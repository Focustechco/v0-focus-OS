import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"
export const dynamic = "force-dynamic"

/**
 * GET /api/projects/[id]/stages
 * Lista etapas ordenadas por order_index
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
    .from("project_stages")
    .select("*")
    .eq("project_id", id)
    .order("order_index", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ stages: data ?? [] })
}

/**
 * POST /api/projects/[id]/stages
 * Criar nova etapa
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth
  const { supabase } = auth
  const { id } = await params
  const body = await request.json()

  if (!body.name) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("project_stages")
    .insert({
      project_id: id,
      name: body.name,
      description: body.description || null,
      status: body.status || "pending",
      responsible_id: body.responsible_id || null,
      due_date: body.due_date || null,
      order_index: body.order_index ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ stage: data }, { status: 201 })
}
