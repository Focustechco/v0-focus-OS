import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

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
      .select()
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

    return NextResponse.json({ task: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
