import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Cliente Supabase para uso em Server Components, API Routes e Server Actions.
 * Lê/grava cookies de sessão via next/headers.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas.')
    throw new Error('Configuração do Supabase incompleta. Verifique o seu arquivo .env')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O `setAll` pode falhar quando chamado a partir de um Server Component.
            // Isso é seguro de ignorar desde que um middleware esteja atualizando
            // a sessão do usuário.
          }
        },
      },
    }
  )
}

/**
 * Cliente Supabase com service role key — uso EXCLUSIVAMENTE server-side em
 * API routes que precisam bypass RLS (migrations, admin tasks, cron jobs).
 * NUNCA exponha ao browser.
 */
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js")
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[createAdminClient] Erro: Faltam chaves do Supabase (URL ou Key).")
    throw new Error("supabaseKey is required. Verifique as variáveis de ambiente.")
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
