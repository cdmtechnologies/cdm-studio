import type { Course } from './types'
import { analyticsExam, analyticsMore, analyticsProject } from './extra/analytics'

export const analytics: Course = {
  id: 'analytics',
  title: 'Data analytics for business',
  blurb: 'Turn spreadsheets into decisions: clean data, summarise it, find trends, build KPIs and tell the story with charts.',
  emoji: '📈',
  colour: 'amber',
  level: 'Beginner',
  hours: 14,
  free: 2,
  skills: ['Asking good business questions', 'Data cleaning', 'Descriptive statistics', 'Pivot tables and grouping', 'Trends, growth and moving averages', 'KPIs and dashboards', 'Data storytelling'],
  careers: ['Data analyst', 'Business analyst', 'Finance / sales analyst', 'Operations analyst'],
  lessons: [
    {
      id: 'analytics-questions',
      title: 'The analyst\'s job: from questions to decisions',
      minutes: 15,
      kind: 'read',
      outline: 'The analytics process, kinds of analysis, and how to ask questions that lead to action.',
      body: `## Analysts sell decisions, not charts

A shop owner does not want "a dashboard". She wants to know **which branch to restock, which product to stop, and whether last month's promo paid off**. The analyst's job is to turn data into a decision someone can act on.

## The process

1. **Ask**: what decision is being made, by whom, and by when?
2. **Get the data**: POS exports, spreadsheets, bank statements, forms. Know where each number comes from.
3. **Clean**: fix types, duplicates, blanks and mistakes (most of the work).
4. **Analyse**: summarise, compare, look for trends and outliers.
5. **Share**: a short story with one clear message, the numbers that prove it, and a recommendation.
6. **Act and measure**: did the decision work?

## Four kinds of analysis

- **Descriptive**: what happened? *Sales were ₦4.2m in October.*
- **Diagnostic**: why? *Garki fell because the generator broke for a week.*
- **Predictive**: what will happen? *December will be about 30% above October.*
- **Prescriptive**: what should we do? *Stock 40% more rice in Wuse before the holidays.*

## Good questions are SMART

Specific, measurable, action-oriented, relevant and time-bound. Weak: *"How are sales?"* Strong: *"Which 5 products lost the most revenue in Q3 compared with Q2, by branch, so we can decide what to reorder for Q4?"*

## Tools

Spreadsheets (Excel, Google Sheets) take you far. Then SQL to pull data from databases, a BI tool (Power BI, Looker Studio, Tableau) for dashboards, and Python for heavier work. CDM Studio's **Data** page lets you practise on your own files right now. In this course you will build the core calculations in code, so the logic behind every tool is clear.`,
      quiz: [
        { q: '"Sales will be about 30% higher in December" is…', options: ['Descriptive', 'Predictive', 'Diagnostic'], answer: 1, why: 'It says what will happen.' },
        { q: 'Which question is the strongest?', options: ['How is the business doing?', 'Which 5 products lost the most revenue in Q3 vs Q2, by branch, to plan Q4 orders?', 'Can you make a chart?'], answer: 1, why: 'Specific, measurable, tied to a decision and a time.' },
        { q: 'Most of an analyst\'s time usually goes to…', options: ['Choosing chart colours', 'Getting and cleaning data', 'Writing emails'], answer: 1, why: 'Data preparation dominates real work.' },
      ],
    },
    {
      id: 'analytics-cleaning',
      title: 'Cleaning messy data',
      minutes: 25,
      kind: 'code',
      outline: 'Fix money written as text, trim names, standardise categories and remove duplicates.',
      body: `## Real data is messy

A POS export or a sheet many people type into usually has:

- Money as text: \`"₦1,200"\`, \`"1200 "\`, \`"N1,200.50"\`
- Names typed differently: \`"Indomie"\`, \`" indomie"\`, \`"INDOMIE "\`
- Duplicate rows from exporting twice
- Blank or impossible values (a negative quantity, a date in 2062)

If you sum before cleaning, the totals are simply wrong.

## Rules of thumb

1. **Keep the raw file** untouched; clean a copy.
2. **Make each column one type**: numbers as numbers, dates as dates.
3. **Standardise text**: trim spaces, consistent capitals, one name per thing.
4. **Remove exact duplicates**, but check: two identical sales might be real.
5. **Write down every rule** you applied, so others can trust the result.

## Your task

1. \`toNumber(text)\`: remove \`₦\`, \`N\` at the start, commas and spaces, then convert. Return \`null\` if it is not a valid number. Real numbers pass through unchanged.
2. \`tidyName(text)\`: trim, collapse inner spaces, and make it Title Case (\`" INDOMIE  noodles"\` → \`"Indomie Noodles"\`).
3. \`dedupe(rows)\`: remove rows that are exactly the same as an earlier row (compare with \`JSON.stringify\`), keeping the first.`,
      task: 'Write toNumber, tidyName and dedupe.',
      starter: `<script>
  function toNumber(text) {
  }
  function tidyName(text) {
  }
  function dedupe(rows) {
  }
</script>
`,
      checks: [
        { label: 'money text becomes a number', test: `return toNumber('₦1,200') === 1200 && toNumber(' N1,200.50 ') === 1200.5 && toNumber('3500') === 3500` },
        { label: 'numbers pass through', test: `return toNumber(42) === 42` },
        { label: 'nonsense becomes null', test: `return toNumber('abc') === null && toNumber('') === null` },
        { label: 'names are tidied', test: `return tidyName('  INDOMIE   noodles ') === 'Indomie Noodles' && tidyName('milk') === 'Milk'` },
        { label: 'exact duplicates removed, first kept', test: `return JSON.stringify(dedupe([['a', 1], ['b', 2], ['a', 1], ['a', 2]])) === '[["a",1],["b",2],["a",2]]'` },
      ],
      hint: "toNumber: if (typeof text === 'number') return text; const s = String(text).trim().replace(/^[₦N]/, '').replace(/[,\\s]/g, ''); if (s === '') return null; const n = Number(s); return Number.isFinite(n) ? n : null",
      solution: `<script>
  function toNumber(text) {
    if (typeof text === 'number') return text
    const s = String(text).trim().replace(/^[₦N]/, '').replace(/[,\\s]/g, '')
    if (s === '') return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }
  function tidyName(text) { return String(text).trim().split(/\\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') }
  function dedupe(rows) { const seen = new Set(); return rows.filter((r) => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true }) }
</script>`,
    },
    {
      id: 'analytics-stats',
      title: 'Descriptive statistics that matter',
      minutes: 25,
      kind: 'code',
      outline: 'Mean, median, percentiles and spotting outliers with the IQR rule.',
      body: `## Average is not enough

If 9 customers spend ₦5,000 and one spends ₦500,000, the **mean** is ₦54,500, which describes nobody. Use the right summary:

- **Mean**: sum ÷ count. Good when values are fairly even.
- **Median**: the middle value when sorted (average of the two middle ones for an even count). Not pulled by extremes: ₦5,000 above.
- **Percentiles**: the 90th percentile is the value 90% of data is below. Useful for delivery times: *"90% of orders arrive within 2 days."*
- **Spread**: range (max − min), standard deviation, and the **interquartile range (IQR)** = Q3 − Q1 (the middle 50%).

## Outliers

Values far from the rest may be **errors** (an extra zero typed) or **important** (a big new customer). A common rule: a value is an outlier if it is below **Q1 − 1.5 × IQR** or above **Q3 + 1.5 × IQR**. Always check outliers before deleting them.

## Percentile method

Many tools use linear interpolation: sort the values; position = p × (n − 1); if it is not a whole number, take the value between the two neighbours in proportion. For p = 0.5 this gives the median.

## Your task

1. \`median(values)\`
2. \`percentile(values, p)\` with the interpolation above (p between 0 and 1)
3. \`outliers(values)\`: the values outside Q1 − 1.5×IQR and Q3 + 1.5×IQR, in their original order (Q1 = 25th percentile, Q3 = 75th).

Do not change the input array (sort a copy).`,
      task: 'Write median, percentile and outliers.',
      starter: `<script>
  function median(values) {
  }
  function percentile(values, p) {
  }
  function outliers(values) {
  }
</script>
`,
      checks: [
        { label: 'median of an odd count', test: `return median([5, 1, 3]) === 3` },
        { label: 'median of an even count', test: `return median([4, 1, 3, 2]) === 2.5` },
        { label: 'percentile interpolates', test: `return Math.abs(percentile([10, 20, 30, 40], 0.25) - 17.5) < 1e-9 && Math.abs(percentile([10, 20, 30, 40], 0.9) - 37) < 1e-9` },
        { label: 'outliers found with the IQR rule', test: `return JSON.stringify(outliers([5000, 5200, 4800, 500000, 5100, 4900, 5050])) === '[500000]'` },
        { label: 'input is not changed', test: `const a = [3, 1, 2]; median(a); percentile(a, 0.5); return a.join() === '3,1,2'` },
      ],
      hint: 'percentile: const s = [...values].sort((a, b) => a - b); const pos = p * (s.length - 1); const lo = Math.floor(pos), hi = Math.ceil(pos); return s[lo] + (s[hi] - s[lo]) * (pos - lo). median is percentile(values, 0.5).',
      solution: `<script>
  function percentile(values, p) { const s = [...values].sort((a, b) => a - b); const pos = p * (s.length - 1); const lo = Math.floor(pos), hi = Math.ceil(pos); return s[lo] + (s[hi] - s[lo]) * (pos - lo) }
  function median(values) { return percentile(values, 0.5) }
  function outliers(values) { const q1 = percentile(values, 0.25), q3 = percentile(values, 0.75), iqr = q3 - q1; return values.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr) }
</script>`,
    },
    {
      id: 'analytics-pivot',
      title: 'Pivot tables: grouping and summarising',
      minutes: 25,
      kind: 'code',
      outline: 'Build the logic of a pivot table: totals by row and column categories, plus share of total.',
      body: `## The most useful spreadsheet tool

A **pivot table** answers questions like *"total sales by branch and by month"* in seconds. It:

1. Groups rows by one category (rows of the pivot), and optionally a second (columns)
2. Applies a measure to each group (sum, count, average)
3. Adds totals

## Shares tell the story

Absolute numbers are hard to compare; **shares** are easier: *"Wuse is 38% of all sales."* Share = group total ÷ grand total.

## Your task

Sales rows look like \`{ branch, month, amount }\`.

1. \`pivot(rows, rowKey, colKey, valueKey)\`: return an object where \`result[row][col]\` is the **sum** of \`valueKey\` for that pair. Missing pairs are simply absent.
2. \`totals(rows, key, valueKey)\`: an array of \`{ name, total, share }\` for each value of \`key\`, sorted by total, highest first. \`share\` is a percentage rounded to 1 decimal place.`,
      task: 'Write pivot and totals.',
      starter: `<script>
  const SALES = [
    { branch: 'Wuse', month: 'Sep', amount: 400 },
    { branch: 'Wuse', month: 'Oct', amount: 600 },
    { branch: 'Garki', month: 'Sep', amount: 300 },
    { branch: 'Garki', month: 'Sep', amount: 100 },
    { branch: 'Kubwa', month: 'Oct', amount: 200 },
  ]
  function pivot(rows, rowKey, colKey, valueKey) {
  }
  function totals(rows, key, valueKey) {
  }
</script>
`,
      checks: [
        { label: 'pivot sums each pair', test: `const p = pivot(SALES, 'branch', 'month', 'amount'); return p.Wuse.Sep === 400 && p.Wuse.Oct === 600 && p.Garki.Sep === 400` },
        { label: 'missing pairs are absent', test: `const p = pivot(SALES, 'branch', 'month', 'amount'); return p.Garki.Oct === undefined && p.Kubwa.Sep === undefined` },
        { label: 'totals sorted highest first', test: `return totals(SALES, 'branch', 'amount').map(t => t.name).join() === 'Wuse,Garki,Kubwa'` },
        { label: 'shares are percentages to 1 decimal', test: `const t = totals(SALES, 'branch', 'amount'); return t[0].share === 62.5 && t[2].share === 12.5` },
      ],
      hint: 'pivot: const out = {}; for (const r of rows) { const a = r[rowKey], b = r[colKey]; out[a] = out[a] || {}; out[a][b] = (out[a][b] || 0) + r[valueKey] }',
      solution: `<script>
  const SALES = [
    { branch: 'Wuse', month: 'Sep', amount: 400 }, { branch: 'Wuse', month: 'Oct', amount: 600 },
    { branch: 'Garki', month: 'Sep', amount: 300 }, { branch: 'Garki', month: 'Sep', amount: 100 }, { branch: 'Kubwa', month: 'Oct', amount: 200 },
  ]
  function pivot(rows, rowKey, colKey, valueKey) { const out = {}; for (const r of rows) { const a = r[rowKey], b = r[colKey]; out[a] = out[a] || {}; out[a][b] = (out[a][b] || 0) + r[valueKey] } return out }
  function totals(rows, key, valueKey) {
    const t = {}; let all = 0
    for (const r of rows) { t[r[key]] = (t[r[key]] || 0) + r[valueKey]; all += r[valueKey] }
    return Object.entries(t).map(([name, total]) => ({ name, total, share: Math.round((total / all) * 1000) / 10 })).sort((a, b) => b.total - a.total)
  }
</script>`,
    },
    {
      id: 'analytics-trends',
      title: 'Trends: growth, moving averages and seasonality',
      minutes: 25,
      kind: 'code',
      outline: 'Period-on-period growth, compound growth and smoothing noisy daily sales with a moving average.',
      body: `## Is it really growing?

Daily or weekly numbers bounce around. To see the real direction:

- **Period growth**: (this − last) ÷ last × 100. October ₦4.2m vs September ₦3.5m is **+20%**.
- **Year-on-year (YoY)**: compare with the same period last year, to remove **seasonality** (December is always busy; school fees peak in September and January).
- **Moving average**: the average of the last n periods, recomputed each period. A 7-day moving average removes the weekday/weekend pattern.
- **CAGR** (compound annual growth rate): the steady yearly rate that turns a start value into an end value over n years: \`(end ÷ start)^(1/n) − 1\`.

## Careful with percentages

- Growth from a tiny base looks huge: ₦10k → ₦30k is +200% but only ₦20k.
- A fall of 50% needs a rise of 100% to recover.
- Inflation: in a high-inflation year, sales up 20% in naira may be flat or down in real terms. Compare with inflation or with units sold.

## Your task

1. \`growth(values)\`: an array of period-on-period growth percentages rounded to 1 decimal, starting from the second value (use \`null\` when the previous value is 0).
2. \`movingAverage(values, n)\`: for each position from \`n - 1\` onward, the average of the last n values (so the result has \`values.length - n + 1\` items).
3. \`cagr(start, end, years)\`: as a percentage rounded to 1 decimal.`,
      task: 'Write growth, movingAverage and cagr.',
      starter: `<script>
  function growth(values) {
  }
  function movingAverage(values, n) {
  }
  function cagr(start, end, years) {
  }
</script>
`,
      checks: [
        { label: 'growth period on period', test: `return JSON.stringify(growth([100, 120, 90, 90])) === '[20,-25,0]'` },
        { label: 'growth from zero is null', test: `return JSON.stringify(growth([0, 50])) === '[null]'` },
        { label: '3-period moving average', test: `return JSON.stringify(movingAverage([3, 6, 9, 12, 3], 3)) === '[6,9,8]'` },
        { label: 'CAGR', test: `return cagr(1000000, 2000000, 3) === 26 && cagr(100, 100, 5) === 0` },
      ],
      hint: 'growth: values.slice(1).map((v, i) => values[i] === 0 ? null : Math.round((v - values[i]) / values[i] * 1000) / 10)',
      solution: `<script>
  function growth(values) { return values.slice(1).map((v, i) => (values[i] === 0 ? null : Math.round(((v - values[i]) / values[i]) * 1000) / 10)) }
  function movingAverage(values, n) { const out = []; for (let i = n - 1; i < values.length; i++) out.push(values.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n); return out }
  function cagr(start, end, years) { return Math.round((Math.pow(end / start, 1 / years) - 1) * 1000) / 10 }
</script>`,
    },
    {
      id: 'analytics-kpis',
      title: 'KPIs and dashboards',
      minutes: 25,
      kind: 'code',
      outline: 'Choose the right KPIs and compute average basket, repeat rate, gross margin and stock cover.',
      body: `## Measure what drives the business

A **KPI** (key performance indicator) is a number that tells you if the business is on track. Good KPIs are few, clear, owned by someone, and tied to a target. Examples for a shop:

- **Revenue** and **gross margin %** = (revenue − cost of goods) ÷ revenue
- **Average basket (order value)** = revenue ÷ number of orders
- **Repeat customer rate** = customers with 2+ orders ÷ all customers
- **Stock cover (days)** = stock on hand ÷ average daily units sold: *how many days until we run out?*
- **Conversion rate** for online shops: orders ÷ visitors

## Dashboard design

- Put the 3 to 5 most important numbers at the top, each with its **comparison** (vs last month, vs target)
- One chart per question; bars for comparing categories, lines for time
- Same scales and colours everywhere; red only for real problems
- Update automatically if you can; a dashboard nobody trusts is worse than none

## Your task

Orders look like \`{ customer, revenue, cost }\`.

1. \`avgBasket(orders)\`: revenue ÷ orders, rounded to whole naira.
2. \`grossMargin(orders)\`: percentage rounded to 1 decimal.
3. \`repeatRate(orders)\`: percentage of distinct customers with 2 or more orders, rounded to 1 decimal.
4. \`stockCover(stock, unitsSoldLast30Days)\`: days of cover rounded down; \`Infinity\` if nothing sold.`,
      task: 'Write avgBasket, grossMargin, repeatRate and stockCover.',
      starter: `<script>
  const ORDERS = [
    { customer: 'Ada', revenue: 5000, cost: 3500 },
    { customer: 'Bayo', revenue: 12000, cost: 9000 },
    { customer: 'Ada', revenue: 3000, cost: 2000 },
    { customer: 'Chi', revenue: 8000, cost: 5500 },
  ]
  function avgBasket(orders) {
  }
  function grossMargin(orders) {
  }
  function repeatRate(orders) {
  }
  function stockCover(stock, unitsSoldLast30Days) {
  }
</script>
`,
      checks: [
        { label: 'average basket', test: `return avgBasket(ORDERS) === 7000` },
        { label: 'gross margin %', test: `return grossMargin(ORDERS) === 28.6` },
        { label: 'repeat customer rate', test: `return repeatRate(ORDERS) === 33.3` },
        { label: 'stock cover in days', test: `return stockCover(100, 60) === 50 && stockCover(10, 0) === Infinity` },
      ],
      hint: 'grossMargin: const r = sum of revenue, c = sum of cost; Math.round((r - c) / r * 1000) / 10. repeatRate: count orders per customer in an object.',
      solution: `<script>
  const ORDERS = [{ customer: 'Ada', revenue: 5000, cost: 3500 }, { customer: 'Bayo', revenue: 12000, cost: 9000 }, { customer: 'Ada', revenue: 3000, cost: 2000 }, { customer: 'Chi', revenue: 8000, cost: 5500 }]
  const sum = (o, k) => o.reduce((s, x) => s + x[k], 0)
  function avgBasket(orders) { return Math.round(sum(orders, 'revenue') / orders.length) }
  function grossMargin(orders) { const r = sum(orders, 'revenue'), c = sum(orders, 'cost'); return Math.round(((r - c) / r) * 1000) / 10 }
  function repeatRate(orders) { const n = {}; for (const o of orders) n[o.customer] = (n[o.customer] || 0) + 1; const c = Object.values(n); return Math.round((c.filter((x) => x >= 2).length / c.length) * 1000) / 10 }
  function stockCover(stock, sold30) { return sold30 === 0 ? Infinity : Math.floor(stock / (sold30 / 30)) }
</script>`,
    },
    ...analyticsMore,
    {
      id: 'analytics-story',
      title: 'Data storytelling and your analyst career',
      minutes: 20,
      kind: 'prompt',
      outline: 'Turn analysis into a one-page story with a recommendation, and plan your path into analytics jobs.',
      body: `## The story structure that works

Busy managers read the first two lines. Lead with the answer:

1. **Headline**: the one message. *"Garki is losing ₦600k a month in stock-outs of 5 fast movers."*
2. **Evidence**: 2 or 3 numbers or one clear chart that prove it.
3. **Why it matters**: money, customers, risk.
4. **Recommendation**: what to do, who, by when, and what it will cost or save.
5. **Next check**: how you will know it worked.

Avoid: 20 charts, jargon, numbers without comparison ("₦4m": good or bad?), and hiding the uncertainty. Say what you are not sure about.

## Charts that tell the truth

- Bar charts start at zero
- Do not use 3D or pie charts with many slices
- Label directly; title the chart with the insight, not the field name ("Sales fell 18% after the price rise", not "Sales by month")

## Getting into analytics

- Master **Excel / Google Sheets** (pivot tables, XLOOKUP, charts), then **SQL**, then **Power BI** or **Looker Studio**, then Python
- Build 3 portfolio projects on real-looking data: a sales dashboard, a customer analysis, a forecast. Publish them with a one-page write-up each.
- Certificates employers know: **Google Data Analytics**, **Microsoft PL-300 (Power BI)**; your CDM Studio certificate shows the foundations
- Freelance on Upwork or Fiverr: small businesses need monthly sales reports and dashboards

## Practise

Ask the tutor to help you turn a set of numbers into a one-page story with a recommendation.`,
      practice: 'Give the AI some numbers from a business you know (for example, monthly sales for 3 branches for 4 months, with one branch falling), and ask it to help you write a one-page story: headline, the evidence, why it matters, a recommendation with owner and deadline, and how to check it worked. Then ask it to critique your headline.',
    },
  ],
  project: analyticsProject,
  exam: [
    { q: 'An analyst\'s main output is…', options: ['As many charts as possible', 'Decisions people can act on, backed by data', 'Raw data exports', 'New software'], answer: 1, why: 'Analysis exists to support decisions.' },
    { q: '"Why did Garki\'s sales fall?" is which kind of analysis?', options: ['Descriptive', 'Diagnostic', 'Predictive', 'Prescriptive'], answer: 1, why: 'It explains why.' },
    { q: 'Before cleaning data you should…', options: ['Delete the original', 'Keep the raw file and clean a copy', 'Sort it randomly', 'Email it to everyone'], answer: 1, why: 'Always keep the source untouched.' },
    { q: '" INDOMIE " and "Indomie" in the same column will…', options: ['Be counted as two products unless tidied', 'Always merge automatically', 'Crash the spreadsheet', 'Not matter'], answer: 0, why: 'Standardise text before grouping.' },
    { q: 'One customer spent far more than everyone. Which summary describes a typical customer best?', options: ['Mean', 'Median', 'Maximum', 'Sum'], answer: 1, why: 'The median is not pulled by extremes.' },
    { q: 'The median of 2, 9, 4, 7 is…', options: ['5.5', '4', '7', '22'], answer: 0, why: 'Sorted 2, 4, 7, 9: (4 + 7) / 2.' },
    { q: 'With Q1 = 100 and Q3 = 200, a value is an outlier above…', options: ['250', '300', '350', '400'], answer: 2, why: 'Q3 + 1.5 × 100 = 350.' },
    { q: 'An outlier should be…', options: ['Deleted immediately', 'Checked: it may be an error or important', 'Doubled', 'Ignored always'], answer: 1, why: 'Investigate before removing.' },
    { q: 'A pivot table mainly…', options: ['Groups rows and summarises a measure per group', 'Encrypts data', 'Draws maps', 'Removes columns'], answer: 0, why: 'Group and summarise.' },
    { q: 'Wuse sold ₦2m of ₦8m total. Its share is…', options: ['20%', '25%', '40%', '2%'], answer: 1, why: '2 ÷ 8 = 25%.' },
    { q: 'September ₦500k, October ₦600k. Growth is…', options: ['+10%', '+20%', '+16.7%', '+100k%'], answer: 1, why: '(600 − 500) / 500 = 20%.' },
    { q: 'A 7-day moving average helps by…', options: ['Removing the weekday/weekend pattern to show the trend', 'Adding more data', 'Predicting exactly', 'Hiding sales'], answer: 0, why: 'It smooths regular noise.' },
    { q: 'Comparing December with last December (YoY) removes…', options: ['Inflation', 'Seasonality', 'Customers', 'Outliers'], answer: 1, why: 'Same season, so seasonal effects cancel.' },
    { q: 'Sales up 20% in naira in a year of 25% inflation means…', options: ['Real growth of 45%', 'Real sales probably fell', 'No change', 'Profit doubled'], answer: 1, why: 'Prices rose faster than sales.' },
    { q: 'A fall of 50% needs what rise to recover?', options: ['50%', '75%', '100%', '200%'], answer: 2, why: 'Half must double to get back.' },
    { q: 'Revenue ₦1,000,000, cost of goods ₦700,000. Gross margin is…', options: ['70%', '30%', '43%', '₦300'], answer: 1, why: '300k / 1m.' },
    { q: 'Stock 300 units, selling 10 a day. Stock cover is…', options: ['3 days', '30 days', '300 days', '10 days'], answer: 1, why: '300 ÷ 10.' },
    { q: 'A good dashboard top row shows…', options: ['Every metric you have', 'The 3 to 5 key numbers with comparisons', 'Only logos', 'Raw tables'], answer: 1, why: 'Few numbers, each with context.' },
    { q: 'The best chart title is…', options: ['"Sales by month"', '"Sales fell 18% after the price rise"', '"Chart 1"', '"Data"'], answer: 1, why: 'Titles should state the insight.' },
    { q: 'A data story should start with…', options: ['The methodology', 'The headline message', 'All the raw data', 'A long introduction'], answer: 1, why: 'Lead with the answer.' },
    ...analyticsExam,
  ],
}
