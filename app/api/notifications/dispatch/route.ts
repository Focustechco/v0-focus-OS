import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
import { createAdminClient } from "@/lib/supabase/server"

/**
 * POST /api/notifications/dispatch
 * 
 * Insere diretamente na tabela "notificacoes" (canal App/Sino).
 * O Supabase Realtime pega o INSERT e o NotificationContext
 * atualiza o sino automaticamente.
 *
 * Payload esperado:
 * {
 *   userId: string,         // quem recebe a notificação
 *   triggeredBy?: string,   // quem disparou (opcional)
 *   eventType: string,      // tipo do evento: "nova_task" | "task_status_changed" | "task_concluida"
 *   data: {
 *     title: string,
 *     message: string,
 *     ref_type?: string,    // "tarefas" | "projetos" etc.
 *     ref_id?: string,      // ID da entidade relacionada
 *     ref_title?: string    // título da entidade (opcional)
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, triggeredBy, eventType, data } = body

    if (!userId || !data?.title) {
      return NextResponse.json(
        { error: "userId e data.title são obrigatórios" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Mapear eventType para o campo "tipo" legível
    const tipoMap: Record<string, string> = {
      nova_task: "tarefa",
      task_status_changed: "tarefa",
      task_concluida: "tarefa",
      sprint_iniciada: "sprint",
      sprint_encerrada: "sprint",
      aprovacao: "aprovacao",
    }

    const insertPayload = {
      user_id: userId,
      tipo: tipoMap[eventType] || "tarefa",
      titulo: data.title,
      mensagem: data.message || "",
      ref_type: data.ref_type || null,
      ref_id: data.ref_id || null,
      lida: false,
    }

    console.log("[dispatch] Inserindo notificação:", JSON.stringify(insertPayload))

    const { data: inserted, error } = await supabase
      .from("notificacoes")
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error("[dispatch] Erro ao inserir:", error)
      throw error
    }

    console.log("[dispatch] Notificação criada com sucesso:", inserted?.id)
    return NextResponse.json({ success: true, id: inserted?.id })
  } catch (error: any) {
    console.error("[dispatch] Erro fatal:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
