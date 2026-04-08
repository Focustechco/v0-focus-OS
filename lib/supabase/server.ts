import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Cliente Supabase para uso em Server Components, API Routes e Server Actions.
 * Lê/grava cookies de sessão via next/headers.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
