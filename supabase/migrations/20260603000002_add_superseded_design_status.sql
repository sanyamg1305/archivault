ALTER TABLE public.design_versions
  DROP CONSTRAINT IF EXISTS design_versions_status_check;

ALTER TABLE public.design_versions
  ADD CONSTRAINT design_versions_status_check
  CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Revision Requested', 'Superseded'));
