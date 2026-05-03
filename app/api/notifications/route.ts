import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: notifications, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    // Colunas reais: id, titulo, mensagem, tipo, ref_id, ref_type, lida, user_id, created_at, triggered_by, ref_title
    const mapped = (notifications || []).map((n: any) => ({
      id: n.id,
      title: n.titulo,
      body: n.mensagem,
      isRead: n.lida,
      type: n.tipo,
      relatedEntityType: n.ref_type || null,
      relatedEntityId: n.ref_id || null,
      relatedEntityTitle: n.ref_title || null,
      triggeredBy: n.triggered_by || null,
      createdAt: n.created_at
    }))

    return NextResponse.json(mapped)
  } catch (error: any) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("notificacoes")
      .insert({
        user_id: body.user_id,
        tipo: body.type, // ex: "tarefa"
        titulo: body.title,
        mensagem: body.body,
        ref_id: body.task_id,
        ref_type: "tarefas",
        lida: false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro ao criar notificação:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { notificationId, isRead, userId } = await request.json()
    const supabase = createAdminClient()

    if (notificationId) {
      const { data, error } = await supabase
        .from("notificacoes")
        .update({ lida: isRead })
        .eq("id", notificationId)
        .select()
        .single()
      
      if (error) throw error
      return NextResponse.json(data)
    }

    if (userId && isRead) {
      const { data, error } = await supabase
        .from("notificacoes")
        .update({ lida: true })
        .eq("user_id", userId)
        .eq("lida", false)
      
      if (error) throw error
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error: any) {
    console.error("Erro ao atualizar notificação:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
