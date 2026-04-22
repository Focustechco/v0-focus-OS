import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"
import { sendNotification } from "@/lib/notifications"
export const dynamic = 'force-dynamic'

/**
 * GET /api/tasks
 * Query: ?project_id=... ?sprint_id=... ?status=... ?assignee_id=... ?limit=50
 */
export async function GET(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth
  const url = new URL(request.url)
  const projectId = url.searchParams.get("project_id")
  const sprintId = url.searchParams.get("sprint_id")
  const status = url.searchParams.get("status")
  const assigneeId = url.searchParams.get("assignee_id")
  const limit = Number(url.searchParams.get("limit") ?? 100)

  let query = supabase
    .from("tasks")
    .select(
      `id, title, description, status, priority, task_type, due_date,
       estimated_hours, actual_hours, order_index, tags, created_at,
       project:projects(id, code, name),
       sprint:sprints(id, sprint_number, name),
       assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)`
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (projectId) query = query.eq("project_id", projectId)
  if (sprintId) query = query.eq("sprint_id", sprintId)
  if (status) query = query.eq("status", status)
  if (assigneeId) query = query.eq("assignee_id", assigneeId)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tasks: data ?? [] })
}

/**
 * POST /api/tasks
 */
export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase, user } = auth
  const body = await request.json()

  if (!body.project_id || !body.title) {
    return NextResponse.json(
      { error: "project_id e title são obrigatórios" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: body.project_id,
      sprint_id: body.sprint_id ?? null,
      parent_task_id: body.parent_task_id ?? null,
      assignee_id: body.assignee_id ?? null,
      title: body.title,
      description: body.description ?? null,
      status: body.status ?? "todo",
      priority: body.priority ?? "normal",
      task_type: body.task_type ?? "task",
      due_date: body.due_date ?? null,
      estimated_hours: body.estimated_hours ?? null,
      tags: body.tags ?? [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase.from("activity_log").insert({
    actor_id: user.id,
    actor_name: user.user_metadata?.full_name ?? user.email ?? "Usuário",
    action: "criou task",
    entity_type: "task",
    entity_id: data.id,
    entity_name: data.title,
  })

  // Notificar o responsável se houver um
  if (data.assignee_id) {
    await sendNotification({
      userId: data.assignee_id,
      event: "nova_task",
      title: "Nova tarefa atribuída",
      body: `Você recebeu a tarefa: ${data.title}`,
      relatedEntityType: "tarefas",
      relatedEntityId: data.id
    })
  }

  return NextResponse.json({ task: data }, { status: 201 })
}
