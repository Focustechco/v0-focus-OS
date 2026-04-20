import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Task {
  id: string
  titulo: string
  descricao?: string
  projeto_id: string
  sprint_id?: string
  responsavel_id?: string
  prazo?: string
  prioridade: "alta" | "media" | "baixa"
  status: "a_fazer" | "em_andamento" | "concluida" | "bloqueada"
  created_at?: string
}

export function useTarefas(sprintId?: string, projetoId?: string) {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false
    return true
  }

  const fetcher = async () => {
    await checkAuth()
    let query = supabase.from("tarefas").select(`
      *,
      checklist_items (
        id,
        title,
        is_done,
        assigned_to
      )
    `)
    
    if (sprintId) {
      query = query.eq("sprint_id", sprintId)
    }
    if (projetoId) {
      query = query.eq("projeto_id", projetoId)
    }

    const { data, error } = await query.order("created_at", { ascending: true })

    if (error) {
      console.error("Erro ao buscar tarefas (JSON):", JSON.stringify(error, null, 2))
      throw error
    }

    // Add summary fields for UI
    const tasksWithChecklist = data?.map((t: any) => ({
      ...t,
      checklist_total: t.checklist_items?.length || 0,
      checklist_done: t.checklist_items?.filter((i: any) => i.is_done).length || 0
    }))

    return tasksWithChecklist as Task[]
  }

  const { data, error, isLoading, mutate } = useSWR(
    sprintId ? `tarefas-sprint-${sprintId}` : projetoId ? `tarefas-proj-${projetoId}` : "tarefas", 
    fetcher
  )

  useEffect(() => {
    const channelId = `tarefas_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const addTask = async (taskData: any) => {
    await checkAuth()
    const { data: newTask, error } = await supabase
      .from("tarefas")
      .insert([{
        titulo: taskData.titulo,
        projeto_id: taskData.projeto_id,
        sprint_id: taskData.sprint_id || null,
        responsavel_id: taskData.responsavel_id || null,
        prazo: taskData.prazo || null,
        prioridade: taskData.prioridade || 'media',
        status: taskData.status || 'a_fazer',
        descricao: taskData.descricao || null
      }])
      .select()
      .single()

    if (error) {
      console.error("Erro ao adicionar tarefa:", error.message)
      return { error }
    }

    mutate()
    return { data: newTask }
  }

  return {
    tasks: data || [],
    isLoading,
    isError: error,
    mutate,
    addTask,
  }
}

// Alias para compatibilidade legada
export { useTarefas as useTasks }
