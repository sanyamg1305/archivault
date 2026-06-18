create table public.mood_board_items (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  organization_id text not null,
  room_id uuid references public.rooms(id) on delete set null,
  type text not null default 'image',   -- 'image' | 'link'
  image_url text,                        -- storage path in mood-board bucket
  link_url text,
  title text,
  notes text,
  added_by text not null,
  added_by_name text not null,
  created_at timestamptz default now() not null
);

create index mood_board_project_idx on public.mood_board_items (project_id);

create table public.project_signoffs (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  organization_id text not null,
  status text not null default 'pending',   -- 'pending' | 'signed'
  notes text,
  requested_at timestamptz default now() not null,
  requested_by text not null,
  requested_by_name text not null,
  signed_by_user_id text,
  signed_by_name text,
  signed_at timestamptz
);

create unique index signoffs_project_idx on public.project_signoffs (project_id);
