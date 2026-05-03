-- Migração para o Sistema de Fluxo de Etapas (Pipeline) do Focus OS

-- 1. Adicionar coluna de tipo de fluxo aos projetos (se ainda não existir)
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS tipo_fluxo TEXT DEFAULT 'Desenvolvimento de Software';

-- 2. Tabela de Etapas (Stages)
-- Cada projeto tem seu conjunto de etapas que formam o pipeline
CREATE TABLE IF NOT EXISTS project_stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id  UUID REFERENCES projetos(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  descricao   TEXT,
  cor         TEXT DEFAULT 'bg-blue-500',
  icone       TEXT DEFAULT 'Briefcase',
  ordem       INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Grupos (Groups/Actors)
-- Dentro de cada etapa, existem grupos (ex: Comercial, DevSecOps, Gabriel)
CREATE TABLE IF NOT EXISTS project_stage_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id      UUID REFERENCES project_stages(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  badge_color   TEXT DEFAULT 'bg-blue-500',
  warning_text  TEXT,
  ordem         INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Itens do Checklist (Tasks)
-- Os itens reais que são marcados/desmarcados
CREATE TABLE IF NOT EXISTS project_checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID REFERENCES project_stage_groups(id) ON DELETE CASCADE,
  projeto_id    UUID REFERENCES projetos(id) ON DELETE CASCADE, -- redundante mas útil para queries rápidas
  titulo        TEXT NOT NULL,
  concluido     BOOLEAN DEFAULT FALSE,
  concluido_em  TIMESTAMPTZ,
  concluido_por UUID REFERENCES auth.users(id),
  ordem         INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Habilitar Realtime para estas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE project_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE project_stage_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE project_checklist_items;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_stages_projeto ON project_stages(projeto_id);
CREATE INDEX IF NOT EXISTS idx_groups_stage ON project_stage_groups(stage_id);
CREATE INDEX IF NOT EXISTS idx_checklist_group ON project_checklist_items(group_id);
CREATE INDEX IF NOT EXISTS idx_checklist_projeto ON project_checklist_items(projeto_id);
