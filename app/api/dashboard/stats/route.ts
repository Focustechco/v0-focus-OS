import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/stats
 * KPIs do Command Center: contagens por stage, tasks abertas,
 * sprints ativas, aprovações pendentes, pipeline comercial.
 */
export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase } = auth

  const [
    { count: totalProjects },
    { count: activeProjects },
    { count: atRiskProjects },
    { count: openTasks },
    { count: activeSprints },
    { count: pendingApprovals },
    { count: openDeals },
    { data: pipelineDeals },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .not("stage", "in", "(finalizado,cancelado)"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .in("health", ["at_risk", "delayed"]),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(done,cancelled)"),
    supabase
      .from("sprints")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("approvals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("deals")
      .select("*", { count: "exact", head: true })
      .not("stage", "in", "(fechado,perdido)"),
    supabase
      .from("deals")
      .select("stage, value, mrr")
      .not("stage", "in", "(perdido)"),
    supabase
      .from("activity_log")
      .select("id, actor_name, action, entity_type, entity_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  // Agregações do pipeline
  const pipelineByStage: Record<string, { count: number; value: number; mrr: number }> = {}
  for (const deal of pipelineDeals ?? []) {
    const stage = (deal as { stage: string }).stage
    if (!pipelineByStage[stage]) {
      pipelineByStage[stage] = { count: 0, value: 0, mrr: 0 }
    }
    pipelineByStage[stage].count += 1
    pipelineByStage[stage].value += Number((deal as { value: number | null }).value ?? 0)
    pipelineByStage[stage].mrr += Number((deal as { mrr: number | null }).mrr ?? 0)
  }

  return NextResponse.json({
    projects: {
      total: totalProjects ?? 0,
      active: activeProjects ?? 0,
      at_risk: atRiskProjects ?? 0,
    },
    tasks: {
      open: openTasks ?? 0,
    },
    sprints: {
      active: activeSprints ?? 0,
    },
    approvals: {
      pending: pendingApprovals ?? 0,
    },
    deals: {
      open: openDeals ?? 0,
      pipeline_by_stage: pipelineByStage,
    },
    activity: recentActivity ?? [],
    updated_at: new Date().toISOString(),
  })
}
