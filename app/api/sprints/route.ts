import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"

/**
 * GET /api/sprints
 * Query: ?project_id=... ?status=active
 */
export async function GET(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth
  const url = new URL(request.url)
  const projectId = url.searchParams.get("project_id")
  const status = url.searchParams.get("status")

  let query = supabase
    .from("sprints")
    .select(
      `id, project_id, sprint_number, name, goal, start_date, end_date,
       status, velocity_completed, velocity_total,
       project:projects(id, code, name, client_name)`
    )
    .order("start_date", { ascending: false })

  if (projectId) query = query.eq("project_id", projectId)
  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sprints: data ?? [] })
}

/**
 * POST /api/sprints
 */
export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth
  const body = await request.json()

  if (!body.project_id || !body.sprint_number || !body.name || !body.start_date || !body.end_date) {
    return NextResponse.json(
      { error: "project_id, sprint_number, name, start_date e end_date são obrigatórios" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("sprints")
    .insert({
      project_id: body.project_id,
      sprint_number: body.sprint_number,
      name: body.name,
      goal: body.goal ?? null,
      start_date: body.start_date,
      end_date: body.end_date,
      status: body.status ?? "planned",
      velocity_total: body.velocity_total ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ sprint: data }, { status: 201 })
}
