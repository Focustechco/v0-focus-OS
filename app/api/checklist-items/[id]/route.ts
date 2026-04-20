import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

// PATCH /api/checklist-items/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { is_done } = body

    if (id === undefined || is_done === undefined) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Update the checklist item
    const { data: updatedItem, error: updateError } = await supabase
      .from("checklist_items")
      .update({ is_done })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // 2. Fetch all checklist items for the same task to recalculate progress
    const { data: allItems, error: itemsError } = await supabase
      .from("checklist_items")
      .select("is_done")
      .eq("task_id", updatedItem.task_id)

    if (!itemsError && allItems && allItems.length > 0) {
      const total = allItems.length
      const doneItems = allItems.filter(item => item.is_done).length
      const progress = Math.round((doneItems / total) * 100)

      let status = 'a_fazer'
      if (progress > 0 && progress < 50) status = 'em_progresso'
      if (progress >= 50 && progress < 100) status = 'revisao'
      if (progress === 100) status = 'concluida'

      await supabase
        .from("tarefas")
        .update({ progress, status })
        .eq("id", updatedItem.task_id)
    }

    // 3. If item is marked as done, update corresponding approval
    if (is_done === true) {
      const { error: approvalError } = await supabase
        .from("aprovacoes")
        .update({ status: 'aprovado' })
        .eq("checklist_item_id", id)

      if (approvalError) {
        console.error("Error updating corresponding approval:", approvalError)
      }
    }

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
