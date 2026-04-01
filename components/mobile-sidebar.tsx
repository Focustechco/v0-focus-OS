"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  X,
  LayoutDashboard,
  FolderKanban,
  GitBranch,
  Zap,
  ListTodo,
  CheckSquare,
  Clock,
  CalendarClock,
  Cpu,
  BarChart3,
  Settings,
  Briefcase,
  FileText,
  Layers,
  Cog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navigation = [
  { id: "command-center", href: "/", icon: LayoutDashboard, label: "COMMAND CENTER" },
  { id: "comercial", href: "/comercial", icon: Briefcase, label: "COMERCIAL / CRM", badge: 12 },
  { id: "projetos", href: "/projetos", icon: FolderKanban, label: "PROJETOS", badge: 23 },
  { id: "fluxo", href: "/fluxo", icon: GitBranch, label: "FLUXO DE ETAPAS" },
  { id: "sprints", href: "/sprints", icon: Zap, label: "SPRINTS", badge: 7 },
  { id: "tasks", href: "/tasks", icon: ListTodo, label: "TAREFAS", badge: 89 },
  { id: "checklists", href: "/checklists", icon: CheckSquare, label: "CHECKLISTS" },
  { id: "aprovacoes", href: "/aprovacoes", icon: Clock, label: "APROVACOES", badge: 5 },
  { id: "prazos", href: "/prazos", icon: CalendarClock, label: "PRAZOS & ENTREGAS" },
  { id: "backlog", href: "/backlog", icon: Layers, label: "BACKLOG", badge: 34 },
  { id: "setores", href: "/setores", icon: Cpu, label: "SETORES TECH" },
  { id: "intelligence", href: "/intelligence", icon: BarChart3, label: "INTELLIGENCE" },
  { id: "relatorios", href: "/relatorios", icon: FileText, label: "RELATORIOS" },
  { id: "sistemas", href: "/sistemas", icon: Settings, label: "SISTEMAS" },
  { id: "configuracoes", href: "/configuracoes", icon: Cog, label: "CONFIGURACOES" },
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const [uptime, setUptime] = useState("00:00:00")

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

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 bg-[#0F0F0F] border-r border-[#2A2A2A] z-50 lg:hidden flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Focus OS" className="w-10 h-10" />
            <div>
              <h1 className="text-orange-500 font-display font-bold text-lg tracking-wider">FOCUS OS</h1>
              <p className="text-neutral-600 text-xs font-mono">v3.0 CLASSIFIED</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-500 hover:text-orange-500 hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overscroll-contain">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group relative ${
                isActive(item.href)
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-[#1A1A1A] active:bg-[#252525]"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium tracking-wide flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 h-5 ${
                    isActive(item.href)
                      ? "bg-white/20 text-white"
                      : "bg-orange-500/20 text-orange-500"
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* System Status */}
        <div className="p-3 m-2 bg-[#141414] border border-[#2A2A2A] rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-500 font-mono tracking-wider">SISTEMA ONLINE</span>
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
        </div>

        {/* Safe area padding for iOS */}
        <div className="pb-safe" />
      </div>
    </>
  )
}
