"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Users,
  BarChart3,
} from "lucide-react"
import { useModules } from "@/contexts/modules-context"
import { useSidebarStats } from "@/lib/hooks/use-sidebar-stats"

const PRIMARY_NAV = [
  { id: "command-center", href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { id: "projetos",       href: "/projetos", icon: FolderKanban, label: "Projetos" },
  { id: "comercial",      href: "/comercial", icon: Briefcase, label: "Comercial" },
  { id: "equipe",         href: "/equipe", icon: Users, label: "Equipe" },
  { id: "intelligence",   href: "/intelligence", icon: BarChart3, label: "Analytics" },
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
        bg-[#0F0F0F]/95 backdrop-blur-xl
        border-t border-[#2A2A2A]
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
              relative flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px]
              transition-colors duration-150 active:scale-95
              ${active ? "text-[#e05c00]" : "text-neutral-500 hover:text-neutral-300"}
            `}
          >
            {/* Active indicator pill */}
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full bg-[#e05c00]" />
            )}

            <div className="relative">
              <item.icon className={`w-5 h-5 ${active ? "text-[#e05c00]" : ""}`} />
              {badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 bg-[#e05c00] rounded-full text-[9px] font-bold text-white flex items-center justify-center font-mono">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>

            <span className={`text-[10px] font-mono tracking-wide leading-none ${active ? "text-[#e05c00]" : ""}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
