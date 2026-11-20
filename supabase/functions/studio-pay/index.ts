// Supabase Edge Function: studio-pay (CDM Studio credits through Paystack)
//   { action: 'start', amount, currency: 'NGN' | 'USD', return_url }  -> { url } to Paystack checkout for a credit top-up of any amount
//   { action: 'verify', reference }  -> checks the payment with Paystack and adds the credits (older month/year payments add Premium time)
//   POST /studio-pay/webhook (Paystack, signed with the secret key) -> the same as verify, in case the person never returns
// Prices come from the settings table. Secret: PAYSTACK_SECRET_KEY (the shared CDM Paystack key).
// Deploy with "Verify JWT" OFF: the start and verify actions check the person's login themselves; the webhook checks Paystack's signature.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { returnUrl, topUp } from './lib.ts'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const PSK = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''
async function hmac512(secret: string, body: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(body)))].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function safeEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false
  let d = 0
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return d === 0
}

// deno-lint-ignore no-explicit-any
async function settle(admin: any, reference: string) {
  const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${PSK}` } })
  const j = await r.json().catch(() => ({}))
  const t = j?.data
  if (!r.ok || !t) return { paid: false, error: 'Could not check the payment just now. Try again in a minute.' }
  if (t.status !== 'success') {
    if (['failed', 'abandoned', 'reversed'].includes(t.status)) await admin.from('payments').update({ status: 'failed' }).eq('reference', reference).eq('status', 'pending')
    return { paid: false, status: t.status }
  }
  const { data: until, error } = await admin.rpc('apply_payment', { p_reference: reference, p_amount: Number(t.amount) / 100, p_currency: String(t.currency) })
  if (error) { console.error('apply_payment', error.message); return { paid: false, error: 'The payment does not match. Contact CDM support with your reference.' } }
  const { data: pay } = await admin.from('payments').select('credits, user_id').eq('reference', reference).maybeSingle()
  const { data: prof } = pay ? await admin.from('profiles').select('credits').eq('id', pay.user_id).maybeSingle() : { data: null }
  return { paid: true, premium_until: until, credits_added: pay?.credits ?? null, balance: prof?.credits ?? null }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
  if (!PSK) return json({ error: 'Payments are not set up yet.' }, 503)
  try {
    if (new URL(req.url).pathname.replace(/\/+$/, '').endsWith('/webhook')) {
      const raw = await req.text()
      if (!safeEqual(await hmac512(PSK, raw), req.headers.get('x-paystack-signature') ?? '')) return new Response('invalid signature', { status: 401 })
      const ev = JSON.parse(raw)
      const ref = String(ev?.data?.reference ?? '')
      if (ev?.event === 'charge.success' && ref.startsWith('cdmstudio_')) {
        const { data: p } = await admin.from('payments').select('reference').eq('reference', ref).maybeSingle()
        if (p) await settle(admin, ref)
      }
      return new Response('ok')
    }

    const db = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } })
    const { data: { user } } = await db.auth.getUser()
    if (!user) return json({ error: 'Please sign in again.' }, 401)
    const body = await req.json().catch(() => ({}))

    if (body.action === 'start') {
      const period = 'credits'
      const currency = body.currency === 'USD' ? 'USD' : 'NGN'
      const { data: s } = await admin.from('settings').select('*').maybeSingle()
      if (!s) return json({ error: 'Prices are not set up yet.' }, 503)
      const t = topUp(body.amount, currency, s)
      if ('error' in t) return json({ error: t.error })
      const { amount, credits } = t
      const ret = returnUrl(body.return_url, req.headers.get('origin'))
      const reference = `cdmstudio_${crypto.randomUUID().replace(/-/g, '')}`
      const referral = typeof body.referral_code === 'string' && /^[A-Z0-9-]{3,24}$/.test(body.referral_code.toUpperCase()) ? body.referral_code.toUpperCase() : null
      const { data: prof } = await admin.from('profiles').select('name').eq('id', user.id).maybeSingle()
      const clientName = (prof?.name || String(user.email ?? '').split('@')[0]).slice(0, 80)
      const { error: e1 } = await admin.from('payments').insert({ reference, user_id: user.id, period, amount, currency, credits })
      if (e1) throw new Error(e1.message)
      const r = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${PSK}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email, amount: Math.round(amount * 100), currency, reference, callback_url: ret,
          // referral_code and client_name are for CDM Partners (sales commission and the Control Centre)
          metadata: { product: 'cdmstudio', user_id: user.id, period, credits, cancel_action: ret, client_name: clientName, ...(referral ? { referral_code: referral } : {}) },
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j?.data?.authorization_url) {
        await admin.from('payments').update({ status: 'failed' }).eq('reference', reference)
        return json({ error: currency === 'USD' ? 'Dollar payments are not available yet. Please pay in naira.' : (j?.message ?? 'Could not start the payment.') })
      }
      return json({ url: j.data.authorization_url, reference })
    }

    if (body.action === 'verify') {
      const reference = String(body.reference ?? '')
      const { data: p } = await admin.from('payments').select('reference, user_id').eq('reference', reference).maybeSingle()
      if (!p || p.user_id !== user.id) return json({ error: 'Payment not found.' }, 404)
      return json(await settle(admin, reference))
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (e) {
    console.error('studio-pay', (e as Error).message)
    return json({ error: 'Something went wrong with the payment. Please try again.' })
  }
})
