begin;
set client_min_messages = warning;
create function pg_temp.ok(c boolean, what text) returns void language plpgsql as $$ begin if c is not true then raise exception 'FAILED: %', what; end if; end $$;
create function pg_temp.as_user(uid uuid, q text) returns text language plpgsql as $$
declare v text; err text;
begin
  perform set_config('request.jwt.claims', case when uid is null then '' else json_build_object('sub', uid, 'role', 'authenticated')::text end, true);
  if uid is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
  begin execute q into v; exception when others then err := 'ERR: ' || sqlerrm; end;
  execute 'reset role'; perform set_config('request.jwt.claims', '', true);
  return coalesce(err, v);
end $$;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'ada@x.test', '{"name":"Ada Lovelace","ref":"ERP-AB12"}'),
  ('00000000-0000-0000-0000-00000000000b', 'bola@x.test', '{}');
\set a '''00000000-0000-0000-0000-00000000000a'''
\set b '''00000000-0000-0000-0000-00000000000b'''

select pg_temp.ok((select name from public.profiles where id = :a) = 'Ada Lovelace', 'profile made with name');
select pg_temp.ok((select referral_code from public.profiles where id = :a) = 'ERP-AB12', 'referral code kept');
select pg_temp.ok(pg_temp.as_user(:a, $q$update public.profiles set premium_until = now() + interval '1 year' where id = auth.uid() returning 1$q$) like 'ERR:%', 'people cannot give themselves Premium');

-- projects
select pg_temp.ok(pg_temp.as_user(:a, $q$insert into public.projects (title, kind, html) values ('My game', 'game', '<h1>hi</h1>') returning id$q$) !~ '^ERR', 'ada makes a project');
select pg_temp.ok(pg_temp.as_user(:b, $q$select count(*) from public.projects$q$) = '0', 'bola cannot see ada''s private project');
select pg_temp.ok(pg_temp.as_user(:a, $q$update public.projects set published = true returning slug$q$) ~ '^[a-z0-9]{10}$', 'publishing gives a slug');
select pg_temp.ok(pg_temp.as_user(:a, $q$update public.projects set hidden = false returning 1$q$) like 'ERR:%', 'owner of project cannot touch hidden');
select pg_temp.ok(pg_temp.as_user(null, $q$select count(*) from public.gallery()$q$) = '1', 'visitors see the gallery');
select pg_temp.ok(pg_temp.as_user(null, format($q$select title from public.open_published(%L)$q$, (select slug from public.projects limit 1))) = 'My game', 'visitors open a published project');
select pg_temp.ok((select views from public.projects limit 1) = 1, 'view counted');
select pg_temp.ok(pg_temp.as_user(null, $q$select count(*) from public.projects$q$) like 'ERR:%', 'visitors cannot read the projects table');
select pg_temp.ok(pg_temp.as_user(:b, format($q$select public.remix_project(%L)$q$, (select slug from public.projects limit 1))) !~ '^ERR', 'bola remixes it');
select pg_temp.ok(pg_temp.as_user(:b, $q$select title || '|' || published from public.projects$q$) = 'Remix of My game|false', 'remix is bola''s, unpublished');
select pg_temp.ok(pg_temp.as_user(:b, $q$select count(*) from public.project_versions$q$) = '1', 'remix has its first version');
select pg_temp.ok(pg_temp.as_user(:b, format($q$insert into public.project_versions (project_id, html, source) values (%L, 'x', 'ai') returning 1$q$, (select id from public.projects where owner_id = :b))) like 'ERR:%', 'people cannot fake an AI version');
update public.projects set hidden = true where owner_id = :a;
select pg_temp.ok(pg_temp.as_user(null, $q$select count(*) from public.gallery()$q$) = '0', 'hidden projects leave the gallery');

-- AI: free allowance, then credits
update public.settings set free_builds_daily = 2, credit_price_ngn = 10, usd_ngn = 1600, markup = 3, fast_in_per_m = 1, fast_out_per_m = 5, best_in_per_m = 3, best_out_per_m = 15;
select pg_temp.ok((select mode from public.usage_take(:a, 'build')) = 'free', 'first build is free');
select pg_temp.ok((select free_left from public.usage_take(:a, 'build')) = 0, 'second build is free, none left');
select pg_temp.ok((select reason from public.usage_take(:a, 'build')) = 'credits', 'third build needs credits');
select pg_temp.ok((select reason from public.usage_take(:a, 'build', true)) = 'credits_best', 'the best model always needs credits');
-- a ₦1,000 top-up = 100 credits
insert into public.payments (reference, user_id, amount, currency, period, credits) values ('cdmstudio_test000001', :a, 1000, 'NGN', 'credits', 100);
select public.apply_payment('cdmstudio_test000001', 1000, 'NGN');
select pg_temp.ok((select credits from public.profiles where id = :a) = 100, 'top-up adds 100 credits');
select public.apply_payment('cdmstudio_test000001', 1000, 'NGN');
select pg_temp.ok((select credits from public.profiles where id = :a) = 100, 'a payment is only counted once');
select pg_temp.ok((select mode from public.usage_take(:a, 'build')) = 'credits', 'with credits the build goes ahead');
-- 4,000 tokens in + 10,000 out on the fast model = $0.054 -> 0.054 * 1600 * 3 / 10 = 25.92 -> 26 credits
select pg_temp.ok((select charged from public.charge_ai(:a, 'build', 'credits', false, 'fast', 4000, 10000, 'p1')) = 26, 'charged 26 credits for that build');
select pg_temp.ok((select credits from public.profiles where id = :a) = 74, '74 credits left');
select pg_temp.ok((select count(*) from public.credit_ledger where user_id = :a) = 2, 'ledger has the top-up and the build');
select pg_temp.ok((select charged from public.charge_ai(:a, 'tutor', 'free', false, 'fast', 1000, 500)) = 0, 'free actions cost no credits');
select pg_temp.ok(pg_temp.as_user(:a, $q$select count(*) from public.credit_ledger$q$) = '2', 'people see their own ledger');
select pg_temp.ok(pg_temp.as_user(:b, $q$select count(*) from public.credit_ledger$q$) = '0', 'and nobody else''s');
select pg_temp.ok(pg_temp.as_user(:a, $q$update public.profiles set credits = 99999 where id = auth.uid() returning 1$q$) like 'ERR:%', 'people cannot give themselves credits');
select pg_temp.ok(pg_temp.as_user(:a, $q$select (public.usage_take(auth.uid(), 'build')).allowed$q$) like 'ERR:%', 'people cannot call the limit function');
update public.settings set ai_enabled = false;
select pg_temp.ok((select reason from public.usage_take(:b, 'tutor')) = 'paused', 'AI switch pauses everything');
select pg_temp.ok(pg_temp.as_user(null, $q$select credit_price_ngn from public.settings$q$) = '10.00', 'credit price is public');
select pg_temp.ok(pg_temp.as_user(null, $q$select ai_cost_in_per_m from public.settings$q$) like 'ERR:%', 'AI costs are not public');
select pg_temp.ok(pg_temp.as_user(:a, $q$select count(*) from public.staff$q$) like 'ERR:%', 'staff list is private');
select 'PASSED studio' as result;
rollback;
