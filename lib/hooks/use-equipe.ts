import { useEffect } from "react"
import useSWR from "swr"
import { supabase } from "@/lib/supabase"

export interface TeamMember {
  id: string
  nome: string
  email: string
  cargo?: string
  setor?: string
  tipo: "admin" | "colaborador" | "estagiario"
  status: "ativo" | "inativo"
  foto_url?: string
  telefone?: string
  data_nascimento?: string
  data_admissao?: string
  salario?: number
  contrato_url?: string
  linkedin?: string
  github?: string
  bio?: string
  tecnologias?: string[]
  cor_avatar?: string
  created_at?: string
}

export function useEquipe() {
  const fetcher = async () => {
    const { data, error } = await supabase
      .from("equipe")
      .select("*")
      .order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao buscar equipe:", JSON.stringify(error, null, 2))
      throw error
    }

    return data || []
  }

  const { data, error, isLoading, mutate } = useSWR("equipe", fetcher)

  useEffect(() => {
    const channelId = `equipe_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "equipe" }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const addMembro = async (membroData: any) => {
    // Tenta primeiro com todos os campos, se falhar por coluna inexistente, tenta o básico
    const { data, error } = await supabase
      .from("equipe")
      .insert([membroData])
      .select()
      .single()

    if (error && error.code === 'PGRST204') {
      const { tipo, status, bio, linkedin, github, tecnologias, cor_avatar, ...baseData } = membroData
      const fallback = await supabase.from("equipe").insert([baseData]).select().single()
      if (fallback.error) return { error: fallback.error }
      mutate()
      return { data: fallback.data }
    }

    if (error) {
      console.error("Erro ao adicionar membro:", JSON.stringify(error, null, 2))
      return { error }
    }

    mutate()
    return { data }
  }

  const updateMembro = async (id: string, updates: Partial<TeamMember>) => {
    // Tenta o update completo. Se falhar por coluna não encontrada (PGRST204), filtra e tenta o básico.
    const { data, error } = await supabase
      .from("equipe")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error && error.code === 'PGRST204') {
      console.warn("[Equipe] Coluna nao encontrada, tentando update filtrado")
      // Remove campos que costumam faltar em schemas antigos
      const { tipo, status, bio, linkedin, github, tecnologias, cor_avatar, telefone, data_nascimento, data_admissao, salario, contrato_url, ...baseUpdates } = updates as any
      const fallback = await supabase.from("equipe").update(baseUpdates).eq("id", id).select().single()
      if (fallback.error) return { error: fallback.error }
      mutate()
      return { data: fallback.data }
    }

    if (error) {
      console.error("Erro ao atualizar membro:", JSON.stringify(error, null, 2))
      return { error }
    }

    mutate()
    return { data }
  }

  const uploadAvatar = async (memberId: string, file: File) => {
    const ext = file.name.split(".").pop()
    const path = `avatares/${memberId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatares")
      .upload(path, file, { upsert: true })

    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
      .from("avatares")
      .getPublicUrl(path)

    return { url: publicUrl }
  }

  const uploadContrato = async (memberId: string, file: File) => {
    const ext = file.name.split(".").pop()
    const path = `contratos/${memberId}/contrato.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("contratos")
      .upload(path, file, { upsert: true })

    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
      .from("contratos")
      .getPublicUrl(path)

    return { url: publicUrl }
  }

  return {
    equipe: (data || []) as TeamMember[],
    isLoading,
    isError: error,
    mutate,
    addMembro,
    updateMembro,
    uploadAvatar,
    uploadContrato,
  }
}
