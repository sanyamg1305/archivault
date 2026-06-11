create table public.project_messages (
  id         uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  sender_id   text not null,
  sender_name text not null,
  content     text not null,
  channel     text not null check (channel in ('internal', 'external')),
  created_at  timestamp with time zone default now() not null
);

alter table public.project_messages enable row level security;

-- Internal channel: org members only (architects)
create policy "messages_internal_select" on public.project_messages
  for select to authenticated
  using (
    channel = 'internal'
    and exists (
      select 1 from public.projects
      where projects.id = project_messages.project_id
        and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
    )
  );

create policy "messages_internal_insert" on public.project_messages
  for insert to authenticated
  with check (
    channel = 'internal'
    and exists (
      select 1 from public.projects
      where projects.id = project_messages.project_id
        and projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
    )
  );

-- External channel: org members AND the assigned client
create policy "messages_external_select" on public.project_messages
  for select to authenticated
  using (
    channel = 'external'
    and exists (
      select 1 from public.projects
      where projects.id = project_messages.project_id
        and (
          projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
          or projects.client_id = auth.jwt() ->> 'sub'
        )
    )
  );

create policy "messages_external_insert" on public.project_messages
  for insert to authenticated
  with check (
    channel = 'external'
    and exists (
      select 1 from public.projects
      where projects.id = project_messages.project_id
        and (
          projects.organization_id = (auth.jwt() -> 'o' ->> 'id')
          or projects.client_id = auth.jwt() ->> 'sub'
        )
    )
  );

create index project_messages_project_channel_idx
  on public.project_messages (project_id, channel, created_at desc);
