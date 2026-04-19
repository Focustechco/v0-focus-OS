import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: "info" | "success" | "warning" | "error"
  lida: boolean
  created_at: string
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false
    return true
  }

  const fetchNotificacoes = useCallback(async () => {
    setIsLoading(true)
    await checkAuth()
    try {
      const { data, error } = await supabase
        .from("notificacoes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotificacoes(data || [])
    } catch (error) {
      console.error("Erro ao carregar notificacoes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotificacoes()

    const channelId = `notifications_realtime_${Math.random().toString(36).substring(2, 9)}`
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes' }, () => fetchNotificacoes())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotificacoes])

  const marcarComoLida = async (id: string) => {
    await checkAuth()
    const { error } = await supabase
      .from("notificacoes")
      .update({ lida: true })
      .eq("id", id)

    if (error) {
      console.error("Erro ao marcar como lida:", error)
      return false
    }

    setNotificacoes(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    )
    return true
  }

  return {
    notificacoes,
    notifications: notificacoes, // Alias para compatibilidade legada
    unreadCount: notificacoes.filter(n => !n.lida).length,
    isLoading,
    marcarComoLida,
    markAsRead: marcarComoLida, // Alias para compatibilidade legada
    refresh: fetchNotificacoes
  }
}

export async function criarNotificacao(titulo: string, mensagem: string, tipo: string = "info") {
  const { error } = await supabase
    .from("notificacoes")
    .insert([{
      titulo,
      mensagem,
      tipo,
      lida: false
    }])

  if (error) {
    console.error("Erro ao criar notificacao:", error)
    return false
  }
  return true
}
