-- Migration: ClickUp Integration & Approvals Module

-- 1. ClickUp Tasks Cache
create table if not exists public.clickup_tasks_cache (
  id text primary key,           -- task id do ClickUp
  list_id text,
  sprint_id text,
  name text,
  status text,
  priority text,
  assignees jsonb,
  due_date timestamptz,
  custom_fields jsonb,
  raw jsonb,                     -- payload completo
  synced_at timestamptz default now()
);

-- Enable Realtime
alter publication supabase_realtime add table clickup_tasks_cache;

-- 2. Approvals (Dados proprietários)
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  clickup_task_id text references clickup_tasks_cache(id),
  project_id text,
  requested_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  status text check (status in ('pending','approved','rejected')) default 'pending',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Realtime
alter publication supabase_realtime add table approvals;

-- 3. Sync Logs
create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  external_id text,
  source text,
  status text,
  payload jsonb,
  created_at timestamptz default now()
);

-- Index for performance
create index if not exists idx_clickup_tasks_list_id on clickup_tasks_cache(list_id);
create index if not exists idx_approvals_task_id on approvals(clickup_task_id);
create index if not exists idx_approvals_status on approvals(status);
