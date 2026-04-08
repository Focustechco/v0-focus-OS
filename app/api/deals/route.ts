import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"

/**
 * GET /api/deals
 * Lista deals do banco (Supabase). Separado do ClickUp sync que vive em /api/clickup.
 */
export async function GET(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth
  const url = new URL(request.url)
  const stage = url.searchParams.get("stage")
  const limit = Number(url.searchParams.get("limit") ?? 200)

  let query = supabase
    .from("deals")
    .select(
      `id, name, company, contact_name, email, phone, value, mrr, stage,
       source, service_type, priority, next_action, next_action_date,
       tags, created_at, closed_at,
       owner:profiles!deals_owner_id_fkey(id, full_name, avatar_url)`
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (stage) query = query.eq("stage", stage)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deals: data ?? [] })
}

/**
 * POST /api/deals
 */
export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase, user } = auth
  const body = await request.json()

  if (!body.name) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      name: body.name,
      company: body.company ?? null,
      contact_name: body.contact_name ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      value: body.value ?? null,
      mrr: body.mrr ?? null,
      stage: body.stage ?? "lead",
      source: body.source ?? null,
      service_type: body.service_type ?? null,
      owner_id: body.owner_id ?? user.id,
      priority: body.priority ?? "normal",
      next_action: body.next_action ?? null,
      next_action_date: body.next_action_date ?? null,
      tags: body.tags ?? [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ deal: data }, { status: 201 })
}
