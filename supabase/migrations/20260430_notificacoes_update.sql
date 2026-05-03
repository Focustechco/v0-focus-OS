-- =============================================
-- MIGRATION: Notifications System Updates
-- Execute no Supabase SQL Editor
-- =============================================

-- Atualiza a tabela existente 'notificacoes' para suportar os novos campos
alter table notificacoes 
add column if not exists triggered_by uuid references auth.users(id) on delete set null,
add column if not exists ref_title text;

-- Garante que o Realtime está ativo para a tabela notificacoes se ainda não estiver
alter publication supabase_realtime add table notificacoes;
