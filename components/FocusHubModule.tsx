'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, RefreshCw, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FOCUSHUB_URL = process.env.NEXT_PUBLIC_FOCUSHUB_URL || 'https://focus-hub-interno-three.vercel.app'
const TIMEOUT_MS = 10_000

export function FocusHubModule() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [session, setSession] = useState<any>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [authConfirmed, setAuthConfirmed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [iframeKey, setIframeKey] = useState(0) // force re-mount on retry

  /* ─── 1. Load session ────────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null)
      setSessionReady(true) // always unlock — session can be null
    }).catch(() => {
      setSessionReady(true) // even on error, show the iframe
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      if (!sessionReady) setSessionReady(true)
    })

    return () => listener.subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── 2. Send auth token to iframe ──────────────────────────── */
  const sendAuth = useCallback((sess: any) => {
    if (!sess?.access_token) return
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'FOCUSOS_AUTH',
        token: sess.access_token,
        user: {
          id: sess.user?.id,
          name: sess.user?.user_metadata?.full_name ?? sess.user?.email?.split('@')[0],
          email: sess.user?.email,
          image: sess.user?.user_metadata?.avatar_url,
        },
      },
      FOCUSHUB_URL
    )
  }, [])

  /* ─── 3. Iframe load handler + timeout ──────────────────────── */
  const handleIframeLoad = useCallback(() => {
    // Clear previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // If session is already available, send auth immediately
    setSession((current: any) => {
      if (current?.access_token) {
        setTimeout(() => sendAuth(current), 300)
      }
      return current
    })

    // Start 10s timeout — reset only when FOCUSHUB_READY arrives
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true)
    }, TIMEOUT_MS)
  }, [sendAuth])

  /* ─── 4. Listen for messages from FocusHub ──────────────────── */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== FOCUSHUB_URL && event.origin !== 'http://localhost:3001') return

      switch (event.data?.type) {
        case 'FOCUSHUB_READY':
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          setTimedOut(false)
          sendAuth(session)
          break
        case 'FOCUSHUB_AUTH_OK':
          setAuthConfirmed(true)
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          break
        case 'FOCUSHUB_NAVIGATE':
          console.log('[FocusOS] Navigate request:', event.data.path)
          break
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [session, sendAuth])

  /* ─── 5. Re-send auth if session arrives after iframe load ───── */
  useEffect(() => {
    if (sessionReady && session) {
      sendAuth(session)
    }
    // If no session at all, just show the iframe (no auth to send)
    if (sessionReady && !session) {
      setAuthConfirmed(true)
    }
  }, [sessionReady, session, sendAuth])

  /* ─── Cleanup on unmount ─────────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleRetry = () => {
    setTimedOut(false)
    setAuthConfirmed(false)
    setIframeKey((k) => k + 1)
  }

  /* ─── Loading state ──────────────────────────────────────────── */
  if (!sessionReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 animate-pulse">
            Sincronizando sessão...
          </p>
        </div>
      </div>
    )
  }

  /* ─── Timeout / error state ──────────────────────────────────── */
  if (timedOut) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Não foi possível conectar</h3>
            <p className="text-neutral-500 text-sm">
              O Focus Hub não respondeu em tempo hábil. Verifique sua conexão ou tente novamente.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRetry}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
            <a
              href={FOCUSHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir em nova aba
              </Button>
            </a>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Main render ─────────────────────────────────────────────── */
  return (
    <div className="relative w-full h-full bg-[#0A0A0A]">
      {/* Connecting overlay */}
      {!authConfirmed && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A] z-10 transition-opacity">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-neutral-500 font-mono text-xs uppercase tracking-widest animate-pulse">
              Conectando ao Focus Hub...
            </span>
          </div>
        </div>
      )}

      <iframe
        key={iframeKey}
        ref={iframeRef}
        src={FOCUSHUB_URL}
        onLoad={handleIframeLoad}
        title="Focus Hub"
        className={`w-full h-full border-none transition-opacity duration-700 ${authConfirmed ? 'opacity-100' : 'opacity-0'}`}
        allow="camera; microphone; clipboard-read; clipboard-write; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
      />
    </div>
  )
}

// Named + default export for compatibility
export default FocusHubModule
