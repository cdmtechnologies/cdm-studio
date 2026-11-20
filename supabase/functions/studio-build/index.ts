// Supabase Edge Function: studio-build (the AI builder)
//   { mode: 'create', kind, prompt }                  -> makes a new project
//   { mode: 'change', project_id, prompt }            -> changes the project
//   { mode: 'fix', project_id, prompt, error }        -> fixes a JavaScript error the page showed
//   add best: true for the stronger model (always paid with credits)
// Answers { project, summary, version_id, mode, charged, credits, free_left }. Each run uses one of the day's free builds
// (fast model), or credits worked out from the real AI cost (see the credits migration). The project is read with the
// person's own login and only its owner or an editor may change it.
//
// Secrets: ANTHROPIC_API_KEY. Optional: STUDIO_BUILD_MODEL (fast, default claude-haiku-5-5),
// STUDIO_PREMIUM_MODEL (best, default claude-sonnet-5-5). Deploy with "Verify JWT" ON.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cleanInput, cleanPage, limitMessage, SAVE_TOOL, systemPrompt, userMessage } from './lib.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const FREE_MODEL = Deno.env.get('STUDIO_BUILD_MODEL') ?? 'claude-haiku-5-5'
const PREMIUM_MODEL = Deno.env.get('STUDIO_PREMIUM_MODEL') ?? 'claude-sonnet-5-5'
const COLS = 'id, title, kind, html, published, slug, views, updated_at, remix_of'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const url = Deno.env.get('SUPABASE_URL')!
  const db = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } })
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  try {
    const { data: { user } } = await db.auth.getUser()
    if (!user) return json({ error: 'Please sign in again.' }, 401)
    const { input, error: bad } = cleanInput(await req.json().catch(() => null))
    if (!input) return json({ error: bad }, 400)
    if (!KEY) return json({ error: 'The AI builder is not set up yet. Please try again later.' })

    // the current page (read as the person: only their own projects)
    let current = '', kind = input.kind
    const recent: string[] = []
    const secrets: string[] = []
    if (input.projectId) {
      const { data: p } = await db.from('projects').select('id, kind, html').eq('id', input.projectId).maybeSingle()
      if (!p) return json({ error: 'That project was not found.' }, 404)
      // owners and editors may change it; viewers may only look
      const { data: role } = await db.rpc('project_role', { p_project: p.id })
      if (role !== 'owner' && role !== 'editor') return json({ error: 'You can view this project but not change it. Ask the owner to make you an editor.' }, 403)
      const { data: sec } = await admin.from('project_secrets').select('name').eq('project_id', p.id)
      for (const x of sec ?? []) secrets.push(String(x.name))
      current = p.html; kind = p.kind
      const { data: vs } = await db.from('project_versions').select('prompt').eq('project_id', p.id).not('prompt', 'is', null).order('id', { ascending: false }).limit(6)
      for (const v of (vs ?? []).reverse()) if (v.prompt) recent.push(String(v.prompt).slice(0, 300))
    } else {
      const { count } = await db.from('projects').select('id', { count: 'exact', head: true }).eq('owner_id', user.id)
      if ((count ?? 0) >= 200) return json({ error: 'You have 200 projects. Delete some to make new ones.' })
    }

    const { data: gate, error: gErr } = await admin.rpc('usage_take', { p_user: user.id, p_kind: 'build', p_best: input.best })
    if (gErr) throw new Error(gErr.message)
    const g = gate?.[0]
    if (!g?.allowed) return json({ error: limitMessage(g?.reason, 'AI builds', Number(g?.day_limit ?? 0), Number(g?.reserve ?? 0)), limited: true, need_credits: g?.reason !== 'paused' })
    const model = input.best ? PREMIUM_MODEL : FREE_MODEL

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: input.best ? 16000 : 12000,
        system: [{ type: 'text', text: systemPrompt(kind), cache_control: { type: 'ephemeral' } }],
        tools: [SAVE_TOOL], tool_choice: { type: 'tool', name: 'save_page' },
        messages: [{ role: 'user', content: userMessage(input, current, recent) + (secrets.length ? `\n\nAPI keys this project has (use with studio.api): ${secrets.join(', ')}` : '') }],
      }),
      signal: AbortSignal.timeout(140_000),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { console.error('studio-build ai', r.status, j?.error?.message); return json({ error: 'The AI could not build that just now. Please try again in a minute.' }) }
    const { data: ch } = await admin.rpc('charge_ai', {
      p_user: user.id, p_kind: 'build', p_mode: g.mode, p_best: input.best, p_model: model,
      p_in: Number(j.usage?.input_tokens ?? 0) + Number(j.usage?.cache_read_input_tokens ?? 0) + Number(j.usage?.cache_creation_input_tokens ?? 0),
      p_out: Number(j.usage?.output_tokens ?? 0), p_ref: input.projectId ?? 'new project',
    })
    const charge = { mode: g.mode, charged: Number(ch?.[0]?.charged ?? 0), credits: Number(ch?.[0]?.balance ?? g.credits), free_left: Number(g.free_left ?? 0) }
    if (j.stop_reason === 'max_tokens') return json({ error: 'That came out too big to finish. Ask for a smaller change, or split it into steps.', ...charge })
    const page = cleanPage((j.content ?? []).find((b: { type: string }) => b.type === 'tool_use')?.input)
    if (!page) return json({ error: 'The page did not come out right. Please try again.', ...charge })

    let project
    if (input.mode === 'create') {
      const { data, error } = await admin.from('projects').insert({ owner_id: user.id, title: page.title, kind, html: page.html }).select(COLS).single()
      if (error) throw new Error(error.message)
      project = data
    } else {
      const { data, error } = await admin.from('projects').update({ html: page.html }).eq('id', input.projectId!).select(COLS).single()
      if (error) throw new Error(error.message)
      project = data
    }
    const { data: v } = await admin.from('project_versions').insert({ project_id: project.id, html: page.html, prompt: input.prompt, summary: page.summary, source: 'ai' }).select('id').single()
    return json({ project, summary: page.summary, version_id: v?.id ?? null, ...charge })
  } catch (e) {
    console.error('studio-build', (e as Error).message)
    return json({ error: (e as Error).name === 'TimeoutError' ? 'That took too long. Try a smaller change.' : 'Something went wrong. Please try again.' })
  }
})
