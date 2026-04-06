-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  stage TEXT,
  url TEXT,
  is_internal BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  responsible_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "projects_select_authenticated" ON public.projects 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "projects_insert_authenticated" ON public.projects 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "projects_update_authenticated" ON public.projects 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "projects_delete_authenticated" ON public.projects 
  FOR DELETE TO authenticated USING (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_responsible_id ON public.projects(responsible_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
