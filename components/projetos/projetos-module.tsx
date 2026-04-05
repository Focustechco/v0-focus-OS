"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// Tab Components
import { FluxoDeEtapas } from "./tabs/fluxo-de-etapas"
import { SprintsTab } from "./tabs/sprints-tab"
import { TarefasTab } from "./tabs/tarefas-tab"
import { ChecklistsTab } from "./tabs/checklists-tab"
import { AprovacoesTab } from "./tabs/aprovacoes-tab"
import { PrazosEntregasTab } from "./tabs/prazos-entregas-tab"
import { LinksFocusTab } from "./tabs/links-focus-tab"

export function ProjetosModule() {
  const [activeTab, setActiveTab] = useState("prazos")

  const tabs = [
    { value: "fluxo", label: "FLUXO DE ETAPAS", badge: null },
    { value: "sprints", label: "SPRINTS", badge: 7 },
    { value: "tarefas", label: "TAREFAS", badge: 89 },
    { value: "checklists", label: "CHECKLISTS", badge: null },
    { value: "aprovacoes", label: "APROVACOES", badge: 5 },
    { value: "prazos", label: "PRAZOS & ENTREGAS", badge: null },
    { value: "links", label: "LINKS FOCUS", badge: null },
  ]

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        {/* Tabs Navigation - Horizontally scrollable on mobile */}
        <div className="flex-shrink-0 border-b border-[#2a2a2a]">
          <ScrollArea className="w-full">
            <TabsList className="bg-transparent rounded-none w-max min-w-full justify-start gap-0 h-auto p-0 px-3 lg:px-6">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative px-3 sm:px-6 py-3 rounded-none bg-transparent text-neutral-500 font-mono text-[10px] sm:text-xs tracking-widest whitespace-nowrap data-[state=active]:text-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-neutral-300 transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-orange-500 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {tab.badge && (
                      <Badge className="bg-orange-500/20 text-orange-500 text-[9px] px-1.5 py-0 h-4 font-mono">
                        {tab.badge}
                      </Badge>
                    )}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>
        </div>

        {/* Tab Content - Scrollable area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="fluxo" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <FluxoDeEtapas />
            </div>
          </TabsContent>
          <TabsContent value="sprints" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <SprintsTab />
            </div>
          </TabsContent>
          <TabsContent value="tarefas" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <TarefasTab />
            </div>
          </TabsContent>
          <TabsContent value="checklists" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <ChecklistsTab />
            </div>
          </TabsContent>
          <TabsContent value="aprovacoes" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <AprovacoesTab />
            </div>
          </TabsContent>
          <TabsContent value="prazos" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <PrazosEntregasTab />
            </div>
          </TabsContent>
          <TabsContent value="links" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <LinksFocusTab />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
