"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarClock,
  LayoutGrid,
} from "lucide-react"
import { useModules } from "@/contexts/modules-context"
import { useSidebarStats } from "@/lib/hooks/use-sidebar-stats"

const PRIMARY_NAV = [
  { id: "command-center", href: "/",         icon: LayoutDashboard, label: "Home" },
  { id: "projetos",       href: "/projetos",  icon: FolderKanban,    label: "Projetos" },
  { id: "tarefas",        href: "/tarefas",   icon: CheckSquare,     label: "Tasks" },
  { id: "agenda",         href: "/agenda",    icon: CalendarClock,   label: "Agenda" },
  { id: "backoffice",     href: "/backoffice", icon: LayoutGrid,      label: "Backoffice" },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { isSidebarItemVisible } = useModules()
  const { stats } = useSidebarStats()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Timeout para garantir que o DOM foi atualizado
    const timeout = setTimeout(() => {
      const activeItem = navRef.current?.querySelector('[data-active="true"]')
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }, 50)
    return () => clearTimeout(timeout)
  }, [pathname])

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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .mobile-nav-scroll::-webkit-scrollbar {
          display: none;
        }
      `}} />
      <nav
        ref={navRef}
        className="
          fixed bottom-0 left-0 right-0 z-50
          lg:hidden
          bg-background/95 backdrop-blur-xl
          border-t border-border
          flex items-stretch
          overflow-x-auto scroll-smooth mobile-nav-scroll
          safe-area-inset-bottom
        "
        style={{ 
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {visible.map((item) => {
          const active = isActive(item.href)
          const badge = getBadge(item.id)
          return (
            <Link
              key={item.id}
              href={item.href}
              data-active={active}
              className={`
                relative flex-1 shrink-0 flex flex-col items-center justify-center gap-1 py-1 min-h-[56px] min-w-[70px]
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
      </nav>
    </>
  )
}
