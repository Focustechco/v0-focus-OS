-- Schema for sprints table mapping to projects

CREATE TABLE public.sprints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    projeto_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    objetivo TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status TEXT DEFAULT 'ativa' CHECK(status IN ('ativa', 'concluida', 'cancelada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Row Level Security (RLS) configuration
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- Allow public access for development (adjust later for production)
CREATE POLICY "Allow public select sprints" ON public.sprints FOR SELECT USING (true);
CREATE POLICY "Allow public insert sprints" ON public.sprints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sprints" ON public.sprints FOR UPDATE USING (true);
CREATE POLICY "Allow public delete sprints" ON public.sprints FOR DELETE USING (true);
