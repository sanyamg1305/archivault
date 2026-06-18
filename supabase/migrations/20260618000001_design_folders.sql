create table public.design_folders (
  id              uuid default gen_random_uuid() primary key,
  project_id      uuid references public.projects(id) on delete cascade not null,
  organization_id text not null,
  name            text not null,
  created_at      timestamptz default now() not null
);
alter table public.design_folders enable row level security;
create policy "design_folders_org" on public.design_folders for all to authenticated
  using  ((auth.jwt()->'o'->>'id') = organization_id)
  with check ((auth.jwt()->'o'->>'id') = organization_id);
create index design_folders_project_idx on public.design_folders(project_id);

alter table public.designs add column if not exists folder_id uuid references public.design_folders(id) on delete set null;
