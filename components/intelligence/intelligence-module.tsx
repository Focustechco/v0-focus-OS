"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Cpu } from "lucide-react"
import { DashboardTab } from "./tabs/dashboard-tab"
import { SetoresTechTab } from "./tabs/setores-tech-tab"

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "setores", label: "Setores Tech", icon: Cpu },
]

export function IntelligenceModule() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-white">Intelligence Center</h1>
          <p className="text-xs sm:text-sm text-neutral-500">Metricas, analytics e insights dos projetos</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-[#2A2A2A] overflow-x-auto scrollbar-hide">
          <TabsList className="bg-transparent h-auto p-0 w-max min-w-full sm:w-auto flex">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-neutral-500 data-[state=active]:text-orange-500 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 transition-all duration-200 hover:text-neutral-300 whitespace-nowrap flex items-center gap-1.5 sm:gap-2"
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="mt-4 sm:mt-6">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="setores" className="mt-4 sm:mt-6">
          <SetoresTechTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
