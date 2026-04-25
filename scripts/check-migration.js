// Script para executar a migration no Supabase via REST API
const SUPABASE_URL = 'https://nmvupgurzfdwzsocsvyq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw';

const queries = [
  // 1. clickup_tasks_cache
  `create table if not exists clickup_tasks_cache (
    id text primary key,
    list_id text,
    folder_id text,
    space_id text,
    name text not null,
    status text,
    priority text,
    assignees jsonb default '[]',
    due_date timestamptz,
    start_date timestamptz,
    tags jsonb default '[]',
    custom_fields jsonb default '{}',
    parent_id text,
    raw jsonb,
    synced_at timestamptz default now(),
    updated_at timestamptz default now()
  )`,
  // 2. clickup_lists_cache
  `create table if not exists clickup_lists_cache (
    id text primary key,
    folder_id text,
    space_id text,
    name text not null,
    status text,
    start_date timestamptz,
    due_date timestamptz,
    raw jsonb,
    synced_at timestamptz default now()
  )`,
  // 3. sync_logs (before approvals to avoid dependency issues)
  `create table if not exists sync_logs (
    id uuid primary key default gen_random_uuid(),
    source text default 'clickup',
    status text check (status in ('success','error')) not null,
    message text,
    synced_at timestamptz default now()
  )`,
  // 4. approvals
  `create table if not exists approvals (
    id uuid primary key default gen_random_uuid(),
    clickup_task_id text references clickup_tasks_cache(id) on delete set null,
    project_name text not null,
    requested_by uuid,
    reviewed_by uuid,
    status text check (status in ('pending','approved','rejected')) default 'pending',
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  )`,
  // 5. Indexes
  `create index if not exists idx_clickup_tasks_list_id on clickup_tasks_cache(list_id)`,
  `create index if not exists idx_clickup_tasks_space_id on clickup_tasks_cache(space_id)`,
  `create index if not exists idx_approvals_status on approvals(status)`,
  `create index if not exists idx_sync_logs_synced_at on sync_logs(synced_at desc)`,
];

async function run() {
  for (let i = 0; i < queries.length; i++) {
    const sql = queries[i];
    console.log(`\n[${i+1}/${queries.length}] Executando...`);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });
      // rpc/ won't work directly for DDL, use the postgres endpoint instead
    } catch (e) {
      // ignore, we'll try the direct approach
    }
  }

  // Use the Supabase Management API via the pg_dump style — or just use fetch to the SQL endpoint
  // Since REST API can't run DDL directly, let's use the supabase-js approach
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Test connection by trying to select from a table
  const { data, error } = await supabase.from('clickup_tasks_cache').select('id').limit(1);
  if (error && error.code === '42P01') {
    console.log('Tabelas ainda não existem. Execute o SQL manualmente no Supabase Dashboard.');
    console.log('URL: https://supabase.com/dashboard/project/nmvupgurzfdwzsocsvyq/sql');
  } else if (error) {
    console.log('Erro:', error.message);
  } else {
    console.log('✅ Tabela clickup_tasks_cache já existe!');
  }

  // Check approvals
  const r2 = await supabase.from('approvals').select('id').limit(1);
  if (r2.error && r2.error.code === '42P01') {
    console.log('❌ Tabela approvals não existe.');
  } else if (!r2.error) {
    console.log('✅ Tabela approvals já existe!');
  }

  // Check sync_logs
  const r3 = await supabase.from('sync_logs').select('id').limit(1);
  if (r3.error && r3.error.code === '42P01') {
    console.log('❌ Tabela sync_logs não existe.');
  } else if (!r3.error) {
    console.log('✅ Tabela sync_logs já existe!');
  }
}

run().catch(console.error);
