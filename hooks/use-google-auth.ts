"use client"

import { useState, useCallback, useEffect } from "react"

type GoogleScope = "sheets" | "drive" | "calendar"

interface TokenData {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  scope: string
}

interface UseGoogleAuthReturn {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => void
  getToken: () => string | null
  refreshToken: () => Promise<boolean>
}

const SCOPES: Record<GoogleScope, string[]> = {
  sheets: [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.file",
  ],
  drive: [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.file",
  ],
  calendar: [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ],
}

const TOKEN_PREFIX = "focusOS_token_"

export function useGoogleAuth(scope: GoogleScope): UseGoogleAuthReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storageKey = `${TOKEN_PREFIX}${scope}`

  // Check for existing token on mount
  useEffect(() => {
    const tokenData = getStoredToken()
    if (tokenData && tokenData.expiresAt > Date.now()) {
      setIsConnected(true)
      
      // Set up auto-refresh 5 minutes before expiry
      const timeUntilRefresh = tokenData.expiresAt - Date.now() - 5 * 60 * 1000
      if (timeUntilRefresh > 0) {
        const timeout = setTimeout(() => {
          refreshToken()
        }, timeUntilRefresh)
        return () => clearTimeout(timeout)
      }
    } else if (tokenData) {
      // Token expired, try to refresh
      refreshToken()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStoredToken = useCallback((): TokenData | null => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Invalid JSON
    }
    return null
  }, [storageKey])

  const storeToken = useCallback((tokenData: TokenData) => {
    localStorage.setItem(storageKey, JSON.stringify(tokenData))
    setIsConnected(true)
  }, [storageKey])

  const getToken = useCallback((): string | null => {
    const tokenData = getStoredToken()
    if (tokenData && tokenData.expiresAt > Date.now()) {
      return tokenData.accessToken
    }
    return null
  }, [getStoredToken])

  const signIn = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      
      if (!clientId) {
        // Demo mode - simulate OAuth
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const mockToken: TokenData = {
          accessToken: `mock_${scope}_token_${Date.now()}`,
          expiresAt: Date.now() + 3600 * 1000, // 1 hour
          scope: SCOPES[scope].join(" "),
        }
        
        storeToken(mockToken)
        setIsLoading(false)
        return
      }

      // Real OAuth flow
      const redirectUri = `${window.location.origin}/api/auth/google`
      const scopeString = SCOPES[scope].join(" ")
      
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
      authUrl.searchParams.set("client_id", clientId)
      authUrl.searchParams.set("redirect_uri", redirectUri)
      authUrl.searchParams.set("response_type", "code")
      authUrl.searchParams.set("scope", scopeString)
      authUrl.searchParams.set("access_type", "offline")
      authUrl.searchParams.set("prompt", "consent")
      authUrl.searchParams.set("state", scope)
      
      // Open OAuth popup
      const popup = window.open(
        authUrl.toString(),
        "google-oauth",
        "width=500,height=600,scrollbars=yes"
      )

      // Listen for callback
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
          const { accessToken, refreshToken, expiresIn } = event.data
          
          const tokenData: TokenData = {
            accessToken,
            refreshToken,
            expiresAt: Date.now() + expiresIn * 1000,
            scope: scopeString,
          }
          
          storeToken(tokenData)
          popup?.close()
          window.removeEventListener("message", handleMessage)
          setIsLoading(false)
        } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
          setError(event.data.error || "Falha na autenticacao")
          popup?.close()
          window.removeEventListener("message", handleMessage)
          setIsLoading(false)
        }
      }

      window.addEventListener("message", handleMessage)

      // Fallback timeout
      setTimeout(() => {
        if (isLoading) {
          window.removeEventListener("message", handleMessage)
          setError("Tempo esgotado. Tente novamente.")
          setIsLoading(false)
        }
      }, 120000) // 2 minutes

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setIsLoading(false)
    }
  }, [scope, storeToken, isLoading])

  const signOut = useCallback(() => {
    localStorage.removeItem(storageKey)
    setIsConnected(false)
    setError(null)
  }, [storageKey])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const tokenData = getStoredToken()
    
    if (!tokenData?.refreshToken) {
      // No refresh token, need to re-authenticate
      setIsConnected(false)
      return false
    }

    try {
      const response = await fetch("/api/auth/google/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokenData.refreshToken }),
      })

      if (!response.ok) {
        throw new Error("Failed to refresh token")
      }

      const { accessToken, expiresIn } = await response.json()
      
      const newTokenData: TokenData = {
        ...tokenData,
        accessToken,
        expiresAt: Date.now() + expiresIn * 1000,
      }
      
      storeToken(newTokenData)
      return true
    } catch {
      // Refresh failed, need to re-authenticate
      signOut()
      return false
    }
  }, [getStoredToken, storeToken, signOut])

  return {
    isConnected,
    isLoading,
    error,
    signIn,
    signOut,
    getToken,
    refreshToken,
  }
}

// Hook for GitHub auth
interface UseGitHubAuthReturn {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => void
  getToken: () => string | null
}

export function useGitHubAuth(): UseGitHubAuthReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storageKey = `${TOKEN_PREFIX}github`

  useEffect(() => {
    const token = localStorage.getItem(storageKey)
    setIsConnected(!!token)
  }, [storageKey])

  const getToken = useCallback((): string | null => {
    return localStorage.getItem(storageKey)
  }, [storageKey])

  const signIn = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
      
      if (!clientId) {
        // Demo mode
        await new Promise(resolve => setTimeout(resolve, 1500))
        localStorage.setItem(storageKey, `mock_github_token_${Date.now()}`)
        setIsConnected(true)
        setIsLoading(false)
        return
      }

      // Real OAuth flow
      const redirectUri = `${window.location.origin}/api/auth/github`
      
      const authUrl = new URL("https://github.com/login/oauth/authorize")
      authUrl.searchParams.set("client_id", clientId)
      authUrl.searchParams.set("redirect_uri", redirectUri)
      authUrl.searchParams.set("scope", "repo read:org")
      
      const popup = window.open(
        authUrl.toString(),
        "github-oauth",
        "width=500,height=600,scrollbars=yes"
      )

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === "GITHUB_AUTH_SUCCESS") {
          localStorage.setItem(storageKey, event.data.accessToken)
          setIsConnected(true)
          popup?.close()
          window.removeEventListener("message", handleMessage)
          setIsLoading(false)
        } else if (event.data.type === "GITHUB_AUTH_ERROR") {
          setError(event.data.error || "Falha na autenticacao")
          popup?.close()
          window.removeEventListener("message", handleMessage)
          setIsLoading(false)
        }
      }

      window.addEventListener("message", handleMessage)

      setTimeout(() => {
        if (isLoading) {
          window.removeEventListener("message", handleMessage)
          setError("Tempo esgotado. Tente novamente.")
          setIsLoading(false)
        }
      }, 120000)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      setIsLoading(false)
    }
  }, [storageKey, isLoading])

  const signOut = useCallback(() => {
    localStorage.removeItem(storageKey)
    setIsConnected(false)
    setError(null)
  }, [storageKey])

  return {
    isConnected,
    isLoading,
    error,
    signIn,
    signOut,
    getToken,
  }
}
