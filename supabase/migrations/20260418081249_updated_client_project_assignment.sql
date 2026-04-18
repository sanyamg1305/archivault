-- 1. Add client_id column to projects
ALTER TABLE public.projects 
ADD COLUMN client_id text;

-- 2. Drop existing overly-permissive policy on projects
DROP POLICY IF EXISTS "View projects by org" ON public.projects;

-- 3. Create newly scoped RLS policies based on Clerk Tokens
-- Admins see all org projects; Members (Clients) only see their assigned project
CREATE POLICY "View projects by org and role" 
ON public.projects FOR SELECT 
USING (
  organization_id = (auth.jwt() ->> 'org_id')
  AND (
    (auth.jwt() ->> 'org_role') = 'org:admin' -- Architects see all
    OR 
    client_id = (auth.jwt() ->> 'sub')        -- Clients see their own
  )
);

-- We update child tables just in case they used to check only project's organization_id

-- Rooms
DROP POLICY IF EXISTS "View rooms by org" ON public.rooms;
CREATE POLICY "View rooms by org and role" 
ON public.rooms FOR SELECT 
USING ( 
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = rooms.project_id 
  ) 
);

-- Materials
DROP POLICY IF EXISTS "View materials by org" ON public.materials;
CREATE POLICY "View materials by org and role" 
ON public.materials FOR SELECT 
USING ( 
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = materials.project_id 
  ) 
);
