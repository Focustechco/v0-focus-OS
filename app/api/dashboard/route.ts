import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getClickUpConfig, clickupFetch, ClickUpNotConfiguredError } from "@/lib/clickup-server"
import { mapTaskToDeal, type CRMDeal } from "@/lib/crm-field-mapper"
import type { ClickUpTask } from "@/lib/clickup-api"
export const dynamic = 'force-dynamic'

// Helper: run a query and return [] / 0 on any error instead of throwing
async function safeQuery<T>(fn: () => Promise<{ data: T | null; error: any; count?: number | null }>): Promise<{ data: T; count: number }> {
  try {
    const result = await fn()
    if (result.error) {
      console.warn("[dashboard] query warning:", result.error.message)
    }
    return {
      data: (result.data ?? []) as T,
      count: result.count ?? (Array.isArray(result.data) ? result.data.length : 0)
    }
  } catch (e: any) {
    console.warn("[dashboard] query exception:", e?.message)
    return { data: [] as unknown as T, count: 0 }
  }
}

async function fetchClickUpPipelineDeals(): Promise<CRMDeal[]> {
  const cfg = await getClickUpConfig()
  if (!cfg.configured || !cfg.listId) {
    throw new ClickUpNotConfiguredError()
  }

  const params = new URLSearchParams({ archived: "false", include_closed: "true", subtasks: "true" })
  const data = await clickupFetch<{ tasks: ClickUpTask[] }>(`/list/${cfg.listId}/task?${params}`)
  return data.tasks.map(mapTaskToDeal)
}

function buildCommercialLeadSummary(deals: CRMDeal[]) {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const activeDeals = deals.filter(d => {
    const status = d.status.status.toLowerCase()
    return status !== 'fechado' && status !== 'perdido'
  })
  const negotiationDeals = deals.filter(d => {
    const status = d.status.status.toLowerCase()
    return status.includes('negoc') || status.includes('proposta')
  })
  const newThisMonth = deals.filter(d => d.dateCreated >= monthStart)

  return {
    leads: activeDeals.slice(0, 4).map(deal => ({
      id: deal.id,
      nome: deal.name,
      status: deal.status.status,
    })),
    stats: {
      ativos: activeDeals.length,
      negociacao: negotiationDeals.length,
      novos_mes: newThisMonth.length,
    },
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const clickupPipelineDeals = await (async () => {
      try {
        const deals = await fetchClickUpPipelineDeals()
        return deals
      } catch (error: any) {
        console.warn("[dashboard] clickup pipeline:", error?.message || error)
        return []
      }
    })()

    // Run all 6 primary queries in parallel, each isolated so one failure doesn't break the rest
    const [projetos, tarefas, sprints, aprovacoes, equipe, leads] = await Promise.all([
      safeQuery(() =>
        supabase.from("projetos")
          .select("id, nome, status, progresso, created_at", { count: "exact" })
          .order("created_at", { ascending: false })
      ),
      safeQuery(() =>
        supabase.from("tarefas")
          .select("id, titulo, status, prioridade, prazo, projeto_id", { count: "exact" })
          .neq("status", "concluida")
      ),
      safeQuery(() =>
        supabase.from("sprints")
          .select("id, nome, status, data_fim")
          .eq("status", "ativa")
          .order("data_fim", { ascending: true })
      ),
      safeQuery(() =>
        supabase.from("aprovacoes")
          .select("id, titulo, status, created_at", { count: "exact" })
          .eq("status", "pendente")
          .order("created_at", { ascending: true })
      ),
      safeQuery(() =>
        supabase.from("equipe").select("id, nome, status")
      ),
      safeQuery(() =>
        supabase.from("leads")
          .select("id, nome, status, created_at")
          .not("status", "fechado_ganho")
          .not("status", "fechado_perdido")
          .order("created_at", { ascending: false })
      ),
    ])

    // Secondary counts (non-critical)
    const [totalLeadsAtivos, totalLeadsMes, totalTarefas, totalConcluidas] = await Promise.all([
      safeQuery(() => supabase.from("leads").select("*", { count: "exact", head: true }).not("status", "fechado_ganho").not("status", "fechado_perdido")),
      safeQuery(() => supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())),
      safeQuery(() => supabase.from("tarefas").select("*", { count: "exact", head: true })),
      safeQuery(() => supabase.from("tarefas").select("*", { count: "exact", head: true }).eq("status", "concluida")),
    ])

    // --- Derived metrics ---
    const tarefasData: any[] = Array.isArray(tarefas.data) ? tarefas.data : []
    const projetosData: any[] = Array.isArray(projetos.data) ? projetos.data : []
    const sprintsData: any[] = Array.isArray(sprints.data) ? sprints.data : []
    const aprovacoesData: any[] = Array.isArray(aprovacoes.data) ? aprovacoes.data : []
    const equipeData: any[] = Array.isArray(equipe.data) ? equipe.data : []
    const leadsData: any[] = Array.isArray(leads.data) ? leads.data : []

    const clickupCommercialSummary = clickupPipelineDeals.length > 0 ? buildCommercialLeadSummary(clickupPipelineDeals) : null
    const pipelineLeads = clickupCommercialSummary ? clickupCommercialSummary.leads : leadsData
    const pipelineLeadStats = clickupCommercialSummary ? clickupCommercialSummary.stats : {
      ativos: totalLeadsAtivos.count,
      negociacao: leadsData.filter(l => ['proposta_enviada', 'negociacao', 'reuniao_agendada'].includes(l.status)).length,
      novos_mes: totalLeadsMes.count,
    }

    const topProjetos = projetosData.slice(0, 5).map(p => ({
      id: p.id,
      name: p.nome || "Sem nome",
      stage: p.status || "geral",
      progress: Number(p.progresso) || 0
    }))

    const delayedTasks = tarefasData.filter(t => t.prazo && t.prazo < today)
    const urgentTasks = tarefasData
      .filter(t => t.prioridade === 'alta' || (t.prazo && t.prazo < today))
      .sort((a, b) => new Date(a.prazo || '2099-01-01').getTime() - new Date(b.prazo || '2099-01-01').getTime())
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        titulo: t.titulo,
        projeto: "Geral",
        sprint: null,
        prioridade: t.prioridade,
        prazo: t.prazo || null,
        isDelayed: !!(t.prazo && t.prazo < today)
      }))

    const inProgressTasks = tarefasData.filter(t => t.status === 'em_andamento' || t.status === 'em_progresso').length
    const reviewTasks = tarefasData.filter(t => t.status === 'em_revisao').length
    const percentageCompleted = totalTarefas.count > 0
      ? Math.round((totalConcluidas.count / totalTarefas.count) * 100)
      : 0

    let teamCapacityTotal = 0
    const equipeFormatada = equipeData
      .filter(m => m.status !== 'inativo')
      .slice(0, 8)
      .map(m => {
        const hash = (m.nome || "").split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)
        const occ = 40 + (hash % 50)
        teamCapacityTotal += occ
        return {
          id: m.id,
          nome: m.nome,
          iniciais: (m.nome || "??").substring(0, 2).toUpperCase(),
          ocupacao_percent: occ
        }
      })

    const avgCapacity = equipeFormatada.length > 0
      ? Math.round(teamCapacityTotal / equipeFormatada.length)
      : 0

    let intelligence = "Tempo e capacidade normalizados. Ótimo ritmo de entregas."
    if (avgCapacity > 80) {
      intelligence = "A capacidade média da equipe passou dos 80%. Sugerimos redistribuição de tarefas pendentes."
    } else if (delayedTasks.length > 5) {
      intelligence = `Existem ${delayedTasks.length} tarefas atrasadas impactando suas sprints. Priorize a revisão delas.`
    } else if (projetosData.some(p => Number(p.progresso) === 0)) {
      intelligence = "Há projetos com zero progresso no pipeline aguardando inicialização."
    }

    return NextResponse.json({
      kpis: {
        projetos: projetos.count,
        tarefas_abertas: tarefas.count,
        tarefas_atrasadas: delayedTasks.length,
        sprints_ativas: sprintsData.length,
        proxima_sprint_fim: sprintsData[0]?.nome || "Nenhuma",
        aprovacoes_pendentes: aprovacoes.count,
      },
      projetos: topProjetos,
      tarefas_urgentes: urgentTasks,
      tarefas_stats: {
        in_progress: inProgressTasks,
        review: reviewTasks,
        completed_month_percent: percentageCompleted,
      },
      equipe: equipeFormatada,
      equipe_stats: {
        total: equipeFormatada.length,
        avg_capacity: avgCapacity,
      },
      leads: pipelineLeads.slice(0, 4),
      leads_stats: {
        ativos: pipelineLeadStats.ativos,
        negociacao: pipelineLeadStats.negociacao,
        novos_mes: pipelineLeadStats.novos_mes,
      },
      aprovacoes: aprovacoesData.slice(0, 3).map(a => ({
        id: a.id,
        titulo: a.titulo,
        projeto: null,
        created_at: a.created_at,
      })),
      intelligence,
    })
  } catch (error: any) {
    console.error("[GET /api/dashboard] Fatal error:", error)
    return NextResponse.json(
      { error: error?.message || "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
