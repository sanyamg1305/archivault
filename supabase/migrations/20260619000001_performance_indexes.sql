-- Performance indexes for the most-queried columns
-- These were absent on the core tables since initial schema

-- projects: org lookup is the primary filter on every architect page
create index if not exists projects_org_idx
  on public.projects (organization_id, created_at desc);

-- rooms: always filtered by project
create index if not exists rooms_project_idx
  on public.rooms (project_id);

-- materials: filtered by project + status on dashboard, action center, and budget calc
create index if not exists materials_project_idx
  on public.materials (project_id, created_at desc);

create index if not exists materials_status_idx
  on public.materials (project_id, status);

-- designs: filtered by project on every designs page
create index if not exists designs_project_idx
  on public.designs (project_id, created_at desc);

create index if not exists designs_room_idx
  on public.designs (room_id);

-- design_versions: filtered by design_id (join) and by status (pending approvals query)
create index if not exists design_versions_design_idx
  on public.design_versions (design_id, version_number desc);

create index if not exists design_versions_status_idx
  on public.design_versions (status, created_at desc);

-- activity_logs: filtered by project, ordered by time — this is queried on every dashboard/portal load
create index if not exists activity_logs_project_idx
  on public.activity_logs (project_id, created_at desc);

-- project_milestones: ordered by sort_order within a project
create index if not exists milestones_project_sort_idx
  on public.project_milestones (project_id, sort_order);

-- site_visits: ordered by visit_date within a project
create index if not exists site_visits_project_date_idx
  on public.site_visits (project_id, visit_date desc);

-- mood_board_items: filtered by project
create index if not exists mood_board_project_room_idx
  on public.mood_board_items (project_id, room_id);

-- project_signoffs: unique lookup by project (already has unique index but add for query planner)
create index if not exists signoffs_project_status_idx
  on public.project_signoffs (project_id, status);
