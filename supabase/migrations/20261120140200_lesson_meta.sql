-- What the AI tutor knows about each lesson (title, task, hint, text). Server only.
-- Filled and refreshed by: node scripts/lesson-meta.mjs > lesson-meta.sql (run that in the SQL editor).
create table public.lesson_meta (id text primary key check (id ~ '^[a-z0-9-]{1,60}$'), meta jsonb not null, updated_at timestamptz not null default now());
alter table public.lesson_meta enable row level security;
grant all on public.lesson_meta to service_role;
