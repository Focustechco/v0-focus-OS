-- =====================================================
-- COMERCIAL / CRM MODULE SCHEMA
-- =====================================================

-- 1. Tabela de Leads (integrada ao ClickUp)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clickup_id TEXT UNIQUE,
    nome TEXT NOT NULL,
    valor DECIMAL(12,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'prospect',
    origem TEXT,
    fechado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    responsavel_id UUID REFERENCES public.equipe(id) ON DELETE SET NULL
);

-- 2. Tabela de Atividades Comerciais
CREATE TABLE IF NOT EXISTS public.atividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'contato', 'reuniao', 'proposta'
    status TEXT DEFAULT 'agendada',
    responsavel_setor TEXT, -- 'sdr', 'closer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabela de Notificações (Realtime)
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT, -- projeto, tarefa, sprint, aprovacao, backlog, comercial
    referencia_id UUID,
    referencia_tipo TEXT,
    lida BOOLEAN DEFAULT false,
    usuario_id UUID REFERENCES public.equipe(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Adicionar campo 'cargo' na tabela equipe se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='equipe' AND column_name='cargo') THEN
        ALTER TABLE public.equipe ADD COLUMN cargo TEXT;
    END IF;
END $$;

-- 5. RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow public all atividades" ON public.atividades FOR ALL USING (true);
CREATE POLICY "Allow public all notificacoes" ON public.notificacoes FOR ALL USING (true);

-- 6. RPC para Meta Comercial (Exemplo de valor fixo configurado via SQL)
CREATE OR REPLACE FUNCTION get_comercial_metas()
RETURNS JSONB AS $$
BEGIN
    RETURN '{"meta_leads": 50, "meta_vendas": 100000, "meta_fechamentos": 10}'::JSONB;
END;
$$ LANGUAGE plpgsql;
