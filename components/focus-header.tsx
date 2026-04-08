"use client"

import { useState, useEffect } from "react"
import { Bell, RefreshCw, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/user-menu"

interface FocusHeaderProps {
  title: string
  breadcrumb?: string
  onMenuClick?: () => void
}

export function FocusHeader({ title, breadcrumb, onMenuClick }: FocusHeaderProps) {
  const [currentTime, setCurrentTime] = useState("")

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
        <div className="hidden lg:block text-xs text-neutral-500 font-mono">
          LAST UPDATE: {currentTime}
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-400 hover:text-orange-500 hover:bg-[#1A1A1A] relative"
        >
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-orange-500 text-white border-0">
            3
          </Badge>
        </Button>

        {/* Refresh - Hidden on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex text-neutral-400 hover:text-orange-500 hover:bg-[#1A1A1A]"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
