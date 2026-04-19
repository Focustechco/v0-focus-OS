"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { CommandCenter } from "@/components/command-center"

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-[100dvh] bg-[#0A0A0A] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <FocusHeader
          title="DASHBOARD"
          breadcrumb="DASHBOARD"
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-3 sm:p-4 lg:p-6 pb-[calc(56px+env(safe-area-inset-bottom,0px)+12px)] lg:pb-6">
          <CommandCenter />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  )
}
