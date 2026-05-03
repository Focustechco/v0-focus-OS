import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface ProjectStage {
  id: string
  projeto_id: string
  nome: string
  descricao: string
  cor: string
  icone: string
  ordem: number
  groups?: ProjectStageGroup[]
}

export interface ProjectStageGroup {
  id: string
  stage_id: string
  nome: string
  badge_color: string
  warning_text: string
  ordem: number
  items?: ProjectChecklistItem[]
}

export interface ProjectChecklistItem {
  id: string
  group_id: string
  projeto_id: string
  titulo: string
  concluido: boolean
  concluido_em?: string
  concluido_por?: string
  ordem: number
}

export function useFluxo(projetoId?: string) {
  const fetcher = async () => {
    if (!projetoId) return []

    const { data: stages, error: stagesError } = await supabase
      .from("project_stages")
      .select(`
        *,
        groups:project_stage_groups (
          *,
          items:project_checklist_items (*)
        )
      `)
      .eq("projeto_id", projetoId)
      .order("ordem", { ascending: true })

    if (stagesError) throw stagesError

    // Ordenar recursivamente (Supabase order só funciona no primeiro nível facilmente)
    return (stages || []).map(stage => ({
      ...stage,
      groups: (stage.groups || [])
        .sort((a: any, b: any) => a.ordem - b.ordem)
        .map((group: any) => ({
          ...group,
          items: (group.items || []).sort((a: any, b: any) => a.ordem - b.ordem)
        }))
    }))
  }

  const { data: stages, error, isLoading, mutate } = useSWR(
    projetoId ? `fluxo-${projetoId}` : null,
    fetcher
  )

  useEffect(() => {
    if (!projetoId) return

    const channel = supabase.channel(`fluxo_realtime_${projetoId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_stages', filter: `projeto_id=eq.${projetoId}` }, () => mutate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_stage_groups' }, () => mutate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_checklist_items', filter: `projeto_id=eq.${projetoId}` }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projetoId, mutate])

  const toggleItem = async (itemId: string, concluido: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from("project_checklist_items")
      .update({ 
        concluido, 
        concluido_em: concluido ? new Date().toISOString() : null,
        concluido_por: concluido ? user?.id : null
      })
      .eq("id", itemId)

    if (error) throw error
    mutate()
  }

  const updateStage = async (id: string, updates: any) => {
    const { error } = await supabase.from("project_stages").update(updates).eq("id", id)
    if (error) throw error
    mutate()
  }

  const updateGroup = async (id: string, updates: any) => {
    const { error } = await supabase.from("project_stage_groups").update(updates).eq("id", id)
    if (error) throw error
    mutate()
  }

  const updateItem = async (id: string, updates: any) => {
    const { error } = await supabase.from("project_checklist_items").update(updates).eq("id", id)
    if (error) throw error
    mutate()
  }

  const addItem = async (groupId: string, projetoId: string, titulo: string, ordem: number) => {
    const { error } = await supabase.from("project_checklist_items").insert({
      group_id: groupId,
      projeto_id: projetoId,
      titulo,
      ordem
    })
    if (error) throw error
    mutate()
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("project_checklist_items").delete().eq("id", id)
    if (error) throw error
    mutate()
  }

  const addGroup = async (stageId: string, nome: string, ordem: number) => {
    const { error } = await supabase.from("project_stage_groups").insert({
        stage_id: stageId,
        nome,
        ordem
    })
    if (error) throw error
    mutate()
  }

  const seedFluxo = async (projetoId: string, tipo: string = 'Software') => {
    // Definir etapas padrão
    const defaultStages = [
      { nome: "DIAGNÓSTICO INICIAL", descricao: "Focus Hub + validação técnica", cor: "bg-blue-500", icone: "Briefcase", ordem: 1 },
      { nome: "MVP - PROTÓTIPO FUNCIONAL", descricao: "Desenvolvimento rápido de prova de conceito", cor: "bg-purple-500", icone: "Code", ordem: 2 },
      { nome: "PROPOSTA E FECHAMENTO", descricao: "Apresentação comercial e assinatura", cor: "bg-yellow-500", icone: "Briefcase", ordem: 3 },
      { nome: "SPRINTS DE DESENVOLVIMENTO", descricao: "Ciclos de desenvolvimento iterativo", cor: "bg-orange-500", icone: "Rocket", ordem: 4 },
      { nome: "DEPLOY E ENTREGA FINAL", descricao: "Lançamento em produção", cor: "bg-green-500", icone: "Shield", ordem: 5 },
      { nome: "SUPORTE RECORRENTE (MRR)", descricao: "Manutenção e evolução contínua", cor: "bg-neutral-500", icone: "HeadphonesIcon", ordem: 6 },
    ]

    for (const s of defaultStages) {
      const { data: stage, error: sErr } = await supabase.from("project_stages").insert({ ...s, projeto_id: projetoId }).select().single()
      if (sErr) throw sErr

      // Adicionar grupos básicos para a etapa 1 como exemplo
      if (s.ordem === 1) {
          const groups = [
              { nome: "COMERCIAL", badge_color: "bg-green-500", tasks: ["Reunião com cliente", "Preenchimento no Focus Hub"] },
              { nome: "DEVSECOPS", badge_color: "bg-purple-500", tasks: ["Valida escopo", "Define infra necessária"] }
          ]
          for (const g of groups) {
              const { data: group, error: gErr } = await supabase.from("project_stage_groups").insert({ stage_id: stage.id, nome: g.nome, badge_color: g.badge_color }).select().single()
              if (gErr) throw gErr
              
              for (const t of g.tasks) {
                  await supabase.from("project_checklist_items").insert({ group_id: group.id, projeto_id: projetoId, titulo: t })
              }
          }
      }
    }
    mutate()
  }

  return {
    stages: stages || [],
    isLoading,
    isError: error,
    mutate,
    toggleItem,
    updateStage,
    updateGroup,
    updateItem,
    addItem,
    deleteItem,
    addGroup,
    seedFluxo
  }
}
