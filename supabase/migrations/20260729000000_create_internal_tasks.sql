-- Create Internal Tasks table for project team member assignments
create table if not exists public.internal_tasks (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    organization_id text not null,
    title text not null,
    description text,
    assigned_to text not null, -- Clerk user ID of the team member (architect/admin)
    assigned_to_name text not null, -- Display name of the team member
    status text not null default 'Pending' check (status in ('Pending', 'In Progress', 'Completed', 'On Hold')),
    due_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by text not null -- Clerk user ID of the creator
);

-- Enable Row Level Security (RLS)
alter table public.internal_tasks enable row level security;

-- Drop policy if exists
drop policy if exists "internal_tasks_org_policy" on public.internal_tasks;

-- Add RLS Policy to restrict access to authenticated members of the same organization
create policy "internal_tasks_org_policy"
on public.internal_tasks
to authenticated
using (
    organization_id = (auth.jwt() -> 'o' ->> 'id')
)
with check (
    organization_id = (auth.jwt() -> 'o' ->> 'id')
);
