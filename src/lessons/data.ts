import type { Track } from './types'

export const data: Track = {
  id: 'data',
  title: 'Data analysis',
  blurb: 'Turn numbers into answers: totals, averages, top sellers and charts.',
  colour: 'rose',
  emoji: '📊',
  soon: 'Upload your own spreadsheets and analyse them with AI: coming in the next stage.',
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
  ],
}
