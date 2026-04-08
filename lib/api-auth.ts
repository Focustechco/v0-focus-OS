import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

/**
 * Helper para proteger API routes. Retorna o user autenticado ou
 * uma NextResponse 401 que deve ser retornada imediatamente.
 *
 * Uso:
 *   const auth = await requireUser()
 *   if (auth instanceof NextResponse) return auth
 *   const { user, supabase } = auth
 */
export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    )
  }

  return { user: user as User, supabase }
}
