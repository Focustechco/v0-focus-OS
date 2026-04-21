// Script para criar as tabelas da Agenda no Supabase
// Execute: node scripts/run-agenda-migration.js

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nmvupgurzfdwzsocsvyq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw'
)

async function runMigration() {
  console.log('🚀 Criando tabelas da Agenda...\n')

  // 1. Criar tabela eventos
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.eventos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        data DATE NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fim TIME,
        duracao_minutos INTEGER DEFAULT 60,
        tipo TEXT DEFAULT 'reuniao' CHECK (tipo IN ('reuniao', 'tarefa', 'lembrete', 'outro')),
        cor TEXT DEFAULT '#FF6B00',
        criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        google_event_id TEXT,
        sincronizado_google BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })

  if (e1) {
    // rpc exec_sql pode não existir — usar abordagem direta via fetch
    console.log('ℹ️  Usando abordagem alternativa via REST API...')
    await runViaMgmtApi()
    return
  }

  console.log('✅ Tabela eventos criada')
  process.exit(0)
}

async function runViaMgmtApi() {
  const PROJECT_REF = 'nmvupgurzfdwzsocsvyq'
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tdnVwZ3VyemZkd3pzb2NzdnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk0MzQ3NiwiZXhwIjoyMDkxNTE5NDc2fQ.N8-XT85QFolD8sQD0VzVm91Lv-BPi5-xc5eSSbo1emw'

  const sql = `
    -- Criação das tabelas da Agenda

    CREATE TABLE IF NOT EXISTS public.eventos (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT,
      data DATE NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT,
      duracao_minutos INTEGER DEFAULT 60,
      tipo TEXT DEFAULT 'reuniao',
      cor TEXT DEFAULT '#FF6B00',
      criado_por UUID,
      google_event_id TEXT,
      sincronizado_google BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.evento_membros (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      evento_id UUID REFERENCES public.eventos(id) ON DELETE CASCADE,
      usuario_id UUID,
      confirmado BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.google_tokens (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID UNIQUE,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS eventos_data_idx ON public.eventos(data);
    CREATE INDEX IF NOT EXISTS evento_membros_evento_idx ON public.evento_membros(evento_id);

    -- RLS
    ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.evento_membros ENABLE ROW LEVEL SECURITY;

    -- Políticas permissivas (ajuste conforme necessário)
    DROP POLICY IF EXISTS "eventos_select" ON public.eventos;
    CREATE POLICY "eventos_select" ON public.eventos FOR SELECT USING (true);

    DROP POLICY IF EXISTS "eventos_insert" ON public.eventos;
    CREATE POLICY "eventos_insert" ON public.eventos FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "eventos_update" ON public.eventos;
    CREATE POLICY "eventos_update" ON public.eventos FOR UPDATE USING (true);

    DROP POLICY IF EXISTS "eventos_delete" ON public.eventos;
    CREATE POLICY "eventos_delete" ON public.eventos FOR DELETE USING (true);

    DROP POLICY IF EXISTS "evento_membros_all" ON public.evento_membros;
    CREATE POLICY "evento_membros_all" ON public.evento_membros FOR ALL USING (true);
  `

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    })

    const result = await res.json()
    if (!res.ok) {
      console.error('❌ Erro via Management API:', result)
      console.log('\n📋 Execute manualmente no Supabase SQL Editor:')
      console.log('https://supabase.com/dashboard/project/nmvupgurzfdwzsocsvyq/sql\n')
      console.log(sql)
    } else {
      console.log('✅ Migração executada com sucesso via API!')
    }
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message)
  }
}

runMigration().catch(console.error)
