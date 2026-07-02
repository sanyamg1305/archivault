-- Project members: tracks which org:architect users are assigned to which projects.
-- org:admin users have full access to all projects and don't need a row here.

create table if not exists project_members (
  id               uuid        primary key default gen_random_uuid(),
  project_id       uuid        not null references projects(id) on delete cascade,
  user_id          text        not null,
  organization_id  text        not null,
  assigned_at      timestamptz not null default now(),
  unique(project_id, user_id)
);

create index if not exists project_members_project_id_idx on project_members(project_id);
create index if not exists project_members_user_id_idx    on project_members(user_id);
create index if not exists project_members_org_id_idx     on project_members(organization_id);
