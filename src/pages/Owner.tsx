import { useEffect, useState } from 'react'
import { href } from '../lib/router'
import { callFunction } from '../lib/supabase'
import { Alert, fmtDate, Spinner } from '../components/ui'

type Settings = { ai_enabled: boolean; owner_two_step: boolean; free_builds_daily: number; premium_builds_daily: number; free_tutor_daily: number; premium_tutor_daily: number; price_monthly_ngn: number; price_yearly_ngn: number; price_monthly_usd: number; price_yearly_usd: number; ai_cost_in_per_m: number; ai_cost_out_per_m: number }
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
      <input className="input" type="number" min={0} step={k.startsWith('ai_cost') || k.endsWith('usd') ? '0.01' : '1'} value={String(s[k])} onChange={(e) => setS({ ...s, [k]: Number(e.target.value) })} />
    </label>
  )
  const tiles: [string, string | number][] = [
    ['People', o.users.total], ['New today', o.users.today], ['Premium', o.users.premium], ['Active (7 days)', o.users.active_7d],
    ['Lessons done (7 days)', o.learning.lessons_done_7d], ['Projects', o.projects.total], ['Published', o.projects.published],
    ['AI builds today', o.ai.builds_today], ['Tutor today', o.ai.tutor_today], ['AI cost 7 days', `$${o.ai.cost_7d_usd}`], ['AI cost this month', `$${o.ai.cost_month_usd}`],
    ['Paid this month', `₦${Number(o.money.month_ngn).toLocaleString()}${o.money.month_usd ? ` + $${o.money.month_usd}` : ''}`],
  ]
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
        <div className="flex items-center gap-3"><button className="btn btn-primary" onClick={save}>Save</button>{msg && <span className="text-sm text-slate-600">{msg}</span>}</div>
      </section>

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
  free_builds_daily: 'Free: AI builds a day', premium_builds_daily: 'Premium: AI builds a day', free_tutor_daily: 'Free: tutor a day', premium_tutor_daily: 'Premium: tutor a day',
  price_monthly_ngn: 'Price a month (₦)', price_yearly_ngn: 'Price a year (₦)', price_monthly_usd: 'Price a month ($)', price_yearly_usd: 'Price a year ($)',
  ai_cost_in_per_m: 'AI cost in ($ per million tokens)', ai_cost_out_per_m: 'AI cost out ($ per million tokens)',
}
