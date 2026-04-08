-- 1. Remove the auto-generated/incorrect policies 
-- (Note: Replace these names if they differ in your dashboard, or just use the UI to delete them)
drop policy if exists "Design bucket org scoped insert and select pr0nlh_0" on storage.objects;
drop policy if exists "Design bucket org scoped insert and select pr0nlh_1" on storage.objects;

-- 2. SELECT: Allow all Org members (including Clients) to view files
-- We check: 
-- a) The bucket is 'designs'
-- b) The first part of the file path matches the user's Clerk Org ID
create policy "designs_select_policy"
on storage.objects for select
to authenticated
using (
  bucket_id = 'designs' 
  and (storage.foldername(name))[1] = (auth.jwt() -> 'o' ->> 'id')
);

-- 3. INSERT: Only Admins and Team Members can upload
-- We check:
-- a) The bucket is 'designs'
-- b) The user's role is 'admin' or 'member'
-- c) The file path begins with their Org ID
create policy "designs_insert_policy"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'designs'
  and (auth.jwt() -> 'o' ->> 'rol') in ('admin', 'member')
  and (storage.foldername(name))[1] = (auth.jwt() -> 'o' ->> 'id')
);

-- 4. DELETE: Only Admins and Team Members can delete
create policy "designs_delete_policy"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'designs'
  and (auth.jwt() -> 'o' ->> 'rol') in ('admin', 'member')
  and (storage.foldername(name))[1] = (auth.jwt() -> 'o' ->> 'id')
);