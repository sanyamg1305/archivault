-- Replace clerk_user_id with username/password auth (no Clerk needed for trade workers)
alter table public.trades drop column if exists clerk_user_id;
alter table public.trades add column if not exists username text unique;
alter table public.trades add column if not exists password_hash text;
create index if not exists trades_username_idx on public.trades (username);
