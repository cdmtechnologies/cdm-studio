import type { Track } from './types'

export const data: Track = {
  id: 'data',
  title: 'Data analysis',
  blurb: 'Turn numbers into answers: totals, averages, top sellers and charts.',
  colour: 'rose',
  emoji: '📊',
  lessons: [
    {
      id: 'data-totals',
      title: 'Totals, averages and the best seller',
      minutes: 14,
      kind: 'code',
      body: `## Data is a list of records

\`\`\`js
const sales = [
  { item: 'Bread', qty: 4, price: 1200 },
  { item: 'Milk',  qty: 2, price: 1500 },
  { item: 'Bread', qty: 1, price: 1200 },
]
\`\`\`

Three tools do most of the work:

- \`reduce\` adds things up: \`sales.reduce((sum, s) => sum + s.qty * s.price, 0)\`
- \`filter\` keeps some rows: \`sales.filter(s => s.item === 'Bread')\`
- an object can count per item: \`by[s.item] = (by[s.item] || 0) + s.qty\``,
      task: 'Write revenue(sales) for the total money, and bestSeller(sales) for the item with the most units sold.',
      starter: `<script>
  function revenue(sales) {
  }
  function bestSeller(sales) {
  }
</script>
`,
      checks: [
        { label: 'revenue gives 9000 for the example', test: `return revenue([{ item: 'Bread', qty: 4, price: 1200 }, { item: 'Milk', qty: 2, price: 1500 }, { item: 'Bread', qty: 1, price: 1200 }]) === 9000` },
        { label: 'revenue of no sales is 0', test: `return revenue([]) === 0` },
        { label: 'bestSeller finds Bread', test: `return bestSeller([{ item: 'Bread', qty: 4, price: 1200 }, { item: 'Milk', qty: 2, price: 1500 }, { item: 'Bread', qty: 1, price: 1200 }]) === 'Bread'` },
        { label: 'bestSeller adds up repeated items', test: `return bestSeller([{ item: 'A', qty: 3, price: 1 }, { item: 'B', qty: 2, price: 1 }, { item: 'B', qty: 2, price: 1 }]) === 'B'` },
      ],
    },
    {
      id: 'data-chart',
      title: 'Draw a bar chart',
      minutes: 15,
      kind: 'code',
      body: `## A picture of the numbers

A bar chart is just rectangles whose height follows the value. Scale the tallest bar to fit:

\`\`\`js
const max = Math.max(...values)
const h = value / max * 150   // 150px for the tallest
ctx.fillRect(x, 170 - h, 30, h)
\`\`\``,
      task: 'Draw one bar per month (4 bars) on the canvas, with heights that follow the sales.',
      starter: `<canvas id="c" width="320" height="200" style="background:#fff;border:1px solid #ddd"></canvas>
<script>
  const months = ['Jan', 'Feb', 'Mar', 'Apr']
  const sales = [120, 300, 180, 240]
  const ctx = document.getElementById('c').getContext('2d')
  // draw the bars here
</script>
`,
      checks: [
        { label: 'Something is drawn', test: `const d = document.getElementById('c').getContext('2d').getImageData(0, 0, 320, 200).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false` },
        { label: 'There are 4 separate bars', test: `const ctx = document.getElementById('c').getContext('2d'); const d = ctx.getImageData(0, 165, 320, 1).data; let bars = 0, inBar = false; for (let x = 0; x < 320; x++) { const on = d[x*4+3] > 0 && !(d[x*4] > 240 && d[x*4+1] > 240 && d[x*4+2] > 240); if (on && !inBar) bars++; inBar = on } return bars === 4` },
      ],
      hint: 'months.forEach((m, i) => { const h = sales[i] / Math.max(...sales) * 150; ctx.fillStyle = "#e11d48"; ctx.fillRect(30 + i * 70, 170 - h, 40, h) })',
    },
    {
      id: 'data-your-file',
      title: 'Analyse your own spreadsheet',
      minutes: 8,
      kind: 'read',
      body: `## From a file to answers in minutes

Open **Data** at the top of CDM Studio. You can:

- **Upload** a CSV or Excel (.xlsx) file, **paste** rows straight from a spreadsheet, or try the **sample shop sales**
- See every column at a glance: is it a number, a date or text, how many are missing, the totals and the most common values

## Ask in plain words

Type a question such as *"Which branch sold the most last month?"* or tap **Suggest questions**. The AI turns your question into a **plan** (filter, group, measure, sort) and Studio runs that plan on **every row** in your browser.

> Your file stays on your device. The AI only sees the column names, simple totals and up to 20 sample rows, never the whole file.

## Make charts yourself, free

Under **Make a chart yourself** pick *Total of Amount by Branch* (or *by Date, per month*) and press **Add chart**. No AI needed, so it never uses your allowance.

## Then go further

- Tap **What does this mean?** on a result for a short explanation and what to check next
- **Download CSV** to take a result back to Excel
- **Make a dashboard page** turns your results into a page you can publish and share

## Good habits

- One row per sale (or per record), one column per detail, a single header row at the top
- Dates written the same way all through the column (for example 20/11/2026)
- Check odd results: a total that looks too big often means a "Total" row inside the data`,
      quiz: [
        { q: 'When you ask the AI a question about your file, what does it see?', options: ['The whole file', 'Column names, simple totals and a few sample rows', 'Nothing at all'], answer: 1, why: 'Studio runs the analysis on every row in your browser; the AI only plans it from a short description.' },
        { q: 'Which is the free way to make a chart with no AI?', options: ['Make a chart yourself', 'Suggest questions', 'What does this mean?'], answer: 0, why: 'Charts you build yourself run in your browser and never use AI.' },
        { q: 'Your total looks twice as big as expected. What should you check first?', options: ['Your internet', 'Whether the sheet has a Total row inside the data', 'The chart colour'], answer: 1, why: 'A total row in the data gets added again, doubling the result.' },
      ],
    },
  ],
}
