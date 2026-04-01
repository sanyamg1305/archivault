-- Profiles table: Mirrors Clerk users
create table public.profiles (
  id text primary key, -- Clerk User ID
  first_name text,
  last_name text,
  email text not null,
  created_at timestamp with time zone default now() not null
);

-- Projects table: The root of everything
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  organization_id text not null, -- Clerk Org ID
  name text not null,
  client_reference text,
  total_budget numeric(15, 2) not null default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Rooms table: Project hierarchy
create table public.rooms (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now() not null
);

-- Materials table: Financial tracking
create table public.materials (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  room_id uuid references public.rooms(id) on delete cascade not null,
  name text not null,
  category text,
  brand text,
  vendor text,
  estimated_cost numeric(15, 2) not null default 0,
  status text check (status in ('Pending', 'Approved', 'Rejected', 'Revision Requested')) default 'Pending',
  created_at timestamp with time zone default now() not null
);

-- Activity Logs: The Audit Trail
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id text references public.profiles(id) not null,
  action_description text not null,
  metadata jsonb,
  created_at timestamp with time zone default now() not null
);

-- RLS CONFIGURATION
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.rooms enable row level security;
alter table public.materials enable row level security;
alter table public.activity_logs enable row level security;

-- 1. Project Security: Only members of the Clerk Org can see the project
create policy "View projects by org" 
on public.projects for select 
using ( organization_id = (auth.jwt() ->> 'org_id') );

-- 2. Material Security: Viewable if you belong to the project's org
create policy "View materials by org" 
on public.materials for select 
using ( 
  exists (
    select 1 from public.projects 
    where projects.id = materials.project_id 
    and projects.organization_id = (auth.jwt() ->> 'org_id')
  ) 
);

-- 3. Room Security: Viewable if you belong to the project's org
create policy "View rooms by org" 
on public.rooms for select 
using ( 
  exists (
    select 1 from public.projects 
    where projects.id = rooms.project_id 
    and projects.organization_id = (auth.jwt() ->> 'org_id')
  ) 
);