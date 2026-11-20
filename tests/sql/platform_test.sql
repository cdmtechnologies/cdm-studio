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
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'ada@x.test'),
  ('00000000-0000-0000-0000-00000000000b', 'Bola@X.test'),
  ('00000000-0000-0000-0000-00000000000c', 'chi@x.test');
\set a '''00000000-0000-0000-0000-00000000000a'''
\set b '''00000000-0000-0000-0000-00000000000b'''
\set c '''00000000-0000-0000-0000-00000000000c'''
update public.settings set market_commission_pct = 20, lesson_price_credits = 20, min_payout_credits = 50, credit_price_ngn = 10;
insert into public.projects (id, owner_id, title, kind, html, published) values ('10000000-0000-0000-0000-000000000001', :a, 'Shop site', 'website', '<h1>shop</h1>', true);
\set p '''10000000-0000-0000-0000-000000000001'''

-- ---------- team work ----------
select pg_temp.ok(pg_temp.as_user(:b, format($q$select public.invite_member(%L, 'chi@x.test', 'editor')$q$, :p)) like 'ERR:%', 'only the owner invites');
select pg_temp.ok(pg_temp.as_user(:a, format($q$select public.invite_member(%L, 'BOLA@x.test', 'editor')$q$, :p)) !~ '^ERR', 'owner invites bola as editor');
select pg_temp.ok(pg_temp.as_user(:c, $q$select count(*) from public.my_requests()$q$) = '0', 'chi sees no invitation');
select pg_temp.ok(pg_temp.as_user(:c, $q$select count(*) from public.project_invites$q$) = '0', 'chi cannot read invitations');
select pg_temp.ok(pg_temp.as_user(:b, $q$select title from public.my_requests()$q$) = 'Shop site', 'bola sees the invitation (email case ignored)');
select pg_temp.ok(pg_temp.as_user(:c, format($q$select public.answer_invite(%L, true)$q$, (select id from public.project_invites limit 1))) like 'ERR:%', 'chi cannot accept bola''s invitation');
select pg_temp.ok(pg_temp.as_user(:b, format($q$select public.answer_invite(%L, true)$q$, (select id from public.project_invites limit 1))) !~ '^ERR', 'bola accepts');
select pg_temp.ok(pg_temp.as_user(:b, $q$select count(*) from public.projects$q$) = '1', 'bola now sees the project');
select pg_temp.ok(pg_temp.as_user(:b, $q$update public.projects set html = '<h1>shop 2</h1>' returning 1$q$) = '1', 'bola edits it');
select pg_temp.ok(pg_temp.as_user(:b, $q$update public.projects set published = false returning published$q$) = 'true', 'editors cannot unpublish');
select pg_temp.ok(pg_temp.as_user(:b, $q$delete from public.projects returning 1$q$) is null, 'editors cannot delete');
select pg_temp.ok((select count(*) from public.projects) = 1, 'project still there');
select pg_temp.ok(pg_temp.as_user(:b, format($q$insert into public.project_versions (project_id, html, source) values (%L, 'x', 'edit') returning 1$q$, :p)) = '1', 'editors save versions');
select pg_temp.ok(pg_temp.as_user(:b, format($q$insert into public.project_versions (project_id, html, source) values (%L, 'x', 'ai') returning 1$q$, :p)) like 'ERR:%', 'editors cannot fake AI versions');
select pg_temp.ok(pg_temp.as_user(:b, format($q$select count(*) from public.project_people(%L)$q$, :p)) = '2', 'people list: owner and bola');
select pg_temp.ok(pg_temp.as_user(:b, format($q$select string_agg(coalesce(email, '-'), ',' order by role) from public.project_people(%L)$q$, :p)) = 'bola@x.test,-', 'bola does not see the owner''s email');
select pg_temp.ok(pg_temp.as_user(:a, format($q$select public.invite_member(%L, 'chi@x.test', 'viewer')$q$, :p)) !~ '^ERR', 'chi invited as viewer');
select pg_temp.ok(pg_temp.as_user(:c, format($q$select public.answer_invite(%L, true)$q$, (select id from public.project_invites limit 1))) !~ '^ERR', 'chi accepts');
select pg_temp.ok(pg_temp.as_user(:c, $q$update public.projects set html = 'hack' returning 1$q$) is null, 'viewers cannot edit');
select pg_temp.ok(pg_temp.as_user(:b, format($q$select public.remove_member(%L, %L)$q$, :p, :c)) like 'ERR:%', 'editors cannot remove others');
select pg_temp.ok(pg_temp.as_user(:c, format($q$select public.remove_member(%L, %L)$q$, :p, :c)) !~ '^ERR', 'chi leaves');
select pg_temp.ok(pg_temp.as_user(:c, $q$select count(*) from public.projects$q$) = '0', 'chi no longer sees it');

-- ---------- API secrets ----------
select public.secret_save(:p, :a, 'WEATHER_KEY', 'sk-live-123456', 'https://api.weather.test/v1', 'bearer', null, false, 2);
select pg_temp.ok(pg_temp.as_user(:a, $q$select name || '|' || hint from public.project_secrets$q$) = 'WEATHER_KEY|456', 'owner sees the secret settings, not the value');
select pg_temp.ok(pg_temp.as_user(:a, $q$select vault_id from public.project_secrets$q$) like 'ERR:%', 'vault id is not readable');
select pg_temp.ok(pg_temp.as_user(:b, $q$select count(*) from public.project_secrets$q$) = '0', 'editors do not see secret settings');
select pg_temp.ok(pg_temp.as_user(:a, $q$select count(*) from vault.decrypted_secrets$q$) like 'ERR:%', 'people cannot read the vault');
select pg_temp.ok(pg_temp.as_user(:a, format($q$select value from public.secret_take(null, %L, %L, 'WEATHER_KEY')$q$, :p, :a)) like 'ERR:%', 'people cannot call secret_take');
select pg_temp.ok((select value from public.secret_take(null, :p, :a, 'WEATHER_KEY')) = 'sk-live-123456', 'owner preview gets the value (server side)');
select pg_temp.ok((select value from public.secret_take(null, :p, :b, 'WEATHER_KEY')) = 'sk-live-123456', 'editor preview too');
select pg_temp.ok((select reason from public.secret_take(null, :p, :c, 'WEATHER_KEY')) = 'project', 'outsiders cannot');
select pg_temp.ok((select reason from public.secret_take((select slug from public.projects where id = :p), null, null, 'WEATHER_KEY')) = 'private', 'published page cannot use a private secret');
select pg_temp.ok((select reason from public.secret_take(null, :p, :a, 'WEATHER_KEY')) = 'limit', 'daily limit');
select public.secret_save(:p, :a, 'WEATHER_KEY', '', 'https://api.weather.test/v1', 'bearer', null, true, 100);
select pg_temp.ok((select value from public.secret_take((select slug from public.projects where id = :p), null, null, 'WEATHER_KEY')) = 'sk-live-123456', 'public use on the published page, value kept');
select public.secret_delete(:p, :a, 'WEATHER_KEY');
select pg_temp.ok((select count(*) from vault.secrets) = 0, 'deleting removes it from the vault');

-- ---------- marketplace ----------
update public.profiles set credits = 100 where id = :c;
select pg_temp.ok(pg_temp.as_user(:b, format($q$select public.list_for_sale(%L, 50, 'A shop site')$q$, :p)) like 'ERR:%', 'editors cannot sell');
select pg_temp.ok(pg_temp.as_user(:a, format($q$select public.list_for_sale(%L, 50, 'A shop site')$q$, :p)) !~ '^ERR', 'owner lists it');
select pg_temp.ok(pg_temp.as_user(null, $q$select price_credits from public.market()$q$) = '50', 'visitors see it in the market');
select pg_temp.ok(pg_temp.as_user(:a, format($q$select public.buy_project(%L)$q$, :p)) like 'ERR:%', 'cannot buy your own');
select pg_temp.ok(pg_temp.as_user(:c, $q$update public.profiles set credits = 99999 where id = auth.uid() returning 1$q$) like 'ERR:%', 'nobody writes credits');
select pg_temp.ok(pg_temp.as_user(:c, $q$update public.profiles set earnings = 99999 where id = auth.uid() returning 1$q$) like 'ERR:%', 'nobody writes earnings');
select pg_temp.ok(pg_temp.as_user(:c, format($q$select public.buy_project(%L)$q$, :p)) !~ '^ERR', 'chi buys it');
select pg_temp.ok((select credits from public.profiles where id = :c) = 50, 'buyer paid 50');
select pg_temp.ok((select earnings from public.profiles where id = :a) = 40, 'seller earned 40 (20% commission)');
select pg_temp.ok(pg_temp.as_user(:c, $q$select count(*) from public.projects where owner_id = auth.uid()$q$) = '1', 'buyer has a copy');
select pg_temp.ok(pg_temp.as_user(:c, $q$select public.list_for_sale(id, 10, 'resell') from public.projects where owner_id = auth.uid()$q$) like 'ERR:%', 'a bought copy cannot be resold as it is');
select pg_temp.ok(pg_temp.as_user(:c, format($q$select public.buy_project(%L)$q$, :p)) !~ '^ERR', 'chi buys a second copy');
select pg_temp.ok(pg_temp.as_user(:c, format($q$select public.buy_project(%L)$q$, :p)) like 'ERR:%Not enough credits%', 'no credits, no sale');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.earnings_to_credits(30)$q$) = '30.00', 'seller turns 30 earnings into credits');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.request_payout(40, 'Moniepoint', 'Ada L', '0123456789')$q$) like 'ERR:%', 'payout above earnings refused');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.request_payout(20, 'Moniepoint', 'Ada L', '123')$q$) like 'ERR:%', 'needs a 10-digit account');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.request_payout(10, 'Moniepoint', 'Ada L', '0123456789')$q$) like 'ERR:%smallest%', 'minimum payout');
update public.profiles set earnings = 100 where id = :a;
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.request_payout(60, 'Moniepoint', 'Ada L', '0123456789')$q$) !~ '^ERR', 'payout requested');
select pg_temp.ok((select amount_ngn from public.payout_requests) = 600, 'naira amount worked out');
select pg_temp.ok(pg_temp.as_user(:a, $q$select account_no from public.payout_requests$q$) like 'ERR:%', 'account number not read back');
select public.settle_payout((select id from public.payout_requests), false, 'name does not match');
select pg_temp.ok((select earnings from public.profiles where id = :a) = 100, 'refused payout gives earnings back');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.settle_payout(1, true)$q$) like 'ERR:%', 'people cannot settle payouts');

-- ---------- transfer ----------
select pg_temp.ok(pg_temp.as_user(:b, format($q$select public.offer_transfer(%L, 'chi@x.test')$q$, :p)) like 'ERR:%', 'editors cannot transfer');
select pg_temp.ok(pg_temp.as_user(:a, format($q$select public.offer_transfer(%L, 'chi@x.test', 'yours now')$q$, :p)) !~ '^ERR', 'owner offers to chi');
select pg_temp.ok(pg_temp.as_user(:b, format($q$select public.accept_transfer(%L)$q$, :p)) like 'ERR:%', 'bola cannot take it');
select pg_temp.ok((select owner_id from public.projects where id = :p) = :a, 'still ada''s');
select pg_temp.ok(pg_temp.as_user(:a, format($q$update public.projects set owner_id = %L where id = %L returning 1$q$, :c, :p)) like 'ERR:%', 'owner cannot be changed directly');
select pg_temp.ok(pg_temp.as_user(:c, format($q$select public.accept_transfer(%L)$q$, :p)) !~ '^ERR', 'chi accepts');
select pg_temp.ok((select owner_id from public.projects where id = :p) = :c, 'now chi''s');
select pg_temp.ok((select count(*) from public.listings where project_id = :p) = 0, 'listing ends with the transfer');
select pg_temp.ok(pg_temp.as_user(:a, format($q$select count(*) from public.projects where id = %L$q$, :p)) = '0', 'ada no longer sees it');
select pg_temp.ok(pg_temp.as_user(:b, format($q$select count(*) from public.projects where id = %L$q$, :p)) = '1', 'bola stays an editor');

-- ---------- paid lessons and certificates ----------
insert into public.lesson_meta (id, meta) values ('sec-1', '{"track":"sec","track_title":"Cybersecurity"}'), ('sec-2', '{"track":"sec","paid":true}');
insert into public.lesson_content (id, track, body) values ('sec-2', 'sec', '{"body":"secret lesson"}');
insert into public.exam_questions (track, n, question, options, answer) values ('sec', 1, 'Q1', '["a","b"]', 1), ('sec', 2, 'Q2', '["a","b"]', 0);
update public.profiles set credits = 30 where id = :b;
select pg_temp.ok(pg_temp.as_user(:b, $q$select count(*) from public.lesson_content$q$) = '0', 'paid text hidden before unlocking');
select pg_temp.ok(pg_temp.as_user(:b, $q$insert into public.progress (user_id, lesson_id) values (auth.uid(), 'sec-2') returning 1$q$) like 'ERR:%', 'cannot finish a locked lesson');
select pg_temp.ok(pg_temp.as_user(:b, $q$select public.unlock_lesson('sec-2')$q$) = '20', 'unlock costs 20');
select pg_temp.ok(pg_temp.as_user(:b, $q$select public.unlock_lesson('sec-2')$q$) = '0', 'unlocking again is free');
select pg_temp.ok(pg_temp.as_user(:b, $q$select body ->> 'body' from public.lesson_content$q$) = 'secret lesson', 'text readable after unlocking');
select pg_temp.ok(pg_temp.as_user(:b, $q$select public.unlock_lesson('sec-1')$q$) like 'ERR:%free%', 'free lessons need no unlock');
select pg_temp.ok(pg_temp.as_user(:b, $q$select count(*) from public.exam_questions$q$) like 'ERR:%', 'answers are hidden');
select pg_temp.ok(pg_temp.as_user(:b, $q$select count(*) from public.exam_paper('sec')$q$) = '2', 'exam paper without answers');
select pg_temp.ok(pg_temp.as_user(:b, $q$select passed::text || missing from public.submit_exam('sec', array[1,0], 'Bola Ade')$q$) = 'false2', 'full marks but lessons not done: no certificate');
select pg_temp.ok(pg_temp.as_user(:b, $q$insert into public.progress (user_id, lesson_id) values (auth.uid(), 'sec-1'), (auth.uid(), 'sec-2') returning 1$q$) !~ '^ERR', 'lessons done');
select pg_temp.ok(pg_temp.as_user(:b, $q$select passed::text from public.submit_exam('sec', array[0,1], 'Bola Ade')$q$) = 'false', 'wrong answers fail');
select pg_temp.ok(pg_temp.as_user(:b, $q$select code from public.submit_exam('sec', array[1,0], 'Bola Ade')$q$) ~ '^CDM-[A-Z0-9]{4}-[A-Z0-9]{4}$', 'pass gives a certificate');
select pg_temp.ok(pg_temp.as_user(:b, $q$select public.submit_exam('sec', array[1,0], 'Bola Ade')$q$) like 'ERR:%3 tries%', '3 tries a day');
select pg_temp.ok(pg_temp.as_user(null, format($q$select name || '|' || title || '|' || score from public.verify_certificate(%L)$q$, (select lower(code) from public.certificates))) = 'Bola Ade|Cybersecurity|100', 'anyone verifies it');
select pg_temp.ok(pg_temp.as_user(:b, $q$insert into public.certificates (code, user_id, track, title, name, score) values ('CDM-AAAA-BBBB', auth.uid(), 'x', 'x', 'Fake', 100) returning 1$q$) like 'ERR:%', 'certificates cannot be made by hand');

-- ---------- hosting tokens ----------
select public.token_save(:a, 'netlify', 'nfp_secret', 'ada@netlify');
select pg_temp.ok(pg_temp.as_user(:a, $q$select account from public.user_tokens$q$) = 'ada@netlify', 'owner sees which account is connected');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.token_get(auth.uid(), 'netlify')$q$) like 'ERR:%', 'token never readable by people');
select pg_temp.ok(public.token_get(:a, 'netlify') = 'nfp_secret', 'server reads it');
select public.token_delete(:a, 'netlify');
select pg_temp.ok((select count(*) from vault.secrets) = 0, 'disconnect removes the token');

select 'PASSED platform' as result;
rollback;
