-- 1. Drop the legacy/conflicting policies
drop policy if exists "Admins can create projects" on public.projects;
drop policy if exists "Admins can update projects" on public.projects;
drop policy if exists "Org members can view projects" on public.projects;
drop policy if exists "Users can update their own projects" on public.projects;
drop policy if exists "View projects by org" on public.projects;

-- 2. Ensure the V2 policies are the ONLY ones active
-- (We already ran these, but this ensures they are fresh)
drop policy if exists "projects_insert_v2" on public.projects;
drop policy if exists "projects_select_v2" on public.projects;
drop policy if exists "projects_update_v2" on public.projects;

-- INSERT
create policy "projects_insert_v2"
on public.projects for insert
to authenticated
with check (
  organization_id = (auth.jwt() -> 'o' ->> 'id')
  and (auth.jwt() -> 'o' ->> 'rol') = 'admin'
);

-- SELECT
create policy "projects_select_v2"
on public.projects for select
to authenticated
using ( 
  organization_id = (auth.jwt() -> 'o' ->> 'id') 
);

-- UPDATE
create policy "projects_update_v2"
on public.projects for update
to authenticated
using ( 
  organization_id = (auth.jwt() -> 'o' ->> 'id') 
  and (auth.jwt() -> 'o' ->> 'rol') = 'admin'
);