import type { Track } from './types'

export const web: Track = {
  id: 'web',
  title: 'Build websites',
  blurb: 'HTML, CSS and JavaScript from zero: make real pages you can publish and share.',
  colour: 'sky',
  emoji: '🌐',
  lessons: [
    {
      id: 'web-first-page',
      title: 'Your first web page',
      minutes: 10,
      kind: 'code',
      body: `## HTML is the skeleton of a page

A web page is text with **tags** around it. Tags say what each part is:

\`\`\`html
<h1>Big title</h1>
<p>A paragraph of text.</p>
<a href="https://wa.me/2348000000000">Chat on WhatsApp</a>
\`\`\`

Most tags come in pairs: \`<p>\` opens, \`</p>\` closes.`,
      task: 'Change the page so it has a main title (h1) with your name, a paragraph about you, and a link.',
      starter: `<h1>Hello!</h1>
<p>Write something about yourself here.</p>
`,
      checks: [
        { label: 'There is an h1 title', test: `return !!document.querySelector('h1')` },
        { label: 'The title is not "Hello!" any more', test: `const h = document.querySelector('h1'); return !!h && h.textContent.trim() !== 'Hello!' && h.textContent.trim().length > 1` },
        { label: 'Your paragraph is at least 20 characters', test: `return [...document.querySelectorAll('p')].some(p => p.textContent.trim().length >= 20 && !p.textContent.includes('Write something'))` },
        { label: 'There is a link (a tag with href)', test: `return !!document.querySelector('a[href]')` },
      ],
      hint: 'A link looks like <a href="https://example.com">Text people click</a>',
    },
    {
      id: 'web-css',
      title: 'Colours and fonts with CSS',
      minutes: 12,
      kind: 'code',
      body: `## CSS is the clothing

CSS chooses colours, sizes and spacing. Put it in a \`<style>\` tag:

\`\`\`html
<style>
  body { font-family: sans-serif; background: #fff7ed; }
  h1 { color: #ea580c; }
  .card { padding: 16px; border-radius: 12px; background: white; }
</style>
\`\`\`

\`h1 { ... }\` styles every h1. \`.card { ... }\` styles everything with \`class="card"\`.`,
      task: 'Give the page a background colour, colour the h1, and make the box with class "card" have padding and rounded corners.',
      starter: `<style>
  /* write your CSS here */
</style>

<h1>Mama Nkechi's Kitchen</h1>
<div class="card">
  <p>Jollof rice, fried plantain and grilled chicken: ₦3,500</p>
</div>
`,
      checks: [
        { label: 'The page has a background colour', test: `const c = getComputedStyle(document.body).backgroundColor; return c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' && c !== 'rgb(255, 255, 255)'` },
        { label: 'The h1 has a colour (not black)', test: `const c = getComputedStyle(document.querySelector('h1')).color; return c !== 'rgb(0, 0, 0)'` },
        { label: 'The card has padding', test: `return parseFloat(getComputedStyle(document.querySelector('.card')).paddingTop) > 0` },
        { label: 'The card has rounded corners', test: `return parseFloat(getComputedStyle(document.querySelector('.card')).borderTopLeftRadius) > 0` },
      ],
      hint: 'Inside <style>: body { background: #fff7ed; }  h1 { color: #ea580c; }  .card { padding: 16px; border-radius: 12px; }',
    },
    {
      id: 'web-layout',
      title: 'Layout with flexbox',
      minutes: 12,
      kind: 'code',
      body: `## Put things side by side

\`display: flex\` puts the children of a box in a row:

\`\`\`css
.menu { display: flex; gap: 12px; flex-wrap: wrap; }
.menu > div { flex: 1; min-width: 140px; }
\`\`\`

\`gap\` is the space between them, and \`flex-wrap: wrap\` lets them go to the next line on small phones.`,
      task: 'Make the three dishes sit side by side with a gap, and let them wrap on small screens.',
      starter: `<style>
  body { font-family: sans-serif; }
  .dish { background: #ffedd5; padding: 12px; border-radius: 10px; }
  /* make .menu a flex row here */
</style>

<div class="menu">
  <div class="dish">Jollof rice</div>
  <div class="dish">Egusi soup</div>
  <div class="dish">Suya</div>
</div>
`,
      checks: [
        { label: '.menu uses display: flex', test: `return getComputedStyle(document.querySelector('.menu')).display === 'flex'` },
        { label: 'There is a gap between dishes', test: `const s = getComputedStyle(document.querySelector('.menu')); return parseFloat(s.columnGap) > 0 || parseFloat(s.gap) > 0` },
        { label: 'Dishes can wrap', test: `return getComputedStyle(document.querySelector('.menu')).flexWrap === 'wrap'` },
      ],
    },
    {
      id: 'web-js-basics',
      title: 'JavaScript: variables and functions',
      minutes: 14,
      kind: 'code',
      body: `## JavaScript makes pages think

\`\`\`html
<p id="total"></p>
<script>
  const price = 3500
  const plates = 3
  function total(p, n) { return p * n }
  document.getElementById('total').textContent = 'Total: ₦' + total(price, plates)
</script>
\`\`\`

- \`const\` stores a value
- a **function** is a reusable recipe: give it inputs, it gives back an answer
- \`document.getElementById(...)\` finds an element so you can change it`,
      task: 'Write a function called total(price, plates) that returns price × plates, and show "Total: ₦10500" for 3 plates of ₦3,500 in the paragraph with id="total".',
      starter: `<p id="total">Total: ?</p>
<script>
  const price = 3500
  const plates = 3
  // write the total function here, then show the answer in #total
</script>
`,
      checks: [
        { label: 'A function called total exists', test: `return typeof total === 'function'` },
        { label: 'total(3500, 3) gives 10500', test: `return typeof total === 'function' && total(3500, 3) === 10500` },
        { label: 'total(1000, 2) gives 2000', test: `return typeof total === 'function' && total(1000, 2) === 2000` },
        { label: 'The page shows 10500', test: `return document.getElementById('total').textContent.replace(/[, ]/g, '').includes('10500')` },
      ],
      hint: "function total(p, n) { return p * n }  then  document.getElementById('total').textContent = 'Total: ₦' + total(price, plates)",
    },
    {
      id: 'web-events',
      title: 'Buttons that do things',
      minutes: 12,
      kind: 'code',
      body: `## Listen for clicks

\`\`\`html
<button id="add">Add plate</button>
<p>Plates: <span id="count">0</span></p>
<script>
  let count = 0
  document.getElementById('add').addEventListener('click', () => {
    count = count + 1
    document.getElementById('count').textContent = count
  })
</script>
\`\`\`

\`let\` is a value that can change. \`addEventListener('click', ...)\` runs your code every time the button is clicked.`,
      task: 'Make the + button add 1 and the − button take away 1 (never below 0). Show the number in #count.',
      starter: `<button id="minus">−</button>
<span id="count">0</span>
<button id="plus">+</button>
<script>
  let count = 0
  // listen for clicks on #plus and #minus here
</script>
`,
      checks: [
        { label: 'Clicking + twice shows 2', test: `const c = document.getElementById('count'); const p = document.getElementById('plus'); const start = Number(c.textContent); p.click(); p.click(); const ok = Number(c.textContent) === start + 2; document.getElementById('minus').click(); document.getElementById('minus').click(); return ok` },
        { label: 'Clicking − takes away 1', test: `const c = document.getElementById('count'); document.getElementById('plus').click(); const a = Number(c.textContent); document.getElementById('minus').click(); return Number(c.textContent) === a - 1` },
        { label: 'It never goes below 0', test: `const c = document.getElementById('count'); for (let i = 0; i < 20; i++) document.getElementById('minus').click(); return Number(c.textContent) === 0` },
      ],
      hint: "document.getElementById('minus').addEventListener('click', () => { if (count > 0) count--; document.getElementById('count').textContent = count })",
    },
  ],
}
