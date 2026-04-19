import useSWR from "swr"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface Contrato {
  id: string
  nome: string
  cliente_id: string
  valor: string
  status: "pendente" | "ativo" | "vencido" | "cancelado"
  data: string
  created_at: string
}

export function useContratos() {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  }

  const fetcher = async () => {
    await checkAuth()
    const { data, error } = await supabase
      .from("contratos")
      .select(`
        *,
        clientes (
          nome
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar contratos (JSON):", JSON.stringify(error, null, 2))
      throw error
    }

    return data
  }

  const { data, error, isLoading, mutate } = useSWR("contratos", fetcher)

  useEffect(() => {
    const channelId = `contratos_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contratos' }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  const addContrato = async (contractData: any) => {
    await checkAuth()
    const { data, error } = await supabase
      .from("contratos")
      .insert([contractData])
      .select()
      .single()

    if (error) {
      console.error("Erro ao adicionar contrato:", error)
      return { error }
    }

    mutate()
    return { data }
  }

  const updateContrato = async (id: string, updates: any) => {
    await checkAuth()
    const { data, error } = await supabase
      .from("contratos")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar contrato:", error)
      return { error }
    }

    mutate()
    return { data }
  }

  return {
    contracts: data || [],
    contratos: data || [],
    isLoading,
    isError: error,
    mutate,
    addContract: addContrato,
    addContrato,
    updateContract: updateContrato,
    updateContrato
  }
}

// Alias
export { useContratos as useContracts }
