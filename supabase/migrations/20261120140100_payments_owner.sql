/*
  CDM Studio: Premium payments and the owner's dashboard.
    apply_payment(...)        a paid Paystack payment adds a month or a year of Premium (server only)
    studio_owner_overview()   figures for the owner page (server only; the studio-control function checks the owner)
*/

create or replace function public.apply_payment(p_reference text, p_amount numeric, p_currency text)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v public.payments; v_until timestamptz;
begin
  select * into v from public.payments where reference = p_reference for update;
  if not found then raise exception 'Unknown payment'; end if;
  if v.status = 'paid' then select premium_until into v_until from public.profiles where id = v.user_id; return v_until; end if;
  if upper(p_currency) <> upper(v.currency) or p_amount < v.amount then raise exception 'Amount does not match'; end if;
  update public.payments set status = 'paid', paid_at = now() where reference = p_reference;
  update public.profiles set premium_until = greatest(coalesce(premium_until, now()), now()) + case when v.period = 'yearly' then interval '1 year' else interval '1 month' end
   where id = v.user_id returning premium_until into v_until;
  return v_until;
end $$;

create or replace function public.studio_owner_overview()
returns jsonb language sql stable security definer set search_path = public as $$
  with d as (select (now() at time zone 'Africa/Lagos')::date as today),
       s as (select * from public.settings)
  select jsonb_build_object(
    'generated_at', now(),
    'users', jsonb_build_object(
      'total', (select count(*) from public.profiles),
      'today', (select count(*) from public.profiles, d where (created_at at time zone 'Africa/Lagos')::date = d.today),
      'week', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
      'premium', (select count(*) from public.profiles where premium_until > now()),
      'active_7d', (select count(distinct user_id) from public.ai_usage, d where day > d.today - 7)),
    'learning', jsonb_build_object(
      'lessons_done', (select count(*) from public.progress),
      'lessons_done_7d', (select count(*) from public.progress where done_at > now() - interval '7 days'),
      'learners', (select count(distinct user_id) from public.progress),
      'top', coalesce((select jsonb_agg(x) from (select lesson_id, count(*) n from public.progress group by 1 order by 2 desc limit 8) x), '[]')),
    'projects', jsonb_build_object(
      'total', (select count(*) from public.projects),
      'published', (select count(*) from public.projects where published and not hidden),
      'hidden', (select count(*) from public.projects where hidden),
      'week', (select count(*) from public.projects where created_at > now() - interval '7 days')),
    'ai', jsonb_build_object(
      'enabled', (select ai_enabled from s),
      'builds_today', (select coalesce(sum(builds), 0) from public.ai_usage, d where day = d.today),
      'tutor_today', (select coalesce(sum(tutor), 0) from public.ai_usage, d where day = d.today),
      'builds_7d', (select coalesce(sum(builds), 0) from public.ai_usage, d where day > d.today - 7),
      'tutor_7d', (select coalesce(sum(tutor), 0) from public.ai_usage, d where day > d.today - 7),
      'cost_7d_usd', (select round(coalesce(sum(tokens_in), 0) / 1e6 * (select ai_cost_in_per_m from s) + coalesce(sum(tokens_out), 0) / 1e6 * (select ai_cost_out_per_m from s), 2) from public.ai_usage, d where day > d.today - 7),
      'cost_month_usd', (select round(coalesce(sum(tokens_in), 0) / 1e6 * (select ai_cost_in_per_m from s) + coalesce(sum(tokens_out), 0) / 1e6 * (select ai_cost_out_per_m from s), 2) from public.ai_usage where day >= date_trunc('month', now() at time zone 'Africa/Lagos')::date)),
    'money', jsonb_build_object(
      'month_ngn', (select coalesce(sum(amount), 0) from public.payments where status = 'paid' and currency = 'NGN' and paid_at >= date_trunc('month', now())),
      'month_usd', (select coalesce(sum(amount), 0) from public.payments where status = 'paid' and currency = 'USD' and paid_at >= date_trunc('month', now())),
      'total_ngn', (select coalesce(sum(amount), 0) from public.payments where status = 'paid' and currency = 'NGN'),
      'total_usd', (select coalesce(sum(amount), 0) from public.payments where status = 'paid' and currency = 'USD')),
    'reports', coalesce((select jsonb_agg(x order by x.last desc) from (
        select p.id, p.title, p.slug, p.hidden, count(r.*) as reports, max(r.created_at) as last, string_agg(left(r.reason, 120), ' | ') as reasons
          from public.reports r join public.projects p on p.id = r.project_id group by p.id order by max(r.created_at) desc limit 30) x), '[]'),
    'recent_signups', coalesce((select jsonb_agg(x) from (select u.email, pr.name, pr.created_at from public.profiles pr join auth.users u on u.id = pr.id order by pr.created_at desc limit 10) x), '[]'),
    'settings', (select to_jsonb(s) - 'id' from s));
$$;

revoke all on function public.apply_payment(text, numeric, text), public.studio_owner_overview() from public, anon, authenticated;
grant execute on function public.apply_payment(text, numeric, text), public.studio_owner_overview() to service_role;

-- Supabase adds this helper to new projects; nobody signed out or in should be able to call it
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
