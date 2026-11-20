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
  ('00000000-0000-0000-0000-00000000000a', 'ada@x.test'), ('00000000-0000-0000-0000-00000000000b', 'bola@x.test'),
  ('00000000-0000-0000-0000-00000000000c', 'chi@x.test'), ('00000000-0000-0000-0000-00000000000d', 'dan@x.test');
\set a '''00000000-0000-0000-0000-00000000000a'''
\set b '''00000000-0000-0000-0000-00000000000b'''
\set c '''00000000-0000-0000-0000-00000000000c'''
\set d '''00000000-0000-0000-0000-00000000000d'''

select pg_temp.ok(pg_temp.as_user(:a, $q$insert into public.sm_workspaces (name) values ('Mama Nkechi') returning name$q$) = 'Mama Nkechi', 'ada makes a workspace');
create temp table w as select id from public.sm_workspaces;
grant select on w to authenticated;
select pg_temp.ok(pg_temp.as_user(:d, $q$select count(*) from public.sm_workspaces$q$) = '0', 'others cannot see it');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.sm_invite((select id from w), 'bola@x.test', 'editor')$q$) !~ '^ERR', 'invite bola as editor');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.sm_invite((select id from w), 'chi@x.test', 'approver')$q$) !~ '^ERR', 'invite chi as approver');
select pg_temp.ok(pg_temp.as_user(:b, $q$select public.sm_invite((select id from w), 'dan@x.test', 'approver')$q$) like 'ERR:%', 'editors cannot invite');
select pg_temp.ok(pg_temp.as_user(:b, $q$select public.sm_accept((select id from public.sm_my_invites()), true)$q$) !~ '^ERR', 'bola accepts');
select pg_temp.ok(pg_temp.as_user(:c, $q$select public.sm_accept((select id from public.sm_my_invites()), true)$q$) !~ '^ERR', 'chi accepts');

-- a connected account (server side), token never readable
create temp table acct as select public.sm_save_account((select id from w), :a, 'facebook', 'page-1', 'Mama Nkechi Page', 'EAAB-secret-token', null, null) as id;
grant select on acct to authenticated;
select pg_temp.ok(pg_temp.as_user(:b, $q$select name from public.sm_accounts$q$) = 'Mama Nkechi Page', 'members see the account');
select pg_temp.ok(pg_temp.as_user(:b, $q$select vault_id::text from public.sm_accounts$q$) like 'ERR:%', 'not the vault id');
select pg_temp.ok(pg_temp.as_user(:a, $q$select token from public.sm_account_token((select id from acct))$q$) like 'ERR:%', 'people cannot read tokens');
select pg_temp.ok((select token from public.sm_account_token((select id from acct))) = 'EAAB-secret-token', 'the server can');
select pg_temp.ok(pg_temp.as_user(:d, $q$select count(*) from public.sm_accounts$q$) = '0', 'outsiders see nothing');

-- the approval rule
select pg_temp.ok(pg_temp.as_user(:b, $q$insert into public.sm_posts (workspace, text, accounts) values ((select id from w), 'Jollof Friday!', array[(select id from acct)]) returning status$q$) = 'awaiting', 'a new post waits for approval');
create temp table post as select id from public.sm_posts;
grant select on post to authenticated;
select pg_temp.ok(pg_temp.as_user(:b, $q$update public.sm_posts set status = 'approved' returning 1$q$) like 'ERR:%', 'nobody writes status directly');
select pg_temp.ok(pg_temp.as_user(:b, $q$select public.sm_decide((select id from post), true)$q$) like 'ERR:%', 'editors cannot approve');
select pg_temp.ok(pg_temp.as_user(:d, $q$select public.sm_decide((select id from post), true)$q$) like 'ERR:%', 'outsiders cannot approve');
select pg_temp.ok(pg_temp.as_user(:c, $q$select public.sm_decide((select id from post), true)$q$) = 'approved', 'approver approves');
select pg_temp.ok((select approved_by from public.sm_posts) = :c, 'who approved is kept');
select pg_temp.ok(pg_temp.as_user(:b, $q$update public.sm_posts set text = 'Jollof Friday!! 50% off' returning status$q$) = 'awaiting', 'an edit after approval needs approval again');
select pg_temp.ok((select approved_by is null from public.sm_posts), 'approval cleared');
select pg_temp.ok((select count(*) from public.sm_claim_due()) = 0, 'unapproved posts are never claimed');
select pg_temp.ok(pg_temp.as_user(:a, $q$select public.sm_decide((select id from post), true)$q$) = 'approved', 'owner approves');
select pg_temp.ok(pg_temp.as_user(:a, $q$select count(*) from public.sm_claim_due()$q$) like 'ERR:%', 'people cannot claim posts');
select pg_temp.ok((select count(*) from public.sm_claim_due()) = 1, 'the server claims the approved post');
select pg_temp.ok((select count(*) from public.sm_claim_due()) = 0, 'and never twice');
select pg_temp.ok(pg_temp.as_user(:b, $q$update public.sm_posts set text = 'late change' returning 1$q$) like 'ERR:%gone out%', 'no edits once posting');
select pg_temp.ok(pg_temp.as_user(:b, $q$insert into public.sm_posts (workspace, text, accounts) values ((select id from w), 'x', array['11111111-1111-1111-1111-111111111111'::uuid]) returning 1$q$) like 'ERR:%', 'accounts must be in the workspace');
update public.sm_posts set scheduled_at = now() + interval '1 day', status = 'approved' where true;
select pg_temp.ok((select count(*) from public.sm_claim_due()) = 0, 'future posts wait for their time');

-- removing an account removes its token
delete from public.sm_accounts;
select pg_temp.ok((select count(*) from vault.secrets where name like 'sm_%') = 0, 'tokens removed with the account');
select pg_temp.ok(public.sm_cron_ok((select decrypted_secret from vault.decrypted_secrets where name = 'social_cron_secret')) and not public.sm_cron_ok('guess'), 'schedule secret');
select 'PASSED social' as result;
rollback;
