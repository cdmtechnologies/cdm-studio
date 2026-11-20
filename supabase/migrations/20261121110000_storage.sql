/*
  Keeps the database small on the free plan: 20 saved versions per project (was 50), and a storage figure for the
  owner dashboard (studio_storage). Safe to run more than once.
*/
create or replace function public.versions_trim()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.project_versions v
   where v.project_id = new.project_id
     and v.id < (select min(id) from (select id from public.project_versions where project_id = new.project_id order by id desc limit 20) k);
  return new;
end $$;

-- one-time tidy of projects that already have more than 20 versions
delete from public.project_versions v
 where v.id < (select min(id) from (select id from public.project_versions w where w.project_id = v.project_id order by id desc limit 20) k);

create or replace function public.studio_storage()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'db_mb', round(pg_database_size(current_database()) / 1048576.0, 1),
    'limit_mb', 500,
    'projects_mb', round(pg_total_relation_size('public.projects') / 1048576.0, 1),
    'versions_mb', round(pg_total_relation_size('public.project_versions') / 1048576.0, 1));
$$;
revoke all on function public.studio_storage(), public.versions_trim() from public, anon, authenticated;
grant execute on function public.studio_storage() to service_role;
