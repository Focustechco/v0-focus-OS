import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Project {
  id: string
  codigo: string
  nome: string
  cliente_id: string
  tech_lead_id?: string
  dev_secundario_id?: string
  status: string
  progresso: number
  prazo?: string
  data_inicio?: string
  descricao?: string
  created_at?: string
  clientes?: { nome: string }
  team_lead?: { nome: string }
  team_dev?: { nome: string }
}

export function useProjetos() {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.warn("Sessao nao encontrada. Redirecionando...")
      // No Next-js client-side, poderíamos usar windows.location.href se necessário
      return false
    }
    return true
  }

  const fetcher = async () => {
    await checkAuth()
    const { data, error } = await supabase
      .from("projetos")
      .select(`
        *,
        clientes(nome),
        team_lead:tech_lead_id(nome),
        team_dev:dev_secundario_id(nome)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar projetos (JSON):", JSON.stringify(error, null, 2))
      throw error
    }

    return data || []
  }

  const { data, error, isLoading, mutate } = useSWR("projetos", fetcher)

  // Real-time Integration
  useEffect(() => {
    const channelId = `projetos_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projetos' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const addProject = async (projectData: any) => {
    await checkAuth()

    // Helper: converte "" → null para campos uuid e date
    const uuid = (v: any) => (v && typeof v === "string" && v.trim() !== "" ? v.trim() : null)
    const date = (v: any) => (v && typeof v === "string" && v.trim() !== "" ? v.trim() : null)

    const insertData = {
      nome: projectData.nome,
      codigo: projectData.codigo || null,
      cliente_id:          uuid(projectData.cliente_id),
      tech_lead_id:        uuid(projectData.tech_lead_id),
      dev_secundario_id:   uuid(projectData.dev_secundario_id),
      status:              projectData.status || "diagnostico",
      prazo:               date(projectData.prazo),
      data_inicio:         date(projectData.data_inicio) || new Date().toISOString().split("T")[0],
      progresso:           projectData.progresso || 0,
      descricao:           projectData.descricao || null,
    }

    const { data: newProject, error } = await supabase
      .from("projetos")
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error("Erro ao adicionar projeto:", error.message, error.details)
      return { error }
    }

    mutate()
    return { data: newProject }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await checkAuth()
    const { data: updatedProject, error } = await supabase
      .from("projetos")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar projeto:", error)
      return null
    }

    mutate()
    return updatedProject
  }

  return {
    projects: data || [],
    isLoading,
    isError: error,
    mutate,
    addProject,
    updateProject,
  }
}

// Alias para compatibilidade legada
export { useProjetos as useProjects }
