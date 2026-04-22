"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useClickUpConfig, useClickUpCRM } from "@/hooks/use-clickup"
import { PipelineKanban } from "./pipeline-kanban"
import { ClientesTable } from "./clientes-table"
import { CRMDashboard } from "./crm-dashboard"
import { AtividadeFeed } from "./atividade-feed"
import { ConfigurarCRM } from "./configurar-crm"
import { 
  Kanban, 
  Users, 
  BarChart3, 
  Activity, 
  Settings,
  RefreshCw,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ComercialModule() {
  const { isConfigured, isLoaded } = useClickUpConfig()
  const { deals, statuses, loading, error, lastSync, refresh } = useClickUpCRM()
  const [activeTab, setActiveTab] = useState("pipeline")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Estado de loading inicial
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">Carregando configuracao...</p>
        </div>
      </div>
    )
  }

  // Se nao configurado, mostrar tela de setup
  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            <h2 className="text-lg font-display font-bold text-foreground">Configuracao Necessaria</h2>
          </div>
          <p className="text-neutral-400 text-sm mb-6">
            Para usar o Modulo Comercial, voce precisa conectar sua conta do ClickUp. 
            Configure sua API Token e selecione a lista do seu CRM.
          </p>
        </div>
        <ConfigurarCRM />
      </div>
    )
  }

  const activeDeals = deals.filter(d => 
    d.status.status.toLowerCase() !== 'fechado' && 
    d.status.status.toLowerCase() !== 'perdido'
  )

  const negotiatingDeals = deals.filter(d => 
    d.status.status.toLowerCase().includes('negoc')
  )

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-400 text-sm">
              Erro ao conectar com ClickUp: {error.message}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconectar
          </Button>
        </div>
      )}

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-card border border-border p-1 w-full sm:w-auto overflow-x-auto justify-start sm:justify-center no-scrollbar">
            <TabsTrigger 
              value="pipeline" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground flex items-center gap-2 flex-shrink-0"
            >
              <Kanban className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs">PIPELINE</span>
            </TabsTrigger>
            <TabsTrigger 
              value="clientes"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground flex items-center gap-2 flex-shrink-0"
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs">CLIENTES</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground flex items-center gap-2 flex-shrink-0"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs">DASH</span>
            </TabsTrigger>
            <TabsTrigger 
              value="atividade"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground flex items-center gap-2 flex-shrink-0"
            >
              <Activity className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs">FEED</span>
            </TabsTrigger>
            <TabsTrigger 
              value="configurar"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground flex items-center gap-2 flex-shrink-0"
            >
              <Settings className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs">SETUP</span>
            </TabsTrigger>
          </TabsList>

          {/* Sync Status */}
          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-orange-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Sincronizando...</span>
              </div>
            )}
            {!loading && lastSync && (
              <span className="text-xs text-neutral-500 font-mono">
                Sync: {lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
              {negotiatingDeals.length} em negociacao
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-neutral-400 hover:text-orange-500"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <TabsContent value="pipeline" className="mt-0">
          <PipelineKanban deals={deals} statuses={statuses} loading={loading} />
        </TabsContent>

        <TabsContent value="clientes" className="mt-0">
          <ClientesTable deals={deals} loading={loading} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0">
          <CRMDashboard deals={deals} />
        </TabsContent>

        <TabsContent value="atividade" className="mt-0">
          <AtividadeFeed deals={deals} />
        </TabsContent>

        <TabsContent value="configurar" className="mt-0">
          <ConfigurarCRM />
        </TabsContent>
      </Tabs>
    </div>
  )
}
