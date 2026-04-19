-- Adicao de Colunas Avancadas na Tabela Relatorios

ALTER TABLE public.relatorios 
  ADD COLUMN IF NOT EXISTS codigo TEXT,
  ADD COLUMN IF NOT EXISTS resumo_executivo TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS etapa_atual TEXT,
  ADD COLUMN IF NOT EXISTS progresso INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saude TEXT DEFAULT 'no_prazo',
  ADD COLUMN IF NOT EXISTS entrega_prevista DATE,
  ADD COLUMN IF NOT EXISTS contexto_status TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
