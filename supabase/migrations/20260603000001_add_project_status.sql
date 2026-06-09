ALTER TABLE public.projects
  ADD COLUMN status text NOT NULL DEFAULT 'Active'
  CHECK (status IN ('Active', 'On Hold', 'Completed'));
