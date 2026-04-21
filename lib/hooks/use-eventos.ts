import useSWR from "swr"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export interface Evento {
  id: string
  titulo: string
  descricao?: string
  data: string          // "YYYY-MM-DD"
  hora_inicio: string   // "HH:MM"
  hora_fim: string      // "HH:MM"
  duracao_minutos: number
  tipo: "reuniao" | "tarefa" | "lembrete" | "outro"
  cor: string
  criado_por?: string
  google_event_id?: string
  sincronizado_google: boolean
  evento_membros?: Array<{
    usuario_id: string
    perfil: { nome_completo: string; avatar_url?: string }
  }>
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Erro ao buscar eventos")
  return res.json()
}

export function useEventos(dataInicio?: string, dataFim?: string) {
  const params = new URLSearchParams()
  if (dataInicio) params.set("data_inicio", dataInicio)
  if (dataFim) params.set("data_fim", dataFim)

  const { data, error, isLoading, mutate } = useSWR(
    `/api/eventos?${params.toString()}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const criarEvento = async (payload: {
    titulo: string
    descricao?: string
    data: string
    hora_inicio: string
    duracao_minutos: number
    tipo: string
    cor: string
    membros_ids?: string[]
    attendees_emails?: string[]
    criar_no_google?: boolean
  }) => {
    // Busca usuário atual
    const { data: { user } } = await supabase.auth.getUser()

    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, criado_por: user?.id }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erro ao criar evento")
    }

    const result = await res.json()
    mutate() // Revalida lista
    return result
  }

  const deletarEvento = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const res = await fetch(`/api/eventos/${id}?user_id=${user?.id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Erro ao deletar evento")
    mutate()
  }

  const atualizarEvento = async (id: string, payload: Partial<Evento>) => {
    const res = await fetch(`/api/eventos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Erro ao atualizar evento")
    mutate()
  }

  return {
    eventos: (data?.eventos || []) as Evento[],
    isLoading,
    isError: !!error,
    mutate,
    criarEvento,
    deletarEvento,
    atualizarEvento,
  }
}
