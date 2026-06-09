-- Add image_path column to materials
ALTER TABLE public.materials ADD COLUMN image_path text;

-- Storage bucket "materials" must be created in Supabase dashboard and set to PUBLIC.
-- Then apply these policies:

create policy "materials_image_select_policy"
on storage.objects for select
to authenticated
using (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = (auth.jwt() -> 'o' ->> 'id')
);

-- Both admins/members AND clients (any org member) can upload material images
create policy "materials_image_insert_policy"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = (auth.jwt() -> 'o' ->> 'id')
);

create policy "materials_image_delete_policy"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'materials'
  and (auth.jwt() -> 'o' ->> 'rol') in ('admin', 'member')
  and (storage.foldername(name))[1] = (auth.jwt() -> 'o' ->> 'id')
);
