/*
  Graded final projects. Each certified course can have a project (course_projects, written by scripts/courses.mjs).
  The learner submits one of their Studio projects or their code; the studio-grade function marks it with AI against
  the course's checklist and saves the result here. A certificate now needs: every lesson + a passed project + the exam.
  Safe to run more than once.
*/
create table if not exists public.course_projects (
  track     text primary key check (track ~ '^[a-z0-9-]{1,40}$'),
  title     text not null,
  brief     text not null,
  lang      text not null default 'html' check (lang in ('html', 'python', 'sql', 'text')),
  rubric    jsonb not null check (jsonb_typeof(rubric) = 'array'),
  pass_pct  int not null default 70 check (pass_pct between 1 and 100)
);
create table if not exists public.project_submissions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  track      text not null,
  project_id uuid references public.projects (id) on delete set null,
  score      int not null check (score between 0 and 100),
  passed     boolean not null,
  feedback   jsonb not null,
  at         timestamptz not null default now()
);
create index if not exists project_submissions_idx on public.project_submissions (user_id, track, at desc);
alter table public.course_projects enable row level security;
alter table public.project_submissions enable row level security;
grant select on public.course_projects to anon, authenticated;
grant select (id, track, project_id, score, passed, feedback, at) on public.project_submissions to authenticated;
grant all on public.course_projects, public.project_submissions to service_role;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'course_projects' and policyname = 'projects: everyone reads') then
    create policy "projects: everyone reads" on public.course_projects for select to anon, authenticated using (true);
    create policy "submissions: own" on public.project_submissions for select to authenticated using (user_id = (select auth.uid()));
  end if;
end $$;

do $$ begin execute 'drop function if exists public.submit_exam(text, int[], text)'; end $$;
create function public.submit_exam(p_track text, p_answers int[], p_name text)
returns table (score int, passed boolean, code text, need int, missing int, project_ok boolean)
language plpgsql security definer set search_path = public as $$
declare total int; right_n int; pct int; s public.settings; c text; todo int; proj boolean; nm text := trim(coalesce(p_name, ''));
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into s from public.settings;
  select count(*) into total from public.exam_questions where track = p_track;
  if total = 0 then raise exception 'This course has no exam yet.'; end if;
  if length(nm) < 2 or length(nm) > 80 then raise exception 'Type your full name as it should appear on the certificate.'; end if;
  if (select count(*) from public.exam_attempts a where a.user_id = auth.uid() and a.track = p_track and a.at > now() - interval '1 day') >= 3 then
    raise exception 'You have used 3 tries today. Review the lessons and try again tomorrow.';
  end if;
  select count(*) into todo from public.lesson_meta m
   where m.meta ->> 'track' = p_track and not exists (select 1 from public.progress p where p.user_id = auth.uid() and p.lesson_id = m.id);
  proj := not exists (select 1 from public.course_projects where track = p_track)
       or exists (select 1 from public.project_submissions ps where ps.user_id = auth.uid() and ps.track = p_track and ps.passed);
  select count(*) into right_n from public.exam_questions q where q.track = p_track and p_answers[q.n] = q.answer;
  pct := round(right_n * 100.0 / total);
  insert into public.exam_attempts (user_id, track, score) values (auth.uid(), p_track, pct);
  if pct >= s.exam_pass_pct and todo = 0 and proj then
    select ce.code into c from public.certificates ce where ce.user_id = auth.uid() and ce.track = p_track;
    if c is null then
      c := 'CDM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' || upper(substr(md5(random()::text || auth.uid()::text), 1, 4));
      insert into public.certificates (code, user_id, track, title, name, score)
      values (c, auth.uid(), p_track, coalesce((select meta ->> 'track_title' from public.lesson_meta where meta ->> 'track' = p_track limit 1), p_track), nm, pct);
    else
      update public.certificates set score = greatest(certificates.score, pct) where certificates.code = c;
    end if;
  end if;
  return query select pct, pct >= s.exam_pass_pct and todo = 0 and proj, c, s.exam_pass_pct, todo, proj;
end $$;
revoke all on function public.submit_exam(text, int[], text) from public, anon;
grant execute on function public.submit_exam(text, int[], text) to authenticated;
