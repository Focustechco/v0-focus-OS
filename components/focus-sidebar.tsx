"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  FolderKanban,
  BarChart3,
  Settings,
  Briefcase,
  FileText,
  Layers,
  Cog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useModules } from "@/contexts/modules-context"

const navigation = [
  { id: "projetos", href: "/projetos", icon: FolderKanban, label: "PROJETOS", badge: 23 },
  { id: "backlog", href: "/backlog", icon: Layers, label: "BACKLOG", badge: 34 },
  { id: "comercial", href: "/comercial", icon: Briefcase, label: "COMERCIAL / CRM", badge: 12 },
  { id: "relatorios", href: "/relatorios", icon: FileText, label: "RELATORIOS" },
  { id: "sistemas", href: "/sistemas", icon: Settings, label: "SISTEMAS" },
  { id: "intelligence", href: "/intelligence", icon: BarChart3, label: "INTELLIGENCE" },
  { id: "configuracoes", href: "/configuracoes", icon: Cog, label: "CONFIGURACOES" },
]

interface FocusSidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

export function FocusSidebar({ collapsed, onCollapse }: FocusSidebarProps) {
  const pathname = usePathname()
  const [uptime, setUptime] = useState("00:00:00")
  const { isSidebarItemVisible } = useModules()

  // Handle collapse with smooth animation
  const handleCollapse = (newCollapsed: boolean) => {
    onCollapse(newCollapsed)
  }

  // Filtrar navegacao baseado nos modulos ativos
  const visibleNavigation = navigation.filter(item => isSidebarItemVisible(item.id))

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const hours = Math.floor(elapsed / 3600000)
      const minutes = Math.floor((elapsed % 3600000) / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      setUptime(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  return (
    <div
      className={`${collapsed ? "w-16" : "w-56"} bg-[#0F0F0F] border-r border-[#2A2A2A] transition-all duration-300 ease-in-out flex flex-col h-full overflow-hidden`}
    >
      {/* Header */}
      <div className="p-3 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.svg" 
            alt="Focus OS" 
            className={`flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? "w-8 h-8" : "w-9 h-9"}`} 
          />
          <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <h1 className="text-orange-500 font-display font-bold text-base tracking-wider whitespace-nowrap">FOCUS OS</h1>
            <p className="text-neutral-600 text-[10px] font-mono whitespace-nowrap">v3.0 CLASSIFIED</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapse(!collapsed)}
            className={`text-neutral-500 hover:text-orange-500 hover:bg-[#1A1A1A] ml-auto flex-shrink-0 h-8 w-8 transition-all duration-300`}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {visibleNavigation.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative ${
              isActive(item.href)
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-neutral-400 hover:text-white hover:bg-[#1A1A1A]"
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className={`text-xs font-medium tracking-wide flex-1 whitespace-nowrap transition-all duration-300 ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>{item.label}</span>
            {!collapsed && item.badge && (
              <Badge
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 h-5 transition-opacity duration-300 ${
                  isActive(item.href)
                    ? "bg-white/20 text-white"
                    : "bg-orange-500/20 text-orange-500"
                }`}
              >
                {item.badge}
              </Badge>
            )}
            {collapsed && item.badge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* System Status */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? "p-2" : "p-2 m-2"}`}>
        <div className={`bg-[#141414] border border-[#2A2A2A] rounded-lg transition-all duration-300 ${collapsed ? "p-2 flex justify-center" : "p-3"}`}>
          {collapsed ? (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-500 font-mono tracking-wider whitespace-nowrap">SISTEMA ONLINE</span>
              </div>
              <div className="text-[10px] text-neutral-500 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>UPTIME:</span>
                  <span className="text-neutral-400">{uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>PROJETOS ATIVOS:</span>
                  <span className="text-orange-500">23</span>
                </div>
                <div className="flex justify-between">
                  <span>SPRINTS EM CURSO:</span>
                  <span className="text-orange-500">7</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
