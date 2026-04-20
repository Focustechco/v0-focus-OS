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
    console.warn('[Supabase] Aviso: Variáveis de ambiente faltando. Usando fallback.')
  }

  const url = supabaseUrl || 'https://vxxxxxxxxx.supabase.co'
  const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

  return createServerClient(
    url,
    key,
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
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vxxxxxxxxx.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("[createAdminClient] Aviso: Usando variáveis de ambiente de fallback.")
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
