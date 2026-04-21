"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
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
  Bell,
  Briefcase,
  FileText,
  Layers,
  Cog,
  Users,
  Box,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useModules } from "@/contexts/modules-context"
import { useIntelligence } from "@/lib/hooks/use-intelligence"
import { usePwa } from "@/contexts/pwa-context"
import { Download, Target } from "lucide-react"
import { useSidebarStats } from "@/lib/hooks/use-sidebar-stats"

// Subitems do módulo Projetos
const projetosSubItems: any[] = [];

const intelligenceSubItems = [
  { id: "fluxo", href: "/intelligence/fluxo", icon: GitBranch, label: "Fluxo de Etapas" },
  { id: "setores", href: "/setores", icon: Cpu, label: "Setores Tech" },
  { id: "comercial-intel", href: "/intelligence/comercial", icon: Briefcase, label: "Setor Comercial" },
]

interface FocusSidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

export function FocusSidebar({ collapsed, onCollapse }: FocusSidebarProps) {
  const pathname = usePathname()
  const [uptime, setUptime] = useState("00:00:00")
  const [projetosExpanded, setProjetosExpanded] = useState(false)
  const [intelligenceExpanded, setIntelligenceExpanded] = useState(false)
  const { isSidebarItemVisible } = useModules()
  const { metrics } = useIntelligence()
  const { isInstallable, handleInstall } = usePwa()
  const { stats } = useSidebarStats()

  // Atualizar contagens dinamicamente no navigation
  const navigation: any[] = [
    { id: "command-center", href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { id: "projetos", href: "/projetos", icon: FolderKanban, label: "Projetos", badge: stats.projects > 0 ? stats.projects : null },
    { id: "tarefas", href: "/tarefas", icon: CheckSquare, label: "Tarefas" },
    { id: "comercial", href: "/comercial", icon: Briefcase, label: "Comercial", badge: stats.comercial > 0 ? stats.comercial : null },
    { id: "equipe", href: "/equipe", icon: Users, label: "Equipe" },
    { id: "intelligence", href: "/intelligence", icon: BarChart3, label: "Intelligence", hasSubmenu: "intelligence" },
    { id: "clientes", href: "/clientes", icon: Box, label: "Clientes" },
    { id: "relatorios", href: "/relatorios", icon: FileText, label: "Relatórios" },
    { id: "sistemas", href: "/sistemas", icon: Settings, label: "Sistemas" },
    { id: "configuracoes", href: "/configuracoes", icon: Cog, label: "Configurações" },
  ]
  // Filtrar navegacao baseado nos modulos ativos
  const visibleNavigation = navigation.filter(item => isSidebarItemVisible(item.id))
  const visibleProjetosSubItems = projetosSubItems.filter(item => isSidebarItemVisible(item.id))
  const visibleIntelligenceSubItems = intelligenceSubItems.filter(item => isSidebarItemVisible(item.id))

  // Auto-expand Projetos if a subitem is active
  const isProjetosSubItemActive = projetosSubItems.some(item => pathname.startsWith(item.href))
  const isIntelligenceSubItemActive = intelligenceSubItems.some(item => pathname.startsWith(item.href))
  
  useEffect(() => {
    if (isProjetosSubItemActive) {
      setProjetosExpanded(true)
    }
    if (isIntelligenceSubItemActive) {
      setIntelligenceExpanded(true)
    }
  }, [isProjetosSubItemActive, isIntelligenceSubItemActive])

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
      className={`${collapsed ? "w-16" : "w-56"} bg-background border-r border-border transition-all duration-300 flex flex-col h-full`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className={`${collapsed ? "hidden" : "flex items-center gap-3"}`}>
            <img src="/logo.svg" alt="Focus OS" className="w-10 h-10" />
            <div>
              <h1 className="text-orange-500 font-display font-bold text-lg tracking-wider whitespace-nowrap">FOCUS OS</h1>
              <p className="text-neutral-600 text-xs font-mono">v1.0</p>
            </div>
          </div>
          {collapsed && (
            <img src="/logo.svg" alt="Focus OS" className="w-8 h-8 mx-auto" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapse(!collapsed)}
            className={`text-neutral-500 hover:text-orange-500 hover:bg-accent/10 ${collapsed ? "absolute right-2 top-4" : ""}`}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {visibleNavigation.map((item: any) => {
            const isProjetos = item.hasSubmenu === "projetos"
            const isIntelligence = item.hasSubmenu === "intelligence"
            const subItems: any[] = isProjetos ? visibleProjetosSubItems : isIntelligence ? visibleIntelligenceSubItems : []
            const isExpanded = isProjetos ? projetosExpanded : isIntelligence ? intelligenceExpanded : false
            const setExpanded = isProjetos ? setProjetosExpanded : isIntelligence ? setIntelligenceExpanded : () => {}
            const isSubItemActive = isProjetos ? isProjetosSubItemActive : isIntelligence ? isIntelligenceSubItemActive : false

          return (
          <div key={item.id}>
            {item.hasSubmenu ? (
              <>
                {/* Item com submenu */}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative flex-1 ${
                        isActive(item.href) && !isSubItemActive
                          ? "bg-orange-500 text-foreground shadow-lg shadow-orange-500/20"
                          : isSubItemActive || isExpanded
                          ? "bg-orange-500/10 text-orange-500"
                          : "text-neutral-400 hover:text-foreground hover:bg-accent/10"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="text-xs font-bold tracking-wide flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 h-5 ${
                                isActive(item.href) && !isSubItemActive
                                  ? "bg-white/20 text-foreground"
                                  : "bg-orange-500/20 text-orange-500"
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && item.badge && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] flex items-center justify-center text-foreground font-bold">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </Link>
                    {!collapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpanded(!isExpanded)}
                        className="h-8 w-8 text-neutral-500 hover:text-orange-500 hover:bg-accent/10"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {/* Subitems */}
                  {!collapsed && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                      {subItems.map((subItem) => (
                        <Link
                          key={subItem.id}
                          href={subItem.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative ${
                            isActive(subItem.href)
                              ? "bg-orange-500 text-foreground shadow-lg shadow-orange-500/20"
                              : "text-neutral-400 hover:text-foreground hover:bg-accent/10"
                          }`}
                        >
                          <subItem.icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-bold tracking-wide flex-1">{subItem.label}</span>
                          {subItem.badge && (
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 h-5 ${
                                isActive(subItem.href)
                                  ? "bg-white/20 text-foreground"
                                  : "bg-orange-500/20 text-orange-500"
                              }`}
                            >
                              {subItem.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive(item.href)
                    ? "bg-orange-500 text-foreground shadow-lg shadow-orange-500/20"
                    : "text-neutral-400 hover:text-foreground hover:bg-accent/10"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-xs font-bold tracking-wide flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 h-5 ${
                          isActive(item.href)
                            ? "bg-white/20 text-foreground"
                            : "bg-orange-500/20 text-orange-500"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] flex items-center justify-center text-foreground font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        )})}
      </nav>

      {/* PWA Install Button */}
      {!collapsed && isInstallable && (
        <div className="px-4 py-2 mt-auto pb-4">
          <Button
            onClick={handleInstall}
            variant="outline"
            size="sm"
            className="w-full bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-foreground transition-all text-[10px] font-bold h-9"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            INSTALAR APLICATIVO
          </Button>
        </div>
      )}

      {collapsed && isInstallable && (
        <div className="p-2 flex justify-center mt-auto pb-4">
          <Button
            onClick={handleInstall}
            variant="ghost"
            size="icon"
            className="text-orange-500 hover:bg-orange-500/10"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* System Status */}
      {!collapsed && (
        <div className="p-3 m-2 bg-card border border-border rounded-lg">
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
              <span className="text-orange-500">{metrics?.kpis?.totalProjects || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>SPRINTS EM CURSO:</span>
              <span className="text-orange-500">{metrics?.kpis?.activeSprints || 0}</span>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="p-2 flex justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  )
}
