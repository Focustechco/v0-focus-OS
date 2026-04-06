-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies for clients (all authenticated users can read, only admins/managers can modify)
CREATE POLICY "clients_select_authenticated" ON public.clients 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "clients_insert_authenticated" ON public.clients 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "clients_update_authenticated" ON public.clients 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "clients_delete_authenticated" ON public.clients 
  FOR DELETE TO authenticated USING (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS clients_updated_at ON public.clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
