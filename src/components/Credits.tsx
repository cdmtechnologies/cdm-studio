import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { referralCode } from '../lib/router'
import { callFunction, supabase } from '../lib/supabase'
import { Alert, fmtDate } from './ui'

export type CreditPrices = { credit_price_ngn: number; usd_ngn: number; min_topup_ngn: number; min_topup_usd: number; free_builds_daily: number; free_tutor_daily: number; free_data_daily: number }
type Row = { id: number; at: string; change: number; balance: number; reason: string; model: string | null }
const PRESETS_NGN = [1000, 2500, 5000, 10000, 25000]
const PRESETS_USD = [2, 5, 10, 25]
const REASON: Record<string, string> = { purchase: 'Bought credits', signup: 'Welcome credits', build: 'AI build', tutor: 'AI tutor / prompt', data: 'Data analysis', refund: 'Refund', gift: 'Gift from CDM' }

/** How many credits a top-up gives (the server works this out again; this is only the preview). */
export const creditsFor = (amount: number, cur: 'NGN' | 'USD', p: CreditPrices) => Math.max(0, Math.floor(((cur === 'USD' ? amount * p.usd_ngn : amount) / p.credit_price_ngn)))

export function useCreditPrices() {
  const [p, setP] = useState<CreditPrices | null>(null)
  useEffect(() => {
    supabase.from('settings').select('credit_price_ngn, usd_ngn, min_topup_ngn, min_topup_usd, free_builds_daily, free_tutor_daily, free_data_daily').maybeSingle()
      .then(({ data }) => setP(data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Number(v)])) as CreditPrices : null))
  }, [])
  return p
}

/** Balance, buy credits of any amount, and where credits went. */
export default function CreditsPanel() {
  const { session, credits } = useAuth()
  const p = useCreditPrices()
  const [cur, setCur] = useState<'NGN' | 'USD'>('NGN')
  const [amount, setAmount] = useState('2500')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [free, setFree] = useState<{ free_builds: number; free_tutor: number; free_data: number } | null>(null)

  useEffect(() => {
    if (!session) return
    supabase.from('credit_ledger').select('id, at, change, balance, reason, model').order('at', { ascending: false }).limit(30).then(({ data }) => setRows((data as Row[]) ?? []))
    const today = new Date(Date.now() + 3600e3).toISOString().slice(0, 10) // Lagos day
    supabase.from('ai_usage').select('free_builds, free_tutor, free_data').eq('user_id', session.user.id).eq('day', today).maybeSingle()
      .then(({ data }) => setFree((data as typeof free) ?? { free_builds: 0, free_tutor: 0, free_data: 0 }))
  }, [session, credits])

  const n = Number(amount)
  const min = p ? (cur === 'USD' ? p.min_topup_usd : p.min_topup_ngn) : 0
  const get = p && Number.isFinite(n) ? creditsFor(n, cur, p) : 0
  const sym = cur === 'USD' ? '$' : '₦'

  async function buy() {
    setBusy(true); setErr('')
    try {
      const r = await callFunction<{ url: string }>('studio-pay', { action: 'start', amount: n, currency: cur, return_url: `${location.origin}${location.pathname}#/account`, referral_code: referralCode() })
      location.assign(r.url)
    } catch (e) { setErr((e as Error).message); setBusy(false) }
  }

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold">Your credits</h2>
          <p className="text-sm text-slate-600">Pay only for what you use. Credits never expire.</p>
        </div>
        <p className="font-display text-4xl font-bold text-violet-800">{credits.toLocaleString()}<span className="ml-1 text-base font-semibold text-slate-500">credits</span></p>
      </div>

      {p && free && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {([['Free AI builds today', free.free_builds, p.free_builds_daily], ['Free tutor questions today', free.free_tutor, p.free_tutor_daily], ['Free data questions today', free.free_data, p.free_data_daily]] as const).map(([l, u, m]) => (
            <div key={l} className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-600">{l}</p>
              <p className="font-bold">{Math.max(m - u, 0)} of {m} left</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-violet-600" style={{ width: `${Math.min(100, (u / Math.max(1, m)) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500">When the free allowance runs out, AI uses your credits. The strongest AI model always uses credits. Free allowance starts again every day.</p>

      {p && (
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Buy credits</p>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-sm" role="radiogroup" aria-label="Currency">
              {(['NGN', 'USD'] as const).map((c) => <button key={c} role="radio" aria-checked={cur === c} className={`rounded-md px-3 py-1 font-semibold ${cur === c ? 'bg-white shadow' : 'text-slate-500'}`} onClick={() => { setCur(c); setAmount(c === 'USD' ? '5' : '2500') }}>{c === 'NGN' ? '₦ Naira' : '$ Dollar'}</button>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(cur === 'USD' ? PRESETS_USD : PRESETS_NGN).map((a) => <button key={a} className={`chip ${n === a ? 'chip-on' : 'chip-off'}`} onClick={() => setAmount(String(a))}>{sym}{a.toLocaleString()}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2"><span className="text-lg font-semibold">{sym}</span>
              <input className="input w-36" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} aria-label={`Amount in ${cur}`} />
            </label>
            <span className="text-sm text-slate-600">= <b>{get.toLocaleString()}</b> credits</span>
          </div>
          <button className="btn btn-primary" disabled={busy || !(n >= min)} onClick={buy}>{busy ? 'Opening Paystack…' : `Pay ${sym}${(n || 0).toLocaleString()}`}</button>
          {!(n >= min) && <p className="text-xs text-slate-500">The smallest top-up is {sym}{min.toLocaleString()}.</p>}
          {err && <Alert>{err}</Alert>}
          <p className="text-xs text-slate-500">1 credit = ₦{p.credit_price_ngn}. A quick AI build usually uses about 25–40 credits, a build with the strongest model about 70–120, a tutor answer about 3–6. Secure payment by card or bank transfer through Paystack.</p>
        </div>
      )}

      {rows.length > 0 && (
        <details className="mt-5 border-t border-slate-100 pt-4">
          <summary className="cursor-pointer text-sm font-semibold">Where my credits went</summary>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {rows.map((r) => (
              <li key={r.id} className="flex justify-between gap-2 py-1.5">
                <span>{fmtDate(r.at)} · {REASON[r.reason] ?? r.reason}{r.model ? <span className="text-slate-400"> · {/sonnet|opus/i.test(r.model) ? 'strongest AI' : 'quick AI'}</span> : null}</span>
                <span className={`tabular-nums ${Number(r.change) < 0 ? 'text-slate-700' : 'font-semibold text-emerald-700'}`}>{Number(r.change) > 0 ? '+' : ''}{Number(r.change).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

/** The link under an "out of free AI" message. */
export function BuyCreditsLink({ err }: { err: { limited?: boolean; needCredits?: boolean; premiumNeeded?: boolean } | null }) {
  if (!err || !(err.needCredits || err.premiumNeeded)) return null
  return <a className="font-semibold underline" href="#/account">Buy credits</a>
}

/** Choose the quick AI (free allowance first) or the strongest AI (always credits). Remembered on this device. */
export function useBestAI(): [boolean, (v: boolean) => void] {
  const [best, setBest] = useState(() => { try { return localStorage.getItem('cdm-studio-best') === '1' } catch { return false } })
  return [best, (v: boolean) => { setBest(v); try { localStorage.setItem('cdm-studio-best', v ? '1' : '0') } catch { /* ignore */ } }]
}
export function BestToggle({ best, onChange }: { best: boolean; onChange: (v: boolean) => void }) {
  const { credits } = useAuth()
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600" title="The strongest AI writes better, bigger projects. It always uses credits.">
      <input type="checkbox" className="h-4 w-4 accent-violet-700" checked={best} onChange={(e) => onChange(e.target.checked)} />
      <span>Best AI <span className="text-slate-400">(uses credits · you have {credits.toLocaleString()})</span></span>
    </label>
  )
}

/** One line after an AI action: what it cost. */
export function chargeNote(r: { mode?: string; charged?: number; credits?: number; free_left?: number }, what: string): string {
  if (r.mode === 'free') return `${r.free_left ?? 0} free ${what} left today`
  if (r.mode === 'credits') return `Used ${Number(r.charged ?? 0).toLocaleString()} credits · ${Math.floor(Number(r.credits ?? 0)).toLocaleString()} left`
  return ''
}
