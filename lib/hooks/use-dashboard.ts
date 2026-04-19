import useSWR from "swr"
import { supabase } from "@/lib/supabase"

export function useDashboard() {
  const fetcher = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const res = await fetch('/api/dashboard')
    if (!res.ok) throw new Error("Erro ao carregar os dados do dashboard")

    const jsonData = await res.json()
    if (jsonData.error) throw new Error(jsonData.error)
    return jsonData
  }

  const { data, error, isLoading, mutate } = useSWR("dashboard-consolidated", fetcher, {
    refreshInterval: 60000 
  })

  return {
    data,
    isLoading,
    isError: error,
    mutate
  }
}
