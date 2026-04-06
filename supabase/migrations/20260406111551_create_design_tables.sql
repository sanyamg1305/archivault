-- 1. Create the Design Container
create table public.designs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  room_id uuid references public.rooms(id) on delete set null, -- Optional: Can be project-wide
  title text not null,
  description text,
  created_at timestamp with time zone default now() not null
);

-- 2. Create the Design Versions Stack
create table public.design_versions (
  id uuid default gen_random_uuid() primary key,
  design_id uuid references public.designs(id) on delete cascade not null,
  file_path text not null, -- Path in Supabase Storage
  version_number int not null default 1,
  change_notes text,
  status text check (status in ('Pending', 'Approved', 'Rejected', 'Revision Requested')) default 'Pending',
  created_by text references public.profiles(id),
  created_at timestamp with time zone default now() not null
);

-- 3. ENABLE RLS
alter table public.designs enable row level security;
alter table public.design_versions enable row level security;

-- 4. RLS POLICIES (Clerk V2 compatible)
create policy "designs_select_v2" on public.designs for select to authenticated
using ( exists (select 1 from public.projects where projects.id = designs.project_id and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')) );

create policy "designs_all_v2" on public.designs for all to authenticated
using ( exists (select 1 from public.projects where projects.id = designs.project_id and projects.organization_id = (auth.jwt() -> 'o' ->> 'id') and (auth.jwt() -> 'o' ->> 'rol') in ('admin', 'member')) );

create policy "versions_select_v2" on public.design_versions for select to authenticated
using ( exists (select 1 from public.designs join public.projects on projects.id = designs.project_id where designs.id = design_versions.design_id and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')) );

create policy "versions_all_v2" on public.design_versions for all to authenticated
using ( exists (select 1 from public.designs join public.projects on projects.id = designs.project_id where designs.id = design_versions.design_id and projects.organization_id = (auth.jwt() -> 'o' ->> 'id') and (auth.jwt() -> 'o' ->> 'rol') in ('admin', 'member')) );