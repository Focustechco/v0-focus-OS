-- =============================================
-- MIGRATION: ClickUp Integration & Approvals
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. Cache das tarefas vindas do ClickUp
create table if not exists clickup_tasks_cache (
  id            text primary key,
  list_id       text,
  folder_id     text,
  space_id      text,
  name          text not null,
  status        text,
  priority      text,
  assignees     jsonb default '[]',
  due_date      timestamptz,
  start_date    timestamptz,
  tags          jsonb default '[]',
  custom_fields jsonb default '{}',
  parent_id     text,
  raw           jsonb,
  synced_at     timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. Cache de listas/sprints do ClickUp
create table if not exists clickup_lists_cache (
  id          text primary key,
  folder_id   text,
  space_id    text,
  name        text not null,
  status      text,
  start_date  timestamptz,
  due_date    timestamptz,
  raw         jsonb,
  synced_at   timestamptz default now()
);

-- 3. Aprovações (dado proprietário — não vem do ClickUp)
create table if not exists approvals (
  id               uuid primary key default gen_random_uuid(),
  clickup_task_id  text references clickup_tasks_cache(id) on delete set null,
  project_name     text not null,
  requested_by     uuid references auth.users(id),
  reviewed_by      uuid references auth.users(id),
  status           text check (status in ('pending','approved','rejected')) default 'pending',
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- 4. Log da última sincronização
create table if not exists sync_logs (
  id        uuid primary key default gen_random_uuid(),
  source    text default 'clickup',
  status    text check (status in ('success','error')) not null,
  message   text,
  synced_at timestamptz default now()
);

-- Indexes
create index if not exists idx_clickup_tasks_list_id on clickup_tasks_cache(list_id);
create index if not exists idx_clickup_tasks_space_id on clickup_tasks_cache(space_id);
create index if not exists idx_approvals_status on approvals(status);
create index if not exists idx_sync_logs_synced_at on sync_logs(synced_at desc);

-- Habilitar Realtime
alter publication supabase_realtime add table clickup_tasks_cache;
alter publication supabase_realtime add table clickup_lists_cache;
alter publication supabase_realtime add table approvals;
