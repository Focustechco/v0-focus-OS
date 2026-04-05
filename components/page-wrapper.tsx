"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { MobileSidebar } from "@/components/mobile-sidebar"

interface PageWrapperProps {
  title: string
  breadcrumb?: string
  children: React.ReactNode
}

export function PageWrapper({ title, breadcrumb, children }: PageWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] bg-[#0A0A0A] overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block flex-shrink-0">
        <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        {/* Fixed Header */}
        <FocusHeader 
          title={title}
          breadcrumb={breadcrumb}
          onMenuClick={() => setMobileMenuOpen(true)} 
        />
        
        {/* Main Content - Takes remaining space, no scroll on mobile unless needed */}
        <main className="flex-1 overflow-hidden lg:overflow-auto">
          <div className="h-full overflow-y-auto overscroll-contain">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
