import { useMemo, useRef, useState } from 'react'
import { cleanPlan, describeForAI, fmtNum, OP_LABEL, parseCSV, parseXLSX, profile, runPlan, sampleSales, toCSV, type Op, type Plan, type Profile, type Result, type Table } from '../lib/analysis'
import { build } from '../lib/builder'
import { useAuth } from '../lib/auth'
import { go, href } from '../lib/router'
import { callFunction, type FnError } from '../lib/supabase'
import { ResultChart, ResultTable } from '../components/Charts'
import { Alert, Icon, Md } from '../components/ui'

type Card = { id: number; plan: Plan; result: Result; view: 'chart' | 'table'; insights?: string; busy?: boolean }
type Charge = { mode?: string; charged?: number; credits?: number; free_left?: number }
let nextId = 1

/** Upload a spreadsheet, see what is in it, make charts, and ask AI questions about it. Files stay on the device. */
export default function Data() {
  const { session, askSignIn, refresh } = useAuth()
  const [table, setTable] = useState<Table | null>(null)
  const [file, setFile] = useState<{ buf: ArrayBuffer; name: string; sheets: string[]; sheet: number } | null>(null)
  const [paste, setPaste] = useState('')
  const [err, setErr] = useState<FnError | null>(null)
  const [loading, setLoading] = useState('')
  const [cards, setCards] = useState<Card[]>([])
  // a question chosen in the prompt bank waits here until data is loaded
  const [question, setQuestion] = useState(() => { try { const q = sessionStorage.getItem('cdm-studio-pending-question') || ''; sessionStorage.removeItem('cdm-studio-pending-question'); return q.slice(0, 500) } catch { return '' } })
  const [note, setNote] = useState('')
  const [charge, setCharge] = useState<Charge | null>(null)
  const [suggest, setSuggest] = useState<Plan[] | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const prof = useMemo(() => (table ? profile(table) : []), [table])

  async function open(f: File) {
    setErr(null); setLoading('Reading your file…'); setCards([]); setSuggest(null); setNote('')
    try {
      if (f.size > 25 * 1024 * 1024) throw new Error('That file is over 25 MB. Save a smaller part of it and try again.')
      if (/\.xlsx$/i.test(f.name)) {
        const buf = await f.arrayBuffer()
        const t = await parseXLSX(buf, f.name)
        setFile({ buf, name: f.name, sheets: t.sheets, sheet: 0 })
        setTable(t)
      } else if (/\.xls$/i.test(f.name)) {
        throw new Error('Old Excel (.xls) files cannot be read. In Excel choose File > Save As > Excel Workbook (.xlsx) or CSV, then upload that.')
      } else {
        setFile(null)
        setTable(parseCSV(await f.text(), f.name))
      }
    } catch (e) { setErr(e as FnError); setTable(null) } finally { setLoading('') }
  }

  async function pickSheet(i: number) {
    if (!file) return
    setLoading('Reading the sheet…')
    try { const t = await parseXLSX(file.buf, `${file.name} · ${file.sheets[i]}`, i); setTable(t); setFile({ ...file, sheet: i }); setCards([]) } catch (e) { setErr(e as FnError) } finally { setLoading('') }
  }

  function add(plan: Plan) {
    if (!table) return
    setCards((c) => [{ id: nextId++, plan, result: runPlan(table, plan), view: plan.chart === 'table' ? 'table' : 'chart' }, ...c])
  }

  async function ai<T>(body: Record<string, unknown>): Promise<T | null> {
    if (!session) { askSignIn('Create a free account to ask AI about your data. Charts you make yourself work without an account.'); return null }
    setErr(null)
    try {
      const r = await callFunction<T & Charge>('studio-data', body)
      setCharge(r); refresh()
      return r
    } catch (e) { setErr(e as FnError); return null }
  }

  async function ask(q: string) {
    if (!table || !q.trim()) return
    setLoading('Working it out…'); setNote('')
    const r = await ai<{ plans: unknown[]; note: string | null }>({ mode: 'plan', question: q.trim(), data: describeForAI(table, prof) })
    setLoading('')
    if (!r) return
    const plans = r.plans.map((p) => cleanPlan(p, table.columns)).filter((p): p is Plan => !!p)
    if (r.note) setNote(r.note)
    if (!plans.length && !r.note) setNote('The AI could not turn that into an analysis. Try asking it another way, for example "total amount by branch".')
    for (const p of plans.reverse()) add(p)
    setQuestion('')
  }

  async function suggestions() {
    if (!table) return
    setLoading('Finding good questions…')
    const r = await ai<{ plans: unknown[] }>({ mode: 'suggest', data: describeForAI(table, prof) })
    setLoading('')
    if (r) setSuggest(r.plans.map((p) => cleanPlan(p, table.columns)).filter((p): p is Plan => !!p))
  }

  async function explain(card: Card) {
    setCards((c) => c.map((x) => (x.id === card.id ? { ...x, busy: true } : x)))
    const r = await ai<{ reply: string }>({ mode: 'insights', question: card.plan.title, data: table ? { name: table.name, rows: table.rows.length } : null, results: { title: card.result.title, measure: card.result.metricLabel, by: card.result.groupLabel, rows_used: card.result.rowsUsed, labels: card.result.labels.slice(0, 50), values: card.result.values.slice(0, 50) } })
    setCards((c) => c.map((x) => (x.id === card.id ? { ...x, busy: false, insights: r?.reply ?? x.insights } : x)))
  }

  async function dashboard() {
    if (!table || !cards.length) return
    if (!session) return askSignIn('Create a free account to turn your results into a dashboard page.')
    setLoading('Building your dashboard page… (up to a minute)')
    try {
      const results = cards.slice(0, 6).map((c) => ({ title: c.result.title, measure: c.result.metricLabel, by: c.result.groupLabel, chart: c.result.chart, labels: c.result.labels.slice(0, 30), values: c.result.values.slice(0, 30) }))
      const r = await build({ kind: 'data', mode: 'create', prompt: `Make a clean one-page dashboard titled "${table.name.replace(/\.(csv|xlsx|txt)$/i, '')} dashboard" that shows these results with clear SVG or canvas charts and key number tiles, and a short summary of the main findings. Use exactly these figures:\n${JSON.stringify(results)}` })
      go(`build/${r.project.id}`)
    } catch (e) { setErr(e as FnError) } finally { setLoading('') }
  }

  function download(name: string, csv: string) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = name.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').toLowerCase() + '.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Analyse data</h1>
          <p className="mt-1 text-slate-600">Upload a spreadsheet, see what is in it, make charts and ask AI questions about it.</p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500"><Icon.lock /> Your file stays on this device. AI only sees column names, totals and a few sample rows.</p>
      </div>

      {!table && (
        <section className="card grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h2 className="font-semibold">Open a file</h2>
            <p className="mt-1 text-sm text-slate-600">Excel (.xlsx) or CSV, up to 200,000 rows. The first row should hold the column names.</p>
            <input ref={input} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) open(f); e.target.value = '' }} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={() => input.current?.click()}><Icon.download className="rotate-180" /> Choose a file</button>
              <button className="btn btn-ghost" onClick={() => { setTable(sampleSales()); setFile(null); setCards([]) }}>Try sample shop sales</button>
            </div>
          </div>
          <div>
            <h2 className="font-semibold">Or paste rows</h2>
            <textarea className="input mt-2 min-h-[110px] font-mono text-xs" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'Item,Quantity,Price\nBread,4,1200\nMilk,2,1500'} aria-label="Paste data" />
            <button className="btn btn-ghost mt-2" disabled={!paste.trim()} onClick={() => { setTable(parseCSV(paste, 'Pasted data')); setFile(null); setCards([]) }}>Use these rows</button>
          </div>
        </section>
      )}
      {loading && <p className="flex items-center gap-2 text-sm text-violet-700"><span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-700" />{loading}</p>}
      {err && <Alert>{err.message} {err.needCredits && <a className="font-semibold underline" href={href('account')}>Buy credits</a>}</Alert>}

      {table && (
        <>
          <section className="card p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="min-w-0 flex-1 truncate font-semibold">{table.name}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{table.rows.length.toLocaleString()} rows · {table.columns.length} columns</span>
              {file && file.sheets.length > 1 && (
                <select className="input w-auto py-1.5" value={file.sheet} onChange={(e) => pickSheet(+e.target.value)} aria-label="Sheet">{file.sheets.map((s, i) => <option key={s + i} value={i}>{s}</option>)}</select>
              )}
              <button className="btn btn-ghost py-1.5" onClick={() => { setTable(null); setCards([]); setSuggest(null) }}>Open another</button>
            </div>
            <Columns prof={prof} />
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-violet-700">See the first 50 rows</summary>
              <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full whitespace-nowrap text-xs">
                  <thead className="sticky top-0 bg-slate-50"><tr>{table.columns.map((c) => <th key={c} className="px-2 py-1.5 text-left font-semibold">{c}</th>)}</tr></thead>
                  <tbody>{table.rows.slice(0, 50).map((r, i) => <tr key={i} className="border-t border-slate-100">{r.map((v, j) => <td key={j} className={`px-2 py-1 ${typeof v === 'number' ? 'text-right tabular-nums' : ''}`}>{v === null ? '' : typeof v === 'number' ? fmtNum(v) : v}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </details>
          </section>

          <section className="card space-y-3 p-5">
            <h2 className="flex items-center gap-2 font-semibold"><Icon.sparkle /> Ask AI about your data</h2>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(question) }}>
              <input className="input flex-1" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} placeholder="e.g. Which branch sold the most last month? How are sales moving week by week?" aria-label="Question about the data" />
              <button className="btn btn-primary" disabled={!!loading || question.trim().length < 3}>Ask</button>
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <button className="chip chip-off" disabled={!!loading} onClick={suggestions}>Suggest questions</button>
              {suggest?.map((p) => <button key={p.title} className="chip chip-off text-left" onClick={() => add(p)}>{p.title}</button>)}
            </div>
            {note && <Alert tone="info">{note}</Alert>}
            {charge && <p className="text-xs text-slate-500">{charge.mode === 'credits' ? `Used ${charge.charged} credits · ${fmtNum(charge.credits ?? 0)} left` : `${charge.free_left} free AI questions left today`}</p>}
          </section>

          <QuickChart table={table} prof={prof} onAdd={add} />

          {cards.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl font-bold">Results</h2>
              <button className="btn btn-ghost ml-auto" disabled={!!loading} onClick={dashboard}><Icon.hammer /> Make a dashboard page</button>
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {cards.map((c) => (
              <article key={c.id} className="card space-y-3 p-5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{c.result.title}</h3>
                    <p className="text-xs text-slate-500">{c.result.metricLabel}{c.result.groupLabel ? ` by ${c.result.groupLabel}` : ''} · {c.result.rowsUsed.toLocaleString()} rows{c.plan.filters?.length ? ` · filtered: ${c.plan.filters.map((f) => `${f.column} ${f.op} ${f.value}`).join(', ')}` : ''}</p>
                  </div>
                  <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setCards((x) => x.filter((y) => y.id !== c.id))} aria-label="Remove"><Icon.x /></button>
                </div>
                {c.view === 'table' ? <ResultTable r={c.result} /> : <ResultChart r={c.result} />}
                {c.result.explanation && <p className="text-sm text-slate-600">{c.result.explanation}</p>}
                {c.insights && <div className="rounded-xl bg-violet-50 p-3 text-sm"><Md text={c.insights} /></div>}
                <div className="flex flex-wrap gap-2 text-sm">
                  {c.result.labels.length > 1 && <button className="btn btn-ghost px-3 py-1.5" onClick={() => setCards((x) => x.map((y) => (y.id === c.id ? { ...y, view: y.view === 'table' ? 'chart' : 'table' } : y)))}>{c.view === 'table' ? 'Show chart' : 'Show table'}</button>}
                  <button className="btn btn-ghost px-3 py-1.5" disabled={c.busy} onClick={() => explain(c)}>{c.busy ? 'Thinking…' : 'What does this mean?'}</button>
                  <button className="btn btn-ghost px-3 py-1.5" onClick={() => download(c.result.title, toCSV([c.result.groupLabel ?? 'Result', c.result.metricLabel], c.result.labels.map((l, i) => [l, c.result.values[i]])))}><Icon.download /> CSV</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Columns({ prof }: { prof: Profile[] }) {
  const badge = { number: 'bg-emerald-100 text-emerald-800', date: 'bg-sky-100 text-sky-800', text: 'bg-slate-100 text-slate-700' }
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {prof.map((p) => (
        <div key={p.name} className="rounded-xl border border-slate-200 p-3 text-sm">
          <div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate font-semibold" title={p.name}>{p.name}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge[p.type]}`}>{p.type}</span></div>
          <p className="mt-1 text-xs text-slate-500">
            {p.type === 'number' ? `Total ${fmtNum(p.sum ?? 0)} · average ${fmtNum(p.avg ?? 0)} · ${fmtNum(Number(p.min))} to ${fmtNum(Number(p.max))}`
              : p.type === 'date' ? `${p.min} to ${p.max}`
              : `${p.unique.toLocaleString()} different${p.top?.length ? ` · most: ${p.top[0].value} (${p.top[0].count})` : ''}`}
            {p.missing ? ` · ${p.missing} empty` : ''}
          </p>
        </div>
      ))}
    </div>
  )
}

/** Make a chart yourself (no AI, free). */
function QuickChart({ table, prof, onAdd }: { table: Table; prof: Profile[]; onAdd: (p: Plan) => void }) {
  const nums = prof.filter((p) => p.type === 'number').map((p) => p.name)
  const groups = prof.filter((p) => p.type !== 'number' || p.unique <= 30).map((p) => p.name)
  const [by, setBy] = useState(groups[0] ?? '')
  const [op, setOp] = useState<Op>(nums.length ? 'sum' : 'count')
  const [col, setCol] = useState(nums[nums.length - 1] ?? '')
  const [chart, setChart] = useState<Plan['chart']>('bar')
  const isDate = prof.find((p) => p.name === by)?.type === 'date'
  const [bucket, setBucket] = useState<'day' | 'week' | 'month' | 'year'>('month')
  return (
    <section className="card space-y-3 p-5">
      <h2 className="font-semibold">Make a chart yourself <span className="text-sm font-normal text-slate-500">(free, no AI)</span></h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm"><span className="label">Measure</span>
          <select className="input" value={op} onChange={(e) => setOp(e.target.value as Op)}>{(Object.keys(OP_LABEL) as Op[]).map((o) => <option key={o} value={o}>{OP_LABEL[o]}</option>)}</select>
        </label>
        <label className="text-sm"><span className="label">Of</span>
          <select className="input" value={op === 'count' ? '' : col} disabled={op === 'count'} onChange={(e) => setCol(e.target.value)}>
            {op === 'count' ? <option value="">rows</option> : (op === 'distinct' ? table.columns : nums).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm"><span className="label">By</span>
          <select className="input" value={by} onChange={(e) => setBy(e.target.value)}><option value="">(one total)</option>{groups.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
        {isDate ? (
          <label className="text-sm"><span className="label">Per</span>
            <select className="input" value={bucket} onChange={(e) => setBucket(e.target.value as typeof bucket)}>{['day', 'week', 'month', 'year'].map((b) => <option key={b} value={b}>{b}</option>)}</select>
          </label>
        ) : (
          <label className="text-sm"><span className="label">Chart</span>
            <select className="input" value={chart} onChange={(e) => setChart(e.target.value as Plan['chart'])}>{['bar', 'pie', 'line', 'table'].map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </label>
        )}
        <div className="flex items-end"><button className="btn btn-primary w-full" disabled={op !== 'count' && !col} onClick={() => onAdd({
          title: `${OP_LABEL[op]}${op === 'count' ? ' of rows' : ` of ${col}`}${by ? ` by ${by}` : ''}`,
          group_by: by || null, bucket: isDate ? bucket : null, metric: { op, column: op === 'count' ? null : col }, chart: isDate ? 'line' : by ? chart : 'number',
        })}>Add chart</button></div>
      </div>
    </section>
  )
}
