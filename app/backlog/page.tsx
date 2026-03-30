"use client"

import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { BacklogModule } from "@/components/backlog/backlog-module"
import { useState } from "react"

export default function BacklogPage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FocusHeader title="BACKLOG" subtitle="administracao centralizada" />
        <main className="flex-1 overflow-auto">
          <BacklogModule />
        </main>
      </div>
    </div>
  )
}
