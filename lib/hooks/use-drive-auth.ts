"use client"

import { useCallback, useEffect, useState } from "react"
import { disconnectDrive, getDriveAuthUrl, getDriveStatus } from "@/lib/services/drive-api"
import { supabase } from "@/lib/supabase"

export function useDriveAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const status = await getDriveStatus()
      setIsAuthenticated(status.connected)
      setError(null)
      // If not connected but user is logged in, try to restore from server-side stored refresh token
      if (!status.connected) {
        try {
          const { data } = await supabase.auth.getSession()
          const userId = (data as any)?.session?.user?.id
          if (userId) {
            await fetch('/api/drive/restore', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId }),
            })
            // Re-check status
            const newStatus = await getDriveStatus()
            setIsAuthenticated(newStatus.connected)
          }
        } catch (restoreErr) {
          // ignore restore errors; keep original status
        }
      }
    } catch (err: any) {
      setIsAuthenticated(false)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Re-run refresh when Supabase auth state changes (user signs in/out)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // When session changes, re-check Drive connection status
      refresh()
    })

    return () => listener.subscription.unsubscribe()
  }, [refresh])

  const connect = useCallback(async () => {
    setIsLoading(true)
    try {
      // Use server-side OAuth URL generation (direct Google OAuth2 flow)
      // This ensures the authorization code is a real Google code that our
      // /api/drive/callback can exchange for tokens via googleapis.
      const response = await getDriveAuthUrl()
      window.location.href = response.authUrl
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    setIsLoading(true)
    try {
      await disconnectDrive()
      setIsAuthenticated(false)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isAuthenticated,
    isLoading,
    error,
    connect,
    disconnect,
    refresh,
  }
}
