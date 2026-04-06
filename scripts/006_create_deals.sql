-- Create deals table (CRM pipeline)
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  responsible_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_priority BOOLEAN DEFAULT false,
  is_stalled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Policies for deals
CREATE POLICY "deals_select_authenticated" ON public.deals 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "deals_insert_authenticated" ON public.deals 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "deals_update_authenticated" ON public.deals 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "deals_delete_authenticated" ON public.deals 
  FOR DELETE TO authenticated USING (true);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS deals_updated_at ON public.deals;
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_responsible_id ON public.deals(responsible_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
