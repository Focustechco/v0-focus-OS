-- 1. Criação da tabela perfil
CREATE TABLE IF NOT EXISTS public.perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    cargo TEXT,
    empresa TEXT,
    email_profissional TEXT,
    telefone TEXT,
    linkedin TEXT,
    github TEXT,
    foto_url TEXT,
    banner_url TEXT,
    status_texto TEXT DEFAULT 'Disponível',
    status_cor TEXT DEFAULT 'verde', -- enum: verde, amarelo, vermelho, cinza
    setor TEXT,
    bio TEXT,
    tecnologias TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS
CREATE POLICY "Usuários podem ver qualquer perfil" ON public.perfil FOR SELECT USING (true);
CREATE POLICY "Usuários podem editar seu próprio perfil" ON public.perfil FOR ALL USING (auth.uid() = usuario_id);

-- 4. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_perfil_updated
    BEFORE UPDATE ON public.perfil
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- 5. Bucket de Storage para Avatares
-- (Execute estes comandos se você tiver privilégios de admin no SQL do Supabase)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatares', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Políticas de Storage para o bucket 'avatares'
CREATE POLICY "Avatares são públicos" ON storage.objects FOR SELECT USING (bucket_id = 'avatares');
CREATE POLICY "Usuários podem subir seus próprios avatares" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Usuários podem atualizar seus próprios avatares" ON storage.objects FOR UPDATE USING (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Usuários podem deletar seus próprios avatares" ON storage.objects FOR DELETE USING (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);
