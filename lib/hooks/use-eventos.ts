import useSWR from "swr"
import { supabase } from "@/lib/supabase"

export interface Evento {
  id: string
  titulo: string
  descricao?: string
  data: string
  hora_inicio: string
  hora_fim: string
  duracao_minutos: number
  tipo: string
  cor: string
  criado_por?: string
  google_event_id?: string
  sincronizado_google: boolean
  google_cal_url?: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Erro ao buscar eventos")
  return json
}

export function useEventos(dataInicio?: string, dataFim?: string) {
  const params = new URLSearchParams()
  if (dataInicio) params.set("data_inicio", dataInicio)
  if (dataFim) params.set("data_fim", dataFim)

  const { data, error, isLoading, mutate } = useSWR(
    `/api/eventos?${params.toString()}`,
    fetcher,
    { refreshInterval: 15000, revalidateOnFocus: true }
  )

  const criarEvento = async (payload: {
    titulo: string
    descricao?: string
    data: string
    hora_inicio: string
    duracao_minutos: number
    tipo: string
    cor?: string
    membros_ids?: string[]
    attendees_emails?: string[]
    criar_no_google?: boolean
  }) => {
    const { data: { user } } = await supabase.auth.getUser()

    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        criado_por: user?.id || null
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.error || "Erro ao criar evento")
    }

    // Revalida a lista para mostrar o novo evento
    await mutate()

    return result
  }

  const deletarEvento = async (id: string) => {
    const res = await fetch(`/api/eventos/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Erro ao deletar evento")
    await mutate()
  }

  return {
    eventos: (data?.eventos || []) as Evento[],
    isLoading,
    isError: !!error,
    mutate,
    criarEvento,
    deletarEvento,
  }
}
