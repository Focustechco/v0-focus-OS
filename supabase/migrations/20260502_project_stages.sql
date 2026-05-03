-- =============================================
-- MIGRATION: Project Stages (Pipeline de Etapas)
-- Execute no Supabase SQL Editor
-- =============================================

-- Tabela principal de etapas do projeto
CREATE TABLE IF NOT EXISTS public.project_stages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  name varchar(100) NOT NULL,
  description text,
  status varchar(20) DEFAULT 'pending'
    CHECK (status IN ('done', 'active', 'pending', 'blocked')),
  responsible_id uuid,
  due_date date,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_project_stages_project
  ON public.project_stages(project_id, order_index);

-- Adicionar coluna stage_id na tabela tarefas (para vincular tasks a etapas)
ALTER TABLE public.tarefas
  ADD COLUMN IF NOT EXISTS stage_id uuid REFERENCES public.project_stages(id) ON DELETE SET NULL;

-- Habilitar RLS
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Acesso total a project_stages para autenticados" ON public.project_stages;
CREATE POLICY "Acesso total a project_stages para autenticados"
ON public.project_stages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ativar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_stages;
