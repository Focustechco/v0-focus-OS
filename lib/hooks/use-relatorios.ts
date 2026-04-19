import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Relatorio {
  id: string
  projeto_id: string
  titulo: string
  conteudo: any
  created_at: string
  projetos?: {
    nome: string
  }
}

export function useRelatorios() {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  }

  const fetcher = async () => {
    await checkAuth()
    const { data, error } = await supabase
      .from("relatorios")
      .select(`
        *,
        projetos (
          nome
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar relatorios (JSON):", JSON.stringify(error, null, 2))
      throw error
    }

    return data
  }

  const { data, error, isLoading, mutate } = useSWR("relatorios", fetcher)

  useEffect(() => {
    const channelId = `relatorios_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'relatorios' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const addReport = async (reportData: any) => {
    await checkAuth()
    const { data, error } = await supabase
      .from("relatorios")
      .insert([reportData])
      .select()
      .single()

    if (error) {
      console.error("Erro ao adicionar relatorio:", error)
      return { error }
    }
    mutate()
    return { data }
  }

  const deleteReport = async (id: string) => {
    await checkAuth()
    const { error } = await supabase
      .from("relatorios")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao deletar relatorio:", error)
      return { error }
    }
    mutate()
    return { error: null }
  }

  return {
    relatorios: data || [],
    reports: data || [], // Alias para compatibilidade legada
    isLoading,
    isError: error,
    mutate,
    addReport,
    deleteReport
  }
}

// Alias para compatibilidade legada
export { useRelatorios as useAllReports, useRelatorios as useReports }
