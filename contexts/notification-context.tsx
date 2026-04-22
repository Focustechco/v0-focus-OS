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

    // Polling opcional ou setup de Realtime se disponível
    const interval = setInterval(refresh, 60000) // 1 min

    return () => clearInterval(interval)
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
