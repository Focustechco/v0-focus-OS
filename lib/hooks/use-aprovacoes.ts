import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Aprovacao {
  id: string
  projeto_id: string
  tarefa_id?: string
  titulo: string
  descricao?: string
  status: "pendente" | "aprovado" | "reprovado"
  assigned_to: string
  priority?: string
  approval_type?: string
  created_at: string
  projetos?: {
    nome: string
  }
}

export function useAprovacoes() {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false
    return true
  }

  const fetcher = async () => {
    const res = await fetch('/api/approvals')
    if (!res.ok) {
      throw new Error("Erro ao buscar aprovações")
    }
    return res.json()
  }

  const { data, error, isLoading, mutate } = useSWR<Aprovacao[]>("aprovacoes", fetcher)

  useEffect(() => {
    const channelId = `aprovacoes_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'aprovacoes' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const updateStatus = async (id: string, status: "aprovado" | "reprovado") => {
    await checkAuth()
    const { data: updated, error } = await supabase
      .from("aprovacoes")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar aprovacao:", error)
      return null
    }

    mutate()
    return updated
  }

  return {
    aprovacoes: data || [],
    approvals: data || [], // Alias para compatibilidade legada
    isLoading,
    isError: error,
    mutate,
    updateStatus,
  }
}

// Alias para compatibilidade legada
export { useAprovacoes as useApprovals }
