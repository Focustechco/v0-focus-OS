# Setup — Supabase + Vercel + ClickUp

Guia passo a passo para colocar o Focus OS no ar. Segue a arquitetura do
[planejamento_backend_focus_os.md](../planejamento_backend_focus_os.md).

---

## 1. Pré-requisitos

- Conta no [Supabase](https://supabase.com) (projeto já criado conforme informado)
- Conta no [Vercel](https://vercel.com) (criar na hora do deploy)
- Conta no [GitHub](https://github.com) com o repositório do Focus OS
- Node 20+ e `pnpm` localmente

---

## 2. Supabase — configurar o projeto existente

### 2.1 Aplicar o schema SQL

1. Abra o projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor** (ícone de banco de dados na sidebar)
3. Clique em **New query**
4. Copie todo o conteúdo de [`supabase/schema.sql`](../supabase/schema.sql) e cole no editor
5. Clique em **Run** (ou `Ctrl+Enter`)
6. Verifique que todas as tabelas foram criadas em **Table Editor** (devem aparecer 16 tabelas: `profiles`, `teams`, `projects`, `sprints`, `tasks`, `deals`, etc.)

### 2.2 Habilitar Email Auth

1. Vá em **Authentication → Providers**
2. **Email** já vem habilitado por padrão — confirme que está ligado
3. (Recomendado) Em **Email Templates**, personalize os emails de confirmação com a marca Focus
4. (Opcional, mas recomendado para começar sem fricção) Vá em **Authentication → Settings → Email Auth** e **desabilite** `Confirm email` temporariamente para não precisar verificar email em cada cadastro durante o desenvolvimento. Reabilite em produção.

### 2.3 Copiar as chaves de API

1. Vá em **Project Settings → API**
2. Copie os seguintes valores (serão usados no `.env.local` e no Vercel):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (NUNCA exponha ao browser)

---

## 3. Ambiente local

### 3.1 Criar `.env.local`

Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# ClickUp (opcional — só se quiser sync com o CRM)
CLICKUP_API_TOKEN=pk_xxxxxxxx
CLICKUP_TEAM_ID=1234567
CLICKUP_SPACE_ID=1234567
CLICKUP_LIST_ID=1234567

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Instalar e rodar

```bash
pnpm install
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

### 3.3 Criar o primeiro usuário

1. Na tela de login, clique em **CADASTRAR**
2. Preencha nome, email e senha (mínimo 6 caracteres)
3. Se a confirmação de email estiver habilitada, vá ao seu email e clique no link
4. Faça login

Um registro é criado automaticamente em `public.profiles` via trigger (`handle_new_user` no schema).

### 3.4 Promover o primeiro usuário a admin

Por padrão todo novo usuário é `member`. Para torná-lo `admin`:

1. No Supabase Dashboard, vá em **Table Editor → profiles**
2. Encontre seu usuário
3. Mude o campo `role` de `member` para `admin`
4. Salve

---

## 4. Repositório — push para GitHub

Se ainda não está no GitHub:

```bash
git add .
git commit -m "feat: backend base (Supabase + auth + API routes Fase 1)"
git push origin main
```

O `.env.local` é automaticamente ignorado pelo `.gitignore` — confirme com `git status` antes de commitar.

---

## 5. Vercel — deploy

### 5.1 Importar o projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione o repositório do Focus OS no GitHub
4. Vercel detecta Next.js automaticamente — não altere as build settings

### 5.2 Configurar variáveis de ambiente

**Antes do primeiro deploy**, em **Environment Variables**, adicione:

| Nome | Valor | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Production, Preview, Development |
| `CLICKUP_API_TOKEN` | Token ClickUp | Production, Preview (opcional) |
| `CLICKUP_TEAM_ID` | Team ID | Production, Preview (opcional) |
| `CLICKUP_SPACE_ID` | Space ID | Production, Preview (opcional) |
| `CLICKUP_LIST_ID` | List ID | Production, Preview (opcional) |
| `NEXT_PUBLIC_APP_URL` | URL final do app (ex: `https://focusos.vercel.app`) | Production |

### 5.3 Deploy

Clique em **Deploy**. Vercel faz o build e publica. Após o deploy, volte no Supabase:

### 5.4 Configurar redirect URLs no Supabase

1. Supabase Dashboard → **Authentication → URL Configuration**
2. Em **Site URL**, coloque a URL do Vercel (ex: `https://focusos.vercel.app`)
3. Em **Redirect URLs**, adicione:
   - `https://focusos.vercel.app/**`
   - `http://localhost:3000/**` (para dev)

Isso evita erros de "Invalid redirect URL" nos fluxos de auth.

---

## 6. Integração ClickUp (opcional)

A integração CRM → ClickUp agora é 100% server-side. O token **nunca** vai para o browser.

### 6.1 Obter o token

1. Acesse [app.clickup.com/settings/apps](https://app.clickup.com/settings/apps)
2. Em **API Token**, clique em **Generate** (se ainda não tiver)
3. Copie o token (começa com `pk_`)

### 6.2 Descobrir os IDs (Team / Space / List)

Use a API do ClickUp ou navegue pela URL no browser. Exemplo de URL de uma lista:

```
https://app.clickup.com/1234567/v/li/7654321
                        ↑ team_id     ↑ list_id
```

### 6.3 Definir as variáveis

Local: edite `.env.local`. Produção: edite no Vercel e faça redeploy.

```bash
CLICKUP_API_TOKEN=pk_xxxxx
CLICKUP_TEAM_ID=1234567
CLICKUP_LIST_ID=7654321
```

Acesse `/comercial → aba CONFIGURAR` para ver se a integração foi detectada.

---

## 7. Próximos passos (pós-deploy)

Depois que o básico está no ar, migrar cada módulo do mock → real:

1. **Projetos** — conectar [`app/projetos/page.tsx`](../app/projetos/page.tsx) a `GET /api/projects`
2. **Sprints** — `GET /api/sprints?project_id=...`
3. **Tasks** — `GET /api/tasks?sprint_id=...`
4. **Deals** — decidir: usar apenas `/api/deals` (Supabase) ou sync bidirecional com ClickUp
5. **Relatórios** — persistir em `reports` e exportar PDF

Consulte a [Seção 6.1 do planejamento](../planejamento_backend_focus_os.md) para o roadmap completo.

---

## 8. Troubleshooting

| Erro | Causa provável | Solução |
|------|---------------|---------|
| Loop de redirect em `/login` | Cookies não estão sendo setados | Verificar se `NEXT_PUBLIC_SUPABASE_URL` está correto em todos os environments |
| `Token expirado` no ClickUp | Token revogado | Gerar novo em clickup.com/settings/apps |
| `Erro ao carregar dashboard` no Command Center | Schema SQL não aplicado | Rodar `supabase/schema.sql` no SQL Editor |
| `permission denied for table X` | RLS bloqueando | Confirmar que o usuário tem `role` adequado em `profiles` |
| Build falha no Vercel por tipos | `ignoreBuildErrors: true` já está em `next.config.mjs` | OK, TS errors não bloqueiam build |

---

## 9. Checklist de aceite

- [ ] Schema SQL aplicado (16 tabelas em `public.*`)
- [ ] Cadastro e login funcionam localmente
- [ ] Primeiro usuário promovido a `admin`
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy inicial no Vercel passando
- [ ] URLs de redirect do Supabase atualizadas
- [ ] Command Center carrega sem erros (dados vazios é OK)
- [ ] ClickUp sync funciona (se configurado)
