import type { Track } from './types'

export const apps: Track = {
  id: 'apps',
  title: 'Build apps',
  blurb: 'Small useful apps: lists, forms, saving data and calculators, the way real apps work.',
  colour: 'emerald',
  emoji: '📱',
  lessons: [
    {
      id: 'app-todo',
      title: 'A to-do list app',
      minutes: 15,
      kind: 'code',
      body: `## Lists of things are arrays

\`\`\`js
const tasks = ['Buy rice', 'Call mum']
tasks.push('Pay light bill')      // add to the end
tasks.length                      // 3
\`\`\`

To show an array on the page, clear the list and add one \`<li>\` per item:

\`\`\`js
function show() {
  list.innerHTML = ''
  for (const t of tasks) {
    const li = document.createElement('li')
    li.textContent = t
    list.appendChild(li)
  }
}
\`\`\``,
      task: 'When "Add" is clicked, add the typed task to the list (ignore empty text) and clear the box.',
      starter: `<input id="text" placeholder="New task">
<button id="add">Add</button>
<ul id="list"></ul>
<script>
  const tasks = []
  const list = document.getElementById('list')
  const box = document.getElementById('text')
  function show() {
    // draw every task as an <li>
  }
  // when #add is clicked: add box.value to tasks, clear the box, show()
</script>
`,
      checks: [
        { label: 'Adding "Buy rice" shows it in the list', test: `const b = document.getElementById('text'); b.value = 'Buy rice'; document.getElementById('add').click(); return [...document.querySelectorAll('#list li')].some(li => li.textContent.includes('Buy rice'))` },
        { label: 'The box is cleared after adding', test: `const b = document.getElementById('text'); b.value = 'Call mum'; document.getElementById('add').click(); return b.value === ''` },
        { label: 'Empty text is not added', test: `const n = document.querySelectorAll('#list li').length; const b = document.getElementById('text'); b.value = '   '; document.getElementById('add').click(); return document.querySelectorAll('#list li').length === n` },
      ],
      hint: "document.getElementById('add').addEventListener('click', () => { const t = box.value.trim(); if (!t) return; tasks.push(t); box.value = ''; show() })",
    },
    {
      id: 'app-save',
      title: 'Saving data in the browser',
      minutes: 12,
      kind: 'code',
      body: `## localStorage remembers things

\`localStorage\` keeps text in the browser, even after the page is closed:

\`\`\`js
localStorage.setItem('name', 'Ada')
localStorage.getItem('name')   // 'Ada'
\`\`\`

It only stores text, so turn arrays into text with JSON:

\`\`\`js
localStorage.setItem('tasks', JSON.stringify(tasks))
const saved = JSON.parse(localStorage.getItem('tasks') || '[]')
\`\`\`

(In this lesson's sandbox, storage is pretend: it works the same way but is cleared each time.)`,
      task: 'Write save() to store the notes array under the key "notes", and load() to return the saved array (or [] if nothing is saved).',
      starter: `<script>
  // a pretend storage for the lesson sandbox (works like localStorage)
  const store = {}
  const storage = { setItem: (k, v) => { store[k] = String(v) }, getItem: (k) => (k in store ? store[k] : null) }

  function save(notes) {
    // storage.setItem(...)
  }
  function load() {
    // return the saved array, or []
  }
</script>
`,
      checks: [
        { label: 'load() gives [] when nothing is saved', test: `return Array.isArray(load()) && load().length === 0` },
        { label: 'save then load gives the same notes back', test: `save(['a', 'b']); const r = load(); return Array.isArray(r) && r.join() === 'a,b'` },
        { label: 'It is stored as text under "notes"', test: `save(['x']); return typeof storage.getItem('notes') === 'string' && storage.getItem('notes').includes('x')` },
      ],
      hint: "function save(notes) { storage.setItem('notes', JSON.stringify(notes)) }  function load() { return JSON.parse(storage.getItem('notes') || '[]') }",
    },
    {
      id: 'app-forms',
      title: 'Forms and checking input',
      minutes: 12,
      kind: 'code',
      body: `## Never trust input

Before using what people type, check it:

\`\`\`js
function validPhone(p) {
  const digits = p.replace(/\\D/g, '')      // keep only numbers
  return digits.length === 11 && digits.startsWith('0')
}
\`\`\`

\`/\\D/g\` is a *regular expression*: it matches every character that is not a digit.`,
      task: 'Write validPhone(text): true for a Nigerian mobile number with 11 digits starting with 0 (spaces and dashes allowed), false otherwise.',
      starter: `<script>
  function validPhone(text) {
    // your code
  }
</script>
`,
      checks: [
        { label: '08031234567 is valid', test: `return validPhone('08031234567') === true` },
        { label: '0803 123 4567 is valid (spaces)', test: `return validPhone('0803 123 4567') === true` },
        { label: '0803-123 is not valid (too short)', test: `return validPhone('0803-123') === false` },
        { label: '18031234567 is not valid (must start with 0)', test: `return validPhone('18031234567') === false` },
      ],
    },
    {
      id: 'app-calculator',
      title: 'A profit calculator',
      minutes: 14,
      kind: 'code',
      body: `## Real apps do real sums

A shop owner wants to know the profit on an item:

- profit per item = selling price − cost price
- margin % = profit ÷ selling price × 100

Round money to whole naira with \`Math.round()\`, and a percentage to 1 decimal with \`Math.round(x * 10) / 10\`.`,
      task: 'Write profit(cost, price, qty) returning the total profit, and margin(cost, price) returning the margin % to 1 decimal place.',
      starter: `<script>
  function profit(cost, price, qty) {
  }
  function margin(cost, price) {
  }
</script>
`,
      checks: [
        { label: 'profit(800, 1000, 10) is 2000', test: `return profit(800, 1000, 10) === 2000` },
        { label: 'margin(800, 1000) is 20', test: `return margin(800, 1000) === 20` },
        { label: 'margin(700, 900) is 22.2', test: `return margin(700, 900) === 22.2` },
      ],
    },
  ],
}
