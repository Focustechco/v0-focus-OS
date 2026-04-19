import useSWR from "swr"
import { supabase } from "@/lib/supabase"

export function useDashboard() {
  const fetcher = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    // Parallel fetch for dashboard data using Portuguese tables
    const [
      { data: projects },
      { data: tasks },
      { data: approvals },
      { data: leads }
    ] = await Promise.all([
      supabase.from("projetos").select("*, clientes(nome)").order("created_at", { ascending: false }).limit(5),
      supabase.from("tarefas").select("*, projetos(nome)").order("created_at", { ascending: false }).limit(10),
      supabase.from("aprovacoes").select("*, projetos(nome)").eq("status", "pendente"),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5)
    ])

    return {
      recentProjects: projects || [],
      recentTasks: tasks || [],
      pendingApprovals: approvals || [],
      recentLeads: leads || [],
      backlog: {
        total: leads?.length || 0,
        addedToday: 0, // Simplified for now
        byPriority: { alta: 0, media: 0, baixa: 0 }
      }
    }
  }

  const { data, error, isLoading, mutate } = useSWR("dashboard-data", fetcher, {
    refreshInterval: 60000 
  })

  return {
    data,
    isLoading,
    isError: error,
    mutate
  }
}
