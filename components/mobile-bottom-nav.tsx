"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Users,
  Grid,
  CheckSquare,
  CalendarClock,
  Settings,
  Cog,
  BarChart3,
  FileText,
  Box,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useModules } from "@/contexts/modules-context"
import { useSidebarStats } from "@/lib/hooks/use-sidebar-stats"

const PRIMARY_NAV = [
  { id: "command-center", href: "/",         icon: LayoutDashboard, label: "Home" },
  { id: "projetos",       href: "/projetos",  icon: FolderKanban,    label: "Projetos" },
  { id: "tarefas",        href: "/tarefas",   icon: CheckSquare,     label: "Tasks" },
  { id: "comercial",      href: "/comercial", icon: Briefcase,       label: "Comercial" },
]

const ALL_MODULES = [
  { id: "command-center", href: "/",         icon: LayoutDashboard, label: "Dashboard" },
  { id: "projetos",       href: "/projetos",  icon: FolderKanban,    label: "Projetos" },
  { id: "tarefas",        href: "/tarefas",   icon: CheckSquare,     label: "Tasks" },
  { id: "agenda",         href: "/agenda",    icon: CalendarClock,   label: "Agenda" },
  { id: "comercial",      href: "/comercial", icon: Briefcase,       label: "Comercial" },
  { id: "equipe",         href: "/equipe",    icon: Users,           label: "Equipe" },
  { id: "intelligence",   href: "/intelligence", icon: BarChart3,    label: "Inteligence" },
  { id: "clientes",       href: "/clientes",  icon: Box,             label: "Clientes" },
  { id: "relatorios",     href: "/relatorios", icon: FileText,        label: "Relatórios" },
  { id: "sistemas",       href: "/sistemas",  icon: Settings,        label: "Sistemas" },
  { id: "configuracoes",  href: "/configuracoes", icon: Cog,          label: "Ajustes" },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { isSidebarItemVisible } = useModules()
  const { stats } = useSidebarStats()

  const isActive = (href: string) => {
    if (href === "/" ) return pathname === "/"
    return pathname.startsWith(href)
  }

  const getBadge = (id: string) => {
    if (id === "projetos") return stats.projects > 0 ? stats.projects : null
    if (id === "comercial") return stats.comercial > 0 ? stats.comercial : null
    return null
  }

  const visible = PRIMARY_NAV.filter(item => isSidebarItemVisible(item.id))

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        lg:hidden
        bg-background/95 backdrop-blur-xl
        border-t border-border
        flex items-stretch
        safe-area-inset-bottom
      "
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {visible.map((item) => {
        const active = isActive(item.href)
        const badge = getBadge(item.id)
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`
              relative flex-1 flex flex-col items-center justify-center gap-1 py-1 min-h-[56px]
              transition-colors duration-150 active:scale-95
              ${active ? "text-primary" : "text-neutral-500 hover:text-foreground"}
            `}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full bg-primary" />
            )}

            <div className="relative">
              <item.icon className="w-5 h-5" />
              {badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 bg-primary rounded-full text-[9px] font-bold text-foreground flex items-center justify-center font-mono">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>

            <span className="text-[10px] font-mono tracking-wide leading-none">
              {item.label}
            </span>
          </Link>
        )
      })}

      {/* "Todos" Modules Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className="
              relative flex-1 flex flex-col items-center justify-center gap-1 py-1 min-h-[56px]
              text-neutral-500 hover:text-foreground transition-colors duration-150 active:scale-95
            "
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] font-mono tracking-wide leading-none">Todos</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-background border-border rounded-t-[24px] h-[70vh] px-6">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-foreground font-display text-lg tracking-widest uppercase">Módulos Focus OS</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-4 pb-12 overflow-y-auto">
            {ALL_MODULES.filter(m => isSidebarItemVisible(m.id)).map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:bg-accent/10 transition-colors group"
                onClick={() => {
                  // Optional: Close sheet on click if needed, but normally Link navigation 
                  // will re-render and close it anyway if it's a page transition.
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-neutral-400 group-hover:text-primary group-hover:border-[#e05c00]/50 transition-all">
                  <module.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] text-neutral-400 font-mono text-center uppercase tracking-wider group-hover:text-foreground transition-colors">
                  {module.label}
                </span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
