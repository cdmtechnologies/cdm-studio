// Supabase Edge Function: studio-tools (a project owner's tools)
//   { action: 'secret_save', project_id, name, value?, allowed_url, placement, field?, public_use, daily_limit }
//   { action: 'secret_delete', project_id, name }
//   { action: 'netlify_connect', token }   checks the maker's Netlify personal access token and keeps it in Vault
//   { action: 'netlify_disconnect' }
//   { action: 'files', project_id, icons? }          -> { files }  everything needed to host the app anywhere (for the .zip)
//   { action: 'deploy', project_id, site_name?, icons? } -> puts the app on the maker's own Netlify (installable, works offline)
//   { action: 'domain', project_id, domain }        -> connects the maker's own domain to that Netlify site
//   { action: 'android', project_id, package, sha256 } -> links the Play Store app (assetlinks.json) and deploys again
// Only the project's owner can use these. Secret values and tokens are never sent back.
// Deploy with "Verify JWT" ON.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cleanDomain, cleanPackage, cleanSecretInput, cleanSha256, dnsSteps, pngFromBase64, siteFiles, siteName, UUID, type SiteFiles } from './lib.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const NETLIFY = 'https://api.netlify.com/api/v1'

const b64 = (u: Uint8Array) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s) }

class Say extends Error {}
const say = (m: string) => { throw new Say(m) }

async function nf(token: string, path: string, init: RequestInit = {}) {
  const r = await fetch(NETLIFY + path, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.body && typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...(init.headers ?? {}) }, signal: AbortSignal.timeout(30_000) })
  const j = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, j }
}
async function sha1(data: string | Uint8Array) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  return [...new Uint8Array(await crypto.subtle.digest('SHA-1', bytes))].map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  const proxyUrl = `${url}/functions/v1/studio-proxy`
  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: { user } } = token ? await admin.auth.getUser(token) : { data: { user: null } }
    if (!user) return json({ error: 'Please sign in again.' }, 401)
    const raw = await req.text()
    if (raw.length > 1_500_000) return json({ error: 'Too big.' }, 413)
    const b = JSON.parse(raw || '{}') as Record<string, unknown>
    const action = String(b.action ?? '')

    // the project, owner only
    const own = async () => {
      const id = String(b.project_id ?? '')
      if (!UUID.test(id)) say('Open a project first.')
      const { data: p } = await admin.from('projects').select('id, owner_id, title, html, slug, published, hidden').eq('id', id).maybeSingle()
      if (!p || p.owner_id !== user.id) say('Only the project owner can do this.')
      return p!
    }
    const netlifyToken = async () => {
      const { data } = await admin.rpc('token_get', { p_user: user.id, p_provider: 'netlify' })
      if (!data) say('Connect your Netlify account first.')
      return String(data)
    }
    const files = async (p: { title: string; html: string; slug: string | null; published: boolean; hidden: boolean; id: string }) => {
      const icons = (b.icons ?? {}) as Record<string, unknown>
      const { data: h } = await admin.from('project_hosting').select('android_package, android_sha256').eq('project_id', p.id).maybeSingle()
      return siteFiles({
        title: p.title, html: p.html, slug: p.published && !p.hidden ? p.slug : null, proxyUrl,
        colour: typeof b.colour === 'string' ? b.colour : undefined,
        icons: { s192: pngFromBase64(icons.s192) ?? undefined, s512: pngFromBase64(icons.s512) ?? undefined },
        android: h?.android_package && h?.android_sha256 ? { package: h.android_package, sha256: h.android_sha256 } : null,
      })
    }
    const deploy = async (tok: string, siteId: string, fs: SiteFiles) => {
      const digests: Record<string, string> = {}
      for (const [path, data] of Object.entries(fs)) digests[path] = await sha1(data)
      const d = await nf(tok, `/sites/${siteId}/deploys`, { method: 'POST', body: JSON.stringify({ files: digests }) })
      if (!d.ok) say(`Netlify did not accept the upload (${d.j?.message ?? d.status}).`)
      const need = new Set<string>(d.j.required ?? [])
      for (const [path, data] of Object.entries(fs)) {
        if (!need.has(digests[path])) continue
        const r = await fetch(`${NETLIFY}/deploys/${d.j.id}/files${path.split('/').map(encodeURIComponent).join('/')}`, {
          method: 'PUT', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/octet-stream' }, body: typeof data === 'string' ? new TextEncoder().encode(data) : data, signal: AbortSignal.timeout(30_000),
        })
        if (!r.ok) say(`Uploading ${path} failed (${r.status}).`)
        need.delete(digests[path])
      }
      return d.j.id as string
    }

    if (action === 'secret_save') {
      const { input, error } = cleanSecretInput(b)
      if (!input) return json({ error })
      await own()
      const { error: e } = await admin.rpc('secret_save', {
        p_project: input.projectId, p_user: user.id, p_name: input.name, p_value: input.value, p_url: input.allowedUrl,
        p_placement: input.placement, p_field: input.field, p_public: input.publicUse, p_daily: input.dailyLimit,
      })
      if (e) say(e.message.replace(/^.*?: /, ''))
      return json({ saved: true, name: input.name })
    }
    if (action === 'secret_delete') {
      await own()
      const { error: e } = await admin.rpc('secret_delete', { p_project: b.project_id, p_user: user.id, p_name: String(b.name ?? '') })
      if (e) say(e.message)
      return json({ deleted: true })
    }
    if (action === 'netlify_connect') {
      const t = typeof b.token === 'string' ? b.token.trim() : ''
      if (t.length < 20 || t.length > 200 || /\s/.test(t)) say('Paste the whole personal access token from Netlify.')
      const me = await nf(t, '/user')
      if (!me.ok) say('Netlify did not accept that token. Make a new one and paste it again.')
      await admin.rpc('token_save', { p_user: user.id, p_provider: 'netlify', p_value: t, p_account: String(me.j.email ?? me.j.full_name ?? 'Netlify') })
      return json({ connected: true, account: me.j.email ?? null })
    }
    if (action === 'netlify_disconnect') {
      await admin.rpc('token_delete', { p_user: user.id, p_provider: 'netlify' })
      return json({ disconnected: true })
    }
    if (action === 'files') {
      const p = await own()
      const fs = await files(p)
      const out: Record<string, { text?: string; base64?: string }> = {}
      for (const [k, v] of Object.entries(fs)) out[k] = typeof v === 'string' ? { text: v } : { base64: b64(v) }
      return json({ files: out })
    }
    if (action === 'deploy') {
      const p = await own()
      const tok = await netlifyToken()
      const fs = await files(p)
      if (!fs['/icon-192.png'] || !fs['/icon-512.png']) say('The app icons are missing. Try again.')
      const { data: h } = await admin.from('project_hosting').select('*').eq('project_id', p.id).maybeSingle()
      let siteId = h?.site_id as string | undefined, siteUrl = h?.site_url as string | undefined
      if (siteId) {
        const s = await nf(tok, `/sites/${siteId}`)
        if (!s.ok) siteId = undefined // removed on Netlify: make a new one
      }
      if (!siteId) {
        const base = siteName(b.site_name, p.title)
        let s = await nf(tok, '/sites', { method: 'POST', body: JSON.stringify({ name: base }) })
        if (!s.ok && s.status === 422) s = await nf(tok, '/sites', { method: 'POST', body: JSON.stringify({ name: `${base}-${crypto.randomUUID().slice(0, 5)}` }) })
        if (!s.ok) say(`Netlify could not make the site (${s.j?.message ?? s.status}).`)
        siteId = s.j.id; siteUrl = s.j.ssl_url || s.j.url
      }
      await deploy(tok, siteId!, fs)
      const { error: e } = await admin.from('project_hosting').upsert({ project_id: p.id, provider: 'netlify', site_id: siteId, site_url: String(siteUrl).replace(/^http:/, 'https:'), deployed_at: new Date().toISOString() })
      if (e) throw new Error(e.message)
      return json({ site_url: String(siteUrl).replace(/^http:/, 'https:'), api_ready: !!(p.published && p.slug) })
    }
    if (action === 'domain') {
      const p = await own()
      const tok = await netlifyToken()
      const domain = cleanDomain(b.domain)
      if (!domain) say('Enter a domain you own, like mybakery.com or shop.mybakery.com')
      const { data: h } = await admin.from('project_hosting').select('site_id, site_url').eq('project_id', p.id).maybeSingle()
      if (!h) say('Put the app on Netlify first.')
      const r = await nf(tok, `/sites/${h!.site_id}`, { method: 'PATCH', body: JSON.stringify({ custom_domain: domain }) })
      if (!r.ok) say(r.status === 422 ? 'That domain is already used by another Netlify site.' : `Netlify could not add the domain (${r.j?.message ?? r.status}).`)
      await admin.from('project_hosting').update({ custom_domain: domain }).eq('project_id', p.id)
      return json({ domain, dns: dnsSteps(domain!, new URL(h!.site_url).host) })
    }
    if (action === 'android') {
      const p = await own()
      const pkg = cleanPackage(b.package), sha = cleanSha256(b.sha256)
      if (!pkg) say('The package name looks like com.yourname.appname')
      if (!sha) say('Paste the SHA-256 fingerprint exactly as PWABuilder shows it (32 pairs like AB:CD:…).')
      const { data: h } = await admin.from('project_hosting').select('site_id').eq('project_id', p.id).maybeSingle()
      if (!h) say('Put the app on Netlify first.')
      await admin.from('project_hosting').update({ android_package: pkg, android_sha256: sha }).eq('project_id', p.id)
      return json({ saved: true })
    }
    return json({ error: 'Unknown action' }, 400)
  } catch (e) {
    if (e instanceof Say) return json({ error: e.message })
    console.error('studio-tools', (e as Error).message)
    return json({ error: 'Something went wrong. Please try again.' })
  }
})
