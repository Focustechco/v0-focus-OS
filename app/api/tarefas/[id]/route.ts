import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendNotification } from "@/lib/notifications"

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, progress, update_checklist } = body

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const updates: any = {}
    if (status !== undefined) updates.status = status
    if (progress !== undefined) updates.progress = progress

    const { data, error } = await supabase
      .from("tarefas")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        checklist_items(id, title, is_done, assigned_to)
      `)
      .single()

    if (error) throw error

    // Se completou a tarefa pelo circulo e pediu pra atualizar checklist, marcamos todos como done
    if (update_checklist && status === 'concluida') {
      await supabase
        .from("checklist_items")
        .update({ is_done: true })
        .eq("task_id", id)
    } else if (update_checklist && status === 'a_fazer') {
      await supabase
        .from("checklist_items")
        .update({ is_done: false })
        .eq("task_id", id)
    }

    // — Fluxo de Aprovação Automático —
    // Quando tarefa entra em revisão, cria entrada automática em aprovacoes (upsert p/ evitar duplicatas)
    if (status === 'em_revisao' && data) {
      const tarefa = data as any
      const { error: aprovErr } = await supabase
        .from("aprovacoes")
        .upsert(
          {
            tarefa_id: id,
            projeto_id: tarefa.projeto_id,
            titulo: tarefa.titulo,
            descricao: tarefa.descricao || `Tarefa pronta para revisão: ${tarefa.titulo}`,
            status: "pendente",
            assigned_to: tarefa.responsavel_id || "dev",
            priority: tarefa.prioridade === "alta" ? "high" : tarefa.prioridade === "baixa" ? "low" : "normal",
            approval_type: "task_review",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tarefa_id", ignoreDuplicates: false }
        )

      if (aprovErr) {
        // Não falha a request principal — apenas loga o erro de aprovação
        console.error("[PATCH tarefas] Erro ao criar aprovação automática:", aprovErr.message)
      }
    }

    // Notificar conclusão
    if (status === 'concluida' && data && (data as any).responsavel_id) {
      const tarefa = data as any
      await sendNotification({
        userId: tarefa.responsavel_id,
        event: "task_concluida",
        title: "Tarefa concluída",
        body: `A tarefa "${tarefa.titulo}" foi marcada como concluída.`,
        relatedEntityType: "tarefas",
        relatedEntityId: id
      })
    }

    return NextResponse.json({ task: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
