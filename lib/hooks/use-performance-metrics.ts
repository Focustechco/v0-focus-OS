import useSWR from "swr"
import { supabase } from "@/lib/supabase"

export function usePerformanceMetrics() {
  const fetcher = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    // This hook usually aggregates data for charts. 
    // We'll map to the latest Portuguese table structure.
    const [
      { data: projects },
      { data: tasks },
      { data: team }
    ] = await Promise.all([
      supabase.from("projetos").select("status, created_at"),
      supabase.from("tarefas").select("status, created_at"),
      supabase.from("equipe").select("id, nome")
    ])

    return {
      projectsByStage: projects || [],
      tasksByStatus: tasks || [],
      teamSize: team?.length || 0
    }
  }

  const { data, error, isLoading, mutate } = useSWR("performance-metrics", fetcher)

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate
  }
}
