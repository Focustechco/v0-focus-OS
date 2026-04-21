"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHubModule } from "@/components/FocusHubModule"

export default function FocusPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

      {/* Full-height content area — no padding, no header, no scroll */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden">
        <FocusHubModule />
      </div>
    </div>
  )
}
