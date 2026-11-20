/*
  CDM Studio platform: team work, transfers, a marketplace, API secrets, own-domain hosting, paid lessons and certificates.

  Team work      project_members (editor / viewer) and project_invites by email. Invited people accept after signing in
                 with that email. Editors can change the page and use AI on it; only the owner publishes, deletes,
                 invites, sells or transfers.
  Transfer       the owner offers a project to an email address; it moves when that person accepts.
  Marketplace    the owner lists a published project for a price in credits. A buyer gets their own editable copy.
                 The seller earns the price less CDM's commission in "earnings", which can be turned into credits
                 or paid out to a bank account (payout_requests, handled by the owner of CDM Studio).
  API secrets    project_secrets: the value is kept encrypted in Supabase Vault and is never sent back to a browser.
                 The studio-proxy function adds it to calls to the one web address the owner allowed.
  Hosting        project_hosting: where a project was deployed (the maker's own Netlify) and its custom domain.
                 The maker's Netlify token is also kept in Vault (user_tokens).
  Lessons        advanced (paid) lessons: lesson_content holds their text, readable only after unlocking with credits.
                 Final exams are marked on the server; a pass gives a certificate anyone can verify.

  Every money-like change goes through security-definer functions; people can never write balances directly.
  Safe to run more than once.
*/

-- ---------- settings ----------
alter table public.settings
  add column if not exists lesson_price_credits int not null default 20 check (lesson_price_credits between 0 and 100000),
  add column if not exists market_commission_pct numeric(5,2) not null default 20 check (market_commission_pct between 0 and 90),
  add column if not exists min_payout_credits int not null default 1000 check (min_payout_credits between 1 and 10000000),
  add column if not exists proxy_daily_default int not null default 500 check (proxy_daily_default between 1 and 100000),
  add column if not exists exam_pass_pct int not null default 70 check (exam_pass_pct between 1 and 100);
grant select (lesson_price_credits, market_commission_pct, min_payout_credits, exam_pass_pct) on public.settings to anon, authenticated;

-- ---------- wallets ----------
alter table public.profiles add column if not exists earnings numeric(14,2) not null default 0 check (earnings >= 0);
grant select (earnings) on public.profiles to authenticated;

alter table public.credit_ledger add column if not exists wallet text not null default 'credits';
do $$ begin
  execute 'alter table public.credit_ledger drop constraint if exists credit_ledger_reason_check';
  execute 'alter table public.credit_ledger drop constraint if exists credit_ledger_wallet_check';
end $$;
alter table public.credit_ledger add constraint credit_ledger_reason_check
  check (reason in ('purchase', 'build', 'tutor', 'data', 'gift', 'refund', 'signup', 'lesson', 'buy_project', 'sale', 'to_credits', 'payout', 'payout_back'));
alter table public.credit_ledger add constraint credit_ledger_wallet_check check (wallet in ('credits', 'earnings'));
grant select (wallet) on public.credit_ledger to authenticated;

-- one change to a wallet, with its ledger line (inside the caller's transaction)
create or replace function public.wallet_move(p_user uuid, p_wallet text, p_change numeric, p_reason text, p_ref text default null)
returns numeric language plpgsql security definer set search_path = public as $$
declare bal numeric;
begin
  if p_wallet = 'credits' then
    update public.profiles set credits = credits + p_change where id = p_user and credits + p_change >= 0 returning credits into bal;
  else
    update public.profiles set earnings = earnings + p_change where id = p_user and earnings + p_change >= 0 returning earnings into bal;
  end if;
  if bal is null then raise exception 'Not enough %', case when p_wallet = 'credits' then 'credits' else 'earnings' end; end if;
  insert into public.credit_ledger (user_id, change, balance, reason, ref, wallet) values (p_user, p_change, bal, p_reason, left(p_ref, 120), p_wallet);
  return bal;
end $$;

-- the signed-in person's email (from the sign-in system, not from anything they send)
create or replace function public.my_email()
returns text language sql stable security definer set search_path = public as $$
  select lower(email) from auth.users where id = auth.uid();
$$;

-- ---------- team work ----------
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('editor', 'viewer')),
  added_at   timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index if not exists project_members_user_idx on public.project_members (user_id);

create table if not exists public.project_invites (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  email      text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' and length(email) <= 200),
  role       text not null check (role in ('editor', 'viewer')),
  invited_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, email)
);

create table if not exists public.project_transfers (
  project_id uuid primary key references public.projects (id) on delete cascade,
  from_user  uuid not null references auth.users (id) on delete cascade,
  to_email   text not null check (to_email = lower(to_email) and length(to_email) <= 200),
  note       text check (length(note) <= 300),
  created_at timestamptz not null default now()
);

alter table public.project_members enable row level security;
alter table public.project_invites enable row level security;
alter table public.project_transfers enable row level security;
grant all on public.project_members, public.project_invites, public.project_transfers to service_role;
grant select on public.project_members to authenticated;
grant select (id, project_id, email, role, created_at) on public.project_invites to authenticated;
grant select (project_id, to_email, note, created_at) on public.project_transfers to authenticated;

-- helpers used by the policies (security definer, so policies do not loop through each other)
create or replace function public.project_role(p_project uuid)
returns text language sql stable security definer set search_path = public as $$
  select case when exists (select 1 from public.projects where id = p_project and owner_id = auth.uid()) then 'owner'
              else (select role from public.project_members where project_id = p_project and user_id = auth.uid()) end;
$$;
revoke all on function public.project_role(uuid) from public, anon;
grant execute on function public.project_role(uuid) to authenticated, service_role;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'project_members' and policyname = 'members: same project') then
    create policy "members: same project" on public.project_members for select to authenticated using (public.project_role(project_id) is not null);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'project_invites' and policyname = 'invites: owner or invited') then
    create policy "invites: owner or invited" on public.project_invites for select to authenticated
      using (public.project_role(project_id) = 'owner' or email = public.my_email());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'project_transfers' and policyname = 'transfers: owner or receiver') then
    create policy "transfers: owner or receiver" on public.project_transfers for select to authenticated
      using (from_user = (select auth.uid()) or to_email = public.my_email());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'projects: members read') then
    create policy "projects: members read" on public.projects for select to authenticated using (public.project_role(id) in ('editor', 'viewer'));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'projects' and policyname = 'projects: editors change') then
    create policy "projects: editors change" on public.projects for update to authenticated
      using (public.project_role(id) = 'editor') with check (public.project_role(id) = 'editor');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'project_versions' and policyname = 'versions: members read') then
    create policy "versions: members read" on public.project_versions for select to authenticated using (public.project_role(project_id) is not null);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'project_versions' and policyname = 'versions: editors add') then
    create policy "versions: editors add" on public.project_versions for insert to authenticated
      with check (source in ('edit', 'restore') and public.project_role(project_id) = 'editor');
  end if;
end $$;

-- owners keep control: editors cannot publish, and nobody changes the owner except through accept_transfer
create or replace function public.projects_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if new.published and new.slug is null then
    new.slug := substr(md5(random()::text || clock_timestamp()::text || new.id::text), 1, 10);
  end if;
  if tg_op = 'UPDATE' then
    if coalesce(current_setting('cdm.owner_change', true), '') <> 'yes' then new.owner_id := old.owner_id; end if;
    if current_user in ('authenticated', 'anon') then
      new.hidden := old.hidden; new.views := old.views;
      if old.owner_id is distinct from auth.uid() then new.published := old.published; end if;
    end if;
  end if;
  return new;
end $$;

create or replace function public.invite_member(p_project uuid, p_email text, p_role text)
returns void language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email)); uid uuid;
begin
  if public.project_role(p_project) is distinct from 'owner' then raise exception 'Only the owner can invite people.'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' or length(e) > 200 then raise exception 'Enter a valid email address.'; end if;
  if p_role not in ('editor', 'viewer') then raise exception 'Pick editor or viewer.'; end if;
  if e = public.my_email() then raise exception 'That is your own email.'; end if;
  if (select count(*) from public.project_members where project_id = p_project) + (select count(*) from public.project_invites where project_id = p_project) >= 20 then
    raise exception 'A project can have up to 20 people.';
  end if;
  select id into uid from auth.users where lower(email) = e;
  if uid is not null and exists (select 1 from public.project_members where project_id = p_project and user_id = uid) then
    update public.project_members set role = p_role where project_id = p_project and user_id = uid; return;
  end if;
  insert into public.project_invites (project_id, email, role, invited_by) values (p_project, e, p_role, auth.uid())
  on conflict (project_id, email) do update set role = excluded.role, created_at = now();
end $$;

create or replace function public.answer_invite(p_invite uuid, p_accept boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare i public.project_invites;
begin
  select * into i from public.project_invites where id = p_invite and email = public.my_email();
  if not found then raise exception 'That invitation is not for this account.'; end if;
  delete from public.project_invites where id = p_invite;
  if p_accept and not exists (select 1 from public.projects where id = i.project_id and owner_id = auth.uid()) then
    insert into public.project_members (project_id, user_id, role) values (i.project_id, auth.uid(), i.role)
    on conflict (project_id, user_id) do update set role = excluded.role;
  end if;
  return i.project_id;
end $$;

-- the owner removes someone (or an invitation); a member can leave
create or replace function public.remove_member(p_project uuid, p_user uuid default null, p_invite uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_invite is not null then
    if public.project_role(p_project) <> 'owner' then raise exception 'Only the owner can cancel invitations.'; end if;
    delete from public.project_invites where id = p_invite and project_id = p_project; return;
  end if;
  if p_user = auth.uid() or public.project_role(p_project) = 'owner' then
    delete from public.project_members where project_id = p_project and user_id = p_user;
  else raise exception 'Only the owner can remove people.'; end if;
end $$;

create or replace function public.project_people(p_project uuid)
returns table (user_id uuid, name text, email text, role text, invite_id uuid)
language plpgsql stable security definer set search_path = public as $$
begin
  if public.project_role(p_project) is null then raise exception 'Not your project.'; end if;
  return query
    select p.owner_id, pr.name, case when public.project_role(p_project) = 'owner' or p.owner_id = auth.uid() then lower(u.email)::text end, 'owner'::text, null::uuid
      from public.projects p join auth.users u on u.id = p.owner_id left join public.profiles pr on pr.id = p.owner_id where p.id = p_project
    union all
    select m.user_id, pr.name, case when public.project_role(p_project) = 'owner' or m.user_id = auth.uid() then lower(u.email)::text end, m.role, null::uuid
      from public.project_members m join auth.users u on u.id = m.user_id left join public.profiles pr on pr.id = m.user_id where m.project_id = p_project
    union all
    select null::uuid, null::text, i.email, i.role || ' (invited)', i.id from public.project_invites i
     where i.project_id = p_project and public.project_role(p_project) = 'owner';
end $$;

-- invitations and transfers waiting for me
create or replace function public.my_requests()
returns table (kind text, id text, project_id uuid, title text, from_name text, role text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select 'invite', i.id::text, i.project_id, p.title, coalesce(pr.name, 'A CDM Studio maker'), i.role, i.created_at
    from public.project_invites i join public.projects p on p.id = i.project_id left join public.profiles pr on pr.id = i.invited_by
   where i.email = public.my_email()
  union all
  select 'transfer', t.project_id::text, t.project_id, p.title, coalesce(pr.name, 'A CDM Studio maker'), null, t.created_at
    from public.project_transfers t join public.projects p on p.id = t.project_id left join public.profiles pr on pr.id = t.from_user
   where t.to_email = public.my_email()
  order by 7 desc;
$$;

-- ---------- transfer ----------
create or replace function public.offer_transfer(p_project uuid, p_email text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email));
begin
  if public.project_role(p_project) is distinct from 'owner' then raise exception 'Only the owner can transfer a project.'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' or length(e) > 200 then raise exception 'Enter a valid email address.'; end if;
  if e = public.my_email() then raise exception 'That is your own email.'; end if;
  insert into public.project_transfers (project_id, from_user, to_email, note) values (p_project, auth.uid(), e, left(p_note, 300))
  on conflict (project_id) do update set to_email = excluded.to_email, note = excluded.note, created_at = now(), from_user = excluded.from_user;
end $$;

create or replace function public.cancel_transfer(p_project uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.project_transfers where project_id = p_project and (from_user = auth.uid() or to_email = public.my_email());
end $$;

create or replace function public.accept_transfer(p_project uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare t public.project_transfers;
begin
  select * into t from public.project_transfers where project_id = p_project and to_email = public.my_email() for update;
  if not found then raise exception 'That transfer is not for this account.'; end if;
  if not exists (select 1 from public.projects where id = p_project and owner_id = t.from_user) then
    delete from public.project_transfers where project_id = p_project; raise exception 'That project has changed owner already.';
  end if;
  if (select count(*) from public.projects where owner_id = auth.uid()) >= 200 then raise exception 'You have 200 projects. Delete some first.'; end if;
  perform set_config('cdm.owner_change', 'yes', true);
  update public.projects set owner_id = auth.uid() where id = p_project;
  perform set_config('cdm.owner_change', '', true);
  delete from public.project_transfers where project_id = p_project;
  delete from public.project_members where project_id = p_project and user_id = auth.uid();
  delete from public.listings where project_id = p_project;
  delete from public.project_secrets where project_id = p_project;   -- secrets belong to the old owner's accounts
  delete from public.project_hosting where project_id = p_project;
  return p_project;
end $$;

-- ---------- marketplace ----------
create table if not exists public.listings (
  project_id    uuid primary key references public.projects (id) on delete cascade,
  seller        uuid not null references auth.users (id) on delete cascade,
  price_credits int not null check (price_credits between 1 and 1000000),
  blurb         text not null default '' check (length(blurb) <= 1000),
  active        boolean not null default true,
  sales         int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create table if not exists public.purchases (
  id            bigint generated always as identity primary key,
  project_id    uuid references public.projects (id) on delete set null,
  copy_id       uuid references public.projects (id) on delete set null,
  buyer         uuid not null references auth.users (id) on delete cascade,
  seller        uuid not null references auth.users (id) on delete cascade,
  price_credits int not null,
  seller_gets   numeric(14,2) not null,
  created_at    timestamptz not null default now()
);
create index if not exists purchases_buyer_idx on public.purchases (buyer);
create index if not exists purchases_seller_idx on public.purchases (seller);
alter table public.listings enable row level security;
alter table public.purchases enable row level security;
grant all on public.listings, public.purchases to service_role;
grant select on public.listings to authenticated;
grant select on public.purchases to authenticated;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'listings' and policyname = 'listings: own') then
    create policy "listings: own" on public.listings for select to authenticated using (seller = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'purchases' and policyname = 'purchases: mine') then
    create policy "purchases: mine" on public.purchases for select to authenticated using (buyer = (select auth.uid()) or seller = (select auth.uid()));
  end if;
end $$;

create or replace function public.list_for_sale(p_project uuid, p_price int, p_blurb text, p_active boolean default true)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.project_role(p_project) is distinct from 'owner' then raise exception 'Only the owner can sell a project.'; end if;
  if not exists (select 1 from public.projects where id = p_project and published and not hidden) then raise exception 'Publish the project first, so buyers can try it.'; end if;
  if p_price is null or p_price < 1 or p_price > 1000000 then raise exception 'Set a price from 1 to 1,000,000 credits.'; end if;
  if exists (select 1 from public.purchases pu where pu.copy_id = p_project) then
    raise exception 'A bought project cannot be sold again as it is. Change it into your own work first, then make a new project.';
  end if;
  insert into public.listings (project_id, seller, price_credits, blurb, active) values (p_project, auth.uid(), p_price, left(coalesce(p_blurb, ''), 1000), coalesce(p_active, true))
  on conflict (project_id) do update set price_credits = excluded.price_credits, blurb = excluded.blurb, active = excluded.active, seller = excluded.seller, updated_at = now();
end $$;

create or replace function public.market(p_kind text default null, p_q text default null, p_limit int default 24, p_offset int default 0)
returns table (project_id uuid, slug text, title text, kind text, price_credits int, blurb text, sales int, views int, seller_name text, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select l.project_id, p.slug, p.title, p.kind, l.price_credits, l.blurb, l.sales, p.views, coalesce(nullif(split_part(pr.name, ' ', 1), ''), 'A CDM Studio maker'), l.updated_at
    from public.listings l join public.projects p on p.id = l.project_id left join public.profiles pr on pr.id = l.seller
   where l.active and p.published and not p.hidden and p.owner_id = l.seller
     and (p_kind is null or p.kind = p_kind)
     and (p_q is null or p.title ilike '%' || left(p_q, 60) || '%' or l.blurb ilike '%' || left(p_q, 60) || '%')
   order by l.sales desc, l.updated_at desc
   limit least(greatest(p_limit, 1), 48) offset greatest(p_offset, 0);
$$;

create or replace function public.buy_project(p_project uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare l public.listings; src public.projects; new_id uuid; s public.settings; gets numeric;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into s from public.settings;
  select * into l from public.listings where project_id = p_project and active for update;
  if not found then raise exception 'That project is not for sale.'; end if;
  select * into src from public.projects where id = p_project and published and not hidden and owner_id = l.seller;
  if not found then raise exception 'That project is not for sale.'; end if;
  if l.seller = auth.uid() then raise exception 'This is your own project.'; end if;
  if (select count(*) from public.projects where owner_id = auth.uid()) >= 200 then raise exception 'You have 200 projects. Delete some first.'; end if;
  perform public.wallet_move(auth.uid(), 'credits', -l.price_credits, 'buy_project', src.title);
  gets := round(l.price_credits * (100 - s.market_commission_pct) / 100, 2);
  if gets > 0 then perform public.wallet_move(l.seller, 'earnings', gets, 'sale', src.title); end if;
  insert into public.projects (owner_id, title, kind, html, remix_of) values (auth.uid(), left(src.title, 80), src.kind, src.html, src.id) returning id into new_id;
  insert into public.project_versions (project_id, html, summary, source) values (new_id, src.html, 'Bought from the CDM Studio marketplace', 'remix');
  insert into public.purchases (project_id, copy_id, buyer, seller, price_credits, seller_gets) values (p_project, new_id, auth.uid(), l.seller, l.price_credits, gets);
  update public.listings set sales = sales + 1 where project_id = p_project;
  return new_id;
end $$;

-- earnings: turn into credits, or ask for a bank payout
create table if not exists public.payout_requests (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  credits      numeric(14,2) not null check (credits > 0),
  amount_ngn   numeric(14,2) not null,
  bank_name    text not null check (length(bank_name) between 2 and 80),
  account_name text not null check (length(account_name) between 2 and 120),
  account_no   text not null check (account_no ~ '^[0-9]{10}$'),
  status       text not null default 'waiting' check (status in ('waiting', 'paid', 'refused')),
  note         text check (length(note) <= 300),
  created_at   timestamptz not null default now(),
  done_at      timestamptz
);
create index if not exists payout_requests_user_idx on public.payout_requests (user_id);
alter table public.payout_requests enable row level security;
grant all on public.payout_requests to service_role;
grant select (id, credits, amount_ngn, bank_name, account_name, status, note, created_at, done_at) on public.payout_requests to authenticated;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'payout_requests' and policyname = 'payouts: own') then
    create policy "payouts: own" on public.payout_requests for select to authenticated using (user_id = (select auth.uid()));
  end if;
end $$;

create or replace function public.earnings_to_credits(p_amount numeric)
returns numeric language plpgsql security definer set search_path = public as $$
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Enter an amount.'; end if;
  perform public.wallet_move(auth.uid(), 'earnings', -p_amount, 'to_credits');
  return public.wallet_move(auth.uid(), 'credits', p_amount, 'to_credits');
end $$;

create or replace function public.request_payout(p_amount numeric, p_bank text, p_account_name text, p_account_no text)
returns bigint language plpgsql security definer set search_path = public as $$
declare s public.settings; rid bigint; acct text := regexp_replace(coalesce(p_account_no, ''), '\D', '', 'g');
begin
  select * into s from public.settings;
  if p_amount is null or p_amount < s.min_payout_credits then raise exception 'The smallest payout is % credits.', s.min_payout_credits; end if;
  if acct !~ '^[0-9]{10}$' then raise exception 'Enter the 10-digit account number.'; end if;
  if exists (select 1 from public.payout_requests where user_id = auth.uid() and status = 'waiting') then raise exception 'You already have a payout waiting.'; end if;
  perform public.wallet_move(auth.uid(), 'earnings', -p_amount, 'payout');
  insert into public.payout_requests (user_id, credits, amount_ngn, bank_name, account_name, account_no)
  values (auth.uid(), p_amount, round(p_amount * s.credit_price_ngn, 2), left(trim(p_bank), 80), left(trim(p_account_name), 120), acct) returning id into rid;
  return rid;
end $$;

-- the CDM Studio owner marks a payout (server only: studio-control checks the owner)
create or replace function public.settle_payout(p_id bigint, p_paid boolean, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare r public.payout_requests;
begin
  select * into r from public.payout_requests where id = p_id and status = 'waiting' for update;
  if not found then raise exception 'That payout is not waiting.'; end if;
  update public.payout_requests set status = case when p_paid then 'paid' else 'refused' end, note = left(p_note, 300), done_at = now() where id = p_id;
  if not p_paid then perform public.wallet_move(r.user_id, 'earnings', r.credits, 'payout_back', 'payout ' || p_id); end if;
end $$;

-- ---------- API secrets (values only in Vault) ----------
create table if not exists public.project_secrets (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  name        text not null check (name ~ '^[A-Z][A-Z0-9_]{1,40}$'),
  vault_id    uuid not null,
  allowed_url text not null check (allowed_url ~ '^https://[a-z0-9.-]+\.[a-z]{2,}(:[0-9]{2,5})?(/[^\s?#]*)?$' and length(allowed_url) <= 300),
  placement   text not null default 'bearer' check (placement in ('bearer', 'header', 'query')),
  field       text check (field ~ '^[A-Za-z0-9_-]{1,60}$'),
  public_use  boolean not null default false,
  daily_limit int not null default 500 check (daily_limit between 1 and 100000),
  hint        text check (length(hint) <= 8),
  used_day    date,
  used_count  int not null default 0,
  last_used   timestamptz,
  created_at  timestamptz not null default now(),
  unique (project_id, name)
);
alter table public.project_secrets enable row level security;
grant all on public.project_secrets to service_role;
grant select (id, project_id, name, allowed_url, placement, field, public_use, daily_limit, hint, used_day, used_count, last_used, created_at) on public.project_secrets to authenticated;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'project_secrets' and policyname = 'secrets: owner sees settings') then
    create policy "secrets: owner sees settings" on public.project_secrets for select to authenticated using (public.project_role(project_id) = 'owner');
  end if;
end $$;

-- server only (studio-secrets / studio-proxy functions)
create or replace function public.secret_save(p_project uuid, p_user uuid, p_name text, p_value text, p_url text, p_placement text, p_field text, p_public boolean, p_daily int)
returns uuid language plpgsql security definer set search_path = public, vault as $$
declare old public.project_secrets; vid uuid; sid uuid;
begin
  if not exists (select 1 from public.projects where id = p_project and owner_id = p_user) then raise exception 'Only the owner can add secrets.'; end if;
  if (select count(*) from public.project_secrets where project_id = p_project) >= 20 and not exists (select 1 from public.project_secrets where project_id = p_project and name = p_name) then
    raise exception 'A project can have up to 20 secrets.';
  end if;
  select * into old from public.project_secrets where project_id = p_project and name = p_name;
  if found then
    if p_value is not null and p_value <> '' then perform vault.update_secret(old.vault_id, p_value); end if;
    update public.project_secrets set allowed_url = p_url, placement = p_placement, field = p_field, public_use = p_public, daily_limit = p_daily,
      hint = case when p_value is not null and p_value <> '' then right(p_value, 3) else hint end where id = old.id;
    return old.id;
  end if;
  if p_value is null or p_value = '' then raise exception 'Paste the secret value.'; end if;
  vid := vault.create_secret(p_value, 'studio_' || replace(gen_random_uuid()::text, '-', ''), 'CDM Studio project secret');
  insert into public.project_secrets (project_id, name, vault_id, allowed_url, placement, field, public_use, daily_limit, hint)
  values (p_project, p_name, vid, p_url, p_placement, p_field, p_public, p_daily, right(p_value, 3)) returning id into sid;
  return sid;
end $$;

create or replace function public.secret_delete(p_project uuid, p_user uuid, p_name text)
returns void language plpgsql security definer set search_path = public, vault as $$
declare v uuid;
begin
  if not exists (select 1 from public.projects where id = p_project and owner_id = p_user) then raise exception 'Only the owner can remove secrets.'; end if;
  delete from public.project_secrets where project_id = p_project and name = p_name returning vault_id into v;
  if v is not null then delete from vault.secrets where id = v; end if;
end $$;

-- one use of a secret: checks who may use it and the day's limit, then returns the value (server only)
create or replace function public.secret_take(p_slug text, p_project uuid, p_user uuid, p_name text)
returns table (value text, allowed_url text, placement text, field text, reason text)
language plpgsql security definer set search_path = public, vault as $$
declare s public.project_secrets; pid uuid; d date := (now() at time zone 'Africa/Lagos')::date;
begin
  if p_slug is not null then
    select id into pid from public.projects where slug = p_slug and published and not hidden;
  elsif p_project is not null and p_user is not null then
    select id into pid from public.projects p where p.id = p_project
       and (p.owner_id = p_user or exists (select 1 from public.project_members m where m.project_id = p.id and m.user_id = p_user and m.role = 'editor'));
  end if;
  if pid is null then return query select null::text, null::text, null::text, null::text, 'project'; return; end if;
  select * into s from public.project_secrets ps where ps.project_id = pid and ps.name = p_name for update;
  if not found then return query select null::text, null::text, null::text, null::text, 'name'; return; end if;
  if p_slug is not null and not s.public_use then return query select null::text, null::text, null::text, null::text, 'private'; return; end if;
  if s.used_day = d and s.used_count >= s.daily_limit then return query select null::text, null::text, null::text, null::text, 'limit'; return; end if;
  update public.project_secrets set used_day = d, used_count = case when used_day = d then used_count + 1 else 1 end, last_used = now() where id = s.id;
  return query select ds.decrypted_secret, s.allowed_url, s.placement, s.field, null::text from vault.decrypted_secrets ds where ds.id = s.vault_id;
end $$;

-- ---------- hosting on the maker's own Netlify ----------
create table if not exists public.user_tokens (
  user_id    uuid not null references auth.users (id) on delete cascade,
  provider   text not null check (provider in ('netlify')),
  vault_id   uuid not null,
  account    text check (length(account) <= 120),
  created_at timestamptz not null default now(),
  primary key (user_id, provider)
);
alter table public.user_tokens enable row level security;
grant all on public.user_tokens to service_role;
grant select (provider, account, created_at) on public.user_tokens to authenticated;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'user_tokens' and policyname = 'tokens: own') then
    create policy "tokens: own" on public.user_tokens for select to authenticated using (user_id = (select auth.uid()));
  end if;
end $$;

create table if not exists public.project_hosting (
  project_id    uuid primary key references public.projects (id) on delete cascade,
  provider      text not null default 'netlify' check (provider in ('netlify')),
  site_id       text not null check (length(site_id) <= 80),
  site_url      text not null check (site_url ~ '^https://' and length(site_url) <= 200),
  custom_domain text check (custom_domain ~ '^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$' and length(custom_domain) <= 200),
  app_name      text check (length(app_name) <= 60),
  android_package text check (android_package ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$' and length(android_package) <= 150),
  android_sha256  text check (android_sha256 ~ '^([0-9A-F]{2}:){31}[0-9A-F]{2}$'),
  deployed_at   timestamptz not null default now()
);
alter table public.project_hosting enable row level security;
grant all on public.project_hosting to service_role;
grant select on public.project_hosting to authenticated;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'project_hosting' and policyname = 'hosting: members see') then
    create policy "hosting: members see" on public.project_hosting for select to authenticated using (public.project_role(project_id) is not null);
  end if;
end $$;

create or replace function public.token_save(p_user uuid, p_provider text, p_value text, p_account text)
returns void language plpgsql security definer set search_path = public, vault as $$
declare old uuid;
begin
  select vault_id into old from public.user_tokens where user_id = p_user and provider = p_provider;
  if old is not null then
    perform vault.update_secret(old, p_value);
    update public.user_tokens set account = left(p_account, 120), created_at = now() where user_id = p_user and provider = p_provider;
  else
    insert into public.user_tokens (user_id, provider, vault_id, account)
    values (p_user, p_provider, vault.create_secret(p_value, 'studio_tok_' || replace(gen_random_uuid()::text, '-', ''), 'CDM Studio hosting token'), left(p_account, 120));
  end if;
end $$;
create or replace function public.token_get(p_user uuid, p_provider text)
returns text language sql stable security definer set search_path = public, vault as $$
  select ds.decrypted_secret from public.user_tokens t join vault.decrypted_secrets ds on ds.id = t.vault_id where t.user_id = p_user and t.provider = p_provider;
$$;
create or replace function public.token_delete(p_user uuid, p_provider text)
returns void language plpgsql security definer set search_path = public, vault as $$
declare v uuid;
begin
  delete from public.user_tokens where user_id = p_user and provider = p_provider returning vault_id into v;
  if v is not null then delete from vault.secrets where id = v; end if;
end $$;

-- ---------- paid lessons, exams, certificates ----------
-- lesson_meta.meta gains: track, paid (true for advanced lessons), order
create table if not exists public.lesson_content (
  id         text primary key check (id ~ '^[a-z0-9-]{1,60}$'),
  track      text not null check (track ~ '^[a-z0-9-]{1,40}$'),
  body       jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.lesson_unlocks (
  user_id   uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  credits   int not null default 0,
  at        timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create table if not exists public.exam_questions (
  track    text not null check (track ~ '^[a-z0-9-]{1,40}$'),
  n        int not null,
  question text not null,
  options  jsonb not null,
  answer   int not null,
  primary key (track, n)
);
create table if not exists public.certificates (
  code      text primary key check (code ~ '^CDM-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  user_id   uuid not null references auth.users (id) on delete cascade,
  track     text not null,
  title     text not null,
  name      text not null check (length(name) between 2 and 80),
  score     int not null,
  issued_at timestamptz not null default now(),
  unique (user_id, track)
);
create table if not exists public.exam_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  track   text not null,
  at      timestamptz not null default now(),
  score   int not null
);
create index if not exists exam_attempts_idx on public.exam_attempts (user_id, track, at desc);
alter table public.lesson_content enable row level security;
alter table public.lesson_unlocks enable row level security;
alter table public.exam_questions enable row level security;
alter table public.certificates enable row level security;
alter table public.exam_attempts enable row level security;
grant all on public.lesson_content, public.lesson_unlocks, public.exam_questions, public.certificates, public.exam_attempts to service_role;
grant select on public.lesson_content to authenticated;
grant select on public.lesson_unlocks to authenticated;
grant select on public.certificates to authenticated;
grant select (track, at, score) on public.exam_attempts to authenticated;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'lesson_content' and policyname = 'content: unlocked') then
    create policy "content: unlocked" on public.lesson_content for select to authenticated
      using (exists (select 1 from public.lesson_unlocks u where u.lesson_id = id and u.user_id = (select auth.uid())));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'lesson_unlocks' and policyname = 'unlocks: own') then
    create policy "unlocks: own" on public.lesson_unlocks for select to authenticated using (user_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'certificates' and policyname = 'certificates: own') then
    create policy "certificates: own" on public.certificates for select to authenticated using (user_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where tablename = 'exam_attempts' and policyname = 'attempts: own') then
    create policy "attempts: own" on public.exam_attempts for select to authenticated using (user_id = (select auth.uid()));
  end if;
end $$;

-- a paid lesson can only be marked done once it is unlocked
create or replace function public.progress_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- people come through the API with a user id; the server's own key has none
  if auth.uid() is not null
     and exists (select 1 from public.lesson_content c where c.id = new.lesson_id)
     and not exists (select 1 from public.lesson_unlocks u where u.lesson_id = new.lesson_id and u.user_id = new.user_id) then
    raise exception 'Unlock this lesson first.';
  end if;
  return new;
end $$;
do $$ begin execute 'drop trigger if exists progress_guard on public.progress'; end $$;
create trigger progress_guard before insert or update on public.progress for each row execute function public.progress_guard();

create or replace function public.unlock_lesson(p_lesson text)
returns int language plpgsql security definer set search_path = public as $$
declare price int; t text;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select track into t from public.lesson_content where id = p_lesson;
  if t is null then raise exception 'That lesson is free.'; end if;
  if exists (select 1 from public.lesson_unlocks where user_id = auth.uid() and lesson_id = p_lesson) then return 0; end if;
  select lesson_price_credits into price from public.settings;
  if price > 0 then perform public.wallet_move(auth.uid(), 'credits', -price, 'lesson', p_lesson); end if;
  insert into public.lesson_unlocks (user_id, lesson_id, credits) values (auth.uid(), p_lesson, price);
  return price;
end $$;

-- the exam questions without the answers
create or replace function public.exam_paper(p_track text)
returns table (n int, question text, options jsonb)
language sql stable security definer set search_path = public as $$
  select q.n, q.question, q.options from public.exam_questions q where q.track = p_track and auth.uid() is not null order by q.n;
$$;

-- marks an exam; a pass with every lesson of the track done gives a certificate. 3 tries a day.
create or replace function public.submit_exam(p_track text, p_answers int[], p_name text)
returns table (score int, passed boolean, code text, need int, missing int)
language plpgsql security definer set search_path = public as $$
declare total int; right_n int; pct int; s public.settings; c text; todo int; nm text := trim(coalesce(p_name, ''));
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into s from public.settings;
  select count(*) into total from public.exam_questions where track = p_track;
  if total = 0 then raise exception 'This course has no exam yet.'; end if;
  if length(nm) < 2 or length(nm) > 80 then raise exception 'Type your full name as it should appear on the certificate.'; end if;
  if (select count(*) from public.exam_attempts a where a.user_id = auth.uid() and a.track = p_track and a.at > now() - interval '1 day') >= 3 then
    raise exception 'You have used 3 tries today. Review the lessons and try again tomorrow.';
  end if;
  select count(*) into todo from jsonb_object_keys(coalesce((select jsonb_object_agg(m.id, true) from public.lesson_meta m where m.meta ->> 'track' = p_track), '{}')) k
   where not exists (select 1 from public.progress p where p.user_id = auth.uid() and p.lesson_id = k);
  select count(*) into right_n from public.exam_questions q where q.track = p_track and p_answers[q.n] = q.answer;
  pct := round(right_n * 100.0 / total);
  insert into public.exam_attempts (user_id, track, score) values (auth.uid(), p_track, pct);
  if pct >= s.exam_pass_pct and todo = 0 then
    select ce.code into c from public.certificates ce where ce.user_id = auth.uid() and ce.track = p_track;
    if c is null then
      c := 'CDM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4)) || '-' || upper(substr(md5(random()::text || auth.uid()::text), 1, 4));
      insert into public.certificates (code, user_id, track, title, name, score)
      values (c, auth.uid(), p_track, coalesce((select meta ->> 'track_title' from public.lesson_meta where meta ->> 'track' = p_track limit 1), p_track), nm, pct);
    else
      update public.certificates set score = greatest(certificates.score, pct) where certificates.code = c;
    end if;
  end if;
  return query select pct, pct >= s.exam_pass_pct and todo = 0, c, s.exam_pass_pct, todo;
end $$;

-- anyone can check a certificate
create or replace function public.verify_certificate(p_code text)
returns table (code text, name text, title text, score int, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.code, c.name, c.title, c.score, c.issued_at from public.certificates c where c.code = upper(trim(p_code));
$$;

-- ---------- who may call what ----------
revoke all on function public.wallet_move(uuid, text, numeric, text, text), public.my_email(),
  public.invite_member(uuid, text, text), public.answer_invite(uuid, boolean), public.remove_member(uuid, uuid, uuid), public.project_people(uuid), public.my_requests(),
  public.offer_transfer(uuid, text, text), public.cancel_transfer(uuid), public.accept_transfer(uuid),
  public.list_for_sale(uuid, int, text, boolean), public.market(text, text, int, int), public.buy_project(uuid),
  public.earnings_to_credits(numeric), public.request_payout(numeric, text, text, text), public.settle_payout(bigint, boolean, text),
  public.secret_save(uuid, uuid, text, text, text, text, text, boolean, int), public.secret_delete(uuid, uuid, text), public.secret_take(text, uuid, uuid, text),
  public.token_save(uuid, text, text, text), public.token_get(uuid, text), public.token_delete(uuid, text),
  public.progress_guard(), public.unlock_lesson(text), public.exam_paper(text), public.submit_exam(text, int[], text), public.verify_certificate(text)
  from public, anon, authenticated;
grant execute on function public.my_email(), public.invite_member(uuid, text, text), public.answer_invite(uuid, boolean), public.remove_member(uuid, uuid, uuid),
  public.project_people(uuid), public.my_requests(), public.offer_transfer(uuid, text, text), public.cancel_transfer(uuid), public.accept_transfer(uuid),
  public.list_for_sale(uuid, int, text, boolean), public.buy_project(uuid), public.earnings_to_credits(numeric), public.request_payout(numeric, text, text, text),
  public.unlock_lesson(text), public.exam_paper(text), public.submit_exam(text, int[], text) to authenticated;
grant execute on function public.market(text, text, int, int), public.verify_certificate(text) to anon, authenticated;
grant execute on function public.wallet_move(uuid, text, numeric, text, text), public.settle_payout(bigint, boolean, text),
  public.secret_save(uuid, uuid, text, text, text, text, text, boolean, int), public.secret_delete(uuid, uuid, text), public.secret_take(text, uuid, uuid, text),
  public.token_save(uuid, text, text, text), public.token_get(uuid, text), public.token_delete(uuid, text) to service_role;
