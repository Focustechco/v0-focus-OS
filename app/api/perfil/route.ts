import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

// Acesso seguro ao perfil bypassando RLS e criando row padrao se precisar
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const usuarioId = searchParams.get("usuario_id")
    const email = searchParams.get("email")
    const nomeCompleto = searchParams.get("nome_completo")

    if (!usuarioId) {
      return NextResponse.json({ error: "usuario_id não informado." }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // Tenta buscar o perfil nativo
    const { data: perfil, error } = await supabase
      .from("perfil")
      .select("*")
      .eq("usuario_id", usuarioId)
      .maybeSingle()

    if (error) {
      console.error("[GET /api/perfil] Error ao buscar:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (perfil) {
      return NextResponse.json(perfil)
    }

    // Se nao houver perfil, cria um registro inicial na tabela
    const newProfilePayload = {
      usuario_id: usuarioId,
      nome_completo: nomeCompleto || (email ? email.split("@")[0] : "Usuário"),
    }

    const { data: newProfile, error: initError } = await supabase
      .from("perfil")
      .insert([newProfilePayload])
      .select()
      .single()

    if (initError) {
      console.error("[GET /api/perfil] Erro ao criar primeiro login:", initError)
      return NextResponse.json({ error: initError.message }, { status: 500 })
    }

    return NextResponse.json(newProfile)

  } catch (error: any) {
    console.error("[GET /api/perfil] Internal Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
