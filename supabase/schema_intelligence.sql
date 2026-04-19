-- Intelligence Center Schema & RPCs

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.equipe (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    setor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tarefas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    status TEXT DEFAULT 'em_andamento', 
    responsavel_id UUID REFERENCES public.equipe(id) ON DELETE SET NULL,
    prazo DATE,
    projeto_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.aprovacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    projeto_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.relatorios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    projeto_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    periodo_inicio DATE,
    periodo_fim DATE,
    tipo TEXT,
    observacoes TEXT,
    status TEXT DEFAULT 'rascunho',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aprovacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all equipe" ON public.equipe FOR ALL USING (true);
CREATE POLICY "Allow public all tarefas" ON public.tarefas FOR ALL USING (true);
CREATE POLICY "Allow public all aprovacoes" ON public.aprovacoes FOR ALL USING (true);
CREATE POLICY "Allow public all relatorios" ON public.relatorios FOR ALL USING (true);

-- 2. Create RPC Functions for Metrics

-- 2.1 Projetos Ativos
CREATE OR REPLACE FUNCTION get_active_projects_kpi()
RETURNS TABLE (count BIGINT, change BIGINT) AS $$
DECLARE
    curr_count BIGINT;
    prev_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO curr_count FROM public.projects WHERE status != 'concluida';
    SELECT COUNT(*) INTO prev_count FROM public.projects WHERE created_at < date_trunc('month', now()) AND status != 'concluida';
    RETURN QUERY SELECT curr_count, curr_count - prev_count;
END;
$$ LANGUAGE plpgsql;

-- 2.2 Tasks Concluidas 
CREATE OR REPLACE FUNCTION get_completed_tasks_kpi()
RETURNS TABLE (count BIGINT, change BIGINT) AS $$
DECLARE
    curr_count BIGINT;
    prev_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO curr_count FROM public.tarefas WHERE status = 'concluida' AND updated_at >= date_trunc('month', now());
    SELECT COUNT(*) INTO prev_count FROM public.tarefas WHERE status = 'concluida' AND updated_at >= date_trunc('month', now() - INTERVAL '1 month') AND updated_at < date_trunc('month', now());
    RETURN QUERY SELECT curr_count, curr_count - prev_count;
END;
$$ LANGUAGE plpgsql;

-- 2.3 Sprints Ativas
CREATE OR REPLACE FUNCTION get_active_sprints_kpi()
RETURNS BIGINT AS $$
  SELECT COUNT(*) FROM public.sprints WHERE status = 'ativa' AND data_inicio <= now()::date AND data_fim >= now()::date;
$$ LANGUAGE sql;

-- 2.4 Taxa de Entrega
CREATE OR REPLACE FUNCTION get_delivery_rate_kpi()
RETURNS NUMERIC AS $$
DECLARE
    total_concluidas BIGINT;
    no_prazo BIGINT;
BEGIN
    SELECT COUNT(*) INTO total_concluidas FROM public.tarefas WHERE status = 'concluida' AND updated_at >= date_trunc('month', now());
    
    IF total_concluidas = 0 THEN
        RETURN 0;
    END IF;

    SELECT COUNT(*) INTO no_prazo FROM public.tarefas WHERE status = 'concluida' AND updated_at >= date_trunc('month', now()) AND (prazo IS NULL OR updated_at::date <= prazo);

    RETURN ROUND((no_prazo::NUMERIC / total_concluidas::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- 2.5 Projetos por Etapa
CREATE OR REPLACE FUNCTION get_projects_by_stage_stats()
RETURNS TABLE (etapa TEXT, total BIGINT) AS $$
    SELECT stage as etapa, COUNT(*) as total FROM public.projects GROUP BY stage;
$$ LANGUAGE sql;

-- 2.6 Performance por Setor
CREATE OR REPLACE FUNCTION get_sector_performance_stats()
RETURNS TABLE (setor TEXT, concluidas BIGINT, total BIGINT) AS $$
    SELECT 
        e.setor, 
        COUNT(*) FILTER (WHERE t.status = 'concluida') as concluidas, 
        COUNT(*) as total 
    FROM public.tarefas t 
    JOIN public.equipe e ON t.responsavel_id = e.id 
    GROUP BY e.setor;
$$ LANGUAGE sql;

-- 2.7 Alertas de Projetos (Prazo proximo)
CREATE OR REPLACE FUNCTION get_project_alerts()
RETURNS TABLE (nome TEXT, prazo TEXT) AS $$
    SELECT name as nome, deadline as prazo 
    FROM public.projects 
    WHERE deadline IS NOT NULL 
    AND deadline != '' 
    AND (
      -- Tenta converter a string de data (assumindo que seja aceitavel, ou comparando diretamente via engine se a mascara for padronizada YYYY-MM-DD.
      -- Se falhar o ::date por string invalida, no Supabase ideal seria q deadline fosse DATE, mas vimos que na UI ele e TEXT as vezes.
      -- O codigo abaixo faz safe coercing ou ignora e resolve via string ordering limit
      TRY_CAST(deadline AS DATE) BETWEEN now()::date AND now()::date + interval '7 days'
    )
    AND status != 'concluido';
$$ LANGUAGE sql;
-- Funcao utilitaria para TRY_CAST
CREATE OR REPLACE FUNCTION TRY_CAST(p_in text, p_out date) RETURNS date AS $$
BEGIN
   RETURN p_in::date;
EXCEPTION WHEN others THEN
   RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update get_project_alerts to use try_cast properly (PostgreSQL hack for safe cast)
CREATE OR REPLACE FUNCTION get_project_alerts()
RETURNS TABLE (nome TEXT, prazo TEXT) AS $$
    SELECT name as nome, deadline as prazo 
    FROM public.projects 
    WHERE deadline IS NOT NULL 
    AND deadline != '' 
    AND TRY_CAST(deadline, NULL::date) BETWEEN now()::date AND now()::date + interval '7 days'
    AND status != 'concluida';
$$ LANGUAGE sql;


-- 2.8 Alertas de Tarefas (Bloqueada ou atrasada)
CREATE OR REPLACE FUNCTION get_task_alerts()
RETURNS TABLE (titulo TEXT, dias_parada INT, tipo TEXT) AS $$
    SELECT 
        titulo, 
        EXTRACT(DAY FROM now() - updated_at)::INT as dias_parada,
        status as tipo
    FROM public.tarefas 
    WHERE status = 'bloqueada' 
       OR (status = 'em_andamento' AND updated_at < now() - interval '2 days');
$$ LANGUAGE sql;

-- 2.9 Alertas de Aprovacoes
CREATE OR REPLACE FUNCTION get_approvals_alert()
RETURNS BIGINT AS $$
    SELECT COUNT(*) FROM public.aprovacoes WHERE status = 'pendente';
$$ LANGUAGE sql;
