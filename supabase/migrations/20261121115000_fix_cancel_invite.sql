/* Fix: only a project's owner may cancel its invitations (someone with no role on the project was not refused). */
create or replace function public.remove_member(p_project uuid, p_user uuid default null, p_invite uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_invite is not null then
    if public.project_role(p_project) is distinct from 'owner' then raise exception 'Only the owner can cancel invitations.'; end if;
    delete from public.project_invites where id = p_invite and project_id = p_project; return;
  end if;
  if p_user = auth.uid() or public.project_role(p_project) is not distinct from 'owner' then
    delete from public.project_members where project_id = p_project and user_id = p_user;
  else raise exception 'Only the owner can remove people.'; end if;
end $$;
revoke all on function public.remove_member(uuid, uuid, uuid) from public, anon;
grant execute on function public.remove_member(uuid, uuid, uuid) to authenticated;
