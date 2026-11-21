import { aiOff, aiOffResponse } from './ai_switch.ts'
// Supabase Edge Function: social-ai (CDM Social's AI writer). Every result is a DRAFT that waits for approval.
//   { action: 'plan', workspace, accounts: [ids], days, count, topics? } -> saves count draft posts with suggested times
//   { action: 'write', workspace, idea, accounts: [ids] }                -> { text } one post for the idea (not saved)
//   { action: 'improve', workspace, text, instruction }                  -> { text } a better version (not saved)
// Paid with the caller's CDM Studio credits (real AI cost x markup). Deploy with "Verify JWT" ON.
// Secrets: ANTHROPIC_API_KEY. Optional SOCIAL_MODEL (default claude-haiku-5-5).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { NAMES, PLAN_TOOL, planPrompt, scheduleTime, SOCIAL_SYSTEM, UUID, type Platform } from '../_shared/social.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const MODEL = Deno.env.get('SOCIAL_MODEL') ?? 'claude-haiku-5-5'
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, n) : '')

function offsetMinutes(tz: string): number {
  try {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find((x) => x.type === 'timeZoneName')?.value ?? 'GMT'
    const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(p)
    return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0
  } catch { return 60 }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (await aiOff('cdmsocial')) return aiOffResponse(cors)
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const url = Deno.env.get('SUPABASE_URL')!
  const db = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } })
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  try {
    const { data: { user } } = await db.auth.getUser()
    if (!user) return json({ error: 'Please sign in again.' }, 401)
    if (!KEY) return json({ error: 'The AI writer is not set up yet.' })
    const b = await req.json().catch(() => ({}))
    const ws = String(b.workspace ?? '')
    if (!UUID.test(ws)) return json({ error: 'Open a workspace first.' }, 400)
    const { data: w } = await db.from('sm_workspaces').select('id, name, brand, language, timezone').eq('id', ws).maybeSingle()
    if (!w) return json({ error: 'Workspace not found.' }, 404)
    const { data: s } = await admin.from('settings').select('ai_enabled, social_enabled').maybeSingle()
    if (!s?.ai_enabled || !s?.social_enabled) return json({ error: 'AI is paused for a short while. Please try again later.' })

    // pay with credits: the most one call can cost must be in the balance first
    const [{ data: need }, { data: prof }] = await Promise.all([admin.rpc('credits_reserve', { p_kind: 'social', p_best: false }), admin.from('profiles').select('credits').eq('id', user.id).maybeSingle()])
    const plan = b.action === 'plan'
    const reserve = Number(need ?? 5) * (plan ? 4 : 1)
    if (Number(prof?.credits ?? 0) < reserve) return json({ error: `The AI writer uses credits: you need at least ${Math.ceil(reserve)} credits. Buy credits in CDM Studio.`, need_credits: true })

    let accounts: { id: string; platform: Platform; name: string }[] = []
    if (Array.isArray(b.accounts) && b.accounts.length) {
      const ids = b.accounts.filter((x: unknown) => typeof x === 'string' && UUID.test(x)).slice(0, 12)
      const { data } = await db.from('sm_accounts').select('id, platform, name').eq('workspace', ws).in('id', ids)
      accounts = (data ?? []) as typeof accounts
    }
    const platforms = [...new Set(accounts.map((a) => NAMES[a.platform]))]
    let content = '', tools: unknown[] | undefined, max = 900
    if (plan) {
      const days = Math.min(60, Math.max(1, Math.round(Number(b.days) || 7)))
      const count = Math.min(30, Math.max(1, Math.round(Number(b.count) || 5)))
      content = planPrompt({ name: w.name, brand: w.brand, language: w.language, platforms: platforms.length ? platforms : ['Facebook Page'], days, count, topics: clip(b.topics, 1000) })
      tools = [PLAN_TOOL]; max = 6000
    } else if (b.action === 'write') {
      const idea = clip(b.idea, 1000)
      if (idea.length < 3) return json({ error: 'Describe the post idea first.' }, 400)
      content = `Workspace: ${w.name}\nBrand facts: ${w.brand || '(none)'}\nLanguage: ${w.language}\nPlatforms: ${platforms.join(', ') || 'Facebook Page'}\n\nWrite one ready-to-post text for this idea: ${idea}\nReply with the post text only.`
    } else if (b.action === 'improve') {
      const text = clip(b.text, 5000), how = clip(b.instruction, 300) || 'Make it clearer and more engaging'
      if (!text) return json({ error: 'Write some text first.' }, 400)
      content = `Brand facts: ${w.brand || '(none)'}\nLanguage: ${w.language}\n\nImprove this post (${how}). Keep the facts. Reply with the new post text only.\n\n${text}`
    } else return json({ error: 'Unknown action' }, 400)

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: max, system: [{ type: 'text', text: SOCIAL_SYSTEM, cache_control: { type: 'ephemeral' } }],
        ...(tools ? { tools, tool_choice: { type: 'tool', name: 'posts' } } : {}), messages: [{ role: 'user', content }] }),
      signal: AbortSignal.timeout(90_000),
    })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) { console.error('social-ai', r.status, j?.error?.message); return json({ error: 'The AI could not write that just now. Please try again.' }) }
    const { data: ch } = await admin.rpc('charge_ai', { p_user: user.id, p_kind: 'social', p_mode: 'credits', p_best: false, p_model: MODEL,
      p_in: Number(j.usage?.input_tokens ?? 0) + Number(j.usage?.cache_read_input_tokens ?? 0) + Number(j.usage?.cache_creation_input_tokens ?? 0), p_out: Number(j.usage?.output_tokens ?? 0), p_ref: w.name })
    const charge = { charged: Number(ch?.[0]?.charged ?? 0), credits: Number(ch?.[0]?.balance ?? 0) }

    if (!plan) {
      const text = (j.content ?? []).filter((x: { type: string }) => x.type === 'text').map((x: { text: string }) => x.text).join('\n').trim().slice(0, 5000)
      return json({ text, ...charge })
    }
    const posts = ((j.content ?? []).find((x: { type: string }) => x.type === 'tool_use')?.input?.posts ?? []) as { text: string; day: number; time: string; idea: string }[]
    const off = offsetMinutes(w.timezone)
    const rows = posts.slice(0, 30).filter((p) => typeof p.text === 'string' && p.text.trim()).map((p) => ({
      workspace: ws, text: p.text.trim().slice(0, 5000), accounts: accounts.map((a) => a.id), source: 'ai', idea: clip(p.idea, 500),
      scheduled_at: scheduleTime(new Date(), Number(p.day) || 0, String(p.time ?? '10:00'), off), created_by: user.id,
    }))
    const { error } = await admin.from('sm_posts').insert(rows)
    if (error) throw new Error(error.message)
    return json({ saved: rows.length, ...charge })
  } catch (e) {
    console.error('social-ai', (e as Error).message)
    return json({ error: 'Something went wrong. Please try again.' })
  }
})
