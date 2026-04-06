-- Create sprints table
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- Policies for sprints
CREATE POLICY "sprints_select_authenticated" ON public.sprints 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "sprints_insert_authenticated" ON public.sprints 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "sprints_update_authenticated" ON public.sprints 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "sprints_delete_authenticated" ON public.sprints 
  FOR DELETE TO authenticated USING (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS sprints_updated_at ON public.sprints;
CREATE TRIGGER sprints_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sprints_project_id ON public.sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(status);
