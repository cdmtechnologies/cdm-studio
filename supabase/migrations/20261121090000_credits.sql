/*
  CDM Studio: pay-as-you-go credits instead of monthly/yearly Premium.

  - Everyone gets a small free allowance each day (cheaper AI model).
  - Beyond that, or for the best AI model, each AI action costs credits worked out from what it really cost:
        credits = ceil( AI cost in US$ × usd_ngn × markup ÷ credit_price_ngn )
    AI cost = input tokens × in-rate + output tokens × out-rate, per model, from settings (US$ per million tokens).
  - People buy any amount of credits (from min_topup) through Paystack; credits never expire.
  - Every change to a balance is in credit_ledger (purchases, each AI action with its tokens and real cost).

  Safe to run more than once.
*/

alter table public.settings
  add column if not exists credit_price_ngn numeric(10,2) not null default 10 check (credit_price_ngn > 0),
  add column if not exists usd_ngn numeric(10,2) not null default 1600 check (usd_ngn > 0),
  add column if not exists markup numeric(5,2) not null default 3 check (markup >= 1 and markup <= 20),
  add column if not exists min_topup_ngn int not null default 500 check (min_topup_ngn >= 100),
  add column if not exists min_topup_usd numeric(8,2) not null default 1 check (min_topup_usd >= 0.5),
  add column if not exists free_data_daily int not null default 3 check (free_data_daily between 0 and 1000),
  add column if not exists fast_in_per_m numeric(8,3) not null default 1 check (fast_in_per_m >= 0),
  add column if not exists fast_out_per_m numeric(8,3) not null default 5 check (fast_out_per_m >= 0),
  add column if not exists best_in_per_m numeric(8,3) not null default 3 check (best_in_per_m >= 0),
  add column if not exists best_out_per_m numeric(8,3) not null default 15 check (best_out_per_m >= 0),
  add column if not exists signup_credits int not null default 0 check (signup_credits between 0 and 10000);

-- a gentler free allowance: the free AI is CDM's own cost
update public.settings set free_builds_daily = 3, free_tutor_daily = 10 where free_builds_daily = 8 and free_tutor_daily = 20;
alter table public.settings alter column free_builds_daily set default 3, alter column free_tutor_daily set default 10;

alter table public.profiles add column if not exists credits numeric(14,2) not null default 0 check (credits >= 0);

alter table public.ai_usage
  add column if not exists data int not null default 0,
  add column if not exists free_builds int not null default 0,
  add column if not exists free_tutor int not null default 0,
  add column if not exists free_data int not null default 0,
  add column if not exists cost_usd numeric(12,5) not null default 0,
  add column if not exists credits_used numeric(14,2) not null default 0;

create table if not exists public.credit_ledger (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  at         timestamptz not null default now(),
  change     numeric(14,2) not null,
  balance    numeric(14,2) not null,
  reason     text not null check (reason in ('purchase', 'build', 'tutor', 'data', 'gift', 'refund', 'signup')),
  ref        text check (length(ref) <= 120),
  model      text check (length(model) <= 60),
  tokens_in  int,
  tokens_out int,
  cost_usd   numeric(12,5)
);
create index if not exists credit_ledger_user_idx on public.credit_ledger (user_id, at desc);
alter table public.credit_ledger enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'credit_ledger' and policyname = 'ledger: own') then
    create policy "ledger: own" on public.credit_ledger for select to authenticated using (user_id = (select auth.uid()));
  end if;
end $$;
grant select (id, at, change, balance, reason, ref, model, tokens_in, tokens_out) on public.credit_ledger to authenticated;
grant all on public.credit_ledger to service_role;
grant usage, select on all sequences in schema public to service_role;

-- payments can now be credit top-ups of any amount
alter table public.payments add column if not exists credits numeric(14,2);
do $$ begin execute 'alter table public.payments drop constraint if exists payments_period_check'; end $$;
alter table public.payments add constraint payments_period_check check (period in ('monthly', 'yearly', 'credits'));
grant select (credits) on public.payments to authenticated;

-- new public settings people may read (prices and free allowance; never the AI costs)
grant select (credit_price_ngn, usd_ngn, min_topup_ngn, min_topup_usd, free_data_daily) on public.settings to anon, authenticated;
grant select (credits) on public.profiles to authenticated;

/** Credits for an AI cost in US$ (rounded up to whole credits, at least 1). */
create or replace function public.credits_for(p_cost_usd numeric)
returns numeric language sql stable set search_path = public as $$
  select greatest(1, ceil(p_cost_usd * s.usd_ngn * s.markup / s.credit_price_ngn)) from public.settings s;
$$;

/** The most one action can cost, so a person must hold at least this many credits before it starts. */
create or replace function public.credits_reserve(p_kind text, p_best boolean)
returns numeric language sql stable set search_path = public as $$
  select public.credits_for(
    (case p_kind when 'build' then 30000 else 8000 end) / 1e6 * (case when p_best then s.best_in_per_m else s.fast_in_per_m end)
    + (case p_kind when 'build' then (case when p_best then 16000 else 12000 end) when 'data' then 1500 else 1800 end) / 1e6 * (case when p_best then s.best_out_per_m else s.fast_out_per_m end))
  from public.settings s;
$$;

-- One AI action: free allowance first (fast model only), otherwise credits. Server only.
do $$ begin execute 'drop function if exists public.usage_take(uuid, text)'; end $$;
create or replace function public.usage_take(p_user uuid, p_kind text, p_best boolean default false)
returns table (allowed boolean, mode text, free_left int, day_limit int, credits numeric, reserve numeric, reason text)
language plpgsql security definer set search_path = public as $$
declare s public.settings; d date := (now() at time zone 'Africa/Lagos')::date; lim int; used int; bal numeric; need numeric;
begin
  if p_kind not in ('build', 'tutor', 'data') then raise exception 'unknown kind'; end if;
  select * into s from public.settings;
  select coalesce(p.credits, 0) into bal from public.profiles p where p.id = p_user;
  bal := coalesce(bal, 0);
  if not s.ai_enabled then return query select false, null::text, 0, 0, bal, 0::numeric, 'paused'; return; end if;
  lim := case p_kind when 'build' then s.free_builds_daily when 'tutor' then s.free_tutor_daily else s.free_data_daily end;
  insert into public.ai_usage (user_id, day) values (p_user, d) on conflict do nothing;
  select case p_kind when 'build' then u.free_builds when 'tutor' then u.free_tutor else u.free_data end into used
    from public.ai_usage u where u.user_id = p_user and u.day = d for update;
  need := public.credits_reserve(p_kind, p_best);
  if not p_best and used < lim then
    update public.ai_usage u set
      free_builds = u.free_builds + (p_kind = 'build')::int, free_tutor = u.free_tutor + (p_kind = 'tutor')::int, free_data = u.free_data + (p_kind = 'data')::int,
      builds = u.builds + (p_kind = 'build')::int, tutor = u.tutor + (p_kind = 'tutor')::int, data = u.data + (p_kind = 'data')::int
    where u.user_id = p_user and u.day = d;
    return query select true, 'free'::text, lim - used - 1, lim, bal, need, null::text; return;
  end if;
  if bal < need then
    return query select false, null::text, greatest(lim - used, 0), lim, bal, need, case when p_best then 'credits_best' else 'credits' end; return;
  end if;
  update public.ai_usage u set builds = u.builds + (p_kind = 'build')::int, tutor = u.tutor + (p_kind = 'tutor')::int, data = u.data + (p_kind = 'data')::int
   where u.user_id = p_user and u.day = d;
  return query select true, 'credits'::text, greatest(lim - used, 0), lim, bal, need, null::text;
end $$;

-- After an AI action: record its tokens and real cost; take credits when it was paid with credits. Server only.
create or replace function public.charge_ai(p_user uuid, p_kind text, p_mode text, p_best boolean, p_model text, p_in int, p_out int, p_ref text default null)
returns table (charged numeric, balance numeric, cost_usd numeric)
language plpgsql security definer set search_path = public as $$
declare s public.settings; c numeric; cr numeric := 0; bal numeric; d date := (now() at time zone 'Africa/Lagos')::date;
begin
  select * into s from public.settings;
  c := greatest(p_in, 0) / 1e6 * (case when p_best then s.best_in_per_m else s.fast_in_per_m end)
     + greatest(p_out, 0) / 1e6 * (case when p_best then s.best_out_per_m else s.fast_out_per_m end);
  update public.ai_usage u set tokens_in = u.tokens_in + greatest(p_in, 0), tokens_out = u.tokens_out + greatest(p_out, 0), cost_usd = u.cost_usd + c
   where u.user_id = p_user and u.day = d;
  if p_mode = 'credits' then
    cr := public.credits_for(c);
    update public.profiles p set credits = greatest(p.credits - cr, 0) where p.id = p_user returning p.credits into bal;
    update public.ai_usage u set credits_used = u.credits_used + cr where u.user_id = p_user and u.day = d;
    insert into public.credit_ledger (user_id, change, balance, reason, ref, model, tokens_in, tokens_out, cost_usd)
    values (p_user, -cr, bal, p_kind, left(p_ref, 120), p_model, p_in, p_out, c);
  else
    select p.credits into bal from public.profiles p where p.id = p_user;
  end if;
  return query select cr, coalesce(bal, 0), round(c, 5);
end $$;

-- A paid Paystack payment: a credit top-up adds credits (older month/year payments still add Premium time). Server only.
create or replace function public.apply_payment(p_reference text, p_amount numeric, p_currency text)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v public.payments; v_until timestamptz; bal numeric;
begin
  select * into v from public.payments where reference = p_reference for update;
  if not found then raise exception 'Unknown payment'; end if;
  if v.status = 'paid' then select premium_until into v_until from public.profiles where id = v.user_id; return coalesce(v_until, now()); end if;
  if upper(p_currency) <> upper(v.currency) or p_amount < v.amount then raise exception 'Amount does not match'; end if;
  update public.payments set status = 'paid', paid_at = now() where reference = p_reference;
  if v.period = 'credits' then
    update public.profiles set credits = credits + v.credits where id = v.user_id returning credits into bal;
    insert into public.credit_ledger (user_id, change, balance, reason, ref) values (v.user_id, v.credits, bal, 'purchase', p_reference);
    return now();
  end if;
  update public.profiles set premium_until = greatest(coalesce(premium_until, now()), now()) + case when v.period = 'yearly' then interval '1 year' else interval '1 month' end
   where id = v.user_id returning premium_until into v_until;
  return v_until;
end $$;

-- welcome credits for new accounts, when the owner sets some
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare gift int;
begin
  select signup_credits into gift from public.settings;
  insert into public.profiles (id, name, referral_code, credits)
  values (new.id,
          nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), 80), ''),
          nullif(left(regexp_replace(coalesce(new.raw_user_meta_data ->> 'ref', ''), '[^A-Za-z0-9-]', '', 'g'), 40), ''),
          coalesce(gift, 0))
  on conflict (id) do nothing;
  if coalesce(gift, 0) > 0 then
    insert into public.credit_ledger (user_id, change, balance, reason) values (new.id, gift, gift, 'signup');
  end if;
  return new;
end $$;

-- the owner's overview gains credits figures
create or replace function public.studio_credit_overview()
returns jsonb language sql stable security definer set search_path = public as $$
  with d as (select (now() at time zone 'Africa/Lagos')::date as today)
  select jsonb_build_object(
    'credits_held', (select coalesce(sum(credits), 0) from public.profiles),
    'credits_sold_month', (select coalesce(sum(change), 0) from public.credit_ledger where reason = 'purchase' and at >= date_trunc('month', now())),
    'credits_used_month', (select coalesce(-sum(change), 0) from public.credit_ledger where change < 0 and at >= date_trunc('month', now())),
    'avg_build_cost_usd', (select round(avg(cost_usd), 4) from public.credit_ledger where reason = 'build' and at > now() - interval '30 days'),
    'avg_build_credits', (select round(avg(-change), 1) from public.credit_ledger where reason = 'build' and at > now() - interval '30 days'),
    'avg_tutor_credits', (select round(avg(-change), 1) from public.credit_ledger where reason = 'tutor' and at > now() - interval '30 days'),
    'free_cost_7d_usd', (select round(coalesce(sum(u.cost_usd), 0) - coalesce((select sum(cost_usd) from public.credit_ledger where at > now() - interval '7 days'), 0), 2) from public.ai_usage u, d where u.day > d.today - 7),
    'paid_cost_7d_usd', (select round(coalesce(sum(cost_usd), 0), 2) from public.credit_ledger where at > now() - interval '7 days'));
$$;

revoke all on function public.usage_take(uuid, text, boolean), public.charge_ai(uuid, text, text, boolean, text, int, int, text),
  public.apply_payment(text, numeric, text), public.studio_credit_overview(), public.credits_reserve(text, boolean), public.credits_for(numeric),
  public.handle_new_user() from public, anon, authenticated;
grant execute on function public.usage_take(uuid, text, boolean), public.charge_ai(uuid, text, text, boolean, text, int, int, text),
  public.apply_payment(text, numeric, text), public.studio_credit_overview(), public.credits_reserve(text, boolean), public.credits_for(numeric) to service_role;
