-- Trade workers directory (org-scoped)
create table public.trades (
  id              uuid default gen_random_uuid() primary key,
  organization_id text not null,
  name            text not null,
  trade_type      text not null,
  phone           text,
  email           text,
  notes           text,
  created_at      timestamptz default now() not null
);

-- Tasks assigned to trade workers per project
create table public.trade_tasks (
  id              uuid default gen_random_uuid() primary key,
  organization_id text not null,
  project_id      uuid references public.projects(id) on delete cascade not null,
  room_id         uuid references public.rooms(id) on delete set null,
  trade_id        uuid references public.trades(id) on delete set null,
  title           text not null,
  description     text,
  status          text default 'Pending' check (status in ('Pending', 'In Progress', 'Completed', 'On Hold')),
  due_date        date,
  created_by      text not null,
  created_at      timestamptz default now() not null,
  completed_at    timestamptz
);

alter table public.trades enable row level security;
alter table public.trade_tasks enable row level security;

-- Trades: org members only
create policy "trades_all" on public.trades for all to authenticated
  using ((auth.jwt() -> 'o' ->> 'id') = organization_id)
  with check ((auth.jwt() -> 'o' ->> 'id') = organization_id);

-- Trade tasks: org members only
create policy "trade_tasks_all" on public.trade_tasks for all to authenticated
  using ((auth.jwt() -> 'o' ->> 'id') = organization_id)
  with check ((auth.jwt() -> 'o' ->> 'id') = organization_id);

create index trade_tasks_project_idx on public.trade_tasks (project_id);
create index trade_tasks_trade_idx on public.trade_tasks (trade_id);
create index trades_org_idx on public.trades (organization_id);
