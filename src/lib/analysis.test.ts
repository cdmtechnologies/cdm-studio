import { describe, expect, it } from 'vitest'
import { cleanPlan, describeForAI, excelDate, fromGrid, parseCSV, profile, runPlan, sampleSales, toCSV, toDate, toValue } from './analysis'
import { blanksOf, fill, PROMPT_BANK } from './prompts'
import { cleanDataInput } from '../../supabase/functions/studio-data/lib'
import { topUp } from '../../supabase/functions/studio-pay/lib'
import { cleanSettings } from '../../supabase/functions/studio-control/lib'

describe('reading data', () => {
  it('reads CSV with quotes, commas in money and blank cells', () => {
    const t = parseCSV('Item,Amount,Date\n"Bread, big","₦1,200",20/11/2026\nRice,,2026-11-21\n')
    expect(t.columns).toEqual(['Item', 'Amount', 'Date'])
    expect(t.rows).toEqual([['Bread, big', 1200, '20/11/2026'], ['Rice', null, '2026-11-21']])
  })
  it('picks semicolons and tabs as separators', () => {
    expect(parseCSV('a;b\n1;2').rows).toEqual([[1, 2]])
    expect(parseCSV('a\tb\n1\t2').rows).toEqual([[1, 2]])
  })
  it('keeps phone numbers as text and reads percentages', () => {
    expect(toValue('08012345678')).toBe('08012345678')
    expect(toValue('45%')).toBe(45)
    expect(toValue('0.5')).toBe(0.5)
    expect(toValue('$3,000')).toBe(3000)
  })
  it('reads dates day first and refuses impossible ones', () => {
    expect(toDate('20/11/2026')?.toISOString().slice(0, 10)).toBe('2026-11-20')
    expect(toDate('2026-02-30')).toBe(null)
    expect(excelDate(46346)).toBe('2026-11-20')
  })
  it('names blank or repeated headers', () => {
    const t = fromGrid([['Item', '', 'Item'], ['a', 1, 'b']], 'x')
    expect(new Set(t.columns).size).toBe(3)
  })
})

describe('analysis', () => {
  const t = sampleSales()
  const p = profile(t)
  it('profiles column types', () => {
    const types = Object.fromEntries(p.map((c) => [c.name, c.type]))
    expect(Object.values(types)).toContain('number')
    expect(Object.values(types)).toContain('date')
  })
  it('groups and sums every row', () => {
    const num = p.find((c) => c.type === 'number')!.name
    const grp = p.find((c) => c.type === 'text')!.name
    const plan = cleanPlan({ title: 'x', group_by: grp, metric: { op: 'sum', column: num }, chart: 'bar' }, t.columns)!
    const r = runPlan(t, plan)
    const total = t.rows.reduce((a, row) => a + (Number(row[t.columns.indexOf(num)]) || 0), 0)
    expect(Math.round(r.values.reduce((a, b) => a + b, 0))).toBe(Math.round(total))
    expect(r.values).toEqual([...r.values].sort((a, b) => b - a))
  })
  it('groups dates by month in time order', () => {
    const date = p.find((c) => c.type === 'date')!.name
    const r = runPlan(t, cleanPlan({ title: 'm', group_by: date, bucket: 'month', metric: { op: 'count' }, chart: 'line' }, t.columns)!)
    expect(r.labels).toEqual([...r.labels].sort())
    expect(r.labels.every((l) => /^\d{4}-\d{2}$/.test(l))).toBe(true)
  })
  it('refuses plans with columns that are not in the data', () => {
    expect(cleanPlan({ title: 'x', metric: { op: 'sum', column: 'Nope' }, chart: 'bar' }, t.columns)).toBe(null)
    const c = cleanPlan({ title: 'x', metric: { op: 'count' }, filters: [{ column: 'Nope', op: '=', value: 1 }, { column: t.columns[0], op: 'drop', value: 1 }], chart: 'evil' }, t.columns)!
    expect(c.filters).toEqual([]); expect(c.chart).toBe('bar')
  })
  it('handles 200,000 rows for min and max', () => {
    const big = { name: 'big', columns: ['n'], rows: Array.from({ length: 200_000 }, (_, i) => [i]) }
    expect(runPlan(big, { title: 'max', metric: { op: 'max', column: 'n' }, chart: 'number' }).values[0]).toBe(199_999)
    expect(runPlan(big, { title: 'min', metric: { op: 'min', column: 'n' }, chart: 'number' }).values[0]).toBe(0)
  })
  it('filters with numbers, dates and text', () => {
    const d = parseCSV('who,amt,day\nA,10,01/11/2026\nB,20,15/11/2026\nA,30,20/11/2026')
    const sum = (f: unknown[]) => runPlan(d, cleanPlan({ title: 's', metric: { op: 'sum', column: 'amt' }, filters: f, chart: 'number' }, d.columns)!).values[0]
    expect(sum([{ column: 'amt', op: '>', value: 15 }])).toBe(50)
    expect(sum([{ column: 'day', op: '>=', value: '2026-11-15' }])).toBe(50)
    expect(sum([{ column: 'who', op: '=', value: 'a' }])).toBe(40)
  })
  it('sends the AI a short description, not the file', () => {
    const big = { name: 'big', columns: ['n', 'secret'], rows: Array.from({ length: 5000 }, (_, i) => [i, 'row' + i]) }
    const d = JSON.stringify(describeForAI(big, profile(big)))
    expect(d.length).toBeLessThan(40_000)
    expect(d).not.toContain('row4999')
  })
  it('exports CSV safely', () => {
    const csv = toCSV(['a', 'b', 'c'], [['x,y', '=1+1', -5]])
    expect(csv).toContain('"x,y"'); expect(csv).toContain("'=1+1"); expect(csv).toContain(',-5')
  })
})

describe('prompt bank', () => {
  it('has unique ids and every blank has an example', () => {
    const ids = PROMPT_BANK.flatMap((g) => g.items.map((i) => i.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const g of PROMPT_BANK) for (const i of g.items) { expect(blanksOf(i.text).length).toBeGreaterThan(0); expect(fill(i.text, {})).not.toMatch(/[{}]/) }
  })
  it('fills blanks with answers or examples', () => {
    expect(fill('Hi {Name|Ada}, from {City|Abuja}', { Name: ' Tobi ' })).toBe('Hi Tobi, from Abuja')
  })
})

describe('data function input', () => {
  it('needs a question and data, and keeps requests small', () => {
    expect(cleanDataInput({ mode: 'plan', question: '', data: {} }).error).toBeTruthy()
    expect(cleanDataInput({ mode: 'plan', question: 'sales by branch', data: { x: 'y'.repeat(50_000) } }).error).toBeTruthy()
    expect(cleanDataInput({ mode: 'plan', question: 'sales by branch', data: { columns: [] } }).input?.mode).toBe('plan')
    expect(cleanDataInput({ mode: 'insights', results: null }).error).toBeTruthy()
  })
})

describe('credits', () => {
  const s = { credit_price_ngn: 10, usd_ngn: 1600, min_topup_ngn: 500, min_topup_usd: 1 }
  it('works out credits on the server for any amount', () => {
    expect(topUp(2500, 'NGN', s)).toEqual({ amount: 2500, credits: 250 })
    expect(topUp('1234.6', 'NGN', s)).toEqual({ amount: 1235, credits: 123 })
    expect(topUp(5, 'USD', s)).toEqual({ amount: 5, credits: 800 })
  })
  it('refuses too little, too much and nonsense', () => {
    expect('error' in topUp(100, 'NGN', s)).toBe(true)
    expect('error' in topUp(0.5, 'USD', s)).toBe(true)
    expect('error' in topUp(9_000_000, 'NGN', s)).toBe(true)
    expect('error' in topUp('abc', 'NGN', s)).toBe(true)
    expect('error' in topUp(-500, 'NGN', s)).toBe(true)
  })
  it('owner settings keep the credit fields within limits', () => {
    const c = cleanSettings({ markup: 50, credit_price_ngn: 10, usd_ngn: 1650.5, signup_credits: 20, free_data_daily: 3, evil: 1 })
    expect(c).toEqual({ markup: 20, credit_price_ngn: 10, usd_ngn: 1650.5, signup_credits: 20, free_data_daily: 3 })
  })
})
