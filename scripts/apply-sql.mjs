// Applies database changes through the Supabase Management API (run by GitHub Actions with SUPABASE_ACCESS_TOKEN).
//  - each file in supabase/migrations once, in name order
//  - the generated content (courses, lesson notes) again whenever it changes
// What has run is kept in public.deploy_log (no one but the server can read it).
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const REF = 'vkrnrupiidbnqxrehrty'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN is not set: add it under Settings > Secrets and variables > Actions.'); process.exit(1) }

async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }),
  })
  const text = await r.text()
  if (!r.ok) throw new Error(`${r.status} ${text.slice(0, 500)}`)
  return text ? JSON.parse(text) : []
}
const lit = (s) => `'${String(s).replace(/'/g, "''")}'`
const sha = (s) => createHash('sha256').update(s).digest('hex')

// first run: these were applied by hand before this script existed
await sql(`create table if not exists public.deploy_log (file text primary key, sha text not null, applied_at timestamptz not null default now());
alter table public.deploy_log enable row level security;
revoke all on public.deploy_log from anon, authenticated;
insert into public.deploy_log (file, sha) values ('20261120140000_init.sql', 'manual'), ('20261120140100_payments_owner.sql', 'manual'), ('20261120140200_lesson_meta.sql', 'manual'), ('20261121090000_credits.sql', 'manual') on conflict do nothing;`)
const done = Object.fromEntries((await sql('select file, sha from public.deploy_log')).map((r) => [r.file, r.sha]))

for (const f of readdirSync('supabase/migrations').filter((x) => x.endsWith('.sql')).sort()) {
  if (done[f]) continue
  const body = readFileSync(`supabase/migrations/${f}`, 'utf8')
  console.log('migration', f)
  await sql(`${body}\ninsert into public.deploy_log (file, sha) values (${lit(f)}, ${lit(sha(body))}) on conflict (file) do update set sha = excluded.sha, applied_at = now();`)
}

const generated = {
  'seed:courses': readFileSync('supabase/seed/courses.sql', 'utf8').replace(/^begin;$|^commit;$/gm, ''),
  'seed:lesson-meta': execFileSync('node', ['scripts/lesson-meta.mjs'], { encoding: 'utf8' }),
}
for (const [name, body] of Object.entries(generated)) {
  const h = sha(body)
  if (done[name] === h) continue
  console.log('content', name)
  await sql(`${body}\ninsert into public.deploy_log (file, sha) values (${lit(name)}, ${lit(h)}) on conflict (file) do update set sha = excluded.sha, applied_at = now();`)
}
console.log('database up to date')
