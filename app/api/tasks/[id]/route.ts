import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"

export const dynamic = 'force-dynamic'

/**
 * PUT /api/tasks/[id]
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase, user } = auth
  const { id } = await params
  const body = await request.json()

  const allowed: Record<string, unknown> = {}
  const fields = [
    "title",
    "description",
    "status",
    "priority",
    "task_type",
    "due_date",
    "estimated_hours",
    "actual_hours",
    "assignee_id",
    "sprint_id",
    "order_index",
    "tags",
  ]
  for (const f of fields) {
    if (f in body) allowed[f] = body[f]
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(allowed)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    actor_name: user.user_metadata?.full_name ?? user.email ?? "Usuário",
    action: "atualizou task",
    entity_type: "task",
    entity_id: data.id,
    entity_name: data.title,
  })

  return NextResponse.json({ task: data })
}

/**
 * DELETE /api/tasks/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth
  const { id } = await params

  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
