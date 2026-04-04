-- 1. CLEAN UP ROOMS POLICIES
drop policy if exists "Org members can view rooms" on public.rooms;
drop policy if exists "Admins and Team can manage rooms" on public.rooms;

-- SELECT Rooms: Check if the parent project belongs to the user's Org
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

-- INSERT/UPDATE/DELETE Rooms: Check Org AND Role (Admin or Member)
create policy "rooms_all_v2"
on public.rooms for all
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = rooms.project_id
    and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
    and (auth.jwt() -> 'o' ->> 'rol') in ('admin', 'member')
  )
);

-- 2. CLEAN UP ACTIVITY LOGS POLICIES
drop policy if exists "Org members can view activity logs" on public.activity_logs;
drop policy if exists "System can insert activity logs" on public.activity_logs;

create policy "activity_select_v2"
on public.activity_logs for select
to authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = activity_logs.project_id
    and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
  )
);

create policy "activity_insert_v2"
on public.activity_logs for insert
to authenticated
with check (
  exists (
    select 1 from public.projects
    where projects.id = activity_logs.project_id
    and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
  )
);