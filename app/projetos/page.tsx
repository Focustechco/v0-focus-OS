"use client"

import { useState, Suspense } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

import { VisaoGeralTab } from "@/components/projetos/visao-geral-tab"
import { SprintsTab } from "@/components/projetos/sprints-tab"
import { TasksTab } from "@/components/projetos/tasks-tab"
import { ChecklistsTab } from "@/components/projetos/checklists-tab"
import { AprovacoesTab } from "@/components/projetos/aprovacoes-tab"
import { PrazosTab } from "@/components/projetos/prazos-tab"
import { useIntelligence } from "@/lib/hooks/use-intelligence"

export default function ProjetosPage() {
  const [activeTab, setActiveTab] = useState("visao-geral")
  const { metrics, isLoading: intelLoading } = useIntelligence()

  const tabs = [
    { value: "visao-geral", label: "VISAO GERAL" },
    { value: "sprints", label: "SPRINTS", badge: metrics?.kpis?.activeSprints || 0 },
    { value: "tasks", label: "TAREFAS", badge: metrics?.activeTasksCount || 0 },
    { value: "checklists", label: "CHECKLISTS" },
    { value: "aprovacoes", label: "APROVACOES", badge: Number(metrics?.alerts?.approvalsCount || 0) },
    { value: "prazos", label: "PRAZOS & ENTREGAS" },
  ]

  return (
    <PageWrapper title="PROJETOS" breadcrumb="PROJETOS">
      <Suspense fallback={
        <div className="flex items-center justify-center p-20 text-orange-500 font-mono">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          INICIALIZANDO MODULO...
        </div>
      }>
        <div className="min-h-full bg-[#0d0d0d] p-6 -m-6 rounded-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-[#2a2a2a] rounded-none w-full justify-start gap-0 h-auto p-0 mb-6 flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative px-4 sm:px-6 py-3 rounded-none bg-transparent text-neutral-500 font-mono text-xs tracking-widest data-[state=active]:text-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-neutral-300 transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-orange-500 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform flex items-center gap-2"
                >
                  {tab.label}
                  {tab.badge && (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 h-5 ${
                        activeTab === tab.value
                          ? "bg-orange-500/20 text-orange-500"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="visao-geral" className="mt-0 outline-none">
              <VisaoGeralTab />
            </TabsContent>
            <TabsContent value="sprints" className="mt-0 outline-none">
              <SprintsTab />
            </TabsContent>
            <TabsContent value="tasks" className="mt-0 outline-none">
              <TasksTab />
            </TabsContent>
            <TabsContent value="checklists" className="mt-0 outline-none">
              <ChecklistsTab />
            </TabsContent>
            <TabsContent value="aprovacoes" className="mt-0 outline-none">
              <AprovacoesTab />
            </TabsContent>
            <TabsContent value="prazos" className="mt-0 outline-none">
              <PrazosTab />
            </TabsContent>
          </Tabs>
        </div>
      </Suspense>
    </PageWrapper>
  )
}
