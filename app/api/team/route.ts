import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"
export const dynamic = 'force-dynamic'

/**
 * GET /api/team
 * Retorna os membros da equipe (perfis + equipes).
 */
export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, department, avatar_url, status, created_at")
    .order("full_name", { ascending: true })

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, description, color")

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, user_id, role_in_team")

  return NextResponse.json({
    profiles: profiles ?? [],
    teams: teams ?? [],
    memberships: memberships ?? [],
  })
}
