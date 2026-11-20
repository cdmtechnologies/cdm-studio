// Data analysis that runs in the browser: read CSV and Excel (.xlsx) files, profile the columns, and run analysis
// plans (filter, group, measure, sort) on every row. The data never leaves the device; the AI only sees column
// names, types, a few figures and up to 20 sample rows, and answers with a plan that is run here.

export type Cell = string | number | null
export type Table = { name: string; columns: string[]; rows: Cell[][] }
export type ColType = 'number' | 'date' | 'text'
export type Profile = {
  name: string; type: ColType; filled: number; missing: number; unique: number
  min?: number | string; max?: number | string; sum?: number; avg?: number; top?: { value: string; count: number }[]
}

export const MAX_ROWS = 200_000
export const MAX_COLS = 200

// ---------- reading ----------

/** CSV / TSV / semicolon files, with quotes. Picks the separator from the first line. */
export function parseCSV(text: string, name = 'data'): Table {
  const src = text.replace(/^﻿/, '')
  const first = src.slice(0, src.indexOf('\n') > 0 ? src.indexOf('\n') : src.length)
  const counts = [',', ';', '\t', '|'].map((d) => [d, first.split(d).length] as const).sort((a, b) => b[1] - a[1])
  const sep = counts[0][1] > 1 ? counts[0][0] : ','
  const rows: string[][] = []
  let row: string[] = [], cell = '', q = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (q) {
      if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++ } else q = false }
      else cell += c
    } else if (c === '"' && cell === '') q = true
    else if (c === sep) { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some((x) => x.trim() !== '')) rows.push(row)
      row = []
      if (rows.length > MAX_ROWS) break
    } else cell += c
  }
  if (cell !== '' || row.length) { row.push(cell); if (row.some((x) => x.trim() !== '')) rows.push(row) }
  return fromGrid(rows, name)
}

/** First row = headers (blank or repeated headers get a name), the rest = data with numbers as numbers. */
export function fromGrid(grid: Cell[][], name: string): Table {
  if (!grid.length) return { name, columns: [], rows: [] }
  const width = Math.min(MAX_COLS, Math.max(...grid.slice(0, 50).map((r) => r.length)))
  const seen = new Map<string, number>()
  const columns = Array.from({ length: width }, (_, i) => {
    let h = String(grid[0][i] ?? '').trim() || `Column ${i + 1}`
    const n = seen.get(h) ?? 0
    seen.set(h, n + 1)
    if (n) h = `${h} (${n + 1})`
    return h.slice(0, 80)
  })
  const rows = grid.slice(1, MAX_ROWS + 1).map((r) => Array.from({ length: width }, (_, i) => toValue(r[i])))
  return { name, columns, rows }
}

/** "₦1,200.50" -> 1200.5, "45%" -> 45, "" -> null; anything else stays text. */
export function toValue(v: Cell | undefined): Cell {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const s = String(v).trim()
  if (!s) return null
  const n = s.replace(/^[₦$£€]\s?|\s?(NGN|USD)$/i, '').replace(/,(?=\d{3}(\D|$))/g, '').replace(/%$/, '')
  if (/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(n) && !/^0\d/.test(n)) return Number(n)
  return s
}

const DATE_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})|^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/
/** A date written as 2026-11-20, 20/11/2026 or 20-11-26 (day first, as in Nigeria and the UK). */
export function toDate(v: Cell): Date | null {
  if (typeof v !== 'string') return null
  const m = DATE_RE.exec(v.trim().slice(0, 10))
  if (!m) return null
  const [y, mo, d] = m[1] ? [+m[1], +m[2], +m[3]] : [+m[6] < 100 ? 2000 + +m[6] : +m[6], +m[5], +m[4]]
  const dt = new Date(Date.UTC(y, mo - 1, d))
  return dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d ? dt : null
}

/** Excel .xlsx: a zip of XML files. Reads the first sheet (or the one named), using the browser's own unzip. */
export async function parseXLSX(buf: ArrayBuffer, name = 'data', sheetIndex = 0): Promise<Table & { sheets: string[] }> {
  const files = await unzip(buf, (p) => /^xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|styles\.xml|worksheets\/[^/]+\.xml)$/.test(p))
  const xml = (p: string) => (files[p] ? new DOMParser().parseFromString(files[p], 'application/xml') : null)
  const wb = xml('xl/workbook.xml')
  if (!wb) throw new Error('This does not look like an Excel .xlsx file.')
  const rels = xml('xl/_rels/workbook.xml.rels')
  const sheets = [...wb.getElementsByTagName('sheet')].map((s) => ({ name: s.getAttribute('name') || 'Sheet', rid: s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || '' }))
  const pick = sheets[Math.min(sheetIndex, sheets.length - 1)]
  const target = [...(rels?.getElementsByTagName('Relationship') ?? [])].find((r) => r.getAttribute('Id') === pick?.rid)?.getAttribute('Target') || 'worksheets/sheet1.xml'
  const sheetPath = 'xl/' + target.replace(/^\/?xl\//, '').replace(/^\//, '')
  const sheet = xml(sheetPath)
  if (!sheet) throw new Error('Could not read the sheet.')
  const shared = [...(xml('xl/sharedStrings.xml')?.getElementsByTagName('si') ?? [])].map((si) => [...si.getElementsByTagName('t')].map((t) => t.textContent ?? '').join(''))
  // which cell styles are dates
  const styles = xml('xl/styles.xml')
  const customDate = new Set([...(styles?.getElementsByTagName('numFmt') ?? [])].filter((f) => /[dmy]/i.test((f.getAttribute('formatCode') || '').replace(/"[^"]*"|\[[^\]]*\]/g, ''))).map((f) => f.getAttribute('numFmtId')))
  const xfs = styles?.getElementsByTagName('cellXfs')[0]
  const dateStyle = [...(xfs?.getElementsByTagName('xf') ?? [])].map((x) => { const id = x.getAttribute('numFmtId') || '0'; return (+id >= 14 && +id <= 22) || customDate.has(id) })
  const grid: Cell[][] = []
  for (const r of [...sheet.getElementsByTagName('row')].slice(0, MAX_ROWS + 1)) {
    const row: Cell[] = []
    for (const c of r.getElementsByTagName('c')) {
      const ref = c.getAttribute('r') || ''
      const col = colIndex(ref.replace(/\d+/g, ''))
      if (col >= MAX_COLS) continue
      const t = c.getAttribute('t')
      const v = c.getElementsByTagName('v')[0]?.textContent ?? ''
      let val: Cell = null
      if (t === 's') val = shared[+v] ?? ''
      else if (t === 'inlineStr') val = [...c.getElementsByTagName('t')].map((x) => x.textContent ?? '').join('')
      else if (t === 'b') val = v === '1' ? 'TRUE' : 'FALSE'
      else if (t === 'str' || t === 'e') val = v
      else if (v !== '') {
        const n = Number(v)
        val = dateStyle[+(c.getAttribute('s') || 0)] && n > 0 && n < 2958466 ? excelDate(n) : n
      }
      row[col] = val
    }
    grid.push(row)
  }
  return { ...fromGrid(grid, name), sheets: sheets.map((s) => s.name) }
}

const colIndex = (letters: string) => [...letters.toUpperCase()].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1
/** Excel day number -> 2026-11-20 */
export function excelDate(n: number): string {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.round(n * 86400000))
  return d.toISOString().slice(0, 10)
}

async function unzip(buf: ArrayBuffer, want: (path: string) => boolean): Promise<Record<string, string>> {
  const b = new DataView(buf)
  let eocd = -1
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (b.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  if (eocd < 0) throw new Error('This does not look like an Excel .xlsx file.')
  const count = b.getUint16(eocd + 10, true)
  let p = b.getUint32(eocd + 16, true)
  const out: Record<string, string> = {}
  const dec = new TextDecoder()
  for (let k = 0; k < count; k++) {
    if (b.getUint32(p, true) !== 0x02014b50) break
    const method = b.getUint16(p + 10, true), size = b.getUint32(p + 20, true)
    const nameLen = b.getUint16(p + 28, true), extra = b.getUint16(p + 30, true), comment = b.getUint16(p + 32, true)
    const local = b.getUint32(p + 42, true)
    const path = dec.decode(new Uint8Array(buf, p + 46, nameLen))
    p += 46 + nameLen + extra + comment
    if (!want(path)) continue
    const start = local + 30 + b.getUint16(local + 26, true) + b.getUint16(local + 28, true)
    const data = new Uint8Array(buf, start, size)
    if (method === 0) out[path] = dec.decode(data)
    else if (method === 8) {
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      out[path] = await new Response(stream).text()
    }
  }
  return out
}

// ---------- understanding the columns ----------

export function profile(t: Table): Profile[] {
  return t.columns.map((name, i) => {
    const vals = t.rows.map((r) => r[i])
    const filled = vals.filter((v) => v !== null)
    const nums = filled.filter((v): v is number => typeof v === 'number')
    const dates = filled.length && nums.length < filled.length * 0.9 ? filled.filter((v) => toDate(v) !== null) : []
    const type: ColType = filled.length && nums.length >= filled.length * 0.9 ? 'number' : filled.length && dates.length >= filled.length * 0.9 ? 'date' : 'text'
    const counts = new Map<string, number>()
    for (const v of filled) { const k = String(v); counts.set(k, (counts.get(k) ?? 0) + 1) }
    const p: Profile = { name, type, filled: filled.length, missing: vals.length - filled.length, unique: counts.size }
    if (type === 'number' && nums.length) {
      let min = Infinity, max = -Infinity, sum = 0
      for (const n of nums) { if (n < min) min = n; if (n > max) max = n; sum += n }
      Object.assign(p, { min, max, sum: round(sum), avg: round(sum / nums.length) })
    } else if (type === 'date') {
      const ds = dates.map((v) => toDate(v)!.toISOString().slice(0, 10)).sort()
      Object.assign(p, { min: ds[0], max: ds[ds.length - 1] })
    }
    if (type !== 'number' || counts.size <= 12) p.top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([value, count]) => ({ value: value.slice(0, 60), count }))
    return p
  })
}

export const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d

// ---------- analysis plans ----------

export type Op = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'median' | 'distinct'
export type Filter = { column: string; op: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'contains'; value: string | number }
export type Plan = {
  title: string
  filters?: Filter[]
  group_by?: string | null
  bucket?: 'day' | 'week' | 'month' | 'year' | null
  metric: { op: Op; column?: string | null }
  sort?: 'desc' | 'asc' | 'label'
  limit?: number
  chart: 'bar' | 'line' | 'pie' | 'table' | 'number'
  explanation?: string
}
export type Result = { title: string; labels: string[]; values: number[]; total: number; rowsUsed: number; chart: Plan['chart']; metricLabel: string; groupLabel: string | null; explanation?: string }

const OPS: Op[] = ['count', 'sum', 'avg', 'min', 'max', 'median', 'distinct']
const FOPS = ['=', '!=', '>', '>=', '<', '<=', 'contains']

/** Keeps only a plan that fits this table (the AI's plan is checked like anything else from outside). */
export function cleanPlan(raw: unknown, columns: string[]): Plan | null {
  const o = (raw && typeof raw === 'object' ? raw : null) as Record<string, any> | null
  if (!o) return null
  const has = (c: unknown) => typeof c === 'string' && columns.includes(c)
  const m = o.metric ?? {}
  const op: Op = OPS.includes(m.op) ? m.op : 'count'
  if (op !== 'count' && !has(m.column)) return null
  const filters = Array.isArray(o.filters) ? o.filters.filter((f: any) => has(f?.column) && FOPS.includes(f?.op) && (typeof f?.value === 'string' || typeof f?.value === 'number')).slice(0, 5) : []
  return {
    title: String(o.title ?? 'Result').slice(0, 120),
    filters,
    group_by: has(o.group_by) ? o.group_by : null,
    bucket: ['day', 'week', 'month', 'year'].includes(o.bucket) ? o.bucket : null,
    metric: { op, column: op === 'count' && !has(m.column) ? null : m.column },
    sort: ['desc', 'asc', 'label'].includes(o.sort) ? o.sort : undefined,
    limit: Math.min(50, Math.max(1, Math.round(Number(o.limit) || 20))),
    chart: ['bar', 'line', 'pie', 'table', 'number'].includes(o.chart) ? o.chart : 'bar',
    explanation: typeof o.explanation === 'string' ? o.explanation.slice(0, 600) : undefined,
  }
}

function matches(v: Cell, f: Filter): boolean {
  if (f.op === 'contains') return String(v ?? '').toLowerCase().includes(String(f.value).toLowerCase())
  const dv = toDate(v), df = toDate(String(f.value))
  const a: Cell = dv && df ? dv.getTime() : typeof v === 'number' ? v : String(v ?? '').toLowerCase()
  const b: Cell = dv && df ? df.getTime() : typeof v === 'number' ? Number(f.value) : String(f.value).toLowerCase()
  switch (f.op) {
    case '=': return a === b
    case '!=': return a !== b
    case '>': return a! > b!
    case '>=': return a! >= b!
    case '<': return a! < b!
    case '<=': return a! <= b!
  }
  return false
}

function bucketOf(v: Cell, b: Plan['bucket']): string {
  const d = toDate(v)
  if (!d || !b) return v === null ? '(blank)' : String(v)
  const iso = d.toISOString()
  if (b === 'day') return iso.slice(0, 10)
  if (b === 'month') return iso.slice(0, 7)
  if (b === 'year') return iso.slice(0, 4)
  const monday = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86400000)
  return 'w/c ' + monday.toISOString().slice(0, 10)
}

function measure(op: Op, vals: Cell[]): number {
  if (op === 'count') return vals.length
  if (op === 'distinct') return new Set(vals.filter((v) => v !== null).map(String)).size
  const n = vals.filter((v): v is number => typeof v === 'number')
  if (!n.length) return 0
  if (op === 'sum') return round(n.reduce((a, b) => a + b, 0))
  if (op === 'avg') return round(n.reduce((a, b) => a + b, 0) / n.length)
  // a loop, not Math.min(...n): spreading 200,000 values overflows the stack
  if (op === 'min') { let m = Infinity; for (const x of n) if (x < m) m = x; return m }
  if (op === 'max') { let m = -Infinity; for (const x of n) if (x > m) m = x; return m }
  const s = [...n].sort((a, b) => a - b)
  return s.length % 2 ? s[(s.length - 1) / 2] : round((s[s.length / 2 - 1] + s[s.length / 2]) / 2)
}

export const OP_LABEL: Record<Op, string> = { count: 'Count', sum: 'Total', avg: 'Average', min: 'Lowest', max: 'Highest', median: 'Middle value', distinct: 'Different values' }

/** Runs a plan on every row. */
export function runPlan(t: Table, plan: Plan): Result {
  const idx = (c?: string | null) => (c ? t.columns.indexOf(c) : -1)
  let rows = t.rows
  for (const f of plan.filters ?? []) { const i = idx(f.column); rows = rows.filter((r) => matches(r[i], f)) }
  const mi = idx(plan.metric.column)
  const metricLabel = `${OP_LABEL[plan.metric.op]}${plan.metric.column ? ` of ${plan.metric.column}` : ' of rows'}`
  if (!plan.group_by) {
    const v = measure(plan.metric.op, mi >= 0 ? rows.map((r) => r[mi]) : rows.map(() => 1))
    return { title: plan.title, labels: [metricLabel], values: [v], total: v, rowsUsed: rows.length, chart: 'number', metricLabel, groupLabel: null, explanation: plan.explanation }
  }
  const gi = idx(plan.group_by)
  const groups = new Map<string, Cell[]>()
  for (const r of rows) {
    const k = bucketOf(r[gi], plan.bucket ?? null)
    const list = groups.get(k) ?? []
    list.push(mi >= 0 ? r[mi] : 1)
    groups.set(k, list)
  }
  let pairs = [...groups.entries()].map(([k, vals]) => [k, measure(plan.metric.op, vals)] as [string, number])
  const timeLike = !!plan.bucket || plan.chart === 'line'
  const sort = plan.sort ?? (timeLike ? 'label' : 'desc')
  pairs.sort((a, b) => (sort === 'label' ? a[0].localeCompare(b[0], undefined, { numeric: true }) : sort === 'asc' ? a[1] - b[1] : b[1] - a[1]))
  if (!timeLike) pairs = pairs.slice(0, plan.limit ?? 20)
  else pairs = pairs.slice(-(plan.limit && plan.limit > 1 ? Math.max(plan.limit, 24) : 60))
  return {
    title: plan.title, labels: pairs.map((p) => p[0]), values: pairs.map((p) => p[1]), total: round(pairs.reduce((a, p) => a + p[1], 0)),
    rowsUsed: rows.length, chart: plan.chart === 'number' ? 'bar' : plan.chart, metricLabel, groupLabel: plan.group_by + (plan.bucket ? ` (by ${plan.bucket})` : ''), explanation: plan.explanation,
  }
}

/** What the AI is told about the data: never the whole file. */
export function describeForAI(t: Table, p: Profile[]) {
  return {
    name: t.name.slice(0, 80), rows: t.rows.length,
    columns: p.map((c) => ({ name: c.name, type: c.type, missing: c.missing, unique: c.unique, min: c.min, max: c.max, avg: c.avg, sum: c.sum, top: c.top?.slice(0, 5) })),
    sample: t.rows.slice(0, 20).map((r) => r.map((v) => (typeof v === 'string' ? v.slice(0, 60) : v))),
  }
}

export function toCSV(columns: string[], rows: Cell[][]): string {
  // text starting with = + - @ could run as a formula when opened in Excel, so it gets a leading '
  const esc = (v: Cell) => { let s = v === null ? '' : String(v); if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  return [columns.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
}

export const fmtNum = (n: number) => (Math.abs(n) >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : n.toLocaleString(undefined, { maximumFractionDigits: 2 }))

/** A small example file so people can try the tool straight away. */
export function sampleSales(): Table {
  const items = [['Bread', 'Bakery', 1200], ['Milk', 'Dairy', 1500], ['Rice 5kg', 'Grains', 9800], ['Indomie', 'Grains', 350], ['Eggs (crate)', 'Dairy', 5400], ['Sugar', 'Grains', 1700], ['Malt drink', 'Drinks', 600], ['Water (pack)', 'Drinks', 1800]] as const
  const branches = ['Wuse', 'Garki', 'Maitama', 'Kubwa']
  const rows: Cell[][] = []
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (let d = 0; d < 120; d++) {
    const date = new Date(Date.UTC(2026, 6, 1) + d * 86400000).toISOString().slice(0, 10)
    for (let k = 0; k < 6; k++) {
      const [item, cat, price] = items[Math.floor(rnd() * items.length)]
      const qty = 1 + Math.floor(rnd() * (cat === 'Drinks' ? 12 : 6))
      rows.push([date, branches[Math.floor(rnd() * branches.length)], item, cat, qty, price, qty * price])
    }
  }
  return { name: 'Sample shop sales (Jul to Oct 2026)', columns: ['Date', 'Branch', 'Item', 'Category', 'Quantity', 'Unit price', 'Amount'], rows }
}
