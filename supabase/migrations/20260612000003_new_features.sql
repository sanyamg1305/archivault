-- ── Project Milestones / Timeline ────────────────────────────────────────────
create table public.project_milestones (
  id              uuid default gen_random_uuid() primary key,
  project_id      uuid references public.projects(id) on delete cascade not null,
  organization_id text not null,
  title           text not null,
  description     text,
  target_date     date,
  completed_at    timestamptz,
  sort_order      int default 0 not null,
  created_at      timestamptz default now() not null
);
alter table public.project_milestones enable row level security;
create policy "milestones_org" on public.project_milestones for all to authenticated
  using  ((auth.jwt()->'o'->>'id') = organization_id)
  with check ((auth.jwt()->'o'->>'id') = organization_id);
create index project_milestones_project_idx on public.project_milestones(project_id);

-- ── Site Progress Photos ─────────────────────────────────────────────────────
create table public.site_photos (
  id              uuid default gen_random_uuid() primary key,
  project_id      uuid references public.projects(id) on delete cascade not null,
  room_id         uuid references public.rooms(id) on delete set null,
  organization_id text not null,
  file_path       text not null,
  caption         text,
  taken_at        date default current_date not null,
  uploaded_by     text not null,
  created_at      timestamptz default now() not null
);
alter table public.site_photos enable row level security;
create policy "site_photos_org" on public.site_photos for all to authenticated
  using  ((auth.jwt()->'o'->>'id') = organization_id)
  with check ((auth.jwt()->'o'->>'id') = organization_id);
create index site_photos_project_idx on public.site_photos(project_id);

-- ── Project Documents ────────────────────────────────────────────────────────
create table public.project_documents (
  id              uuid default gen_random_uuid() primary key,
  project_id      uuid references public.projects(id) on delete cascade not null,
  organization_id text not null,
  name            text not null,
  file_path       text not null,
  file_size       bigint,
  mime_type       text,
  category        text not null default 'Other',
  uploaded_by     text not null,
  created_at      timestamptz default now() not null
);
alter table public.project_documents enable row level security;
create policy "documents_org" on public.project_documents for all to authenticated
  using  ((auth.jwt()->'o'->>'id') = organization_id)
  with check ((auth.jwt()->'o'->>'id') = organization_id);
create index project_documents_project_idx on public.project_documents(project_id);

-- ── Vendors Directory ────────────────────────────────────────────────────────
create table public.vendors (
  id              uuid default gen_random_uuid() primary key,
  organization_id text not null,
  name            text not null,
  phone           text,
  city            text,
  category        text not null default 'Other',
  notes           text,
  created_at      timestamptz default now() not null
);
alter table public.vendors enable row level security;
create policy "vendors_org" on public.vendors for all to authenticated
  using  ((auth.jwt()->'o'->>'id') = organization_id)
  with check ((auth.jwt()->'o'->>'id') = organization_id);
create index vendors_org_idx on public.vendors(organization_id);

alter table public.materials add column if not exists vendor_id uuid references public.vendors(id) on delete set null;

-- ── Notifications ────────────────────────────────────────────────────────────
create table public.notifications (
  id              uuid default gen_random_uuid() primary key,
  organization_id text not null,
  title           text not null,
  body            text,
  link            text,
  read_by         text[] default '{}' not null,
  created_at      timestamptz default now() not null
);
alter table public.notifications enable row level security;
create policy "notifications_org" on public.notifications for all to authenticated
  using  ((auth.jwt()->'o'->>'id') = organization_id)
  with check ((auth.jwt()->'o'->>'id') = organization_id);
create index notifications_org_idx on public.notifications(organization_id, created_at desc);
