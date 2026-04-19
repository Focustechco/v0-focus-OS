import useSWR, { mutate as globalMutate } from 'swr'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type Cliente = {
  id: string
  nome: string
  empresa: string
  email?: string
  telefone?: string
  observacoes?: string
  created_at: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Erro ao carregar clientes')
  }
  return res.json() as Promise<Cliente[]>
}

export function useClientes() {
  const { data: clientes, error, isLoading, mutate } = useSWR<Cliente[]>('/api/clientes', fetcher)

  const addCliente = async (cliente: Omit<Cliente, 'id' | 'created_at'>) => {
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cliente)
      })

      const json = await res.json()

      if (!res.ok) {
        return { data: null, error: new Error(json.error || 'Erro ao criar cliente') }
      }

      // Re-fetch para atualizar componentes localmente (SWR resolve o resto em background tb)
      await mutate()

      return { data: json.data, error: null }
    } catch (err: any) {
      console.error("Erro no addCliente hook:", err)
      return { data: null, error: err }
    }
  }

  // Realtime subscription (opicional para manter a lista em sync entre devices)
  useEffect(() => { 
    // Usamos ID unico para evitar conflitos de cache no supabase-js
    const channelId = `clientes_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => {
        // Quando uma mudanca realTime eh detectada, validamos SWR cache
        mutate()
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  return { 
    clientes: clientes || [], 
    isLoading, 
    addCliente, 
    refetch: mutate,
    // Alias para compatibilidade legada
    clients: clientes || [],
    addClient: addCliente
  }
}

export { useClientes as useClients }
