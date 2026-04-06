-- Create approvals table
CREATE TABLE IF NOT EXISTS public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approvals_select_authenticated" ON public.approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "approvals_insert_authenticated" ON public.approvals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "approvals_update_authenticated" ON public.approvals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "approvals_delete_authenticated" ON public.approvals FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS approvals_updated_at ON public.approvals;
CREATE TRIGGER approvals_updated_at BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'meeting',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  attendees UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_events_select_authenticated" ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "calendar_events_insert_authenticated" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "calendar_events_update_authenticated" ON public.calendar_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "calendar_events_delete_authenticated" ON public.calendar_events FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_dismissed BOOLEAN DEFAULT false,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_select_own" ON public.alerts FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "alerts_insert_authenticated" ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "alerts_update_own" ON public.alerts FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "alerts_delete_own" ON public.alerts FOR DELETE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

-- Create checklists table
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklists_select_authenticated" ON public.checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "checklists_insert_authenticated" ON public.checklists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "checklists_update_authenticated" ON public.checklists FOR UPDATE TO authenticated USING (true);
CREATE POLICY "checklists_delete_authenticated" ON public.checklists FOR DELETE TO authenticated USING (true);

-- Create project_links table
CREATE TABLE IF NOT EXISTS public.project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  username TEXT,
  password_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_links_select_authenticated" ON public.project_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "project_links_insert_authenticated" ON public.project_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "project_links_update_authenticated" ON public.project_links FOR UPDATE TO authenticated USING (true);
CREATE POLICY "project_links_delete_authenticated" ON public.project_links FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS project_links_updated_at ON public.project_links;
CREATE TRIGGER project_links_updated_at BEFORE UPDATE ON public.project_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'approved', 'rejected')),
  due_date DATE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deliveries_select_authenticated" ON public.deliveries FOR SELECT TO authenticated USING (true);
CREATE POLICY "deliveries_insert_authenticated" ON public.deliveries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "deliveries_update_authenticated" ON public.deliveries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "deliveries_delete_authenticated" ON public.deliveries FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS deliveries_updated_at ON public.deliveries;
CREATE TRIGGER deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_select_authenticated" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert_authenticated" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS comments_updated_at ON public.comments;
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#f97316',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_select_authenticated" ON public.tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "tags_insert_authenticated" ON public.tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tags_update_authenticated" ON public.tags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "tags_delete_authenticated" ON public.tags FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON public.approvals(requester_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_checklists_task ON public.checklists(task_id);
CREATE INDEX IF NOT EXISTS idx_project_links_project ON public.project_links(project_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_project ON public.deliveries(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
