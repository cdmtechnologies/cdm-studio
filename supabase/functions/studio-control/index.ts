// Supabase Edge Function: studio-control (CDM Studio's owner dashboard, and the CDM Partners Control Centre)
//
// Two ways in, nothing else:
//   1. CDM Partners' Control Centre, with the shared secret CDM_CONTROL_KEY in the x-cdm-control-key header
//      (same value as in the other CDM apps). It may read the overview only.
//   2. The owner, signed in to CDM Studio with an email listed in the staff table. When two-step sign-in is required
//      (settings.owner_two_step, on by default) the session must have passed it (aal2).
// Every change is written to admin_log.
//
// Deploy with "Verify JWT" OFF (the checks above are done here). Secret: CDM_CONTROL_KEY (optional, for Partners).
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cleanSettings, claims, safeEqual } from './lib.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cdm-control-key', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Admin = ReturnType<typeof createClient>
type Who = { actor: string }
const log = (a: Admin, w: Who, action: string, target: string | null, detail: unknown) =>
  a.from('admin_log').insert({ actor: w.actor, action, target, detail })

const ACTIONS: Record<string, { partners?: boolean; run: (a: Admin, b: Record<string, unknown>, w: Who) => Promise<unknown> }> = {
  overview: {
    partners: true,
    run: async (a) => {
      const { data, error } = await a.rpc('studio_owner_overview')
      if (error) throw new Error(error.message)
      const { data: c } = await a.rpc('studio_credit_overview')
      return { ...(data as Record<string, unknown>), credits: c ?? null }
    },
  },
  settings: {
    run: async (a, b, w) => {
      const patch = cleanSettings(b.settings)
      if (!Object.keys(patch).length) throw new Error('Nothing to save')
      const { error } = await a.from('settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', true)
      if (error) throw new Error(error.message)
      await log(a, w, 'settings', null, patch)
      return { saved: true }
    },
  },
  payouts: {
    run: async (a) => {
      const { data, error } = await a.from('payout_requests').select('id, user_id, credits, amount_ngn, bank_name, account_name, account_no, status, note, created_at, done_at').order('created_at', { ascending: false }).limit(50)
      if (error) throw new Error(error.message)
      const ids = [...new Set((data ?? []).map((r) => r.user_id))]
      const emails: Record<string, string> = {}
      for (const id of ids) { const { data: u } = await a.auth.admin.getUserById(id); if (u?.user?.email) emails[id] = u.user.email }
      return (data ?? []).map((r) => ({ ...r, email: emails[r.user_id] ?? null }))
    },
  },
  payout: {
    run: async (a, b, w) => {
      const id = Number(b.id)
      if (!Number.isInteger(id) || id < 1) throw new Error('Pick a payout first')
      const paid = b.paid === true
      const { error } = await a.rpc('settle_payout', { p_id: id, p_paid: paid, p_note: typeof b.note === 'string' ? b.note.slice(0, 300) : null })
      if (error) throw new Error(error.message)
      await log(a, w, paid ? 'payout paid' : 'payout refused', String(id), {})
      return { done: true }
    },
  },
  hide: {
    run: async (a, b, w) => {
      const id = String(b.project_id ?? '')
      if (!UUID.test(id)) throw new Error('Pick a project first')
      const hidden = b.hidden !== false
      const { error } = await a.from('projects').update({ hidden }).eq('id', id)
      if (error) throw new Error(error.message)
      await log(a, w, hidden ? 'hide project' : 'show project', id, {})
      return { hidden }
    },
  },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json({ error: 'Invalid request' }, 400) }
  const name = String(body.action ?? '')

  let who: Who
  const key = req.headers.get('x-cdm-control-key')
  if (key !== null) {
    const secret = Deno.env.get('CDM_CONTROL_KEY') ?? ''
    if (secret.length < 24) return json({ error: 'Not configured' }, 503)
    if (!safeEqual(key, secret)) return json({ error: 'Forbidden' }, 401)
    if (!ACTIONS[name]?.partners) return json({ error: 'Unknown action' }, 400)
    who = { actor: 'CDM Partners Control Centre' }
  } else {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Please sign in again.' }, 401)
    const { data: { user } } = await admin.auth.getUser(token)
    if (!user?.email || !user.email_confirmed_at) return json({ error: 'Please sign in again.' }, 401)
    const email = user.email.toLowerCase()
    const { data: staff } = await admin.from('staff').select('role').eq('email', email).maybeSingle()
    if (!staff) return json({ error: 'This page is for the CDM Studio owner only.' }, 403)
    const { data: s } = await admin.from('settings').select('owner_two_step').maybeSingle()
    const aal = String(claims(token).aal ?? 'aal1')
    const twoStep = s?.owner_two_step !== false
    if (name === 'whoami') return json({ data: { email, role: staff.role, two_step_required: twoStep, aal } })
    if (twoStep && aal !== 'aal2') return json({ error: 'Turn on two-step sign-in in your account and enter its code first.', need_two_step: true }, 403)
    if (!ACTIONS[name]) return json({ error: 'Unknown action' }, 400)
    who = { actor: email }
  }

  try {
    return json({ data: await ACTIONS[name].run(admin, body, who) })
  } catch (e) {
    const msg = (e as Error).message
    console.error('studio-control', name, msg)
    return json({ error: msg.length < 200 ? msg : 'Something went wrong.' }, 400)
  }
})
