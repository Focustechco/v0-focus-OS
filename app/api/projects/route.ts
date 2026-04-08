import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"

/**
 * GET /api/projects
 * Query params:
 *  - stage: filtrar por stage
 *  - limit: default 50
 */
export async function GET(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth
  const url = new URL(request.url)
  const stage = url.searchParams.get("stage")
  const limit = Number(url.searchParams.get("limit") ?? 50)

  let query = supabase
    .from("projects")
    .select(
      `id, code, name, client_name, client_company, stage, progress, health,
       priority, delivery_date, contract_value, mrr_value, tags, created_at,
       responsible:profiles!projects_responsible_id_fkey(id, full_name, avatar_url),
       team:teams(id, name, color)`
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (stage) {
    query = query.eq("stage", stage)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects: data ?? [] })
}

/**
 * POST /api/projects
 * Body: { code, name, client_name, client_company?, stage?, delivery_date?, ... }
 */
export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase, user } = auth
  const body = await request.json()

  if (!body.code || !body.name || !body.client_name) {
    return NextResponse.json(
      { error: "code, name e client_name são obrigatórios" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      code: body.code,
      name: body.name,
      description: body.description ?? null,
      client_name: body.client_name,
      client_company: body.client_company ?? null,
      client_email: body.client_email ?? null,
      client_phone: body.client_phone ?? null,
      stage: body.stage ?? "diagnostico",
      progress: body.progress ?? 0,
      health: body.health ?? "on_track",
      responsible_id: body.responsible_id ?? user.id,
      team_id: body.team_id ?? null,
      delivery_date: body.delivery_date ?? null,
      contract_value: body.contract_value ?? null,
      mrr_value: body.mrr_value ?? 0,
      priority: body.priority ?? "normal",
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
    action: "criou projeto",
    entity_type: "project",
    entity_id: data.id,
    entity_name: data.name,
  })

  return NextResponse.json({ project: data }, { status: 201 })
}
