"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { CommandCenter } from "@/components/command-center"

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] bg-[#0A0A0A] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader
          title="DASHBOARD"
          breadcrumb="DASHBOARD"
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 overscroll-contain">
          <CommandCenter />
        </main>
      </div>
    </div>
  )
}
