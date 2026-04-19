import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Sprint {
  id: string
  nome: string
  projeto_id: string
  objetivo: string | null
  data_inicio: string
  data_fim: string
  status: "ativa" | "concluida" | "cancelada"
  created_at: string
}

export function useSprints(projetoId?: string) {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false
    return true
  }

  const fetcher = async () => {
    await checkAuth()
    let query = supabase.from("sprints").select(`
      *,
      projetos(nome, codigo)
    `)
    
    if (projetoId) {
      query = query.eq("projeto_id", projetoId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar sprints (JSON):", JSON.stringify(error, null, 2))
      throw error
    }

    return data
  }

  const { data, error, isLoading, mutate } = useSWR(projetoId ? `sprints-${projetoId}` : "sprints", fetcher)

  useEffect(() => {
    const channelId = `sprints_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sprints' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const addSprint = async (sprintData: any) => {
    await checkAuth()
    const { data: newSprint, error } = await supabase
      .from("sprints")
      .insert([{
        nome: sprintData.nome,
        projeto_id: sprintData.projeto_id,
        objetivo: sprintData.objetivo,
        data_inicio: sprintData.data_inicio,
        data_fim: sprintData.data_fim,
        status: 'ativa'
      }])
      .select()
      .single()

    if (error) {
      console.error("Erro ao adicionar sprint:", error.message, error.details)
      return { error }
    }

    mutate() 
    return { data: newSprint }
  }

  return {
    sprints: data || [],
    isLoading,
    isError: error,
    addSprint,
    mutate,
  }
}
