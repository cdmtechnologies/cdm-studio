// Supabase Edge Function: studio-tutor (the AI tutor)
//   { mode: 'help', lesson_id, message, code?, history? }      lesson help: hints first, never the full answer straight away
//   { mode: 'practice', lesson_id, message, history? }         answers the learner's prompt, then coaches how they asked
//   { mode: 'explain', project_id, message? }                  explains one of the person's projects for a beginner
// Answers { reply }. Each call counts as one tutor question (daily limit from settings).
//
// Secrets: ANTHROPIC_API_KEY. Optional: STUDIO_TUTOR_MODEL (default claude-haiku-5-5).
// Lesson details come from the lesson_meta table (refresh it with node scripts/lesson-meta.mjs). Deploy with "Verify JWT" ON.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cleanHistory, tutorSystem } from './lib.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const MODEL = Deno.env.get('STUDIO_TUTOR_MODEL') ?? 'claude-haiku-5-5'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
type Meta = { track: string; title: string; kind: string; task: string | null; practice: string | null; hint: string | null; body: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const url = Deno.env.get('SUPABASE_URL')!
  const db = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } })
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  try {
    const { data: { user } } = await db.auth.getUser()
    if (!user) return json({ error: 'Please sign in again.' }, 401)
    const b = await req.json().catch(() => ({}))
    const mode = b.mode === 'practice' || b.mode === 'explain' ? b.mode : 'help'
    const message = typeof b.message === 'string' ? b.message.replace(/\u0000/g, '').trim().slice(0, 2000) : ''
    let lesson: Meta | null = null
    if (typeof b.lesson_id === 'string' && /^[a-z0-9-]{1,60}$/.test(b.lesson_id)) {
      const { data: lm } = await admin.from('lesson_meta').select('meta').eq('id', b.lesson_id).maybeSingle()
      lesson = (lm?.meta as Meta) ?? null
    }
    if (mode !== 'explain' && !message) return json({ error: 'Type a question first.' }, 400)
    if (!KEY) return json({ error: 'The tutor is not set up yet. Please try again later.' })

    let project = ''
    if (mode === 'explain') {
      if (typeof b.project_id !== 'string' || !UUID.test(b.project_id)) return json({ error: 'Open a project first.' }, 400)
      const { data: p } = await db.from('projects').select('title, html').eq('id', b.project_id).maybeSingle()
      if (!p) return json({ error: 'That project was not found.' }, 404)
      project = `Project "${p.title}":\n<page>\n${String(p.html).slice(0, 60000)}\n</page>`
    }

    const { data: gate, error: gErr } = await admin.rpc('usage_take', { p_user: user.id, p_kind: 'tutor' })
    if (gErr) throw new Error(gErr.message)
    const g = gate?.[0]
    if (!g?.allowed) {
      return json({
        error: g?.reason === 'paused' ? 'The tutor is paused for a short while. Please try again later.'
          : g?.premium ? `You have asked ${g.day_limit} questions today. The tutor is back tomorrow.` : `You have used today's ${g?.day_limit} free tutor questions. They come back tomorrow, or get Premium for many more.`,
        limited: true, premium_needed: !g?.premium && g?.reason === 'limit',
      })
    }

    const code = typeof b.code === 'string' ? b.code.slice(0, 20000) : ''
    const last = mode === 'explain'
      ? `${project}\n\n${message || 'Explain how this project works, section by section, for a beginner.'}`
      : code ? `${message}\n\nMy current code:\n<code>\n${code}\n</code>` : message
    const messages = [...cleanHistory(b.history), { role: 'user', content: last }]

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: mode === 'explain' ? 1800 : 1000, system: tutorSystem(mode, lesson), messages }),
      signal: AbortSignal.timeout(60_000),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { console.error('studio-tutor ai', r.status, j?.error?.message); return json({ error: 'The tutor could not answer just now. Please try again.' }) }
    await admin.rpc('ai_add_tokens', { p_user: user.id, p_in: Number(j.usage?.input_tokens ?? 0), p_out: Number(j.usage?.output_tokens ?? 0) })
    const reply = (j.content ?? []).filter((x: { type: string }) => x.type === 'text').map((x: { text: string }) => x.text).join('\n').trim()
    return json({ reply: reply || 'Sorry, I could not answer that. Try asking another way.' })
  } catch (e) {
    console.error('studio-tutor', (e as Error).message)
    return json({ error: 'Something went wrong. Please try again.' })
  }
})
