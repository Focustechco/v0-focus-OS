import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Valida a existencia das chaves do Supabase.
 * Se faltar alguma, lancamos um erro capturavel pela UI.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "ATENCAO: Variaveis de ambiente NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY nao encontradas. A conexao com o banco falhara."
  )
}

/**
 * Instancia unica do cliente Supabase para o Frontend.
 */
export const supabase = createBrowserClient(
  supabaseUrl || "https://vxxxxxxxxx.supabase.co",
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy"
)

/**
 * Utilitario para queries seguras com try/catch automatico.
 */
export async function safeQuery<T>(query: Promise<{ data: T | null; error: any }>) {
  try {
    const { data, error } = await query
    if (error) throw error
    return { data, error: null }
  } catch (err: any) {
    console.error("Supabase Query Error:", err)
    return { data: null, error: err }
  }
}
