-- =============================================
-- MIGRATION: Integrations (Tokens, Configs, Logs)
-- Execute no Supabase SQL Editor
-- =============================================

-- Tokens de integração por usuário:
CREATE TABLE IF NOT EXISTS public.integration_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid, -- Remover a constraint temporariamente se teams nao existir de forma direta ou for tratado pelo app
  service varchar(50),   -- 'clickup'|'google_calendar'|'google_drive'
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  connected_at timestamptz DEFAULT now(),
  last_sync_at timestamptz,
  sync_frequency int DEFAULT 15,  -- minutos
  metadata jsonb DEFAULT '{}'     -- configs específicas
);

-- Config de mapeamentos por integração:
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid,
  service varchar(50),
  config_key varchar(100),
  config_value text,
  updated_at timestamptz DEFAULT now()
);

-- Log de sincronizações:
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service varchar(50),
  team_id uuid,
  status varchar(20),    -- 'success'|'error'|'partial'
  records_synced int DEFAULT 0,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz
);

-- Habilitar RLS
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas (temporárias para desenvolvimento)
DROP POLICY IF EXISTS "Acesso total a integration_tokens para autenticados" ON public.integration_tokens;
CREATE POLICY "Acesso total a integration_tokens para autenticados"
ON public.integration_tokens
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a integration_configs para autenticados" ON public.integration_configs;
CREATE POLICY "Acesso total a integration_configs para autenticados"
ON public.integration_configs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a integration_sync_logs para autenticados" ON public.integration_sync_logs;
CREATE POLICY "Acesso total a integration_sync_logs para autenticados"
ON public.integration_sync_logs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
