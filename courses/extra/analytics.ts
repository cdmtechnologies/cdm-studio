import type { Quiz } from '../../src/lessons/types'
import type { CourseLesson, CourseProject } from '../types'

const SALES = `
create table sales (id integer primary key, sale_date text not null, branch text not null, product text not null, category text not null, qty integer not null, unit_price integer not null, unit_cost integer not null);
insert into sales values
 (1, '2026-09-03', 'Wuse', 'Rice 50kg', 'Food', 2, 72000, 61000), (2, '2026-09-03', 'Garki', 'Bread', 'Food', 30, 1200, 800),
 (3, '2026-09-10', 'Wuse', 'Power bank', 'Electronics', 3, 18000, 13500), (4, '2026-09-17', 'Maitama', 'Earbuds', 'Electronics', 4, 9500, 6000),
 (5, '2026-09-24', 'Garki', 'Vegetable oil 5L', 'Food', 6, 15500, 12800), (6, '2026-10-01', 'Wuse', 'Bread', 'Food', 45, 1200, 800),
 (7, '2026-10-08', 'Maitama', 'Rice 50kg', 'Food', 1, 72000, 61000), (8, '2026-10-15', 'Garki', 'Power bank', 'Electronics', 2, 18000, 13500),
 (9, '2026-10-22', 'Wuse', 'Earbuds', 'Electronics', 6, 9500, 6000), (10, '2026-10-29', 'Maitama', 'Bread', 'Food', 25, 1200, 800),
 (11, '2026-11-05', 'Garki', 'Rice 50kg', 'Food', 3, 72000, 61000), (12, '2026-11-12', 'Wuse', 'Vegetable oil 5L', 'Food', 8, 15500, 12800),
 (13, '2026-11-12', 'Maitama', 'Power bank', 'Electronics', 5, 18000, 13500), (14, '2026-11-19', 'Garki', 'Earbuds', 'Electronics', 3, 9500, 6000);
`

// Advanced lessons added to Data analytics for business (before the final storytelling and career lesson).
export const analyticsMore: CourseLesson[] = [
  {
    id: 'analytics-sql',
    title: 'Getting data with SQL',
    minutes: 35,
    kind: 'code',
    lang: 'sql',
    setup: SALES,
    outline: 'Why analysts use SQL, revenue and margin by group, and turning a business question into a query.',
    body: `## Spreadsheets run out of room

Spreadsheets are wonderful until the data reaches hundreds of thousands of rows, lives in the company's systems, or changes every hour. Then analysts go to the source: the **database**, and the language for asking it questions is **SQL**. Most analyst job adverts list SQL as a must-have skill. (The **SQL and databases** course goes deep; this lesson gives you the analyst's core.)

## The analyst's query shape

Nearly every report query follows the same shape. Read it like a recipe:

\`\`\`sql
select   branch,                                   -- the groups you want
         sum(qty * unit_price) as revenue,          -- the measures
         sum(qty * (unit_price - unit_cost)) as gross_profit
from     sales                                     -- the table
where    sale_date >= '2026-10-01'                 -- the rows that count
group by branch                                    -- one row per group
order by revenue desc;                             -- the order to read it in
\`\`\`

It is the same idea as the pivot table lesson: choose rows, group them, summarise a measure. SQL simply does it on the full data, every time, the same way.

## Calculated measures

- **Revenue** = quantity × price.
- **Gross profit** = quantity × (price − cost).
- **Gross margin %** = gross profit ÷ revenue × 100. Calculate it from the **totals** (\`sum(profit) / sum(revenue)\`), not by averaging the margins of individual rows, which gives small sales the same weight as big ones.

Multiply by \`100.0\` (with a decimal point) so the division keeps its decimals.

## From question to query

*"Which category makes us the most money in each branch, and at what margin?"*

1. The groups: branch and category.
2. The measures: revenue, profit, margin.
3. The filter: none (all time) or a date range.
4. The order: by branch, then revenue.

Write the question as a comment at the top of the query. Future you (and your manager) will thank you.

## Check your numbers

Before sharing, sanity-check: does the total revenue match the finance report? Are there negative quantities or zero prices? Do the group totals add up to the grand total?

## The table

\`sales\` has: id, sale_date, branch (Wuse, Garki, Maitama), product, category (Food, Electronics), qty, unit_price, unit_cost.

## Your task

Show, for each \`branch\` and \`category\`: \`revenue\`, \`gross_profit\` and \`margin_pct\` (gross profit ÷ revenue × 100, rounded to 1 decimal). Columns in that order: branch, category, revenue, gross_profit, margin_pct. Sort by branch, then by revenue highest first.`,
    task: 'Revenue, gross profit and margin for each branch and category.',
    starter: `-- Which category makes the most money in each branch, and at what margin?
select * from sales;
`,
    checks: [
      { label: 'branch, category, revenue, gross_profit and margin_pct in order', test: `return await same("select branch, category, sum(qty * unit_price), sum(qty * (unit_price - unit_cost)), round(sum(qty * (unit_price - unit_cost)) * 100.0 / sum(qty * unit_price), 1) from sales group by branch, category order by branch, sum(qty * unit_price) desc", true)` },
    ],
    hint: 'round(sum(qty * (unit_price - unit_cost)) * 100.0 / sum(qty * unit_price), 1) as margin_pct … group by branch, category order by branch, revenue desc',
    solution: `-- Which category makes the most money in each branch, and at what margin?
select branch, category,
       sum(qty * unit_price) as revenue,
       sum(qty * (unit_price - unit_cost)) as gross_profit,
       round(sum(qty * (unit_price - unit_cost)) * 100.0 / sum(qty * unit_price), 1) as margin_pct
from sales
group by branch, category
order by branch, revenue desc;
`,
  },
  {
    id: 'analytics-charts',
    title: 'Choosing the right chart',
    minutes: 25,
    kind: 'read',
    outline: 'Matching charts to questions, common chart mistakes, honest axes, colour and annotation.',
    body: `## A chart answers one question

A chart is a picture of an answer. If you cannot say the question in one sentence, the chart will confuse. Start from the question, then choose the chart that answers it most directly, the way you choose a tool from a toolbox: a hammer for nails, a screwdriver for screws.

## The main chart types

| Question | Best chart |
|---|---|
| How does it change over time? | **Line chart** (time on the horizontal axis) |
| Which is bigger? Comparing categories | **Bar chart** (horizontal bars when labels are long) |
| What is the share of a whole? | **Stacked bar** or a single **100% bar**; a pie only for 2 or 3 slices |
| How are values spread? | **Histogram** or **box plot** |
| Do two measures move together? | **Scatter plot** |
| One key number | A big **number tile** with a comparison ("₦4.2m, +12% vs last month") |
| Exact values to look up | A **table** |

## Common mistakes

- **Pie charts with many slices**: people cannot compare angles well. Use a sorted bar chart instead.
- **Bar charts that do not start at zero**: a bar's length is its value, so cutting the axis makes small differences look huge. (Line charts may zoom in, if labelled clearly.)
- **3D effects, shadows and gradients**: they distort sizes and add nothing.
- **Too many colours**: every colour should mean something.
- **Unsorted bars**: sort by value so the order tells the story.
- **Two different y-axes** on one chart: easy to mislead, hard to read.

## Honest charts

Charts persuade, so they carry responsibility. Show the full context: the time range, the units, the source, and whether numbers are adjusted for inflation. Cherry-picking a start date to make growth look bigger is a lie told with pictures.

## Colour with purpose

Use one neutral colour (grey) for most of the data and a strong colour to **highlight** what matters: the branch you are talking about, this year compared with last. Keep the same colour for the same thing across all charts in a report. Check that the chart still works for colour-blind readers (do not rely on red versus green alone).

## Titles that say the answer

"Revenue by month" describes the chart. "Revenue fell 18% after the price rise in August" says the insight. Use the second kind, then add a short **annotation** on the chart pointing at the moment that matters.

## Dashboard tools

Power BI, Tableau, Looker Studio and Metabase build interactive charts from your data; CDM Studio's Data page lets you practise. The principles are the same in every tool.`,
    quiz: [
      { q: 'Monthly sales over two years are best shown as…', options: ['A pie chart', 'A line chart', 'A table only'], answer: 1, why: 'Lines show change over time.' },
      { q: 'A bar chart whose axis starts at 900 instead of 0…', options: ['Is always fine', 'Exaggerates small differences', 'Is required for big numbers'], answer: 1, why: 'Bar length must reflect value.' },
      { q: 'Comparing 9 product categories, the best choice is…', options: ['A 9-slice pie', 'A sorted bar chart', 'A 3D pie'], answer: 1, why: 'People compare lengths better than angles.' },
      { q: 'The strongest chart title is…', options: ['"Chart 3"', '"Revenue by month"', '"Revenue fell 18% after the August price rise"'], answer: 2, why: 'Titles should state the insight.' },
    ],
  },
  {
    id: 'analytics-ab',
    title: 'A/B tests: did the change really work?',
    minutes: 35,
    kind: 'code',
    outline: 'Conversion rates, lift, random variation, a two-proportion z-test and how to read p-values honestly.',
    body: `## The coin that lands heads 6 times

Toss a fair coin 10 times and you might get 6 heads. That does not mean the coin is unfair: small samples wobble. Business numbers wobble too. If a new checkout page converts 5.4% of visitors and the old one 5.0%, is the new page better, or is it a lucky week?

An **A/B test** answers this. Visitors are split **at random**: half see version A (the control), half see version B (the change). Randomness is the key: it makes the two groups alike in every way except the change, so a real difference can be credited to the change.

## The numbers

- **Conversion rate** = conversions ÷ visitors.
- **Lift** = (rate B − rate A) ÷ rate A. From 5.0% to 5.4% is a lift of +8%.

## Is the difference real? The z-test

The **two-proportion z-test** asks: *if A and B were truly the same, how surprising would a difference this big be?*

1. The pooled rate: \`p = (convA + convB) / (nA + nB)\`
2. The standard error: \`se = sqrt( p × (1 − p) × (1/nA + 1/nB) )\`
3. The z score: \`z = (rateB − rateA) / se\`

A z score beyond about **±1.96** means a difference this large would happen by chance less than 5% of the time if there were no real effect. That 5% is the **p-value threshold** usually used: we call the result **statistically significant at 95%**.

## Reading results honestly

- **Decide the sample size and the duration before starting**, and do not stop the test early the moment it looks good. Peeking repeatedly and stopping when you like the result produces false winners.
- Run for **whole weeks**, because weekday and weekend visitors behave differently.
- **Significant is not the same as important**: a tiny lift can be significant with huge traffic but not worth the cost.
- **Not significant does not mean no effect**: maybe the test was too small to detect it.
- Change **one thing** at a time, or you will not know what caused the result.
- Check the **guardrail metrics**: a pop-up may raise sign-ups but also raise complaints or refunds.

## Beyond websites

The same thinking works for SMS reminders (does a reminder increase fee payments?), price tests, store layouts and training programmes. Wherever you can randomise, you can test.

## Your task

1. \`rate(conversions, visitors)\`: conversions ÷ visitors (\`0\` when visitors is 0).
2. \`lift(a, b)\`: \`a\` and \`b\` are \`{ visitors, conversions }\`. Return the lift of B over A as a **percentage** rounded to 1 decimal.
3. \`zScore(a, b)\`: the two-proportion z score, rounded to 2 decimals.
4. \`significant(a, b)\`: \`true\` when the absolute z score is at least 1.96.`,
    task: 'Write rate, lift, zScore and significant.',
    starter: `<script>
  function rate(conversions, visitors) {
  }
  function lift(a, b) {
  }
  function zScore(a, b) {
  }
  function significant(a, b) {
  }
</script>
`,
    checks: [
      { label: 'conversion rate', test: `return rate(50, 1000) === 0.05 && rate(3, 0) === 0` },
      { label: 'lift as a percentage', test: `return lift({ visitors: 1000, conversions: 50 }, { visitors: 1000, conversions: 54 }) === 8 && lift({ visitors: 200, conversions: 20 }, { visitors: 200, conversions: 15 }) === -25` },
      { label: 'z score for two proportions', test: `return zScore({ visitors: 5000, conversions: 250 }, { visitors: 5000, conversions: 300 }) === 2.19 && zScore({ visitors: 1000, conversions: 50 }, { visitors: 1000, conversions: 54 }) === 0.4` },
      { label: 'significance at 95%', test: `return significant({ visitors: 5000, conversions: 250 }, { visitors: 5000, conversions: 300 }) === true && significant({ visitors: 1000, conversions: 50 }, { visitors: 1000, conversions: 54 }) === false` },
    ],
    hint: 'zScore: const p = (a.conversions + b.conversions) / (a.visitors + b.visitors); const se = Math.sqrt(p * (1 - p) * (1 / a.visitors + 1 / b.visitors)); return Math.round((rate(b) - rate(a)) / se * 100) / 100',
    solution: `<script>
  function rate(conversions, visitors) { return visitors ? conversions / visitors : 0 }
  function lift(a, b) {
    const ra = rate(a.conversions, a.visitors), rb = rate(b.conversions, b.visitors)
    return Math.round((rb - ra) / ra * 1000) / 10
  }
  function zScore(a, b) {
    const p = (a.conversions + b.conversions) / (a.visitors + b.visitors)
    const se = Math.sqrt(p * (1 - p) * (1 / a.visitors + 1 / b.visitors))
    return Math.round((rate(b.conversions, b.visitors) - rate(a.conversions, a.visitors)) / se * 100) / 100
  }
  function significant(a, b) { return Math.abs(zScore(a, b)) >= 1.96 }
</script>
`,
  },
  {
    id: 'analytics-cohorts',
    title: 'Customers over time: cohorts and retention',
    minutes: 35,
    kind: 'code',
    outline: 'Why averages hide churn, building a cohort retention table, repeat rate and customer lifetime value.',
    body: `## The leaking bucket

Picture filling a bucket with water while it leaks from a hole in the bottom. You can pour faster (more marketing), but if the hole is big, the bucket never fills. For a business, new customers are the water being poured in, and customers who never come back are the leak. **Retention analysis** measures the size of the hole.

## Why totals hide the problem

"We had 1,000 active customers this month and last month" sounds stable. But maybe 400 left and 400 new ones replaced them. Totals mix old and new customers together. To see clearly, follow **groups of customers who started at the same time**.

## Cohorts

A **cohort** is a group of customers who share a starting point, usually the month of their first purchase. A **cohort table** shows, for each cohort, what share was still buying 1, 2, 3 months later:

| First month | Customers | Month 0 | Month 1 | Month 2 |
|---|---|---|---|---|
| 2026-09 | 120 | 100% | 42% | 30% |
| 2026-10 | 150 | 100% | 48% | |
| 2026-11 | 140 | 100% | | |

Read **across** a row to see one cohort fading over time. Read **down** a column to see whether newer cohorts are retained better than older ones: if month-1 retention rose from 42% to 48%, something you changed (better onboarding, a loyalty programme) may be working.

## Key measures

- **Retention rate** for period n: customers from the cohort active in month n ÷ cohort size.
- **Churn** = 1 − retention.
- **Repeat purchase rate**: share of customers who bought more than once.
- **Customer lifetime value (CLV)**, simply: average order value × purchases per year × years a customer stays (× margin for profit). Compare CLV with the cost to acquire a customer: if acquiring costs more than a customer is worth, growth loses money.

## Month numbers

To place each purchase, work out the **months since the first purchase**: \`(year − firstYear) × 12 + (month − firstMonth)\`. A first purchase in November and a repeat in January of the next year is month 2.

## Your task

Purchases are \`{ customer, date }\` with dates like \`"2026-09-14"\`.

1. \`monthIndex(first, date)\`: months between two dates' months (\`"2026-11-30"\` to \`"2027-01-02"\` is 2).
2. \`cohorts(purchases)\`: an object mapping each first-purchase month (\`"2026-09"\`) to the **number of customers** whose first purchase was in that month.
3. \`retention(purchases, cohort, n)\`: the share (0 to 1, rounded to 2 decimals) of that cohort's customers who made at least one purchase in month \`n\` after their first.
4. \`repeatRate(purchases)\`: share of all customers with 2 or more purchases, rounded to 2 decimals.`,
    task: 'Write monthIndex, cohorts, retention and repeatRate.',
    starter: `<script>
  const P = [
    { customer: 'ada', date: '2026-09-02' }, { customer: 'ada', date: '2026-10-11' }, { customer: 'ada', date: '2026-11-20' },
    { customer: 'bola', date: '2026-09-15' }, { customer: 'bola', date: '2026-11-03' },
    { customer: 'chi', date: '2026-09-28' },
    { customer: 'dan', date: '2026-10-05' }, { customer: 'dan', date: '2026-11-09' },
    { customer: 'eze', date: '2026-10-21' },
  ]
  function monthIndex(first, date) {
  }
  function cohorts(purchases) {
  }
  function retention(purchases, cohort, n) {
  }
  function repeatRate(purchases) {
  }
</script>
`,
    checks: [
      { label: 'months between dates', test: `return monthIndex('2026-11-30', '2027-01-02') === 2 && monthIndex('2026-09-02', '2026-09-30') === 0` },
      { label: 'cohort sizes by first-purchase month', test: `return JSON.stringify(cohorts(P)) === JSON.stringify({ '2026-09': 3, '2026-10': 2 })` },
      { label: 'retention per month', test: `return retention(P, '2026-09', 1) === 0.33 && retention(P, '2026-09', 2) === 0.67 && retention(P, '2026-10', 1) === 0.5 && retention(P, '2026-09', 0) === 1` },
      { label: 'repeat purchase rate', test: `return repeatRate(P) === 0.6` },
    ],
    hint: 'First find each customer\'s earliest date (dates as YYYY-MM-DD sort as text). monthIndex: compare Number(date.slice(0, 4)) and Number(date.slice(5, 7)).',
    solution: `<script>
  const P = [
    { customer: 'ada', date: '2026-09-02' }, { customer: 'ada', date: '2026-10-11' }, { customer: 'ada', date: '2026-11-20' },
    { customer: 'bola', date: '2026-09-15' }, { customer: 'bola', date: '2026-11-03' },
    { customer: 'chi', date: '2026-09-28' },
    { customer: 'dan', date: '2026-10-05' }, { customer: 'dan', date: '2026-11-09' },
    { customer: 'eze', date: '2026-10-21' },
  ]
  const ym = (d) => [Number(d.slice(0, 4)), Number(d.slice(5, 7))]
  function monthIndex(first, date) {
    const [y1, m1] = ym(first), [y2, m2] = ym(date)
    return (y2 - y1) * 12 + (m2 - m1)
  }
  function firsts(purchases) {
    const f = {}
    for (const p of purchases) if (!f[p.customer] || p.date < f[p.customer]) f[p.customer] = p.date
    return f
  }
  function cohorts(purchases) {
    const out = {}
    for (const d of Object.values(firsts(purchases))) out[d.slice(0, 7)] = (out[d.slice(0, 7)] || 0) + 1
    return out
  }
  function retention(purchases, cohort, n) {
    const f = firsts(purchases)
    const members = Object.keys(f).filter((c) => f[c].slice(0, 7) === cohort)
    if (!members.length) return 0
    const active = members.filter((c) => purchases.some((p) => p.customer === c && monthIndex(f[c], p.date) === n))
    return Math.round(active.length / members.length * 100) / 100
  }
  function repeatRate(purchases) {
    const counts = {}
    for (const p of purchases) counts[p.customer] = (counts[p.customer] || 0) + 1
    const all = Object.values(counts)
    return Math.round(all.filter((n) => n >= 2).length / all.length * 100) / 100
  }
</script>
`,
  },
  {
    id: 'analytics-forecast',
    title: 'Simple forecasting',
    minutes: 35,
    kind: 'code',
    outline: 'Naive and seasonal forecasts, a linear trend, measuring forecast error with MAPE, and communicating uncertainty.',
    body: `## Forecasts are weather reports for business

A weather forecast does not promise rain; it says "70% chance". Business forecasts work the same way: they help plan stock, staff and cash, but they are always uncertain. The goal is not to be perfect; it is to be **less wrong** than guessing, and to know how wrong you might be.

## Start with simple baselines

Before any clever model, try the simplest forecasts. Surprisingly often, they are hard to beat.

- **Naive forecast**: next period = this period. ("Tomorrow's sales will be like today's.")
- **Moving average**: next period = average of the last k periods. Smooths out noise.
- **Seasonal naive**: next period = the same period last season. For a shop with a December rush, this December ≈ last December. For daily data with a weekly pattern, next Monday ≈ last Monday.

## Linear trend

If sales grow steadily, fit a straight line through time (the least-squares method from the regression lesson):

\`\`\`
slope = Σ (t − t̄)(y − ȳ) / Σ (t − t̄)²
intercept = ȳ − slope × t̄
forecast(t) = intercept + slope × t
\`\`\`

Here \`t\` is the period number (0, 1, 2 …) and \`y\` the value. Extend the line forward for future periods. Be careful: straight lines never bend, and real growth always slows eventually. Do not extend a trend far into the future.

## Measuring forecast error

Compare forecasts with what actually happened, on periods the model did not see:

- **MAE** (mean absolute error): the average size of the miss, in units (₦, items).
- **MAPE** (mean absolute percentage error): the average miss as a percentage of the actual value: \`mean( |actual − forecast| ÷ |actual| ) × 100\`. Easy for managers to understand ("we are usually within 8%"). It breaks when actual values are zero, so skip those.

Always compare a fancy model's error with the naive baseline. If it does not beat the baseline, it is not worth the complexity.

## Communicating forecasts

Give a range, not only a single number: "between ₦3.8m and ₦4.6m, most likely ₦4.2m". State the assumptions ("assumes no price change and normal stock levels"). Update forecasts as new data arrives.

## Going further

Exponential smoothing (Holt-Winters), ARIMA, and tools like Prophet handle trend and seasonality together. Excel and Google Sheets have a FORECAST function and forecast sheets. The baseline thinking from this lesson still applies.

## Your task

1. \`naive(series)\`: the forecast for the next period (the last value).
2. \`seasonalNaive(series, season)\`: the forecast for the next period, which is the value \`season\` periods before it (\`series[series.length - season]\`).
3. \`trend(series)\`: return \`{ slope, intercept }\` of the least-squares line with \`t = 0, 1, 2 …\`.
4. \`forecastTrend(series, ahead)\`: the trend line's value \`ahead\` periods after the last one, rounded to 2 decimals.
5. \`mape(actual, forecast)\`: MAPE as a percentage rounded to 1 decimal, skipping periods where actual is 0.`,
    task: 'Write naive, seasonalNaive, trend, forecastTrend and mape.',
    starter: `<script>
  function naive(series) {
  }
  function seasonalNaive(series, season) {
  }
  function trend(series) {
  }
  function forecastTrend(series, ahead) {
  }
  function mape(actual, forecast) {
  }
</script>
`,
    checks: [
      { label: 'naive and seasonal naive', test: `return naive([5, 7, 9]) === 9 && seasonalNaive([10, 20, 30, 40, 12, 22, 33, 41], 4) === 12` },
      { label: 'least-squares trend', test: `const t = trend([3, 5, 7, 9]); const u = trend([2, 4, 5, 4, 5]); return t.slope === 2 && t.intercept === 3 && Math.abs(u.slope - 0.6) < 1e-9 && Math.abs(u.intercept - 2.8) < 1e-9` },
      { label: 'forecast along the trend', test: `return forecastTrend([3, 5, 7, 9], 1) === 11 && forecastTrend([2, 4, 5, 4, 5], 2) === 6.4` },
      { label: 'MAPE skipping zero actuals', test: `return mape([100, 200, 0, 400], [110, 180, 5, 400]) === 6.7 && mape([50], [50]) === 0` },
    ],
    hint: 'trend: const n = series.length; const tm = (n - 1) / 2; const ym = mean of series; slope = Σ (i - tm)(y - ym) / Σ (i - tm)². forecastTrend: intercept + slope * (n - 1 + ahead).',
    solution: `<script>
  function naive(series) { return series[series.length - 1] }
  function seasonalNaive(series, season) { return series[series.length - season] }
  function trend(series) {
    const n = series.length
    const tm = (n - 1) / 2
    const ym = series.reduce((a, b) => a + b, 0) / n
    let num = 0, den = 0
    series.forEach((y, t) => { num += (t - tm) * (y - ym); den += (t - tm) ** 2 })
    const slope = den ? num / den : 0
    return { slope, intercept: ym - slope * tm }
  }
  function forecastTrend(series, ahead) {
    const { slope, intercept } = trend(series)
    return Math.round((intercept + slope * (series.length - 1 + ahead)) * 100) / 100
  }
  function mape(actual, forecast) {
    const errs = []
    actual.forEach((a, i) => { if (a !== 0) errs.push(Math.abs(a - forecast[i]) / Math.abs(a)) })
    return errs.length ? Math.round(errs.reduce((x, y) => x + y, 0) / errs.length * 1000) / 10 : 0
  }
</script>
`,
  },
]

export const analyticsProject: CourseProject = {
  title: 'Business dashboard and insight report',
  lang: 'html',
  brief: `Take a real or realistic business dataset (sales, school fees, clinic visits, farm output, church giving, delivery times: at least 60 rows over at least 3 months, kept in the page) and build an **analytics dashboard in CDM Studio** that a manager could use on a Monday morning.

**It must:** clean the data in code (show how many rows were fixed or skipped), show 3 to 5 KPI tiles with comparisons to the previous period, include at least 3 well-chosen charts with insight titles, break results down by a useful group (branch, product, class), and include one deeper analysis: a cohort or retention view, an A/B comparison, or a simple forecast with its error.

Finish with a short **written insight report** on the same page: the headline finding, the evidence, a recommendation with an owner and a deadline, and how to check whether it worked.`,
  rubric: [
    'Uses a realistic dataset of at least 60 rows over at least 3 months',
    'Cleans the data in code and reports how many rows were fixed or skipped',
    'Shows 3 to 5 KPI tiles, each compared with a previous period or target',
    'Includes at least 3 charts of the right type for their questions, with insight titles',
    'Breaks results down by a meaningful group such as branch, product or class',
    'Includes one deeper analysis: cohorts or retention, an A/B comparison, or a forecast with its error',
    'Calculations are correct (for example margins from totals, growth rates, averages)',
    'The written report states a headline, evidence, a recommendation with owner and deadline, and how to measure success',
    'The dashboard is clean and readable, including on a phone',
  ],
}

export const analyticsExam: Quiz[] = [
  { q: 'Gross margin % for a group should be calculated as…', options: ['The average of each row\'s margin', 'Total gross profit ÷ total revenue × 100', 'Revenue − cost', 'Profit × 100'], answer: 1, why: 'Averaging row margins gives small sales too much weight.' },
  { q: 'To compare 9 categories, the clearest chart is usually…', options: ['A pie chart', 'A sorted bar chart', 'A 3D pie', 'A scatter plot'], answer: 1, why: 'People compare lengths best.' },
  { q: 'In an A/B test, visitors should be split…', options: ['By the analyst\'s choice', 'At random', 'By city only', 'Old visitors to A, new to B'], answer: 1, why: 'Randomness makes the groups comparable.' },
  { q: 'A z score of 2.5 in a two-proportion test means the difference is…', options: ['Significant at 95%', 'Not significant', 'Certainly important for the business', 'An error'], answer: 0, why: 'Beyond ±1.96 is significant at 95%.' },
  { q: 'A cohort is…', options: ['All customers ever', 'A group of customers who started at the same time', 'A type of chart', 'One product'], answer: 1, why: 'Cohorts share a starting point.' },
  { q: 'A forecast model is worth using only if it…', options: ['Is complicated', 'Beats a simple baseline such as naive or seasonal naive', 'Uses AI', 'Has many charts'], answer: 1, why: 'Always compare with the baseline error.' },
]
