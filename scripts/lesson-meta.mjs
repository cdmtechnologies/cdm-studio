// Writes the SQL that refreshes the lesson_meta table (the lesson titles, tasks and text the AI tutor uses).
// Run after changing lessons: node scripts/lesson-meta.mjs > lesson-meta.sql, then run that file in the Supabase SQL editor.
import { build } from 'esbuild'
import { mkdtempSync } from 'node:fs'
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
const json = JSON.stringify(meta)
if (json.includes('$lessons$')) throw new Error('lesson text contains the quote marker')
console.log(`insert into public.lesson_meta (id, meta)\nselect key, value from jsonb_each($lessons$${json}$lessons$::jsonb)\non conflict (id) do update set meta = excluded.meta, updated_at = now();\ndelete from public.lesson_meta where id not in (select jsonb_object_keys($lessons$${json}$lessons$::jsonb)) and not (meta ? 'paid');`)
