// Supabase Edge Function: studio-proxy (API calls with a secret key, made by CDM Studio for a project's page)
//   POST { slug | project_id, secret: 'NAME', url, method?, headers?, body? }
//     slug        a published page (works on CDM Studio, on the maker's own domain and in the Android app);
//                 the key must be allowed "on the published page" by the owner
//     project_id  the editor's preview: needs the owner's or an editor's sign-in (Authorization header)
//   -> { ok, status, data, text, content_type }
// The secret comes from Supabase Vault on the server and is never sent to the browser. Only the one address the
// owner allowed (https, same host, path under it) can be called; redirects are not followed; each key has a daily limit.
// Deploy with "Verify JWT" OFF (published pages have no sign-in; the checks above are done here).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cleanProxyInput, MAX_REPLY, REASONS, scrub, underAllowed, withSecret } from './lib.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405)
  const raw = await req.text()
  if (raw.length > 260_000) return json({ ok: false, error: 'Too big.' }, 413)
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return json({ ok: false, error: 'Invalid request.' }, 400) }
  const { input, error } = cleanProxyInput(parsed)
  if (!input) return json({ ok: false, error }, 400)

  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  try {
    let userId: string | null = null
    if (!input.slug) {
      const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
      const { data: { user } } = token ? await admin.auth.getUser(token) : { data: { user: null } }
      if (!user) return json({ ok: false, error: 'Please sign in again.' }, 401)
      userId = user.id
    }
    const { data: rows, error: e } = await admin.rpc('secret_take', { p_slug: input.slug, p_project: input.projectId, p_user: userId, p_name: input.name })
    if (e) throw new Error(e.message)
    const s = rows?.[0]
    if (!s || s.reason || !s.value) return json({ ok: false, error: REASONS[s?.reason ?? 'name'] ?? 'Not allowed.' }, 403)
    if (!underAllowed(input.url, s.allowed_url)) return json({ ok: false, error: `This key may only call ${s.allowed_url}` }, 403)

    const call = withSecret(input, s.value, s.placement, s.field)
    const r = await fetch(call.url, { method: input.method, headers: call.headers, body: input.body, redirect: 'manual', signal: AbortSignal.timeout(15_000) })
    if (r.status >= 300 && r.status < 400) return json({ ok: false, status: r.status, error: 'The API answered with a redirect, which is not followed.' })
    const len = Number(r.headers.get('content-length') ?? 0)
    if (len > MAX_REPLY) return json({ ok: false, status: r.status, error: 'The answer is too big.' })
    const buf = new Uint8Array(await r.arrayBuffer())
    if (buf.length > MAX_REPLY) return json({ ok: false, status: r.status, error: 'The answer is too big.' })
    const type = (r.headers.get('content-type') ?? '').slice(0, 100)
    const text = scrub(new TextDecoder().decode(buf), s.value)
    let data: unknown = null
    if (/json/i.test(type) || /^\s*[[{]/.test(text)) { try { data = JSON.parse(text) } catch { /* not JSON */ } }
    return json({ ok: r.ok, status: r.status, content_type: type, data, text: data === null ? text.slice(0, 200_000) : undefined })
  } catch (e) {
    const name = (e as Error).name
    console.error('studio-proxy', (e as Error).message)
    return json({ ok: false, error: name === 'TimeoutError' ? 'The API took too long to answer.' : 'The call could not be made.' }, 502)
  }
})
