-- Drop FK constraint on design_versions.created_by so Clerk user IDs
-- can be stored directly without needing a matching profiles row.
alter table public.design_versions
  drop constraint if exists design_versions_created_by_fkey;
