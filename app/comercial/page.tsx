"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { ComercialModule } from "@/components/comercial/comercial-module"

export default function ComercialPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <FocusHeader title="COMERCIAL / CRM" subtitle="Pipeline de Vendas e Gestao de Clientes" />
        <main className="flex-1 overflow-y-auto p-6">
          <ComercialModule />
        </main>
      </div>
    </div>
  )
}
