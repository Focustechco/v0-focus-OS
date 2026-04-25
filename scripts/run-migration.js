// Executa DDL no Supabase via endpoint pg/query
const SUPABASE_URL = 'https://nmvupgurzfdwzsocsvyq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw';

const SQL = `
create table if not exists clickup_tasks_cache (
  id text primary key,
  list_id text,
  folder_id text,
  space_id text,
  name text not null,
  status text,
  priority text,
  assignees jsonb default '[]'::jsonb,
  due_date timestamptz,
  start_date timestamptz,
  tags jsonb default '[]'::jsonb,
  custom_fields jsonb default '{}'::jsonb,
  parent_id text,
  raw jsonb,
  synced_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists clickup_lists_cache (
  id text primary key,
  folder_id text,
  space_id text,
  name text not null,
  status text,
  start_date timestamptz,
  due_date timestamptz,
  raw jsonb,
  synced_at timestamptz default now()
);

create table if not exists sync_logs (
  id uuid primary key default gen_random_uuid(),
  source text default 'clickup',
  status text check (status in ('success','error')) not null,
  message text,
  synced_at timestamptz default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  clickup_task_id text,
  project_name text not null default 'default',
  requested_by uuid,
  reviewed_by uuid,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_clickup_tasks_list_id on clickup_tasks_cache(list_id);
create index if not exists idx_clickup_tasks_space_id on clickup_tasks_cache(space_id);
create index if not exists idx_approvals_status on approvals(status);
create index if not exists idx_sync_logs_synced_at on sync_logs(synced_at desc);
`;

async function run() {
  // Try the Supabase SQL execution via the management API
  // Method 1: Use rpc to create a helper function first
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    db: { schema: 'public' }
  });

  // Split SQL into individual statements and execute via rpc
  const statements = SQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
  
  console.log(`Executando ${statements.length} statements via Supabase...`);
  
  // First, try to create a helper function via raw SQL
  // Supabase doesn't expose DDL via REST, so we need a workaround
  // Let's create the function via the SQL endpoint
  
  const PROJECT_REF = 'nmvupgurzfdwzsocsvyq';
  
  // Try the Supabase Management API (requires access token, not service key)
  // Alternatively, use the pg endpoint
  const pgRes = await fetch(`${SUPABASE_URL}/pg`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  });
  
  if (pgRes.ok) {
    console.log('✅ Migration executada com sucesso!');
    return;
  }
  
  console.log('Endpoint /pg retornou:', pgRes.status);
  
  // Fallback: try to create tables one by one via raw fetch to the REST API
  // This won't work for DDL, so let's just verify and instruct
  console.log('\n⚠️  O Supabase REST API não suporta DDL (CREATE TABLE) diretamente.');
  console.log('👉 Execute o SQL manualmente no Supabase Dashboard:');
  console.log(`   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  console.log('\n📋 O SQL está no arquivo: supabase/migrations/20260424_projetos_clickup.sql');
  
  // But let's check if maybe the tables already exist from a previous migration attempt
  console.log('\n🔍 Verificando estado atual das tabelas...');
  
  for (const table of ['clickup_tasks_cache', 'clickup_lists_cache', 'approvals', 'sync_logs']) {
    const { error } = await supabase.from(table).select('*').limit(0);
    if (error) {
      console.log(`  ❌ ${table} — NÃO existe`);
    } else {
      console.log(`  ✅ ${table} — OK`);
    }
  }
}

run().catch(console.error);
