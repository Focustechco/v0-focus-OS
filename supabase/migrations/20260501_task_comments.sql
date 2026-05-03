-- ================================================
-- Migração: Tabela de Comentários de Tasks
-- Focus OS — Kanban Comments
-- ================================================

-- 1. Tabela de comentários
CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id uuid REFERENCES public.tarefas(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Índice para buscar comentários de uma tarefa
CREATE INDEX IF NOT EXISTS idx_task_comments_tarefa 
  ON public.task_comments(tarefa_id);

-- 3. RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage task comments"
  ON public.task_comments FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
