import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
export const dynamic = 'force-dynamic'

// GET /api/checklist-items?task_id=X
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get("task_id")

  if (!taskId) {
    return NextResponse.json({ error: "task_id is required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("DEBUG: Error fetching checklist items:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/checklist-items
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, task_id, project_id } = body // items: { title, assigned_to }[]

    if (!task_id || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const supabase = createAdminClient()
    // 1. Insert checklist items
    const { data: insertedItems, error: insertError } = await supabase
      .from("checklist_items")
      .insert(
        items.map((item: any) => ({
          task_id,
          title: item.title,
          assigned_to: item.assigned_to || null,
          is_done: false
        }))
      )
      .select()

    if (insertError) throw insertError

    // 2. Insert approvals for items with assigned_to
    const approvalItems = insertedItems.filter(item => item.assigned_to)
    
    if (approvalItems.length > 0) {
      const { error: approvalError } = await supabase
        .from("aprovacoes")
        .insert(
          approvalItems.map(item => ({
            checklist_item_id: item.id,
            task_id,
            project_id: project_id || null,
            assigned_to: item.assigned_to,
            status: 'pendente',
            priority: 'media',
            titulo: `Aprovação: ${item.title}`,
            descricao: `Verificação necessária para o item de checklist: ${item.title}`
          }))
        )

      if (approvalError) {
        console.error("Error creating automatic approvals:", approvalError)
        // We don't fail the whole request because items were inserted, but we log it
      }
    }

    return NextResponse.json(insertedItems)
  } catch (error: any) {
    console.error("DEBUG: Critical error in POST /api/checklist-items:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
