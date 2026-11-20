// Runs every code lesson's checks in a sandboxed iframe in Chromium (Playwright):
// the model answer must pass every check; the starter must fail at least one.
// Usage: node scripts/check-lessons.mjs   (needs playwright and esbuild)
import { build } from 'esbuild'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { SOLUTIONS } from './lesson-solutions.mjs'

const dir = mkdtempSync(join(tmpdir(), 'lc-'))
await build({ entryPoints: ['src/lessons/index.ts', 'src/lib/sandbox.ts', 'courses/index.ts'], bundle: true, format: 'esm', platform: 'node', outdir: dir, outbase: '.', logLevel: 'error' })
const { TRACKS } = await import(pathToFileURL(join(dir, 'src/lessons/index.js')).href)
const { COURSES } = await import(pathToFileURL(join(dir, 'courses/index.js')).href)
const { buildDoc, SANDBOX } = await import(pathToFileURL(join(dir, 'src/lib/sandbox.js')).href)

const browser = await chromium.launch()
const page = await browser.newPage()
// an https page, like the real site (Web Crypto and other secure-context features need it)
await page.route('https://lessons.test/**', (r) => r.fulfill({ contentType: 'text/html', body: '<!doctype html><body></body>' }))
await page.goto('https://lessons.test/')
async function run(html, checks) {
  const nonce = 'n' + Math.random().toString(36).slice(2)
  return page.evaluate(async ({ doc, checks, nonce, sandbox }) => {
    document.body.innerHTML = ''
    const f = document.createElement('iframe')
    f.setAttribute('sandbox', sandbox)
    f.srcdoc = doc
    document.body.appendChild(f)
    return await new Promise((resolve) => {
      const t = setTimeout(() => resolve({ timeout: true }), 15000)
      window.onmessage = (e) => {
        if (e.source !== f.contentWindow || e.data?.cdm !== nonce) return
        if (e.data.type === 'ready') f.contentWindow.postMessage({ cdm: nonce, type: 'run-checks', checks }, '*')
        if (e.data.type === 'checks') { clearTimeout(t); resolve(e.data.results) }
      }
    })
  }, { doc: buildDoc(html, nonce), checks, nonce, sandbox: SANDBOX })
}

let bad = 0
// the free tracks' answers live in lesson-solutions.mjs; certified courses carry their own (never shipped)
const all = [...TRACKS.flatMap((t) => t.lessons).filter((l) => !l.paid && !l.id.match(/^(cyber|aieng)-/)), ...COURSES.flatMap((c) => c.lessons.map((l) => ({ ...l, sol: l.solution })))]
for (const l of all) {
  if (l.kind !== 'code') continue
  const sol = l.sol !== undefined ? () => l.sol : SOLUTIONS[l.id]
  if (!sol) { console.log('MISSING answer', l.id); bad++; continue }
  const good = await run(sol(l), l.checks)
  const start = await run(l.starter, l.checks)
  const okGood = Array.isArray(good) && good.every((r) => r.ok)
  const okStart = Array.isArray(start) && start.some((r) => !r.ok)
  console.log(`${okGood && okStart ? 'ok  ' : 'FAIL'} ${l.id}${okGood ? '' : ' answer: ' + JSON.stringify(good)}${okStart ? '' : ' starter passes everything'}`)
  if (!okGood || !okStart) bad++
}
await browser.close()
process.exit(bad ? 1 : 0)
