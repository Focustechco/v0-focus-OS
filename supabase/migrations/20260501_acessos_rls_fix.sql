-- Adiciona políticas completas para a tabela acessos (INSERT, UPDATE, DELETE)

-- 1. INSERT
DROP POLICY IF EXISTS "Allow insert for authenticated users on acessos" ON public.acessos;
CREATE POLICY "Allow insert for authenticated users on acessos"
ON public.acessos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. UPDATE
DROP POLICY IF EXISTS "Allow update for authenticated users on acessos" ON public.acessos;
CREATE POLICY "Allow update for authenticated users on acessos"
ON public.acessos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. DELETE
DROP POLICY IF EXISTS "Allow delete for authenticated users on acessos" ON public.acessos;
CREATE POLICY "Allow delete for authenticated users on acessos"
ON public.acessos
FOR DELETE
TO authenticated
USING (true);
