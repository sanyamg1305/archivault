create table public.site_visits (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  organization_id text not null,
  visit_date date not null,
  title text not null,
  observations text,
  attendees text[],
  created_by text not null,
  created_by_name text not null,
  created_at timestamptz default now() not null
);

create index site_visits_project_idx on public.site_visits (project_id);

-- Link site photos to visits (optional, nullable)
alter table public.site_photos
  add column if not exists visit_id uuid references public.site_visits(id) on delete set null;
