/*
  CDM Studio: learn AI, web, apps, games and data, and build with AI.

    profiles         one per person (name, country, goal); Premium end date is set only by payments
    progress         lessons a person has finished, with their last code
    projects         things people build with AI (one HTML page each); can be published to the gallery
    project_versions every saved version of a project (AI change, own edit, remix), for undo and history
    reports          people can report a published project; the owner hides it
    ai_usage         daily AI use per person (builds, tutor questions, tokens) for limits and costs
    settings         one row: daily limits, prices, AI on/off, owner two-step
    staff, payments, admin_log   owner and money tables, used only by the server functions

  New Supabase projects give the API roles no table rights by default, so every right is granted here.
*/

-- ---------- profiles ----------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text check (length(name) <= 80),
  country       text check (country ~ '^[A-Z]{2}$'),
  goal          text check (goal in ('ai', 'web', 'apps', 'games', 'data', 'all')),
  level         text check (level in ('new', 'some', 'pro')),
  premium_until timestamptz,
  referral_code text check (length(referral_code) <= 40),
  created_at    timestamptz not null default now(),
  last_seen     timestamptz
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, referral_code)
  values (new.id,
          nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), 80), ''),
          nullif(left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'ref', ''), '[^A-Za-z0-9-]', '', 'g'), 40), ''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- lessons done ----------
create table public.progress (
  user_id   uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^[a-z0-9-]{1,60}$'),
  code      text check (length(code) <= 100000),
  done_at   timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ---------- projects ----------
create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null default 'Untitled' check (length(title) between 1 and 80),
  kind       text not null default 'website' check (kind in ('website', 'app', 'game', 'data')),
  html       text not null default '' check (length(html) <= 300000),
  published  boolean not null default false,
  slug       text unique check (slug ~ '^[a-z0-9]{10}$'),
  remix_of   uuid references public.projects (id) on delete set null,
  views      int not null default 0,
  hidden     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_owner_idx on public.projects (owner_id, updated_at desc);
create index projects_gallery_idx on public.projects (updated_at desc) where published and not hidden;

create table public.project_versions (
  id         bigint generated always as identity primary key,
  project_id uuid not null references public.projects (id) on delete cascade,
  html       text not null check (length(html) <= 300000),
  prompt     text check (length(prompt) <= 4000),
  summary    text check (length(summary) <= 4000),
  source     text not null default 'edit' check (source in ('start', 'ai', 'edit', 'remix', 'restore')),
  created_at timestamptz not null default now()
);
create index project_versions_idx on public.project_versions (project_id, id desc);

create or replace function public.projects_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if new.published and new.slug is null then
    new.slug := substr(md5(random()::text || clock_timestamp()::text || new.id::text), 1, 10);
  end if;
  -- people cannot un-hide a project the owner hid, or change who owns it
  if tg_op = 'UPDATE' then
    new.owner_id := old.owner_id;
    if current_user in ('authenticated', 'anon') then new.hidden := old.hidden; new.views := old.views; end if;
  end if;
  return new;
end $$;
create trigger projects_touch before insert or update on public.projects for each row execute function public.projects_touch();

-- keep at most 50 versions per project
create or replace function public.versions_trim()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.project_versions v
   where v.project_id = new.project_id
     and v.id < (select min(id) from (select id from public.project_versions where project_id = new.project_id order by id desc limit 50) k);
  return new;
end $$;
create trigger versions_trim after insert on public.project_versions for each row execute function public.versions_trim();

create table public.reports (
  id         bigint generated always as identity primary key,
  project_id uuid not null references public.projects (id) on delete cascade,
  reporter   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason     text not null check (length(reason) between 3 and 500),
  created_at timestamptz not null default now(),
  unique (project_id, reporter)
);

-- ---------- settings, usage, money, owner ----------
create table public.settings (
  id                   boolean primary key default true check (id),
  ai_enabled           boolean not null default true,
  owner_two_step       boolean not null default true,
  free_builds_daily    int not null default 8 check (free_builds_daily between 0 and 1000),
  premium_builds_daily int not null default 80 check (premium_builds_daily between 0 and 5000),
  free_tutor_daily     int not null default 20 check (free_tutor_daily between 0 and 1000),
  premium_tutor_daily  int not null default 200 check (premium_tutor_daily between 0 and 5000),
  price_monthly_ngn    int not null default 3000 check (price_monthly_ngn > 0),
  price_yearly_ngn     int not null default 30000 check (price_yearly_ngn > 0),
  price_monthly_usd    numeric(8,2) not null default 5 check (price_monthly_usd > 0),
  price_yearly_usd     numeric(8,2) not null default 50 check (price_yearly_usd > 0),
  ai_cost_in_per_m     numeric(8,3) not null default 1 check (ai_cost_in_per_m >= 0),
  ai_cost_out_per_m    numeric(8,3) not null default 5 check (ai_cost_out_per_m >= 0),
  updated_at           timestamptz not null default now()
);
insert into public.settings default values;

create table public.ai_usage (
  user_id    uuid not null references auth.users (id) on delete cascade,
  day        date not null default (now() at time zone 'Africa/Lagos')::date,
  builds     int not null default 0,
  tutor      int not null default 0,
  tokens_in  bigint not null default 0,
  tokens_out bigint not null default 0,
  primary key (user_id, day)
);

create table public.staff (email text primary key check (email = lower(email)), role text not null default 'owner' check (role in ('owner')));
insert into public.staff (email) values ('cdmtech26@gmail.com');

create table public.payments (
  reference  text primary key check (reference ~ '^cdmstudio_[A-Za-z0-9_-]{6,80}$'),
  user_id    uuid not null references auth.users (id) on delete cascade,
  amount     numeric(12,2) not null,
  currency   text not null check (currency in ('NGN', 'USD')),
  period     text not null check (period in ('monthly', 'yearly')),
  status     text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  paid_at    timestamptz
);

create table public.admin_log (
  id     bigint generated always as identity primary key,
  at     timestamptz not null default now(),
  actor  text not null,
  action text not null,
  target text,
  detail jsonb not null default '{}'
);

-- one AI use: checks the switch and the day's limit, then counts it. Server only.
create or replace function public.usage_take(p_user uuid, p_kind text)
returns table (allowed boolean, used int, day_limit int, premium boolean, reason text)
language plpgsql security definer set search_path = public as $$
declare s public.settings; prem boolean; lim int; cur int; d date := (now() at time zone 'Africa/Lagos')::date;
begin
  select * into s from public.settings;
  if not s.ai_enabled then return query select false, 0, 0, false, 'paused'; return; end if;
  select coalesce(premium_until > now(), false) into prem from public.profiles where id = p_user;
  prem := coalesce(prem, false);
  lim := case when p_kind = 'build' then (case when prem then s.premium_builds_daily else s.free_builds_daily end)
              else (case when prem then s.premium_tutor_daily else s.free_tutor_daily end) end;
  insert into public.ai_usage (user_id, day) values (p_user, d) on conflict do nothing;
  select case when p_kind = 'build' then builds else tutor end into cur from public.ai_usage where user_id = p_user and day = d for update;
  if cur >= lim then return query select false, cur, lim, prem, 'limit'; return; end if;
  if p_kind = 'build' then update public.ai_usage set builds = builds + 1 where user_id = p_user and day = d;
  else update public.ai_usage set tutor = tutor + 1 where user_id = p_user and day = d; end if;
  return query select true, cur + 1, lim, prem, null::text;
end $$;

create or replace function public.ai_add_tokens(p_user uuid, p_in bigint, p_out bigint)
returns void language sql security definer set search_path = public as $$
  update public.ai_usage set tokens_in = tokens_in + greatest(p_in, 0), tokens_out = tokens_out + greatest(p_out, 0)
   where user_id = p_user and day = (now() at time zone 'Africa/Lagos')::date;
$$;

-- copy a published project into my projects
create or replace function public.remix_project(p_slug text)
returns uuid language plpgsql security definer set search_path = public as $$
declare src public.projects; new_id uuid;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into src from public.projects where slug = p_slug and published and not hidden;
  if not found then raise exception 'That project is not available.'; end if;
  if (select count(*) from public.projects where owner_id = auth.uid()) >= 200 then raise exception 'You have 200 projects. Delete some first.'; end if;
  insert into public.projects (owner_id, title, kind, html, remix_of)
  values (auth.uid(), left('Remix of ' || src.title, 80), src.kind, src.html, src.id) returning id into new_id;
  insert into public.project_versions (project_id, html, summary, source) values (new_id, src.html, 'Copied from "' || src.title || '"', 'remix');
  return new_id;
end $$;

-- a published project opened by a visitor (counts the view)
create or replace function public.open_published(p_slug text)
returns table (id uuid, title text, kind text, html text, views int, updated_at timestamptz, author text, remix_of_slug text)
language plpgsql security definer set search_path = public as $$
begin
  update public.projects p set views = p.views + 1 where p.slug = p_slug and p.published and not p.hidden;
  return query
    select p.id, p.title, p.kind, p.html, p.views, p.updated_at, coalesce(nullif(split_part(pr.name, ' ', 1), ''), 'A CDM Studio maker'),
           (select r.slug from public.projects r where r.id = p.remix_of and r.published and not r.hidden)
      from public.projects p left join public.profiles pr on pr.id = p.owner_id
     where p.slug = p_slug and p.published and not p.hidden;
end $$;

-- the gallery: newest or most viewed published projects
create or replace function public.gallery(p_kind text default null, p_sort text default 'new', p_limit int default 24, p_offset int default 0)
returns table (slug text, title text, kind text, views int, updated_at timestamptz, author text)
language sql stable security definer set search_path = public as $$
  select p.slug, p.title, p.kind, p.views, p.updated_at, coalesce(nullif(split_part(pr.name, ' ', 1), ''), 'A CDM Studio maker')
    from public.projects p left join public.profiles pr on pr.id = p.owner_id
   where p.published and not p.hidden and (p_kind is null or p.kind = p_kind)
   order by case when p_sort = 'top' then p.views end desc nulls last, p.updated_at desc
   limit least(greatest(p_limit, 1), 48) offset greatest(p_offset, 0);
$$;

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.reports enable row level security;
alter table public.settings enable row level security;
alter table public.ai_usage enable row level security;
alter table public.staff enable row level security;
alter table public.payments enable row level security;
alter table public.admin_log enable row level security;

create policy "profiles: own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles: own update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "progress: own" on public.progress for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "projects: own" on public.projects for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "versions: own" on public.project_versions for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "versions: own add" on public.project_versions for insert to authenticated
  with check (source in ('edit', 'restore', 'start') and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy "reports: add" on public.reports for insert to authenticated with check (reporter = (select auth.uid()));
create policy "settings: read" on public.settings for select to anon, authenticated using (true);
create policy "usage: own" on public.ai_usage for select to authenticated using (user_id = (select auth.uid()));
create policy "payments: own" on public.payments for select to authenticated using (user_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name, country, goal, level, last_seen) on public.profiles to authenticated;
grant select, insert, update, delete on public.progress to authenticated;
grant select, delete on public.projects to authenticated;
grant insert (title, kind, html) on public.projects to authenticated;
grant update (title, kind, html, published) on public.projects to authenticated;
grant select, insert on public.project_versions to authenticated;
grant insert (project_id, reason) on public.reports to authenticated;
grant select (free_builds_daily, premium_builds_daily, free_tutor_daily, premium_tutor_daily, price_monthly_ngn, price_yearly_ngn, price_monthly_usd, price_yearly_usd, ai_enabled) on public.settings to anon, authenticated;
grant select on public.ai_usage to authenticated;
grant select (reference, amount, currency, period, status, created_at, paid_at) on public.payments to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

revoke all on function public.usage_take(uuid, text), public.ai_add_tokens(uuid, bigint, bigint), public.handle_new_user(), public.versions_trim() from public, anon, authenticated;
grant execute on function public.usage_take(uuid, text), public.ai_add_tokens(uuid, bigint, bigint) to service_role;
revoke all on function public.remix_project(text) from public, anon;
grant execute on function public.remix_project(text) to authenticated;
grant execute on function public.open_published(text), public.gallery(text, text, int, int) to anon, authenticated;
