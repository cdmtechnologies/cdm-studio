// Writes the lesson titles and tasks the AI tutor needs (supabase/functions/studio-tutor/lessons.json),
// so the tutor knows which lesson the learner is on. Run after changing lessons: node scripts/lesson-meta.mjs
import { build } from 'esbuild'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const out = join(mkdtempSync(join(tmpdir(), 'lessons-')), 'l.mjs')
await build({ entryPoints: ['src/lessons/index.ts'], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error' })
const { TRACKS } = await import(pathToFileURL(out).href)
const meta = {}
for (const t of TRACKS) for (const l of t.lessons) {
  meta[l.id] = { track: t.title, title: l.title, kind: l.kind, task: l.task ?? null, practice: l.practice ?? null, hint: l.hint ?? null,
    body: l.body.replace(/\s+/g, ' ').slice(0, 1500) }
}
writeFileSync('supabase/functions/studio-tutor/lessons.json', JSON.stringify(meta, null, 1) + '\n')
console.log('lessons:', Object.keys(meta).length)
