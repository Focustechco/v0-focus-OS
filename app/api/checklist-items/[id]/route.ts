import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// PATCH /api/checklist-items/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { is_done } = body

    if (id === undefined || is_done === undefined) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    // 1. Update the checklist item
    const { data: updatedItem, error: updateError } = await supabase
      .from("checklist_items")
      .update({ is_done })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // 2. If item is marked as done, update corresponding approval
    if (is_done === true) {
      const { error: approvalError } = await supabase
        .from("aprovacoes")
        .update({ status: 'aprovado' })
        .eq("checklist_item_id", id)

      if (approvalError) {
        console.error("Error updating corresponding approval:", approvalError)
      }
    } else {
        // Option: if it was undone, mark approval as pending again? 
        // The prompt only mentions when is_done=true -> status='aprovado'.
        // Let's keep it simple as requested.
    }

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
