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
      {/* Desktop Sidebar - Only visible on xl screens (1280px+) */}
      <div className="hidden xl:block flex-shrink-0">
        <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay - Used on screens smaller than xl */}
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full h-[100dvh] overflow-hidden">
        {/* Fixed Header */}
        <FocusHeader 
          title={title}
          breadcrumb={breadcrumb}
          onMenuClick={() => setMobileMenuOpen(true)} 
        />
        
        {/* Main Content with padding */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto overscroll-contain p-3 sm:p-4 xl:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
