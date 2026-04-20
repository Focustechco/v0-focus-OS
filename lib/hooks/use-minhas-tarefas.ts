import useSWR from "swr"
import { useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface ChecklistItem {
  id: string
  task_id: string
  title: string
  assigned_to?: string
  is_done: boolean
  prazo?: string
  created_at?: string
}

export interface MinhasTarefasItem {
  // Dados da tarefa pai
  id: string
  titulo: string
  descricao?: string
  projeto_id: string
  projeto_nome: string
  responsavel_id?: string
  prazo?: string
  prioridade: "alta" | "media" | "baixa"
  status: string
  progress?: number
  created_at?: string
  // Relação com checklist
  checklist_items: ChecklistItem[]
  // Helpers
  isOwner: boolean        // Tarefa DIRETAMENTE atribuída ao usuário
  myChecklist: ChecklistItem[] // Apenas subtarefas do usuário
  checklistTotal: number
  checklistDone: number
}

export function useMinhasTarefas() {
  const fetcher = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) return []

    const userId = session.user.id

    // 1. Busca tarefas com checklist aninhado
    const { data: todasTarefas, error } = await supabase
      .from("tarefas")
      .select(`
        *,
        checklist_items (
          id,
          task_id,
          title,
          assigned_to,
          is_done,
          created_at
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      const msg = error?.message || JSON.stringify(error)
      console.error("[useMinhasTarefas] Fetch error:", msg)
      // Retorna array vazio em vez de throw para não quebrar a UI
      return []
    }

    if (!todasTarefas) return []

    // 2. Tentar buscar projetos — pode ser tabela "projetos" ou "projects"
    let projetoMap: Record<string, string> = {}
    const { data: projetos } = await supabase
      .from("projetos")
      .select("id, nome")
    if (projetos) {
      projetoMap = Object.fromEntries(projetos.map((p: any) => [p.id, p.nome]))
    } else {
      // Fallback — tenta tabela "projects" com "name"
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name")
      if (projects) {
        projetoMap = Object.fromEntries(projects.map((p: any) => [p.id, p.name]))
      }
    }

    // 4. Filtrar: Somente tarefas onde user é responsável OU tem checklist atribuída
    const minhas: MinhasTarefasItem[] = []

    for (const tarefa of todasTarefas || []) {
      const isOwner = tarefa.responsavel_id === userId
      const myChecklist = (tarefa.checklist_items || []).filter(
        (ci: ChecklistItem) => ci.assigned_to === userId
      )

      // Inclui se o usuário é responsável pela tarefa OU tem alguma subtarefa atribuída
      if (isOwner || myChecklist.length > 0) {
        minhas.push({
          ...tarefa,
          projeto_nome: projetoMap[tarefa.projeto_id] || "Projeto",
          isOwner,
          myChecklist,
          checklistTotal: tarefa.checklist_items?.length || 0,
          checklistDone: tarefa.checklist_items?.filter((ci: ChecklistItem) => ci.is_done).length || 0,
        })
      }
    }

    return minhas
  }

  const { data, error, isLoading, mutate } = useSWR("minhas-tarefas", fetcher, {
    refreshInterval: 30000,
  })

  const toggleChecklist = useCallback(async (itemId: string, isDone: boolean) => {
    // Atualiza otimisticamente no cache local
    mutate(
      (current: MinhasTarefasItem[] | undefined) =>
        current?.map((tarefa) => ({
          ...tarefa,
          checklist_items: tarefa.checklist_items.map((ci) =>
            ci.id === itemId ? { ...ci, is_done: isDone } : ci
          ),
          myChecklist: tarefa.myChecklist.map((ci) =>
            ci.id === itemId ? { ...ci, is_done: isDone } : ci
          ),
          checklistDone:
            tarefa.checklist_items.filter((ci) =>
              ci.id === itemId ? isDone : ci.is_done
            ).length,
        })),
      false
    )

    // Chama a API real
    const res = await fetch(`/api/checklist-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: isDone }),
    })

    if (!res.ok) {
      // Reverte em caso de erro
      mutate()
    }
  }, [mutate])

  // Realtime: ouvir mudanças em tarefas e checklist_items
  useEffect(() => {
    const chanId = `minhas_tarefas_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase
      .channel(chanId)
      .on("postgres_changes", { event: "*", schema: "public", table: "tarefas" }, () => mutate())
      .on("postgres_changes", { event: "*", schema: "public", table: "checklist_items" }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  // Cálculos globais para o card "Minha Pauta"
  const tarefas = data || []
  const totalItems = tarefas.reduce((acc, t) => {
    // Conta a tarefa pai se for responsável
    const countParent = t.isOwner ? 1 : 0
    // Conta as subtarefas atribuídas
    return acc + countParent + t.myChecklist.length
  }, 0)

  const doneItems = tarefas.reduce((acc, t) => {
    const parentDone = t.isOwner && t.status === "concluida" ? 1 : 0
    const checksDone = t.myChecklist.filter((ci) => ci.is_done).length
    return acc + parentDone + checksDone
  }, 0)

  const progressGlobal = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  return {
    tarefas,
    isLoading,
    isError: error,
    mutate,
    toggleChecklist,
    totalItems,
    doneItems,
    progressGlobal,
  }
}
