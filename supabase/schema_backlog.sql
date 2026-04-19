-- Schema for Backlog Module
-- Run this in your Supabase SQL Editor

-- 1. Create Clients Table
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    cnpj TEXT,
    segment TEXT,
    status TEXT DEFAULT 'PROSPECT',
    active_projects INTEGER DEFAULT 0,
    mrr TEXT DEFAULT 'R$ 0',
    contact TEXT,
    address TEXT,
    notes TEXT,
    team TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Contracts Table
CREATE TABLE public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    value TEXT DEFAULT 'R$ 0',
    status TEXT DEFAULT 'EM REVISAO',
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create ADM Tasks Table (Kanban)
CREATE TABLE public.adm_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    assignee TEXT,
    due_date TEXT,
    priority TEXT DEFAULT 'baixa',
    tag TEXT,
    status TEXT DEFAULT 'A FAZER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) configuration
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adm_tasks ENABLE ROW LEVEL SECURITY;

-- Allow public access for development (adjust later for production)
CREATE POLICY "Allow public select clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow public select contracts" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Allow public insert contracts" ON public.contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update contracts" ON public.contracts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete contracts" ON public.contracts FOR DELETE USING (true);

CREATE POLICY "Allow public select adm_tasks" ON public.adm_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert adm_tasks" ON public.adm_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update adm_tasks" ON public.adm_tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete adm_tasks" ON public.adm_tasks FOR DELETE USING (true);
