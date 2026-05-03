"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

interface PageWrapperProps {
  title: string
  breadcrumb?: string
  children: React.ReactNode
}

export function PageWrapper({ title, breadcrumb, children }: PageWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <FocusHeader
          title={title}
          breadcrumb={breadcrumb}
        />

        {/* Scrollable content — bottom padding accounts for mobile nav bar */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-3 sm:p-4 lg:p-6 pb-[calc(56px+env(safe-area-inset-bottom,0px)+12px)] lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  )
}
