import useSWR from "swr"
import { supabase } from "@/lib/supabase"

export function useSidebarStats() {
  const fetcher = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { projects: 0, sprints: 0, tasks: 0, approvals: 0, backlog: 0 }

    const [
      { count: projectsCount },
      { count: activeSprintsCount },
      { count: pendingTasksCount },
      { count: pendingApprovalsCount },
      { count: leadsCount }
    ] = await Promise.all([
      supabase.from("projetos").select("*", { count: "exact", head: true }),
      supabase.from("sprints").select("*", { count: "exact", head: true }).eq("status", "ativa"),
      supabase.from("tarefas").select("*", { count: "exact", head: true }).not("status", "eq", "concluida"),
      supabase.from("aprovacoes").select("*", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("leads").select("*", { count: "exact", head: true })
    ])

    return {
      projects: projectsCount || 0,
      sprints: activeSprintsCount || 0,
      tasks: pendingTasksCount || 0,
      approvals: pendingApprovalsCount || 0,
      backlog: leadsCount || 0
    }
  }

  const { data, error, isLoading, mutate } = useSWR("sidebar-stats", fetcher, {
    refreshInterval: 60000 // Refresh every minute
  })

  return {
    stats: data || { projects: 0, sprints: 0, tasks: 0, approvals: 0, backlog: 0 },
    isLoading,
    isError: error,
    mutate
  }
}
