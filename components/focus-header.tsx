"use client"

import { useState, useEffect } from "react"
import { Bell, RefreshCw, Search, Menu, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useFocusOS } from "@/contexts/focus-os-context"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FocusHeaderProps {
  title: string
  breadcrumb?: string
  onMenuClick?: () => void
}

export function FocusHeader({ title, breadcrumb, onMenuClick }: FocusHeaderProps) {
  const [currentTime, setCurrentTime] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Try to use FocusOS context, but handle case where it might not be available
  let focusOS: ReturnType<typeof useFocusOS> | null = null
  try {
    focusOS = useFocusOS()
  } catch {
    // Context not available, will use fallback
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
          " " +
          now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }) +
          " UTC"
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    if (!focusOS) return
    setIsRefreshing(true)
    try {
      await focusOS.refreshAll()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleClearNotifications = () => {
    focusOS?.clearNotifications()
  }

  // Format last update time from context
  const lastUpdateText = focusOS?.lastUpdate
    ? formatDistanceToNow(focusOS.lastUpdate, { addSuffix: true, locale: ptBR })
    : currentTime

  const notificationCount = focusOS?.notificationCount ?? 3

  return (
    <header className="h-14 bg-[#111111] border-b border-[#2A2A2A] flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden text-neutral-400 hover:text-orange-500 hover:bg-[#1A1A1A]"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo for mobile */}
        <img src="/logo.svg" alt="Focus OS" className="w-7 h-7 lg:hidden" />

        <div className="text-xs sm:text-sm text-neutral-400 font-mono tracking-wide truncate max-w-[140px] sm:max-w-none">
          <span className="hidden sm:inline">FOCUS OS / </span>
          <span className="text-orange-500 font-medium">{breadcrumb || title}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        {/* Search - Hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-md">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none w-24 md:w-40"
          />
          <kbd className="hidden md:inline-block text-[10px] text-neutral-600 bg-[#1A1A1A] px-1.5 py-0.5 rounded font-mono">
            /
          </kbd>
        </div>

        {/* Search icon for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden text-neutral-400 hover:text-orange-500 hover:bg-[#1A1A1A]"
        >
          <Search className="w-4 h-4" />
        </Button>

        {/* Last Update - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>LAST UPDATE:</span>
          <span className="text-neutral-400">{lastUpdateText}</span>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-orange-500 hover:bg-[#1A1A1A] relative"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-orange-500 text-white border-0">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#141414] border-[#2a2a2a] w-72" align="end">
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Notificacoes</span>
                {notificationCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-neutral-500 hover:text-white"
                    onClick={handleClearNotifications}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
            {notificationCount > 0 ? (
              <>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-white">Nova sincronizacao concluida</span>
                    <span className="text-xs text-neutral-500">Google Drive atualizado</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-white">Contrato adicionado</span>
                    <span className="text-xs text-neutral-500">Novo documento no backlog</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-3 cursor-pointer">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-white">Planilha importada</span>
                    <span className="text-xs text-neutral-500">Google Sheets sincronizado</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                <DropdownMenuItem className="justify-center text-orange-500 hover:text-orange-400">
                  Ver todas
                </DropdownMenuItem>
              </>
            ) : (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Nenhuma notificacao</p>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh - Hidden on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex text-neutral-400 hover:text-orange-500 hover:bg-[#1A1A1A]"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>
    </header>
  )
}
