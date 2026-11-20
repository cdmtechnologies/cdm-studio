import { useEffect, useState } from 'react'
import { href } from '../lib/router'
import { callFunction } from '../lib/supabase'
import { Alert, fmtDate, Spinner } from '../components/ui'

type Settings = { ai_enabled: boolean; owner_two_step: boolean; free_builds_daily: number; free_tutor_daily: number; free_data_daily: number; signup_credits: number; credit_price_ngn: number; usd_ngn: number; markup: number; min_topup_ngn: number; min_topup_usd: number; fast_in_per_m: number; fast_out_per_m: number; best_in_per_m: number; best_out_per_m: number; lesson_price_credits: number; market_commission_pct: number; min_payout_credits: number; exam_pass_pct: number }
type CreditsOverview = { credits_held: number; credits_sold_month: number; credits_used_month: number; avg_build_cost_usd: number | null; avg_build_credits: number | null; avg_tutor_credits: number | null; free_cost_7d_usd: number; paid_cost_7d_usd: number }
type Overview = {
  generated_at: string
  users: { total: number; today: number; week: number; premium: number; active_7d: number }
  learning: { lessons_done: number; lessons_done_7d: number; learners: number; top: { lesson_id: string; n: number }[] }
  projects: { total: number; published: number; hidden: number; week: number }
  ai: { enabled: boolean; builds_today: number; tutor_today: number; builds_7d: number; tutor_7d: number; cost_7d_usd: number; cost_month_usd: number }
  money: { month_ngn: number; month_usd: number; total_ngn: number; total_usd: number }
  reports: { id: string; title: string; slug: string | null; hidden: boolean; reports: number; last: string; reasons: string }[]
  recent_signups: { email: string; name: string | null; created_at: string }[]
  settings: Settings
  credits: CreditsOverview | null
}

const owner = <T,>(action: string, body: Record<string, unknown> = {}) => callFunction<{ data: T }>('studio-control', { action, ...body }).then((r) => r.data)

/** The owner's view of CDM Studio: people, learning, projects, AI cost and money, plus the switches. */
export default function Owner() {
  const [o, setO] = useState<Overview | null>(null)
  const [err, setErr] = useState('')
  const [s, setS] = useState<Settings | null>(null)
  const [msg, setMsg] = useState('')
  const load = () => owner<Overview>('overview').then((d) => { setO(d); setS(d.settings) }).catch((e) => setErr((e as Error).message))
  useEffect(() => { load() }, [])

  if (err) return <div className="mx-auto max-w-lg"><Alert>{err}</Alert><p className="mt-3 text-sm"><a className="underline" href={href('account')}>Back to your account</a> (two-step sign-in may be needed)</p></div>
  if (!o || !s) return <Spinner />

  async function save() {
    try { await owner('settings', { settings: s }); setMsg('Saved.'); load() } catch (e) { setMsg((e as Error).message) }
  }
  async function hide(id: string, hidden: boolean) {
    try { await owner('hide', { project_id: id, hidden }); load() } catch (e) { alert((e as Error).message) }
  }
  const num = (k: keyof Settings) => (
    <label key={k} className="text-sm"><span className="label">{LABELS[k]}</span>
      <input className="input" type="number" min={0} step={/_per_m|usd|markup|price/.test(k) ? '0.01' : '1'} value={String(s[k])} onChange={(e) => setS({ ...s, [k]: Number(e.target.value) })} />
    </label>
  )
  const tiles: [string, string | number][] = [
    ['People', o.users.total], ['New today', o.users.today], ['Active (7 days)', o.users.active_7d],
    ['Lessons done (7 days)', o.learning.lessons_done_7d], ['Projects', o.projects.total], ['Published', o.projects.published],
    ['AI builds today', o.ai.builds_today], ['Tutor today', o.ai.tutor_today], ['AI cost 7 days', `$${o.ai.cost_7d_usd}`], ['AI cost this month', `$${o.ai.cost_month_usd}`],
    ['Paid this month', `₦${Number(o.money.month_ngn).toLocaleString()}${o.money.month_usd ? ` + $${o.money.month_usd}` : ''}`],
    ...(o.credits ? [
      ['Credits sold this month', Number(o.credits.credits_sold_month).toLocaleString()], ['Credits used this month', Number(o.credits.credits_used_month).toLocaleString()],
      ['Credits people hold', Number(o.credits.credits_held).toLocaleString()], ['Average build', o.credits.avg_build_credits ? `${o.credits.avg_build_credits} credits ($${o.credits.avg_build_cost_usd})` : '—'],
      ['Free AI cost (7 days)', `$${o.credits.free_cost_7d_usd}`], ['Paid AI cost (7 days)', `$${o.credits.paid_cost_7d_usd}`],
    ] as [string, string][] : []),
  ]
  // what one credit really earns after the AI bill, at the current settings
  const perCreditCost = s.credit_price_ngn / s.markup
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between"><h1 className="font-display text-3xl font-bold">Owner dashboard</h1><p className="text-xs text-slate-500">Updated {fmtDate(o.generated_at)}</p></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map(([l, v]) => <div key={l} className="card p-4"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-xl font-bold">{v}</p></div>)}
      </div>

      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Switches and limits</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-violet-700" checked={s.ai_enabled} onChange={(e) => setS({ ...s, ai_enabled: e.target.checked })} /> AI on (turn off to pause all AI at once)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-violet-700" checked={s.owner_two_step} onChange={(e) => setS({ ...s, owner_two_step: e.target.checked })} /> Owner dashboard needs two-step sign-in</label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(Object.keys(LABELS) as (keyof Settings)[]).map(num)}</div>
        <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-900">
          At these settings, every ₦{s.credit_price_ngn} credit covers about ₦{perCreditCost.toFixed(2)} of AI cost (${(perCreditCost / s.usd_ngn).toFixed(4)}),
          leaving ₦{(s.credit_price_ngn - perCreditCost).toFixed(2)} ({Math.round((1 - 1 / s.markup) * 100)}%) for Paystack fees, partner commission, hosting and profit.
          Check the AI prices against your Anthropic console now and then, and raise "Dollar rate" when the naira moves.
        </p>
        <div className="flex items-center gap-3"><button className="btn btn-primary" onClick={save}>Save</button>{msg && <span className="text-sm text-slate-600">{msg}</span>}</div>
      </section>

      <Payouts />

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Reported projects</h2>
        {o.reports.length === 0 ? <p className="text-sm text-slate-500">No reports.</p> : (
          <ul className="divide-y divide-slate-100">
            {o.reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <div className="min-w-0 flex-1"><p className="font-semibold">{r.title} <span className="font-normal text-slate-500">· {r.reports} report{r.reports > 1 ? 's' : ''}</span></p><p className="text-slate-600">{r.reasons}</p></div>
                {r.slug && <a className="btn btn-ghost px-3 py-1.5" href={href(`p/${r.slug}`)} target="_blank" rel="noopener noreferrer">Open</a>}
                <button className={`btn px-3 py-1.5 ${r.hidden ? 'btn-ghost' : 'bg-red-600 text-white hover:bg-red-700'}`} onClick={() => hide(r.id, !r.hidden)}>{r.hidden ? 'Show again' : 'Hide'}</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Newest people</h2>
          <ul className="divide-y divide-slate-100 text-sm">{o.recent_signups.map((u) => <li key={u.email + u.created_at} className="flex justify-between gap-2 py-2"><span className="truncate">{u.name || '—'} · {u.email}</span><span className="shrink-0 text-slate-500">{fmtDate(u.created_at)}</span></li>)}</ul>
        </section>
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Most finished lessons</h2>
          <ul className="divide-y divide-slate-100 text-sm">{o.learning.top.map((t) => <li key={t.lesson_id} className="flex justify-between py-2"><span>{t.lesson_id}</span><span className="text-slate-500">{t.n}</span></li>)}</ul>
        </section>
      </div>
    </div>
  )
}

const LABELS: Partial<Record<keyof Settings, string>> = {
  free_builds_daily: 'Free: AI builds a day', free_tutor_daily: 'Free: tutor questions a day', free_data_daily: 'Free: data questions a day', signup_credits: 'Welcome credits for new accounts',
  credit_price_ngn: 'Price of 1 credit (₦)', markup: 'Markup on AI cost (× times)', usd_ngn: 'Dollar rate (₦ per $1)', min_topup_ngn: 'Smallest top-up (₦)', min_topup_usd: 'Smallest top-up ($)',
  lesson_price_credits: 'Advanced lesson price (credits)', exam_pass_pct: 'Exam pass mark (%)', market_commission_pct: 'Marketplace commission (%)', min_payout_credits: 'Smallest payout (credits)',
  fast_in_per_m: 'Quick AI: $ per million tokens in', fast_out_per_m: 'Quick AI: $ per million tokens out', best_in_per_m: 'Best AI: $ per million tokens in', best_out_per_m: 'Best AI: $ per million tokens out',
}

type Pay = { id: number; email: string | null; credits: number; amount_ngn: number; bank_name: string; account_name: string; account_no: string; status: string; note: string | null; created_at: string }
/** Sellers' payout requests: pay them from the business account, then mark them paid (or refuse, which returns the earnings). */
function Payouts() {
  const [list, setList] = useState<Pay[] | null>(null)
  const load = () => owner<Pay[]>('payouts').then(setList).catch(() => setList([]))
  useEffect(() => { load() }, [])
  async function settle(p: Pay, paid: boolean) {
    const note = paid ? null : prompt('Why is this refused? (the seller sees this)')
    if (!paid && !note) return
    if (paid && !confirm(`Mark ₦${Number(p.amount_ngn).toLocaleString()} to ${p.account_name} as paid?`)) return
    try { await owner('payout', { id: p.id, paid, note }); load() } catch (e) { alert((e as Error).message) }
  }
  if (!list?.length) return null
  return (
    <section className="card p-5">
      <h2 className="mb-3 font-semibold">Marketplace payouts</h2>
      <ul className="divide-y divide-slate-100 text-sm">
        {list.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-2 py-2">
            <span className="min-w-0 flex-1">₦{Number(p.amount_ngn).toLocaleString()} · {p.account_name} · {p.bank_name} <span className="font-mono">{p.account_no}</span> · {p.email} · {fmtDate(p.created_at)}</span>
            {p.status === 'waiting' ? <><button className="btn btn-primary px-3 py-1.5" onClick={() => settle(p, true)}>Mark paid</button><button className="btn btn-ghost px-3 py-1.5" onClick={() => settle(p, false)}>Refuse</button></> : <span className="text-slate-500">{p.status}</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
