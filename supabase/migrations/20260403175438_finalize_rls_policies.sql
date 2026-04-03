-- 1. PROFILES: Allow users to see their own profile and profiles of teammates
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using ( (select auth.jwt() ->> 'sub') = id );

create policy "Org members can view teammate profiles"
on public.profiles for select
to authenticated
using (
  exists (
    select 1 from public.organization_memberships
    where organization_memberships.user_id = profiles.id
    and organization_memberships.organization_id = (select auth.jwt() ->> 'org_id')
  )
);

-- 2. PROJECTS: Scoped by Organization and Role
create policy "Org members can view projects"
on public.projects for select
to authenticated
using ( organization_id = (select auth.jwt() ->> 'org_id') );

create policy "Admins can create projects"
on public.projects for insert
to authenticated
with check (
  organization_id = (select auth.jwt() ->> 'org_id')
  and (select auth.jwt() ->> 'org_role') = 'org:admin'
);

create policy "Admins can update projects"
on public.projects for update
to authenticated
using (
  organization_id = (select auth.jwt() ->> 'org_id')
  and (select auth.jwt() ->> 'org_role') = 'org:admin'
);

-- 3. ROOMS: Scoped by Project Organization
create policy "Org members can view rooms"
on public.rooms for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = rooms.project_id
    and projects.organization_id = (select auth.jwt() ->> 'org_id')
  )
);

create policy "Admins and Team can manage rooms"
on public.rooms for all
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = rooms.project_id
    and projects.organization_id = (select auth.jwt() ->> 'org_id')
    and (select auth.jwt() ->> 'org_role') in ('org:admin', 'org:member')
  )
);

-- 4. MATERIALS: Scoped by Project Organization
create policy "Org members can view materials"
on public.materials for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = materials.project_id
    and projects.organization_id = (select auth.jwt() ->> 'org_id')
  )
);

create policy "Admins and Team can manage materials"
on public.materials for all
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = materials.project_id
    and projects.organization_id = (select auth.jwt() ->> 'org_id')
    and (select auth.jwt() ->> 'org_role') in ('org:admin', 'org:member')
  )
);

-- Special policy: Clients can ONLY update the 'status' of materials
create policy "Clients can approve/reject materials"
on public.materials for update
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = materials.project_id
    and projects.organization_id = (select auth.jwt() ->> 'org_id')
    and (select auth.jwt() ->> 'org_role') = 'org:client'
  )
)
with check (
  -- This ensures a client can't change the price or name, just the status
  -- (Requires additional logic in the Server Action, but this is the DB layer safety)
  (select auth.jwt() ->> 'org_role') = 'org:client'
);

-- 5. ACTIVITY LOGS: Scoped by Org
create policy "Org members can view activity logs"
on public.activity_logs for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = activity_logs.project_id
    and projects.organization_id = (select auth.jwt() ->> 'org_id')
  )
);

create policy "System can insert activity logs"
on public.activity_logs for insert
to authenticated
with check (
  exists (
    select 1 from public.projects
    where projects.id = activity_logs.project_id
    and projects.organization_id = (select auth.jwt() ->> 'org_id')
  )
);

-- 6. ORGANIZATION MEMBERSHIPS
create policy "Users can view memberships in their org"
on public.organization_memberships for select
to authenticated
using ( organization_id = (select auth.jwt() ->> 'org_id') );