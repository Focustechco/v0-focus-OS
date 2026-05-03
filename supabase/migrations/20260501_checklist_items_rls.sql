-- Adiciona permissão de INSERT para a tabela checklist_items
CREATE POLICY "Allow insert for authenticated users on checklist_items"
ON public.checklist_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Adiciona permissão de UPDATE para a tabela checklist_items (caso não exista)
CREATE POLICY "Allow update for authenticated users on checklist_items"
ON public.checklist_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Adiciona permissão de DELETE para a tabela checklist_items (caso não exista)
CREATE POLICY "Allow delete for authenticated users on checklist_items"
ON public.checklist_items
FOR DELETE
TO authenticated
USING (true);
