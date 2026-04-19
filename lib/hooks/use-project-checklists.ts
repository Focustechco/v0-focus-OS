import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface ChecklistItem {
  id: string
  checklist_id: string
  texto: string
  concluido: boolean
  ordem: number
}

export interface Checklist {
  id: string
  titulo: string
  projeto_id: string
  tarefa_id: string
  itens?: ChecklistItem[]
  tarefas?: {
    titulo: string
    sprints?: {
      nome: string
    }
  }
}

export function useProjectChecklists() {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false
    return true
  }

  const fetcher = async () => {
    await checkAuth()
    const { data, error } = await supabase
      .from("checklists")
      .select(`
        *,
        tarefas (
          titulo,
          sprints (
            nome
          )
        ),
        checklist_itens (*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar checklists:", JSON.stringify(error, null, 2))
      throw error
    }

    // Adaptacao para o formato esperado pela UI
    return (data || []).map((cl: any) => ({
      id: cl.id,
      titulo: cl.titulo,
      tarefa: cl.tarefas?.titulo || "Sem Tarefa",
      sprint: cl.tarefas?.sprints?.nome || "Sem Sprint",
      items: cl.checklist_itens?.map((it: any) => ({
        id: it.id,
        text: it.texto,
        done: it.concluido
      })) || []
    }))
  }

  const { data, error, isLoading, mutate } = useSWR("project-checklists", fetcher)

  useEffect(() => {
    const channelId = `checklists_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklists' }, () => mutate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_itens' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const toggleItem = async (itemId: string, concluido: boolean) => {
    await checkAuth()
    const { error } = await supabase
      .from("checklist_itens")
      .update({ concluido })
      .eq("id", itemId)

    if (error) {
      console.error("Erro ao atualizar item do checklist:", error)
      return false
    }

    mutate()
    return true
  }

  return {
    projectChecklists: data || [],
    isLoading,
    isError: error,
    mutate,
    toggleItem
  }
}
