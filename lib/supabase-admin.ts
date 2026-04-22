import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("ATENCAO: Variaveis de ambiente do Supabase nao encontradas.")
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://vxxxxxxxxx.supabase.co",
  supabaseServiceKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy"
)
