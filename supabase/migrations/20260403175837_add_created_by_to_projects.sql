-- Add the missing created_by column to projects
alter table public.projects 
add column if not exists created_by text references public.profiles(id);

-- Optional: Update the RLS policy to allow the creator to manage it
create policy "Users can update their own projects"
on public.projects for update
to authenticated
using ( (select auth.jwt() ->> 'sub') = created_by );