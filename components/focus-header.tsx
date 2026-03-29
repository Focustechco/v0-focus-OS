"use client"

import { useState, useEffect } from "react"
import { Bell, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FocusHeaderProps {
  title: string
  breadcrumb?: string
}

export function FocusHeader({ title, breadcrumb }: FocusHeaderProps) {
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
    <header className="h-14 bg-[#111111] border-b border-[#2A2A2A] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="text-sm text-neutral-400 font-mono tracking-wide">
          FOCUS OS /{" "}
          <span className="text-orange-500 font-medium">{breadcrumb || title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-md">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none w-40"
          />
          <kbd className="text-[10px] text-neutral-600 bg-[#1A1A1A] px-1.5 py-0.5 rounded font-mono">
            /
          </kbd>
        </div>

        {/* Last Update */}
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

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-400 hover:text-orange-500 hover:bg-[#1A1A1A]"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
