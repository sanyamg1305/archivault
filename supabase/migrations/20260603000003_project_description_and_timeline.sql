ALTER TABLE public.projects
  ADD COLUMN description text,
  ADD COLUMN start_date date,
  ADD COLUMN target_date date,
  ADD COLUMN phase text DEFAULT 'Design'
    CHECK (phase IN ('Design', 'Procurement', 'Execution', 'Complete'));
