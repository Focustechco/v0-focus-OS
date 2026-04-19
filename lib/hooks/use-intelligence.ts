import useSWR from "swr"
import { supabase } from "@/lib/supabase"

export function useIntelligence() {
  const fetcher = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    // Fetching stats from standardized Portuguese tables
    const [
      { count: projectsCount },
      { count: tasksCount },
      { count: activeSprintsCount },
      { count: pendingApprovalsCount },
      { count: clientsCount }
    ] = await Promise.all([
      supabase.from("projetos").select("*", { count: "exact", head: true }),
      supabase.from("tarefas").select("*", { count: "exact", head: true }).eq("status", "a_fazer"),
      supabase.from("sprints").select("*", { count: "exact", head: true }).eq("status", "ativa"),
      supabase.from("aprovacoes").select("*", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("clientes").select("*", { count: "exact", head: true })
    ])

    return {
      activeTasksCount: tasksCount || 0,
      kpis: {
        activeSprints: activeSprintsCount || 0,
        totalProjects: projectsCount || 0,
        totalClients: clientsCount || 0
      },
      alerts: {
        approvalsCount: pendingApprovalsCount || 0
      }
    }
  }

  const { data, error, isLoading, mutate } = useSWR("intelligence-stats", fetcher, {
    refreshInterval: 30000 // Refresh every 30s
  })

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate
  }
}
