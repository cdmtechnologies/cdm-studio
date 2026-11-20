// Model answers for every code lesson. scripts/check-lessons.mjs runs each lesson's checks in a real browser
// sandbox: every check must pass with the answer, and at least one must fail with the starter code.
const head = (l) => l.starter
export const SOLUTIONS = {
  'web-first-page': () => `<h1>Ada Okoro</h1>\n<p>I am learning to build websites with CDM Studio.</p>\n<a href="https://wa.me/2348000000000">Chat with me</a>`,
  'web-css': (l) => head(l).replace('/* write your CSS here */', 'body { background: #fff7ed } h1 { color: #ea580c } .card { padding: 16px; border-radius: 12px; background: white }'),
  'web-layout': (l) => head(l).replace('/* make .menu a flex row here */', '.menu { display: flex; gap: 12px; flex-wrap: wrap }'),
  'web-js-basics': (l) => head(l).replace('// write the total function here, then show the answer in #total', "function total(p, n) { return p * n }\n  document.getElementById('total').textContent = 'Total: ₦' + total(price, plates)"),
  'web-events': (l) => head(l).replace('// listen for clicks on #plus and #minus here', "const show = () => { document.getElementById('count').textContent = count }\n  document.getElementById('plus').addEventListener('click', () => { count++; show() })\n  document.getElementById('minus').addEventListener('click', () => { if (count > 0) count--; show() })"),
  'app-todo': (l) => head(l).replace('// draw every task as an <li>', "list.innerHTML = ''\n    for (const t of tasks) { const li = document.createElement('li'); li.textContent = t; list.appendChild(li) }")
    .replace('// when #add is clicked: add box.value to tasks, clear the box, show()', "document.getElementById('add').addEventListener('click', () => { const t = box.value.trim(); if (!t) return; tasks.push(t); box.value = ''; show() })"),
  'app-save': (l) => head(l).replace('// storage.setItem(...)', "storage.setItem('notes', JSON.stringify(notes))").replace('// return the saved array, or []', "return JSON.parse(storage.getItem('notes') || '[]')"),
  'app-forms': (l) => head(l).replace('// your code', "const d = String(text).replace(/\\D/g, ''); return d.length === 11 && d.startsWith('0')"),
  'app-calculator': (l) => head(l).replace('function profit(cost, price, qty) {\n  }', 'function profit(cost, price, qty) { return Math.round((price - cost) * qty) }').replace('function margin(cost, price) {\n  }', 'function margin(cost, price) { return Math.round((price - cost) / price * 1000) / 10 }'),
  'game-canvas': (l) => head(l).replace('// draw here', "ctx.fillStyle = 'green'; ctx.fillRect(20, 20, 80, 50); ctx.fillStyle = 'gold'; ctx.beginPath(); ctx.arc(200, 100, 30, 0, Math.PI * 2); ctx.fill()"),
  'game-loop': (l) => head(l).replace('// move x, wrap it, and ask for the next frame', 'x += 3; if (x > 335) x = -15; requestAnimationFrame(frame)'),
  'game-keys': (l) => head(l).replace('// listen for ArrowLeft and ArrowRight here', "document.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') player.x = Math.max(0, player.x - 20); if (e.key === 'ArrowRight') player.x = Math.min(280, player.x + 20) })"),
  'game-dodge': (l) => head(l).replace('// return true when a and b overlap\n    return false', 'return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y'),
  'data-totals': (l) => head(l).replace('function revenue(sales) {\n  }', 'function revenue(sales) { return sales.reduce((s, r) => s + r.qty * r.price, 0) }')
    .replace('function bestSeller(sales) {\n  }', 'function bestSeller(sales) { const by = {}; for (const s of sales) by[s.item] = (by[s.item] || 0) + s.qty; return Object.keys(by).sort((a, b) => by[b] - by[a])[0] }'),
  'data-chart': (l) => head(l).replace('// draw the bars here', "sales.forEach((v, i) => { const h = v / Math.max(...sales) * 150; ctx.fillStyle = '#e11d48'; ctx.fillRect(30 + i * 70, 170 - h, 40, h) })"),
}
