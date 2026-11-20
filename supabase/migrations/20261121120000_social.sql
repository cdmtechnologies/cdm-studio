/*
  CDM Social: an AI social media manager. Lives in CDM Studio's database (same sign-in, same credits).

  Rule that cannot be bypassed: nothing is ever posted unless an owner or approver of the workspace approved
  that exact version of the post. Any change to the text, pictures, accounts or time sends it back for approval.

  sm_workspaces   a brand or client (name, voice, audience, language)
  sm_members      people on a workspace: approver (can approve) or editor (can write and edit)
  sm_invites      invitations by email
  sm_accounts     connected Facebook Pages, Instagram, LinkedIn and X accounts; their tokens are kept in Vault
  sm_posts        drafts, approvals and the schedule
  sm_results      what each platform answered
  sm_oauth        short-lived sign-in state for connecting accounts (server only)
  Posting runs every 5 minutes (pg_cron) through the social-publish function. Safe to run more than once.
*/
-- the posting schedule needs these two (always there on Supabase; skipped on a plain test database)
do $$ begin create extension if not exists pg_cron; exception when others then raise notice 'pg_cron not available'; end $$;
do $$ begin create extension if not exists pg_net; exception when others then raise notice 'pg_net not available'; end $$;

alter table public.settings
  add column if not exists x_post_credits int not null default 8 check (x_post_credits between 0 and 10000),
  add column if not exists x_link_post_credits int not null default 96 check (x_link_post_credits between 0 and 100000),
  add column if not exists social_enabled boolean not null default true;
grant select (x_post_credits, x_link_post_credits, social_enabled) on public.settings to anon, authenticated;

do $$ begin execute 'alter table public.credit_ledger drop constraint if exists credit_ledger_reason_check'; end $$;
alter table public.credit_ledger add constraint credit_ledger_reason_check
  check (reason in ('purchase', 'build', 'tutor', 'data', 'gift', 'refund', 'signup', 'lesson', 'buy_project', 'sale', 'to_credits', 'payout', 'payout_back', 'social', 'social_post'));

create table if not exists public.sm_workspaces (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (length(name) between 1 and 80),
  brand      text not null default '' check (length(brand) <= 3000),
  language   text not null default 'English' check (length(language) <= 40),
  timezone   text not null default 'Africa/Lagos' check (length(timezone) <= 60),
  created_at timestamptz not null default now()
);
create table if not exists public.sm_members (
  workspace uuid not null references public.sm_workspaces (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  role      text not null check (role in ('approver', 'editor')),
  primary key (workspace, user_id)
);
create table if not exists public.sm_invites (
  id         uuid primary key default gen_random_uuid(),
  workspace  uuid not null references public.sm_workspaces (id) on delete cascade,
  email      text not null check (email = lower(email) and length(email) <= 200),
  role       text not null check (role in ('approver', 'editor')),
  created_at timestamptz not null default now(),
  unique (workspace, email)
);
create table if not exists public.sm_accounts (
  id           uuid primary key default gen_random_uuid(),
  workspace    uuid not null references public.sm_workspaces (id) on delete cascade,
  platform     text not null check (platform in ('facebook', 'instagram', 'linkedin', 'x')),
  external_id  text not null check (length(external_id) <= 120),
  name         text not null default '' check (length(name) <= 120),
  vault_id     uuid not null,
  refresh_id   uuid,
  expires_at   timestamptz,
  status       text not null default 'ok' check (status in ('ok', 'expired', 'error')),
  last_error   text check (length(last_error) <= 300),
  connected_by uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (workspace, platform, external_id)
);
create table if not exists public.sm_posts (
  id           uuid primary key default gen_random_uuid(),
  workspace    uuid not null references public.sm_workspaces (id) on delete cascade,
  text         text not null default '' check (length(text) <= 5000),
  media        jsonb not null default '[]' check (jsonb_typeof(media) = 'array' and jsonb_array_length(media) <= 4),
  accounts     uuid[] not null default '{}' check (cardinality(accounts) <= 12),
  scheduled_at timestamptz,
  status       text not null default 'awaiting' check (status in ('awaiting', 'approved', 'rejected', 'posting', 'posted', 'partly', 'failed')),
  source       text not null default 'user' check (source in ('user', 'ai')),
  idea         text check (length(idea) <= 500),
  note         text check (length(note) <= 500),
  created_by   uuid default auth.uid() references auth.users (id) on delete set null,
  approved_by  uuid references auth.users (id) on delete set null,
  approved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists sm_posts_ws_idx on public.sm_posts (workspace, created_at desc);
create index if not exists sm_posts_due_idx on public.sm_posts (scheduled_at) where status = 'approved';
create table if not exists public.sm_results (
  id          bigint generated always as identity primary key,
  post        uuid not null references public.sm_posts (id) on delete cascade,
  account     uuid references public.sm_accounts (id) on delete set null,
  platform    text not null,
  ok          boolean not null,
  external_id text check (length(external_id) <= 200),
  url         text check (length(url) <= 500),
  error       text check (length(error) <= 500),
  at          timestamptz not null default now()
);
create index if not exists sm_results_post_idx on public.sm_results (post);
create table if not exists public.sm_oauth (
  state      text primary key,
  workspace  uuid not null references public.sm_workspaces (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  platform   text not null,
  verifier   text,
  return_to  text,
  created_at timestamptz not null default now()
);

alter table public.sm_workspaces enable row level security;
alter table public.sm_members enable row level security;
alter table public.sm_invites enable row level security;
alter table public.sm_accounts enable row level security;
alter table public.sm_posts enable row level security;
alter table public.sm_results enable row level security;
alter table public.sm_oauth enable row level security;
grant all on public.sm_workspaces, public.sm_members, public.sm_invites, public.sm_accounts, public.sm_posts, public.sm_results, public.sm_oauth to service_role;

create or replace function public.sm_role(p_ws uuid)
returns text language sql stable security definer set search_path = public as $$
  select case when exists (select 1 from public.sm_workspaces where id = p_ws and owner = auth.uid()) then 'owner'
              else (select role from public.sm_members where workspace = p_ws and user_id = auth.uid()) end;
$$;
revoke all on function public.sm_role(uuid) from public, anon;
grant execute on function public.sm_role(uuid) to authenticated, service_role;

grant select, insert, delete on public.sm_workspaces to authenticated;
grant update (name, brand, language, timezone) on public.sm_workspaces to authenticated;
grant select on public.sm_members to authenticated;
grant select (id, workspace, email, role, created_at) on public.sm_invites to authenticated;
grant select (id, workspace, platform, external_id, name, expires_at, status, last_error, created_at) on public.sm_accounts to authenticated;
grant delete on public.sm_accounts to authenticated;
grant select, delete on public.sm_posts to authenticated;
grant insert (workspace, text, media, accounts, scheduled_at, idea) on public.sm_posts to authenticated;
grant update (text, media, accounts, scheduled_at, idea) on public.sm_posts to authenticated;
grant select on public.sm_results to authenticated;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'sm_workspaces' and policyname = 'ws: members read') then
    create policy "ws: members read" on public.sm_workspaces for select to authenticated using (owner = (select auth.uid()) or public.sm_role(id) is not null);
    create policy "ws: owner add" on public.sm_workspaces for insert to authenticated with check (owner = (select auth.uid()));
    create policy "ws: owner change" on public.sm_workspaces for update to authenticated using (owner = (select auth.uid())) with check (owner = (select auth.uid()));
    create policy "ws: owner delete" on public.sm_workspaces for delete to authenticated using (owner = (select auth.uid()));
    create policy "members: same workspace" on public.sm_members for select to authenticated using (public.sm_role(workspace) is not null);
    create policy "invites: owner or invited" on public.sm_invites for select to authenticated using (public.sm_role(workspace) = 'owner' or email = public.my_email());
    create policy "accounts: members read" on public.sm_accounts for select to authenticated using (public.sm_role(workspace) is not null);
    create policy "accounts: owner removes" on public.sm_accounts for delete to authenticated using (public.sm_role(workspace) = 'owner');
    create policy "posts: members read" on public.sm_posts for select to authenticated using (public.sm_role(workspace) is not null);
    create policy "posts: writers add" on public.sm_posts for insert to authenticated with check (public.sm_role(workspace) is not null);
    create policy "posts: writers change" on public.sm_posts for update to authenticated using (public.sm_role(workspace) is not null) with check (public.sm_role(workspace) is not null);
    create policy "posts: owner or approver delete" on public.sm_posts for delete to authenticated using (public.sm_role(workspace) in ('owner', 'approver') and status <> 'posting');
    create policy "results: members read" on public.sm_results for select to authenticated
      using (exists (select 1 from public.sm_posts p where p.id = post and public.sm_role(p.workspace) is not null));
  end if;
end $$;

-- a workspace limit, and every edit sends the post back for approval
create or replace function public.sm_workspaces_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.sm_workspaces where owner = new.owner) >= 20 then raise exception 'You can have up to 20 workspaces.'; end if;
  return new;
end $$;
do $$ begin execute 'drop trigger if exists sm_workspaces_guard on public.sm_workspaces'; end $$;
create trigger sm_workspaces_guard before insert on public.sm_workspaces for each row execute function public.sm_workspaces_guard();

create or replace function public.sm_posts_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if (select count(*) from public.sm_posts where workspace = new.workspace and status in ('awaiting', 'approved', 'rejected')) >= 500 then raise exception 'Too many open posts. Delete some first.'; end if;
    new.status := 'awaiting'; new.approved_by := null; new.approved_at := null; new.updated_at := now();
    if exists (select 1 from unnest(new.accounts) a where not exists (select 1 from public.sm_accounts s where s.id = a and s.workspace = new.workspace)) then
      raise exception 'Pick accounts from this workspace.';
    end if;
    return new;
  end if;
  new.workspace := old.workspace; new.created_by := old.created_by; new.source := old.source; new.created_at := old.created_at;
  if old.status in ('posting', 'posted', 'partly') and auth.uid() is not null then raise exception 'This post has already gone out.'; end if;
  if (new.text, new.media, new.accounts, new.scheduled_at) is distinct from (old.text, old.media, old.accounts, old.scheduled_at) then
    if exists (select 1 from unnest(new.accounts) a where not exists (select 1 from public.sm_accounts s where s.id = a and s.workspace = new.workspace)) then
      raise exception 'Pick accounts from this workspace.';
    end if;
    if auth.uid() is not null then new.status := 'awaiting'; new.approved_by := null; new.approved_at := null; end if;
  end if;
  -- people cannot write status or approval columns at all (no column rights); only sm_decide changes them
  new.updated_at := now();
  return new;
end $$;
do $$ begin execute 'drop trigger if exists sm_posts_guard on public.sm_posts'; end $$;
create trigger sm_posts_guard before insert or update on public.sm_posts for each row execute function public.sm_posts_guard();

-- approve (optionally "post now") or reject: owners and approvers only
create or replace function public.sm_decide(p_post uuid, p_approve boolean, p_note text default null)
returns text language plpgsql security definer set search_path = public as $$
declare p public.sm_posts;
begin
  select * into p from public.sm_posts where id = p_post for update;
  if not found or coalesce(public.sm_role(p.workspace), '') not in ('owner', 'approver') then raise exception 'Only the owner or an approver can decide.'; end if;
  if p.status not in ('awaiting', 'approved', 'rejected', 'failed') then raise exception 'This post has already gone out.'; end if;
  if p_approve then
    if length(trim(p.text)) = 0 and jsonb_array_length(p.media) = 0 then raise exception 'The post is empty.'; end if;
    if cardinality(p.accounts) = 0 then raise exception 'Pick at least one account.'; end if;
  end if;
  perform set_config('cdm.sm_approve', 'yes', true);
  update public.sm_posts set status = case when p_approve then 'approved' else 'rejected' end,
    approved_by = case when p_approve then auth.uid() end, approved_at = case when p_approve then now() end,
    note = left(p_note, 500) where id = p_post;
  perform set_config('cdm.sm_approve', '', true);
  return case when p_approve then 'approved' else 'rejected' end;
end $$;

-- invitations
create or replace function public.sm_invite(p_ws uuid, p_email text, p_role text)
returns void language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email));
begin
  if public.sm_role(p_ws) is distinct from 'owner' then raise exception 'Only the owner can invite people.'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then raise exception 'Enter a valid email address.'; end if;
  if p_role not in ('approver', 'editor') then raise exception 'Pick approver or editor.'; end if;
  insert into public.sm_invites (workspace, email, role) values (p_ws, e, p_role) on conflict (workspace, email) do update set role = excluded.role;
end $$;
create or replace function public.sm_accept(p_invite uuid, p_accept boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare i public.sm_invites;
begin
  select * into i from public.sm_invites where id = p_invite and email = public.my_email();
  if not found then raise exception 'That invitation is not for this account.'; end if;
  delete from public.sm_invites where id = p_invite;
  if p_accept then insert into public.sm_members (workspace, user_id, role) values (i.workspace, auth.uid(), i.role) on conflict (workspace, user_id) do update set role = excluded.role; end if;
  return i.workspace;
end $$;
create or replace function public.sm_remove(p_ws uuid, p_user uuid default null, p_invite uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_invite is not null and public.sm_role(p_ws) = 'owner' then delete from public.sm_invites where id = p_invite and workspace = p_ws; return; end if;
  if p_user = auth.uid() or public.sm_role(p_ws) = 'owner' then delete from public.sm_members where workspace = p_ws and user_id = p_user; return; end if;
  raise exception 'Only the owner can remove people.';
end $$;
create or replace function public.sm_people(p_ws uuid)
returns table (user_id uuid, name text, email text, role text, invite_id uuid)
language plpgsql stable security definer set search_path = public as $$
begin
  if public.sm_role(p_ws) is null then raise exception 'Not your workspace.'; end if;
  return query
    select w.owner, pr.name, lower(u.email)::text, 'owner'::text, null::uuid from public.sm_workspaces w join auth.users u on u.id = w.owner left join public.profiles pr on pr.id = w.owner where w.id = p_ws
    union all select m.user_id, pr.name, lower(u.email)::text, m.role, null::uuid from public.sm_members m join auth.users u on u.id = m.user_id left join public.profiles pr on pr.id = m.user_id where m.workspace = p_ws
    union all select null::uuid, null::text, i.email, i.role || ' (invited)', i.id from public.sm_invites i where i.workspace = p_ws;
end $$;
create or replace function public.sm_my_invites()
returns table (id uuid, workspace uuid, name text, role text)
language sql stable security definer set search_path = public as $$
  select i.id, i.workspace, w.name, i.role from public.sm_invites i join public.sm_workspaces w on w.id = i.workspace where i.email = public.my_email();
$$;

-- ---------- server only ----------
create or replace function public.sm_save_account(p_ws uuid, p_user uuid, p_platform text, p_external text, p_name text, p_token text, p_refresh text, p_expires timestamptz)
returns uuid language plpgsql security definer set search_path = public, vault as $$
declare a public.sm_accounts; aid uuid;
begin
  select * into a from public.sm_accounts where workspace = p_ws and platform = p_platform and external_id = p_external;
  if found then
    perform vault.update_secret(a.vault_id, p_token);
    if p_refresh is not null then
      if a.refresh_id is null then update public.sm_accounts set refresh_id = vault.create_secret(p_refresh, 'sm_r_' || replace(gen_random_uuid()::text, '-', ''), 'CDM Social refresh token') where id = a.id;
      else perform vault.update_secret(a.refresh_id, p_refresh); end if;
    end if;
    update public.sm_accounts set name = left(p_name, 120), expires_at = p_expires, status = 'ok', last_error = null, connected_by = p_user where id = a.id;
    return a.id;
  end if;
  insert into public.sm_accounts (workspace, platform, external_id, name, vault_id, refresh_id, expires_at, connected_by)
  values (p_ws, p_platform, p_external, left(p_name, 120),
          vault.create_secret(p_token, 'sm_t_' || replace(gen_random_uuid()::text, '-', ''), 'CDM Social token'),
          case when p_refresh is null then null else vault.create_secret(p_refresh, 'sm_r_' || replace(gen_random_uuid()::text, '-', ''), 'CDM Social refresh token') end,
          p_expires, p_user) returning id into aid;
  return aid;
end $$;
create or replace function public.sm_account_token(p_account uuid)
returns table (token text, refresh text) language sql stable security definer set search_path = public, vault as $$
  select (select decrypted_secret from vault.decrypted_secrets where id = a.vault_id), (select decrypted_secret from vault.decrypted_secrets where id = a.refresh_id)
    from public.sm_accounts a where a.id = p_account;
$$;
-- vault secrets go when an account is removed
create or replace function public.sm_accounts_cleanup()
returns trigger language plpgsql security definer set search_path = public, vault as $$
begin
  delete from vault.secrets where id in (old.vault_id, old.refresh_id);
  return old;
end $$;
do $$ begin execute 'drop trigger if exists sm_accounts_cleanup on public.sm_accounts'; end $$;
create trigger sm_accounts_cleanup after delete on public.sm_accounts for each row execute function public.sm_accounts_cleanup();

-- approved posts that are due, claimed so two runs never post twice
create or replace function public.sm_claim_due(p_limit int default 20)
returns setof public.sm_posts language plpgsql security definer set search_path = public as $$
begin
  return query
    update public.sm_posts p set status = 'posting'
     where p.id in (select id from public.sm_posts where status = 'approved' and approved_by is not null and coalesce(scheduled_at, approved_at) <= now()
                     order by coalesce(scheduled_at, approved_at) limit p_limit for update skip locked)
    returning p.*;
end $$;

-- the posting schedule calls social-publish every 5 minutes with a secret only Vault knows
do $$ begin
  if not exists (select 1 from vault.secrets where name = 'social_cron_secret') then
    perform vault.create_secret(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'social_cron_secret', 'CDM Social: posting schedule');
  end if;
end $$;
create or replace function public.sm_cron_ok(p_secret text)
returns boolean language sql stable security definer set search_path = public, vault as $$
  select coalesce(p_secret, '') <> '' and p_secret = (select decrypted_secret from vault.decrypted_secrets where name = 'social_cron_secret');
$$;
do $$ begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then return; end if;
  if exists (select 1 from cron.job where jobname = 'social-publish') then perform cron.unschedule('social-publish'); end if;
  perform cron.schedule('social-publish', '*/5 * * * *', $job$
    select net.http_post(
      url := 'https://vkrnrupiidbnqxrehrty.supabase.co/functions/v1/social-publish',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'social_cron_secret')),
      body := '{"action":"run"}'::jsonb, timeout_milliseconds := 55000)
  $job$);
end $$;

-- pictures for posts: public files (Instagram must fetch them by address) in a folder per workspace
do $$ begin
  if not exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then return; end if;
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('social', 'social', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
  on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and policyname = 'social: members upload') then
    create policy "social: members upload" on storage.objects for insert to authenticated
      with check (bucket_id = 'social' and public.sm_role(((storage.foldername(name))[1])::uuid) is not null);
    create policy "social: owner or approver deletes" on storage.objects for delete to authenticated
      using (bucket_id = 'social' and public.sm_role(((storage.foldername(name))[1])::uuid) in ('owner', 'approver'));
  end if;
end $$;

revoke all on function public.sm_workspaces_guard(), public.sm_posts_guard(), public.sm_decide(uuid, boolean, text), public.sm_invite(uuid, text, text),
  public.sm_accept(uuid, boolean), public.sm_remove(uuid, uuid, uuid), public.sm_people(uuid), public.sm_my_invites(),
  public.sm_save_account(uuid, uuid, text, text, text, text, text, timestamptz), public.sm_account_token(uuid), public.sm_accounts_cleanup(),
  public.sm_claim_due(int), public.sm_cron_ok(text) from public, anon, authenticated;
grant execute on function public.sm_decide(uuid, boolean, text), public.sm_invite(uuid, text, text), public.sm_accept(uuid, boolean),
  public.sm_remove(uuid, uuid, uuid), public.sm_people(uuid), public.sm_my_invites() to authenticated;
grant execute on function public.sm_save_account(uuid, uuid, text, text, text, text, text, timestamptz), public.sm_account_token(uuid),
  public.sm_claim_due(int), public.sm_cron_ok(text) to service_role;
