-- =====================================================
-- FOCUS OS — Database Schema
-- Focus Tecnologias · Abril 2026
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS (profiles que estendem auth.users do Supabase)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'lead', 'member', 'intern', 'viewer')),
  department TEXT DEFAULT 'engineering',
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TEAMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#f97316',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TEAM MEMBERS (relação N:N)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_team TEXT DEFAULT 'member' CHECK (role_in_team IN ('lead', 'member', 'intern')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- =====================================================
-- 4. PROJECTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- PRJ-001, PRJ-002...
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_email TEXT,
  client_phone TEXT,
  stage TEXT NOT NULL DEFAULT 'diagnostico' CHECK (stage IN (
    'diagnostico', 'planejamento', 'mvp', 'proposta', 
    'desenvolvimento', 'deploy', 'suporte', 'finalizado', 'cancelado'
  )),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  health TEXT DEFAULT 'on_track' CHECK (health IN ('on_track', 'at_risk', 'delayed')),
  responsible_id UUID REFERENCES public.profiles(id),
  team_id UUID REFERENCES public.teams(id),
  delivery_date DATE,
  contract_value DECIMAL(12,2),
  mrr_value DECIMAL(12,2) DEFAULT 0,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. PROJECT STAGES HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  observation TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. SPRINTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  velocity_completed INTEGER DEFAULT 0,
  velocity_total INTEGER DEFAULT 0,
  observation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, sprint_number)
);

-- =====================================================
-- 7. TASKS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN (
    'todo', 'in_progress', 'in_review', 'blocked', 'done', 'moved', 'cancelled'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  task_type TEXT DEFAULT 'task' CHECK (task_type IN ('task', 'bug', 'feature', 'improvement', 'subtask')),
  due_date DATE,
  estimated_hours DECIMAL(5,1),
  actual_hours DECIMAL(5,1) DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. CHECKLISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. TASK COMMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. DEALS (CRM)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  value DECIMAL(12,2),
  mrr DECIMAL(12,2),
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN (
    'lead', 'qualificado', 'reuniao_agendada', 'proposta_enviada',
    'negociacao', 'fechado', 'perdido'
  )),
  source TEXT, -- origem: indicação, instagram, google, etc
  service_type TEXT, -- tipo: erp, app, automacao, dashboard, etc
  owner_id UUID REFERENCES public.profiles(id),
  project_id UUID REFERENCES public.projects(id),
  clickup_task_id TEXT, -- ID da task no ClickUp (sync)
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  next_action TEXT,
  next_action_date DATE,
  tags TEXT[] DEFAULT '{}',
  closed_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. DEAL ACTIVITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.deal_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'note', 'call', 'email', 'meeting', 'stage_change', 'value_change', 'system'
  )),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. APPROVALS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id),
  title TEXT NOT NULL,
  description TEXT,
  approval_type TEXT DEFAULT 'stage_change' CHECK (approval_type IN (
    'stage_change', 'task_review', 'deploy', 'proposal', 'budget'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. ACTIVITY LOG (sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- project, task, sprint, deal, etc
  entity_id UUID,
  entity_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('progress', 'sprint', 'complete')),
  title TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'exported')),
  exported_as TEXT CHECK (exported_as IN ('pdf', 'google_docs')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. INTEGRATIONS CONFIG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- 'clickup', 'github', 'whatsapp'
  enabled BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}', -- tokens, IDs, etc (encrypted at rest by Supabase)
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'success')),
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. SYSTEM SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_stage ON public.projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_responsible ON public.projects(responsible_id);
CREATE INDEX IF NOT EXISTS idx_projects_code ON public.projects(code);

CREATE INDEX IF NOT EXISTS idx_sprints_project ON public.sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON public.sprints(status);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON public.tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON public.deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_clickup ON public.deals(clickup_task_id);

CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_project ON public.approvals(project_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON public.activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at DESC);


-- =====================================================
-- TRIGGERS: auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'profiles', 'projects', 'sprints', 'tasks', 
            'deals', 'reports', 'integrations', 'task_comments'
        ])
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trigger_update_%s_updated_at ON public.%s;
             CREATE TRIGGER trigger_update_%s_updated_at
             BEFORE UPDATE ON public.%s
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
            t, t, t, t
        );
    END LOOP;
END;
$$;


-- =====================================================
-- TRIGGER: auto-create profile on auth.users insert
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'member',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =====================================================
-- TRIGGER: log de mudança de stage em projetos
-- =====================================================
CREATE OR REPLACE FUNCTION log_project_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO public.project_stages (project_id, from_stage, to_stage)
    VALUES (NEW.id, OLD.stage, NEW.stage);
    
    INSERT INTO public.activity_log (actor_name, action, entity_type, entity_id, entity_name)
    VALUES (
      'Sistema',
      format('moveu projeto de %s para %s', OLD.stage, NEW.stage),
      'project',
      NEW.id,
      NEW.name
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_project_stage_change ON public.projects;
CREATE TRIGGER trigger_project_stage_change
  AFTER UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION log_project_stage_change();


-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuários autenticados podem ler tudo (app interno)
-- Admins podem escrever. Members podem escrever em seus próprios recursos.

-- Profiles: todos podem ler, apenas o próprio pode editar
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);

-- Teams: leitura aberta, escrita para admins
CREATE POLICY "teams_select" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "teams_all" ON public.teams FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead'))
);

-- Team Members: leitura aberta, escrita para admins/leads
CREATE POLICY "team_members_select" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_members_all" ON public.team_members FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead'))
);

-- Projects: leitura aberta, escrita para members+
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead', 'member'))
);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead', 'member'))
);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Project Stages: leitura aberta, inserção automática
CREATE POLICY "project_stages_select" ON public.project_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "project_stages_insert" ON public.project_stages FOR INSERT TO authenticated WITH CHECK (true);

-- Sprints: leitura aberta, members+ escrevem
CREATE POLICY "sprints_select" ON public.sprints FOR SELECT TO authenticated USING (true);
CREATE POLICY "sprints_all" ON public.sprints FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead', 'member'))
);

-- Tasks: leitura aberta, members+ escrevem
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead', 'member', 'intern'))
);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead', 'member', 'intern'))
);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead'))
);

-- Checklists: leitura aberta, todos autenticados podem editar
CREATE POLICY "checklists_select" ON public.checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "checklists_all" ON public.checklists FOR ALL TO authenticated USING (true);

-- Task Comments: leitura aberta, autenticados podem inserir
CREATE POLICY "task_comments_select" ON public.task_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "task_comments_insert" ON public.task_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "task_comments_update" ON public.task_comments FOR UPDATE TO authenticated USING (author_id = auth.uid());

-- Deals: leitura aberta, members+ escrevem
CREATE POLICY "deals_select" ON public.deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "deals_all" ON public.deals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead', 'member'))
);

-- Deal Activities: leitura aberta, inserção para autenticados
CREATE POLICY "deal_activities_select" ON public.deal_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "deal_activities_insert" ON public.deal_activities FOR INSERT TO authenticated WITH CHECK (true);

-- Approvals: leitura aberta, insert/update para members+
CREATE POLICY "approvals_select" ON public.approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "approvals_all" ON public.approvals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead', 'member'))
);

-- Activity Log: leitura aberta, inserção aberta
CREATE POLICY "activity_log_select" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity_log_insert" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- Reports: leitura aberta, CRUD para members+
CREATE POLICY "reports_select" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "reports_all" ON public.reports FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead', 'member'))
);

-- Integrations: somente admins
CREATE POLICY "integrations_select" ON public.integrations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead'))
);
CREATE POLICY "integrations_all" ON public.integrations FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Settings: leitura para todos, escrita para admins
CREATE POLICY "settings_select" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "settings_all" ON public.settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- =====================================================
-- SEED DATA
-- =====================================================

-- Integração ClickUp (config placeholder)
INSERT INTO public.integrations (name, enabled, config) VALUES 
  ('clickup', false, '{"token": null, "team_id": null, "space_id": null, "list_id": null}'),
  ('github', false, '{}'),
  ('whatsapp', false, '{}')
ON CONFLICT (name) DO NOTHING;

-- Settings padrão
INSERT INTO public.settings (key, value, description) VALUES
  ('general', '{"company_name": "Focus Tecnologias", "company_email": "contatofocustecnologia@gmail.com", "company_phone": "+55 85 8667-4561", "company_address": "Rua Barbosa de Freitas 1741, Aldeota, Fortaleza, CE"}', 'Configurações gerais da empresa'),
  ('modules', '{"command-center": true, "projetos": true, "backlog": true, "pipeline": true, "sprint-board": true, "relatorios": true, "configuracoes": true, "time-tracker": false, "propostas": false, "contratos": true, "canal-interno": false, "notificacoes": true}', 'Módulos ativos'),
  ('notifications', '{"email_enabled": false, "whatsapp_enabled": false, "slack_enabled": false}', 'Configurações de notificações')
ON CONFLICT (key) DO NOTHING;

-- Equipe padrão
INSERT INTO public.teams (id, name, description, color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Focus Core', 'Equipe principal de desenvolvimento', '#f97316'),
  ('00000000-0000-0000-0000-000000000002', 'Focus Comercial', 'Equipe comercial e vendas', '#22c55e')
ON CONFLICT DO NOTHING;

-- =====================================================
-- DRIVE TOKENS (persist refresh tokens por usuário)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.drive_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualizar timestamp
CREATE OR REPLACE FUNCTION update_drive_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_drive_tokens_updated_at ON public.drive_tokens;
CREATE TRIGGER trigger_update_drive_tokens_updated_at
BEFORE UPDATE ON public.drive_tokens
FOR EACH ROW EXECUTE FUNCTION update_drive_tokens_updated_at();
