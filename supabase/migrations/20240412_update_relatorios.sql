-- Migração: Expansão da tabela de Relatórios para Conteúdo Dinâmico e Branding
ALTER TABLE public.relatorios ADD COLUMN IF NOT EXISTS logo_cliente_url TEXT;
ALTER TABLE public.relatorios ADD COLUMN IF NOT EXISTS conteudo_json JSONB DEFAULT '{}';

-- Comentários para documentação
COMMENT ON COLUMN public.relatorios.logo_cliente_url IS 'URL da logo do cliente para branding no PDF';
COMMENT ON COLUMN public.relatorios.conteudo_json IS 'Estrutura completa do relatório gerada automaticamente';
