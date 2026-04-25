-- Criação da tabela de configuração para o módulo Projetos
create table if not exists projects_clickup_config (
  id           uuid primary key default gen_random_uuid(),
  workspace_id text not null,
  workspace_name text,
  space_id     text not null,
  space_name   text,
  list_id      text not null,
  list_name    text,
  updated_at   timestamptz default now(),
  updated_by   uuid references auth.users(id)
);

-- Só uma linha de config (upsert sempre no mesmo id fixo)
insert into projects_clickup_config
  (id, workspace_id, workspace_name, space_id, space_name, list_id, list_name)
values
  ('00000000-0000-0000-0000-000000000001','','','','','','')
on conflict (id) do nothing;

-- Realtime para propagar mudança instantânea a todos os clientes abertos
alter publication supabase_realtime add table projects_clickup_config;
