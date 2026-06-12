-- Link trade workers to their Clerk user account (set on first portal login)
alter table public.trades add column if not exists clerk_user_id text unique;
create index if not exists trades_clerk_user_idx on public.trades (clerk_user_id);

-- Allow trade workers to read their own tasks via service role (no RLS needed for portal — we use service role client)
-- The portal server actions authenticate via Clerk then look up by clerk_user_id
