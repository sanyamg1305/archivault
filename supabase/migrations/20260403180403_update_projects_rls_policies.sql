-- 1. Drop the old policy so we can recreate it
drop policy if exists "Admins can create projects" on public.projects;

-- 2. Create a more flexible version
create policy "Admins can create projects"
on public.projects for insert
to authenticated
with check (
  -- Ensure the project belongs to the user's active organization
  organization_id = (auth.jwt() ->> 'org_id')
  -- Accept either 'admin' or 'org:admin'
  and (
    (auth.jwt() ->> 'org_role') = 'org:admin' 
    or 
    (auth.jwt() ->> 'org_role') = 'admin'
  )
);