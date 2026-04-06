-- Clean up old materials policies
drop policy if exists "materials_select_v2" on public.materials;
drop policy if exists "Admins and Team can manage materials" on public.materials;

-- SELECT: Anyone in the Org can view materials
create policy "materials_select_v2"
on public.materials for select
to authenticated
using (
  exists (
    select 1 from public.projects 
    where projects.id = materials.project_id 
    and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
  )
);

-- ALL: Admins and Team Members can manage materials
create policy "materials_all_v2"
on public.materials for all
to authenticated
using (
  exists (
    select 1 from public.projects 
    where projects.id = materials.project_id 
    and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
    and (auth.jwt() -> 'o' ->> 'rol') in ('admin', 'member')
  )
);

-- UPDATE: Clients can only update the status (for approvals)
create policy "materials_client_update_v2"
on public.materials for update
to authenticated
using (
  exists (
    select 1 from public.projects 
    where projects.id = materials.project_id 
    and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
    and (auth.jwt() -> 'o' ->> 'rol') = 'client'
  )
);