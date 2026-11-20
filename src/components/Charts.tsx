import { fmtNum, type Result } from '../lib/analysis'

const COLOURS = ['#6d28d9', '#f59e0b', '#0ea5e9', '#10b981', '#e11d48', '#8b5cf6', '#14b8a6', '#f97316', '#64748b', '#a3e635']

/** Draws a result as a bar, line or pie chart, a big number, or a table. Plain SVG, no chart library. */
export function ResultChart({ r }: { r: Result }) {
  if (r.chart === 'number' || r.labels.length === 1 && !r.groupLabel) {
    return (
      <div className="py-4 text-center">
        <p className="font-display text-4xl font-bold text-violet-800">{fmtNum(r.values[0] ?? 0)}</p>
        <p className="mt-1 text-sm text-slate-500">{r.metricLabel} · {r.rowsUsed.toLocaleString()} rows</p>
      </div>
    )
  }
  if (!r.labels.length) return <p className="py-6 text-center text-sm text-slate-500">No rows match.</p>
  if (r.chart === 'table') return <ResultTable r={r} />
  if (r.chart === 'pie') return <Pie r={r} />
  if (r.chart === 'line') return <Line r={r} />
  return <Bars r={r} />
}

export function ResultTable({ r }: { r: Result }) {
  return (
    <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-50"><tr><th className="px-3 py-2 text-left font-semibold">{r.groupLabel ?? ''}</th><th className="px-3 py-2 text-right font-semibold">{r.metricLabel}</th></tr></thead>
        <tbody>{r.labels.map((l, i) => <tr key={l + i} className="border-t border-slate-100"><td className="px-3 py-1.5">{l}</td><td className="px-3 py-1.5 text-right tabular-nums">{fmtNum(r.values[i])}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

function Bars({ r }: { r: Result }) {
  const max = Math.max(...r.values, 0) || 1
  const min = Math.min(...r.values, 0)
  const span = max - min || 1
  return (
    <div className="space-y-1.5" role="img" aria-label={`${r.title}: bar chart`}>
      {r.labels.map((l, i) => {
        const v = r.values[i]
        const w = (Math.abs(v) / span) * 100
        return (
          <div key={l + i} className="grid grid-cols-[minmax(70px,30%)_1fr_auto] items-center gap-2 text-xs sm:text-sm">
            <span className="truncate text-slate-600" title={l}>{l}</span>
            <span className="h-5 rounded bg-slate-100"><span className="block h-full rounded" style={{ width: `${Math.max(w, 0.5)}%`, background: v < 0 ? '#e11d48' : '#6d28d9' }} /></span>
            <span className="w-20 text-right font-semibold tabular-nums">{fmtNum(v)}</span>
          </div>
        )
      })}
    </div>
  )
}

function Line({ r }: { r: Result }) {
  const W = 640, H = 240, P = { l: 56, r: 12, t: 12, b: 36 }
  const max = Math.max(...r.values), min = Math.min(0, ...r.values)
  const span = max - min || 1
  const x = (i: number) => P.l + (r.labels.length === 1 ? 0.5 : i / (r.labels.length - 1)) * (W - P.l - P.r)
  const y = (v: number) => P.t + (1 - (v - min) / span) * (H - P.t - P.b)
  const pts = r.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * span)
  const every = Math.ceil(r.labels.length / 8)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${r.title}: line chart`}>
      {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" /><text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">{fmtNum(t)}</text></g>)}
      <polyline points={`${x(0)},${y(min)} ${pts} ${x(r.values.length - 1)},${y(min)}`} fill="#ede9fe" stroke="none" />
      <polyline points={pts} fill="none" stroke="#6d28d9" strokeWidth="2.5" strokeLinejoin="round" />
      {r.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={r.values.length > 40 ? 0 : 3} fill="#6d28d9"><title>{`${r.labels[i]}: ${fmtNum(v)}`}</title></circle>)}
      {r.labels.map((l, i) => (i % every === 0 ? <text key={l + i} x={x(i)} y={H - 12} textAnchor="middle" fontSize="11" fill="#64748b">{l.length > 10 ? l.slice(-10) : l}</text> : null))}
    </svg>
  )
}

function Pie({ r }: { r: Result }) {
  const vals = r.values.map((v) => Math.max(v, 0))
  const top = vals.slice(0, 9)
  const rest = vals.slice(9).reduce((a, b) => a + b, 0)
  const labels = [...r.labels.slice(0, 9), ...(rest ? ['Others'] : [])]
  const parts = [...top, ...(rest ? [rest] : [])]
  const total = parts.reduce((a, b) => a + b, 0) || 1
  let angle = -Math.PI / 2
  const arcs = parts.map((v, i) => {
    const a0 = angle, a1 = angle + (v / total) * Math.PI * 2
    angle = a1
    const large = a1 - a0 > Math.PI ? 1 : 0
    const p = (a: number, rad: number) => `${100 + rad * Math.cos(a)},${100 + rad * Math.sin(a)}`
    const d = v / total > 0.9999 ? 'M100,10 A90,90 0 1,1 99.99,10 Z M100,45 A55,55 0 1,0 100.01,45 Z' : `M${p(a0, 90)} A90,90 0 ${large},1 ${p(a1, 90)} L${p(a1, 55)} A55,55 0 ${large},0 ${p(a0, 55)} Z`
    return <path key={i} d={d} fill={COLOURS[i % COLOURS.length]}><title>{`${labels[i]}: ${fmtNum(v)} (${Math.round((v / total) * 100)}%)`}</title></path>
  })
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg viewBox="0 0 200 200" className="h-44 w-44 shrink-0" role="img" aria-label={`${r.title}: pie chart`}>{arcs}</svg>
      <ul className="w-full space-y-1 text-sm">
        {labels.map((l, i) => (
          <li key={l + i} className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: COLOURS[i % COLOURS.length] }} /><span className="min-w-0 flex-1 truncate">{l}</span><span className="tabular-nums text-slate-600">{Math.round((parts[i] / total) * 100)}%</span></li>
        ))}
      </ul>
    </div>
  )
}
