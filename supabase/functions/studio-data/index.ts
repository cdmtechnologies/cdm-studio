import { aiOff, aiOffResponse } from './ai_switch.ts'
// Supabase Edge Function: studio-data (Ask AI about your data)
//   { mode: 'plan', question, data }     -> { plans, note }: analysis plans the app runs on every row in the browser
//   { mode: 'suggest', data }            -> { plans }: 4 useful questions to start with
//   { mode: 'insights', results, question? } -> { reply }: what the results mean, in plain words
// "data" is only a description (column names, types, simple figures, up to 20 sample rows), never the whole file.
// Each call uses one of the day's free data questions, or credits.
//
// Secrets: ANTHROPIC_API_KEY. Optional: STUDIO_TUTOR_MODEL (default claude-haiku-5-5). Deploy with "Verify JWT" ON.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cleanDataInput, DATA_SYSTEM, PLAN_TOOL, userText } from './lib.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const MODEL = Deno.env.get('STUDIO_TUTOR_MODEL') ?? 'claude-haiku-5-5'

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
    const { input, error: bad } = cleanDataInput(await req.json().catch(() => null))
    if (!input) return json({ error: bad }, 400)
    if (!KEY) return json({ error: 'Ask AI is not set up yet. Please try again later.' })

    const { data: gate, error: gErr } = await admin.rpc('usage_take', { p_user: user.id, p_kind: 'data', p_best: false })
    if (gErr) throw new Error(gErr.message)
    const g = gate?.[0]
    if (!g?.allowed) {
      return json({ error: g?.reason === 'paused' ? 'AI is paused for a short while. Please try again later.' : `You have used today's ${g?.day_limit} free data questions. They come back tomorrow, or buy credits to keep going now. (Charts and tables you make yourself are always free.)`, limited: true, need_credits: g?.reason !== 'paused' })
    }

    const insights = input.mode === 'insights'
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL, max_tokens: insights ? 900 : 1500,
        system: DATA_SYSTEM,
        ...(insights ? {} : { tools: [PLAN_TOOL], tool_choice: { type: 'tool', name: 'analysis_plans' } }),
        messages: [{ role: 'user', content: userText(input) }],
      }),
      signal: AbortSignal.timeout(60_000),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { console.error('studio-data ai', r.status, j?.error?.message); return json({ error: 'Ask AI could not answer just now. Please try again.' }) }
    const { data: ch } = await admin.rpc('charge_ai', { p_user: user.id, p_kind: 'data', p_mode: g.mode, p_best: false, p_model: MODEL, p_in: Number(j.usage?.input_tokens ?? 0), p_out: Number(j.usage?.output_tokens ?? 0), p_ref: input.mode })
    const charge = { mode: g.mode, charged: Number(ch?.[0]?.charged ?? 0), credits: Number(ch?.[0]?.balance ?? g.credits), free_left: Number(g.free_left ?? 0) }
    if (insights) {
      const reply = (j.content ?? []).filter((x: { type: string }) => x.type === 'text').map((x: { text: string }) => x.text).join('\n').trim()
      return json({ reply: reply || 'No clear findings.', ...charge })
    }
    const out = (j.content ?? []).find((x: { type: string }) => x.type === 'tool_use')?.input ?? {}
    return json({ plans: Array.isArray(out.plans) ? out.plans.slice(0, 4) : [], note: typeof out.note === 'string' ? out.note.slice(0, 500) : null, ...charge })
  } catch (e) {
    console.error('studio-data', (e as Error).message)
    return json({ error: 'Something went wrong. Please try again.' })
  }
})
