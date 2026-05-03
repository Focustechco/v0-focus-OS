import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"
export const dynamic = "force-dynamic"

/**
 * PATCH /api/projects/[id]/stages/[stageId]
 * Atualizar etapa
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth
  const { supabase } = auth
  const { stageId } = await params
  const body = await request.json()

  const allowed: Record<string, unknown> = {}
  const fields = ["name", "description", "status", "responsible_id", "due_date", "order_index"]
  for (const f of fields) {
    if (f in body) allowed[f] = body[f]
  }
  allowed.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("project_stages")
    .update(allowed)
    .eq("id", stageId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ stage: data })
}

/**
 * DELETE /api/projects/[id]/stages/[stageId]
 * Remover etapa
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth
  const { supabase } = auth
  const { stageId } = await params

  const { error } = await supabase.from("project_stages").delete().eq("id", stageId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
