CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Master Toggles for Channels
  channel_app boolean DEFAULT true,
  channel_email boolean DEFAULT true,
  channel_push boolean DEFAULT false,
  channel_webhook boolean DEFAULT false,
  
  -- Webhook Settings
  webhook_url text,
  
  -- Events Toggles (Nova Task)
  event_nova_task_app boolean DEFAULT true,
  event_nova_task_email boolean DEFAULT true,
  event_nova_task_push boolean DEFAULT false,
  event_nova_task_webhook boolean DEFAULT false,
  
  -- Events Toggles (Task Concluída)
  event_task_concluida_app boolean DEFAULT true,
  event_task_concluida_email boolean DEFAULT false,
  event_task_concluida_push boolean DEFAULT false,
  event_task_concluida_webhook boolean DEFAULT false,
  
  -- Events Toggles (Sprint Iniciada)
  event_sprint_iniciada_app boolean DEFAULT true,
  event_sprint_iniciada_email boolean DEFAULT false,
  event_sprint_iniciada_push boolean DEFAULT false,
  event_sprint_iniciada_webhook boolean DEFAULT false,
  
  -- Events Toggles (Sprint Encerrada)
  event_sprint_encerrada_app boolean DEFAULT true,
  event_sprint_encerrada_email boolean DEFAULT true,
  event_sprint_encerrada_push boolean DEFAULT false,
  event_sprint_encerrada_webhook boolean DEFAULT false,
  
  -- Events Toggles (Novo Deal)
  event_novo_deal_app boolean DEFAULT true,
  event_novo_deal_email boolean DEFAULT true,
  event_novo_deal_push boolean DEFAULT false,
  event_novo_deal_webhook boolean DEFAULT false,

  -- Events Toggles (Deal Aprovado)
  event_deal_aprovado_app boolean DEFAULT true,
  event_deal_aprovado_email boolean DEFAULT true,
  event_deal_aprovado_push boolean DEFAULT false,
  event_deal_aprovado_webhook boolean DEFAULT false,
  
  -- Events Toggles (Contrato Pendente)
  event_contrato_pendente_app boolean DEFAULT true,
  event_contrato_pendente_email boolean DEFAULT true,
  event_contrato_pendente_push boolean DEFAULT false,
  event_contrato_pendente_webhook boolean DEFAULT false,
  
  -- Events Toggles (Novo Membro)
  event_novo_membro_app boolean DEFAULT true,
  event_novo_membro_email boolean DEFAULT false,
  event_novo_membro_push boolean DEFAULT false,
  event_novo_membro_webhook boolean DEFAULT false,

  -- Events Toggles (Sistema Offline)
  event_sistema_offline_app boolean DEFAULT true,
  event_sistema_offline_email boolean DEFAULT true,
  event_sistema_offline_push boolean DEFAULT true,
  event_sistema_offline_webhook boolean DEFAULT true,

  -- Events Toggles (Backup Concluído)
  event_backup_concluido_app boolean DEFAULT true,
  event_backup_concluido_email boolean DEFAULT true,
  event_backup_concluido_push boolean DEFAULT false,
  event_backup_concluido_webhook boolean DEFAULT false,

  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" 
  ON public.notification_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
  ON public.notification_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
  ON public.notification_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- Push Tokens Table
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL UNIQUE,
  platform text, -- 'web', 'android', 'ios'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id);
