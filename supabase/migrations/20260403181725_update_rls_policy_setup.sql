-- 1. Reset existing project policies
drop policy if exists "projects_select_policy" on public.projects;
drop policy if exists "projects_insert_policy" on public.projects;
drop policy if exists "projects_update_policy" on public.projects;

-- 2. New SELECT Policy (Clerk V2)
create policy "projects_select_v2"
on public.projects for select
to authenticated
using ( 
  organization_id = (auth.jwt() -> 'o' ->> 'id') 
);

-- 3. New INSERT Policy (Clerk V2)
create policy "projects_insert_v2"
on public.projects for insert
to authenticated
with check (
  -- Check the Organization ID
  organization_id = (auth.jwt() -> 'o' ->> 'id')
  and 
  -- Check the Role (V2 removes the 'org:' prefix)
  (auth.jwt() -> 'o' ->> 'rol') = 'admin'
);

-- 4. New UPDATE Policy (Clerk V2)
create policy "projects_update_v2"
on public.projects for update
to authenticated
using ( 
  organization_id = (auth.jwt() -> 'o' ->> 'id') 
  and (auth.jwt() -> 'o' ->> 'rol') = 'admin'
);

-- 5. Fix Profile/Membership RLS for V2 as well
drop policy if exists "Users can view teammate profiles" on public.profiles;
create policy "teammate_profiles_v2"
on public.profiles for select
to authenticated
using (
  exists (
    select 1 from public.organization_memberships
    where organization_memberships.user_id = profiles.id
    and organization_memberships.organization_id = (auth.jwt() -> 'o' ->> 'id')
  )
);

-- Update Materials
drop policy if exists "Org members can view materials" on public.materials;
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

-- Update Rooms
drop policy if exists "Org members can view rooms" on public.rooms;
create policy "rooms_select_v2"
on public.rooms for select
to authenticated
using (
  exists (
    select 1 from public.projects 
    where projects.id = rooms.project_id 
    and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
  )
);