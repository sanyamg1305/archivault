create table public.floors (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  organization_id text not null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz default now() not null
);

create index floors_project_idx on public.floors (project_id);

alter table public.rooms
  add column if not exists floor_id uuid references public.floors(id) on delete set null;
