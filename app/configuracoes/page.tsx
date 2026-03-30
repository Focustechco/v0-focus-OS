"use client"

import { FocusSidebar } from "@/components/focus-sidebar"
import { ConfiguracoesModule } from "@/components/configuracoes/configuracoes-module"
import { useState } from "react"

export default function ConfiguracoesPage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          <ConfiguracoesModule />
        </main>
      </div>
    </div>
  )
}
