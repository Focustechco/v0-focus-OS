-- Garante permissões RLS para a tabela de notificações

-- Habilitar RLS se não estiver
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- 1. Política de SELECT: O usuário pode ver suas próprias notificações
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON public.notificacoes;
CREATE POLICY "Usuários podem ver suas próprias notificações"
ON public.notificacoes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Política de UPDATE: O usuário pode marcar suas próprias notificações como lidas
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON public.notificacoes;
CREATE POLICY "Usuários podem atualizar suas próprias notificações"
ON public.notificacoes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Política de INSERT: Permitir inserção (necessário para o Realtime às vezes, embora APIs usem service role)
DROP POLICY IF EXISTS "Permitir inserção de notificações" ON public.notificacoes;
CREATE POLICY "Permitir inserção de notificações"
ON public.notificacoes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Garantir que o realtime está ativo para esta tabela
ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes;
-- Caso já exista, ignorar o erro acima ou usar:
-- DO $$ BEGIN
--   ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes;
-- EXCEPTION
--   WHEN others THEN NULL;
-- END $$;
