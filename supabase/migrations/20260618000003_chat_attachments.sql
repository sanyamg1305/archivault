alter table public.project_messages
  add column if not exists message_type text not null default 'text',
  add column if not exists image_url text,
  add column if not exists attachment jsonb;
