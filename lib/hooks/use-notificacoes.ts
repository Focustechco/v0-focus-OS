"use client"

import { useNotifications, Notification } from "@/contexts/notification-context"

// Mantendo a interface para compatibilidade com o componente NotificationsPanel
export interface Notificacao {
  id: string
  titulo: string
  descricao: string
  tipo: string
  lida: boolean
  created_at: string
  referencia_tipo?: string
  referencia_id?: string
}

export function useNotificacoes() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh } = useNotifications()

  // Transformar as notificações do Contexto para o formato esperado pelo componente legado
  const mappedNotifications: Notificacao[] = notifications.map(n => ({
    id: n.id,
    titulo: n.title,
    descricao: n.body,
    tipo: n.type,
    lida: n.isRead,
    created_at: n.createdAt,
    referencia_tipo: n.relatedEntityType || undefined,
    referencia_id: n.relatedEntityId || undefined
  }))

  return {
    notificacoes: mappedNotifications,
    notifications: mappedNotifications,
    unreadCount,
    isLoading: loading,
    markAsRead,
    markAllAsRead,
    refresh
  }
}

// Helper para criar notificações (opcional se for usar no lado do cliente, 
// mas recomendado usar a API server-side para segurança)
export async function criarNotificacao(titulo: string, corpo: string, tipo: string = "info") {
  // Em uma aplicação real, você chamaria uma API server-side que verifica permissões
  console.log("Criando notificação:", { titulo, corpo, tipo })
}
