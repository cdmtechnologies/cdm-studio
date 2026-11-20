// Pure helpers for studio-data (unit tested).

export const PLAN_SCHEMA = {
  type: 'object',
  required: ['title', 'metric', 'chart', 'explanation'],
  properties: {
    title: { type: 'string', description: 'Short title of the result, e.g. "Sales by branch"' },
    filters: {
      type: 'array', maxItems: 5,
      items: { type: 'object', required: ['column', 'op', 'value'], properties: {
        column: { type: 'string' }, op: { type: 'string', enum: ['=', '!=', '>', '>=', '<', '<=', 'contains'] }, value: { type: ['string', 'number'] } } },
    },
    group_by: { type: 'string', description: 'Column to group by (omit for one total)' },
    bucket: { type: 'string', enum: ['day', 'week', 'month', 'year'], description: 'Only when group_by is a date column' },
    metric: { type: 'object', required: ['op'], properties: { op: { type: 'string', enum: ['count', 'sum', 'avg', 'min', 'max', 'median', 'distinct'] }, column: { type: 'string' } } },
    sort: { type: 'string', enum: ['desc', 'asc', 'label'] },
    limit: { type: 'integer', minimum: 1, maximum: 50 },
    chart: { type: 'string', enum: ['bar', 'line', 'pie', 'table', 'number'] },
    explanation: { type: 'string', description: 'One or two plain sentences: how this answers the question' },
  },
}

export const PLAN_TOOL = {
  name: 'analysis_plans',
  description: 'Plans the app will run on every row of the data',
  input_schema: {
    type: 'object', required: ['plans'],
    properties: {
      plans: { type: 'array', minItems: 1, maxItems: 4, items: PLAN_SCHEMA },
      note: { type: 'string', description: 'Optional short note, e.g. when the data cannot answer the question' },
    },
  },
}

export type DataInput = { mode: 'plan' | 'suggest' | 'insights'; question: string; data: unknown; results: unknown }

/** Checks the request and keeps it small: the description of the data and results only, never whole files. */
export function cleanDataInput(raw: unknown): { input?: DataInput; error?: string } {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const mode = b.mode === 'suggest' || b.mode === 'insights' ? b.mode : 'plan'
  const question = typeof b.question === 'string' ? b.question.replace(/\u0000/g, '').trim().slice(0, 1000) : ''
  if (mode === 'plan' && question.length < 3) return { error: 'Type a question about your data first.' }
  const data = JSON.stringify(b.data ?? null)
  const results = JSON.stringify(b.results ?? null)
  if (data.length > 40_000) return { error: 'That is too much to send. Try a file with fewer columns.' }
  if (results.length > 20_000) return { error: 'Those results are too big to explain. Pick fewer.' }
  if (mode !== 'insights' && !b.data) return { error: 'Open a data file first.' }
  if (mode === 'insights' && !b.results) return { error: 'Run an analysis first.' }
  return { input: { mode, question, data: b.data, results: b.results } }
}

export const DATA_SYSTEM = `You are the data analyst in CDM Studio. People (many of them beginners, many small business owners in Africa) upload a spreadsheet and ask questions about it.
You never see the whole file: you get the column names, their types (number, date, text), simple figures and up to 20 sample rows.
The app runs your plans on every row, so use EXACT column names. Date columns can be grouped by day, week, month or year with "bucket".
Choose charts well: "line" for a measure over time, "bar" for comparing categories (sorted desc), "pie" only for a few parts of a whole, "number" for one total, "table" for long lists.
Money is in naira (₦) unless the data says otherwise. Reply in the language the person writes in.`

export function userText(i: DataInput): string {
  const data = `Data:\n${JSON.stringify(i.data)}`
  if (i.mode === 'suggest') return `${data}\n\nSuggest the 4 most useful questions a busy owner would ask about this data, each as a plan (the title is the question).`
  if (i.mode === 'insights') return `${i.data ? data + '\n\n' : ''}Results the app worked out:\n${JSON.stringify(i.results)}\n\n${i.question ? `The person asked: ${i.question}\n\n` : ''}Explain what these results show in 3 to 5 short bullet points: the main finding with its number, anything surprising, and one practical next step. Plain words, no tables.`
  return `${data}\n\nQuestion: ${i.question}\n\nAnswer with 1 to 3 plans that together answer it. If the data cannot answer it, say why in note and give the closest useful plan.`
}
