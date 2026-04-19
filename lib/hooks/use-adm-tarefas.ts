import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface AdmTarefa {
  id: string
  titulo: string
  descricao?: string
  status: string
  prioridade: string
  responsavel_id?: string
  prazo?: string
  created_at: string
}

export function useAdmTarefas() {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  }

  const fetcher = async () => {
    await checkAuth()
    const { data, error } = await supabase
      .from("tarefas_dia")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar tarefas adm (JSON):", JSON.stringify(error, null, 2))
      throw error
    }

    return data
  }

  const { data, error, isLoading, mutate } = useSWR("tarefas_dia", fetcher)

  useEffect(() => {
    const channelId = `adm_tarefas_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas_dia' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  return {
    tarefas: data || [],
    tasks: data || [], // Alias para compatibilidade legada
    isLoading,
    isError: error,
    mutate
  }
}

// Alias para compatibilidade legada
export { useAdmTarefas as useAdmTasks }
