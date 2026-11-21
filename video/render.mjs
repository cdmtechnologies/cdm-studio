// Renders a whiteboard scene to an mp4 (or still frames for checking).
//   node render.mjs scene.json out.mp4            -> video, 30 fps, 1920x1080
//   node render.mjs scene.json --stills 1.5,4,9   -> PNG stills in ./stills/
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, renameSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const [, , scenePath, out, times] = process.argv
const scene = JSON.parse(readFileSync(scenePath, 'utf8'))
const fontNames = [...new Set(['EMSReadability', ...scene.cues.flatMap((c) => c.items.map((i) => i.font).filter(Boolean))])]
const fonts = Object.fromEntries(fontNames.map((n) => [n, readFileSync(join(here, n + '.svg'), 'utf8')]))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
await page.setContent('<!doctype html><html><body></body></html>')
await page.addScriptTag({ content: readFileSync(join(here, 'engine.js'), 'utf8') })
const end = await page.evaluate(([s, f]) => window.WB.load(s, f), [scene, fonts])
const duration = scene.duration ?? end + (scene.tail ?? 1.5)

if (out === '--stills') {
  mkdirSync('stills', { recursive: true })
  for (const t of times.split(',').map(Number)) {
    await page.evaluate((t) => window.WB.frame(t), t)
    await page.screenshot({ path: `stills/${scene.name}-${t}.png` })
  }
  console.log('stills done, scene length', duration.toFixed(2))
} else {
  const fps = 30, n = Math.round(duration * fps)
  const tmp = out.replace(/\.mp4$/, '.part.mp4')
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), tmp], { stdio: ['pipe', 'inherit', 'inherit'] })
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.WB.frame(t), i / fps)
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 })
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
  }
  ff.stdin.end()
  const code = await new Promise((r) => ff.on('close', r))
  if (code !== 0) throw new Error('ffmpeg failed')
  renameSync(tmp, out)
  console.log(`${out}: ${n} frames, ${duration.toFixed(2)}s`)
}
await browser.close()
