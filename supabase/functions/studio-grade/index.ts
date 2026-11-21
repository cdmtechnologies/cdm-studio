import { aiOff, aiOffResponse } from './ai_switch.ts'
// Supabase Edge Function: studio-grade (marks a course's final project with AI against its checklist)
//   { track, project_id }  one of the learner's Studio projects (their own or one they can edit)
//   { track, code }        or pasted code (Python / SQL courses), up to 40,000 characters
//   -> { score, passed, items: [{ n, item, met, comment }], summary }
// 3 submissions a day per course. Free for learners (the marking is part of the course).
// Deploy with "Verify JWT" ON. Secrets: ANTHROPIC_API_KEY. Optional GRADE_MODEL (default claude-sonnet-5-5: fair marking matters more than speed).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { GRADE_TOOL, GRADER_SYSTEM, gradePrompt, scoreOf } from './lib.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const MODEL = Deno.env.get('GRADE_MODEL') ?? 'claude-sonnet-5-5'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (await aiOff('cdmstudio')) return aiOffResponse(cors)
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const url = Deno.env.get('SUPABASE_URL')!
  const db = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } })
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  try {
    const { data: { user } } = await db.auth.getUser()
    if (!user) return json({ error: 'Please sign in again.' }, 401)
    if (!KEY) return json({ error: 'Marking is not set up yet.' })
    const b = await req.json().catch(() => ({}))
    const track = String(b.track ?? '')
    const { data: cp } = await admin.from('course_projects').select('*').eq('track', track).maybeSingle()
    if (!cp) return json({ error: 'This course has no final project.' }, 404)
    const { count } = await admin.from('project_submissions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('track', track).gt('at', new Date(Date.now() - 86400000).toISOString())
    if ((count ?? 0) >= 3) return json({ error: 'You have submitted 3 times today. Improve your project and try again tomorrow.' })

    let content = '', projectId: string | null = null
    if (typeof b.project_id === 'string' && /^[0-9a-f-]{36}$/i.test(b.project_id)) {
      // read with the learner's own sign-in: only projects they own or can edit
      const { data: p } = await db.from('projects').select('id, html, owner_id').eq('id', b.project_id).maybeSingle()
      if (!p) return json({ error: 'Project not found.' }, 404)
      const { data: role } = await db.rpc('project_role', { p_project: p.id })
      if (role !== 'owner' && role !== 'editor') return json({ error: 'Submit a project you made.' }, 403)
      content = String(p.html ?? ''); projectId = p.id
    } else if (typeof b.code === 'string') content = b.code
    content = content.replace(/\u0000/g, '').slice(0, 40000)
    if (content.trim().length < 40) return json({ error: 'The submission is too short to mark.' }, 400)

    const rubric = (cp.rubric as string[]).slice(0, 20)
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: AbortSignal.timeout(90_000),
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 2500, temperature: 0, system: GRADER_SYSTEM, tools: [GRADE_TOOL], tool_choice: { type: 'tool', name: 'grade' },
        messages: [{ role: 'user', content: gradePrompt({ title: cp.title, brief: cp.brief, rubric, lang: cp.lang, content }) }] }),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { console.error('studio-grade', r.status, j?.error?.message); return json({ error: 'Marking failed just now. Please try again.' }) }
    const out = (j.content ?? []).find((x: { type: string }) => x.type === 'tool_use')?.input ?? {}
    const raw = Array.isArray(out.items) ? out.items : []
    const score = scoreOf(raw, rubric.length)
    const items = rubric.map((item, i) => {
      const m = raw.find((x: { n: number }) => x?.n === i + 1)
      return { n: i + 1, item, met: m?.met === true, comment: String(m?.comment ?? '').slice(0, 600) }
    })
    const passed = score >= Number(cp.pass_pct)
    const feedback = { items, summary: String(out.summary ?? '').slice(0, 1200) }
    await admin.from('project_submissions').insert({ user_id: user.id, track, project_id: projectId, score, passed, feedback })
    await admin.rpc('charge_ai', { p_user: user.id, p_kind: 'tutor', p_mode: 'free', p_best: true, p_model: MODEL, p_in: Number(j.usage?.input_tokens ?? 0), p_out: Number(j.usage?.output_tokens ?? 0), p_ref: 'project ' + track })
    return json({ score, passed, need: cp.pass_pct, ...feedback })
  } catch (e) {
    console.error('studio-grade', (e as Error).message)
    return json({ error: 'Something went wrong. Please try again.' })
  }
})
