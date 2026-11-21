// Python and SQL lessons: the learner's code is wrapped in a small page that loads the engine (Pyodide for Python,
// sql.js for SQL, both WebAssembly from a CDN), runs the code, shows the output, and gives the checks helpers:
//   Python: await py('add(2, 3) == 5')  -> the value of a Python expression (converted to JavaScript)
//           output()                     -> everything the code printed
//   SQL:    await sql('select count(*) as n from sales') -> rows as objects
//           await result()               -> the rows of the learner's last statement
//           await yes('select … = 1')    -> true when that query's first value is 1 (for checking tables the learner changed)
//           await same('select …', ordered?) -> true when the learner's last result has the same rows as this query
// Everything still runs inside the same sandboxed frame as other lessons.

export const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
export const SQLJS = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/'

/** Puts any text safely inside a <script> as a JavaScript string. */
const js = (s: string) => JSON.stringify(String(s ?? '')).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

const STYLE = `<style>body{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;margin:0;background:#0f172a;color:#e2e8f0;font-size:14px}
#bar{font-family:system-ui,sans-serif;padding:8px 12px;background:#1e293b;color:#94a3b8;font-size:12px}#out{white-space:pre-wrap;padding:12px;margin:0}
.err{color:#fca5a5}table{border-collapse:collapse;margin:8px 12px;font-size:13px}td,th{border:1px solid #334155;padding:4px 8px;text-align:left}th{background:#1e293b}</style>`

export function pythonDoc(code: string, base = PYODIDE): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${STYLE}</head><body>
<div id="bar">Python · starting…</div><pre id="out"></pre>
<script src="${base}pyodide.js"></script>
<script>
(function(){
  var out = document.getElementById('out'), bar = document.getElementById('bar'), printed = ''
  function write(t, cls){ printed += t + '\\n'; var s = document.createElement('span'); if (cls) s.className = cls; s.textContent = t + '\\n'; out.appendChild(s) }
  window.output = function(){ return printed }
  var engine = loadPyodide({ indexURL: ${js(base)}, stdout: function(t){ write(t) }, stderr: function(t){ write(t, 'err') } })
  window.__ready = engine.then(function(py){
    bar.textContent = 'Python · running'
    try { py.runPython(${js(code)}); bar.textContent = 'Python · finished' }
    catch (e) { var m = String(e.message || e).trim().split('\\n'); write(m[m.length - 1], 'err'); bar.textContent = 'Python · error'; throw e }
  })
  window.py = async function(expr){
    var p = await engine; await window.__ready.catch(function(){})
    var v = p.runPython(expr)
    return v && typeof v.toJs === 'function' ? v.toJs({ dict_converter: Object.fromEntries }) : v
  }
})()
</script></body></html>`
}

export function sqlDoc(code: string, setup: string, base = SQLJS): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${STYLE}</head><body>
<div id="bar">SQL · starting…</div><div id="out"></div>
<script src="${base}sql-wasm.js"></script>
<script>
(function(){
  var out = document.getElementById('out'), bar = document.getElementById('bar'), last = []
  function rows(res){ if (!res) return []; return res.values.map(function(v){ var o = {}; res.columns.forEach(function(c, i){ o[c] = v[i] }); return o }) }
  function show(res){
    if (!res) return
    var t = document.createElement('table'), h = document.createElement('tr')
    res.columns.forEach(function(c){ var th = document.createElement('th'); th.textContent = c; h.appendChild(th) }); t.appendChild(h)
    res.values.slice(0, 200).forEach(function(v){ var tr = document.createElement('tr'); v.forEach(function(x){ var td = document.createElement('td'); td.textContent = x === null ? 'NULL' : String(x); tr.appendChild(td) }); t.appendChild(tr) })
    out.appendChild(t)
  }
  var db
  var engine = initSqlJs({ locateFile: function(f){ return ${js(base)} + f } })
  window.__ready = engine.then(function(SQL){
    db = new SQL.Database(); db.run(${js(setup)})
    bar.textContent = 'SQL · running'
    try {
      var res = db.exec(${js(code)})
      res.forEach(show); last = rows(res[res.length - 1])
      bar.textContent = 'SQL · ' + (res.length ? last.length + ' row' + (last.length === 1 ? '' : 's') : 'done')
    } catch (e) { var p = document.createElement('pre'); p.className = 'err'; p.textContent = String(e.message || e); out.appendChild(p); bar.textContent = 'SQL · error'; throw e }
  })
  window.result = async function(){ await window.__ready.catch(function(){}); return last }
  window.sql = async function(q){ await engine; await window.__ready.catch(function(){}); var r = db.exec(q); return rows(r[r.length - 1]) }
  function key(o){ return JSON.stringify(Object.keys(o).map(function(k){ var v = o[k]; return typeof v === 'number' ? Math.round(v * 100) / 100 : v })) }
  window.yes = async function(q){ var r = await sql(q); return r.length > 0 && Object.keys(r[0]).length > 0 && r[0][Object.keys(r[0])[0]] === 1 }
  window.same = async function(q, ordered){
    var a = (await result()).map(key), b = (await sql(q)).map(key)
    if (!ordered) { a.sort(); b.sort() }
    return a.length > 0 && a.length === b.length && a.every(function(x, i){ return x === b[i] })
  }
})()
</script></body></html>`
}

/** The page to run for a lesson: HTML as it is, or Python / SQL wrapped with their engine. */
export function lessonPage(code: string, lesson: { lang?: string; setup?: string }, bases?: { py?: string; sql?: string }): string {
  if (lesson.lang === 'python') return pythonDoc(code, bases?.py)
  if (lesson.lang === 'sql') return sqlDoc(code, lesson.setup ?? '', bases?.sql)
  return code
}
