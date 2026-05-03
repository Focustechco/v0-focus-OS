"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export interface Notification {
  id: string
  title: string
  body: string
  isRead: boolean
  type: string
  relatedEntityType?: string
  relatedEntityId?: string
  triggeredBy?: string
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const refresh = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch(`/api/notifications?userId=${user.id}`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Erro ${res.status} ao buscar notificações`)
      }
      
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      
      await fetch(`/api/notifications`, {
        method: "PATCH",
        body: JSON.stringify({ notificationId: id, isRead: true })
      })
    } catch (error) {
      console.error(error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))

      await fetch(`/api/notifications`, {
        method: "PATCH",
        body: JSON.stringify({ userId: user.id, isRead: true })
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    refresh()

    // Setup de Realtime para ouvir novas notificações
    let channel: ReturnType<typeof supabase.channel>

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel("notificacoes_channel")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notificacoes",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as any
            
            // Format new notification to match local state
            const mappedNewNotif: Notification = {
              id: newNotif.id,
              title: newNotif.titulo,
              body: newNotif.mensagem,
              isRead: newNotif.lida,
              type: newNotif.tipo,
              relatedEntityType: newNotif.ref_type,
              relatedEntityId: newNotif.ref_id,
              triggeredBy: newNotif.triggered_by,
              createdAt: newNotif.created_at,
            }

            setNotifications((prev) => [mappedNewNotif, ...prev])

            // Exibir toast customizado
            toast.success(mappedNewNotif.title, {
              description: mappedNewNotif.body,
              style: {
                background: "#1e1e1e",
                borderLeft: "3px solid #e87c2a",
                color: "#fff",
              },
              duration: 5000,
            })
          }
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
