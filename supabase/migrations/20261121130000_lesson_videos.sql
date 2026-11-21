/*
  A YouTube video for any lesson, set by the CDM Studio owner (Owner page > Course videos).
  Anyone can see which video belongs to which lesson; only the server (studio-control, owner checked) writes.
  Safe to run more than once.
*/
create table if not exists public.lesson_videos (
  lesson_id  text primary key check (lesson_id ~ '^[a-z0-9-]{1,60}$'),
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  title      text check (length(title) <= 120),
  updated_at timestamptz not null default now()
);
alter table public.lesson_videos enable row level security;
grant select on public.lesson_videos to anon, authenticated;
grant all on public.lesson_videos to service_role;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'lesson_videos' and policyname = 'videos: everyone reads') then
    create policy "videos: everyone reads" on public.lesson_videos for select to anon, authenticated using (true);
  end if;
end $$;
