-- 1. Tabela Base: Equipe (Membras da Equipe)
-- Caso já exista 'profiles', vamos assegurar que 'equipe' seja uma visão ou tabela compatível
CREATE TABLE IF NOT EXISTS public.equipe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'colaborador', -- admin, colaborador, estagiario
    departamento TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela: Registro de Ponto
CREATE TABLE IF NOT EXISTS public.registros_ponto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.equipe(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- entrada, saida
    foto_url TEXT NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela: Conteúdos
CREATE TABLE IF NOT EXISTS public.conteudos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT NOT NULL, -- ebook, playbook, treinamento, documento
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    categoria TEXT,
    criado_por UUID REFERENCES public.equipe(id),
    publico BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela: Acessos & Plataformas
CREATE TABLE IF NOT EXISTS public.acessos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    url TEXT NOT NULL,
    icone_url TEXT,
    categoria TEXT NOT NULL, -- plataforma_interna, plataforma_focus, projeto_cliente
    projeto_id UUID, -- Opcional: FK para projetos.id se disponível
    descricao TEXT,
    criado_por UUID REFERENCES public.equipe(id),
    visivel_para UUID[] DEFAULT '{}', -- Array de equipe.id
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela: Tarefas do Dia
CREATE TABLE IF NOT EXISTS public.tarefas_dia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    atribuido_para UUID NOT NULL REFERENCES public.equipe(id) ON DELETE CASCADE,
    atribuido_por UUID NOT NULL REFERENCES public.equipe(id),
    data DATE DEFAULT CURRENT_DATE,
    concluida BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conteudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_dia ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS Básicas (Exemplos)
CREATE POLICY "Leitura Geral Equipe" ON public.equipe FOR SELECT USING (true);
CREATE POLICY "Apenas próprio usuário gerencia seu ponto" ON public.registros_ponto FOR ALL USING (auth.uid() IN (SELECT usuario_id FROM public.equipe WHERE id = public.registros_ponto.usuario_id));
CREATE POLICY "Conteúdos públicos visíveis" ON public.conteudos FOR SELECT USING (publico = true);
CREATE POLICY "Tarefas visíveis para o dono" ON public.tarefas_dia FOR ALL USING (auth.uid() IN (SELECT usuario_id FROM public.equipe WHERE id = public.tarefas_dia.atribuido_para));

-- Buckets de Storage
-- Sugestão de criação manual no painel: 'registros-ponto' (público: false)
-- Se puder via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('registros-ponto', 'registros-ponto', true);
