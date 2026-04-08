import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"

/**
 * GET /api/projects/[id]
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth
  const { id } = await params

  const { data, error } = await supabase
    .from("projects")
    .select(
      `*, responsible:profiles!projects_responsible_id_fkey(id, full_name, avatar_url),
       team:teams(id, name, color)`
    )
    .eq("id", id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ project: data })
}

/**
 * PUT /api/projects/[id]
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

  // Campos atualizáveis (whitelist)
  const allowed: Record<string, unknown> = {}
  const fields = [
    "name",
    "description",
    "client_name",
    "client_company",
    "client_email",
    "client_phone",
    "stage",
    "progress",
    "health",
    "responsible_id",
    "team_id",
    "delivery_date",
    "contract_value",
    "mrr_value",
    "priority",
    "tags",
  ]
  for (const f of fields) {
    if (f in body) allowed[f] = body[f]
  }

  const { data, error } = await supabase
    .from("projects")
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
    action: "atualizou projeto",
    entity_type: "project",
    entity_id: data.id,
    entity_name: data.name,
  })

  return NextResponse.json({ project: data })
}

/**
 * DELETE /api/projects/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth
  const { id } = await params

  const { error } = await supabase.from("projects").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
