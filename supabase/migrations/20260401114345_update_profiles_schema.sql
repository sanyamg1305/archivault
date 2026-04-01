-- Add role and avatar_url to profiles
alter table public.profiles 
add column if not exists avatar_url text,
add column if not exists role text check (role in ('admin', 'team_member', 'client')) default 'team_member';

-- Create a helper table for Organization Memberships
-- This helps us track which user belongs to which Org and their role there
create table public.organization_memberships (
  id text primary key, -- Clerk Membership ID
  organization_id text not null,
  user_id text references public.profiles(id) on delete cascade not null,
  role text not null,
  created_at timestamp with time zone default now() not null
);

alter table public.organization_memberships enable row level security;

-- RLS: Users can see memberships in their own organization
create policy "View memberships by org" 
on public.organization_memberships for select 
using ( organization_id = (auth.jwt() ->> 'org_id') );