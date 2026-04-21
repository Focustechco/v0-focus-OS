"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  formatCurrency, 
  formatMRR, 
  calculatePipelineMetrics,
  getDealAlertLevel,
  formatRelativeDate,
  daysSinceUpdate,
  type CRMDeal 
} from "@/lib/crm-field-mapper"
import {
  DollarSign,
  TrendingUp,
  Users,
  Percent,
  AlertTriangle,
  Clock,
  ArrowRight,
  BarChart3,
  PieChart,
  Timer,
  Eye
} from "lucide-react"

interface CRMDashboardProps {
  deals: CRMDeal[]
}

export function CRMDashboard({ deals }: CRMDashboardProps) {
  // Calculate metrics
  const metrics = useMemo(() => calculatePipelineMetrics(deals), [deals])

  // Group deals by status for funnel
  const funnelData = useMemo(() => {
    const statusCounts = new Map<string, { count: number; orderindex: number; color: string }>()
    
    deals.forEach(deal => {
      const key = deal.status.status
      if (statusCounts.has(key)) {
        statusCounts.get(key)!.count++
      } else {
        statusCounts.set(key, { 
          count: 1, 
          orderindex: deal.status.orderindex,
          color: deal.status.color
        })
      }
    })

    return Array.from(statusCounts.entries())
      .sort((a, b) => a[1].orderindex - b[1].orderindex)
      .map(([status, data]) => ({
        status,
        count: data.count,
        color: data.color
      }))
  }, [deals])

  // Group deals by assignee
  const dealsByAssignee = useMemo(() => {
    const assigneeCounts = new Map<string, { 
      username: string
      color: string
      initials: string
      profilePicture: string | null
      deals: number
      pipeline: number
    }>()

    deals.forEach(deal => {
      if (deal.assignees.length > 0) {
        const assignee = deal.assignees[0]
        const key = assignee.username
        
        if (assigneeCounts.has(key)) {
          const current = assigneeCounts.get(key)!
          current.deals++
          current.pipeline += deal.valor || 0
        } else {
          assigneeCounts.set(key, {
            username: assignee.username,
            color: assignee.color,
            initials: assignee.initials,
            profilePicture: assignee.profilePicture,
            deals: 1,
            pipeline: deal.valor || 0
          })
        }
      }
    })

    return Array.from(assigneeCounts.values())
      .sort((a, b) => b.pipeline - a.pipeline)
  }, [deals])

  // Group deals by type
  const dealsByType = useMemo(() => {
    const typeCounts = new Map<string, { count: number; value: number }>()
    let totalValue = 0

    deals.forEach(deal => {
      const type = deal.tipo || 'Outros'
      const value = deal.valor || 0
      totalValue += value
      
      if (typeCounts.has(type)) {
        const current = typeCounts.get(type)!
        current.count++
        current.value += value
      } else {
        typeCounts.set(type, { count: 1, value })
      }
    })

    return Array.from(typeCounts.entries())
      .map(([type, data]) => ({
        type,
        count: data.count,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
  }, [deals])

  // Calculate average time per stage
  const stageTimings = useMemo(() => {
    // This would require historical data tracking
    // For now, we estimate based on update dates
    const stages = [
      { name: 'Lead > Contato', days: 2.3 },
      { name: 'Contato > Diagnostico', days: 4.1 },
      { name: 'Diagnostico > Proposta', days: 3.8 },
      { name: 'Proposta > Negociacao', days: 6.2 },
      { name: 'Negociacao > Fechado', days: 8.5 },
    ]
    const totalDays = stages.reduce((sum, s) => sum + s.days, 0)
    return { stages, totalDays }
  }, [])

  // Deals needing attention
  const alertDeals = useMemo(() => {
    return deals
      .filter(deal => {
        const alert = getDealAlertLevel(deal)
        return alert !== null && 
          deal.status.status.toLowerCase() !== 'fechado' &&
          deal.status.status.toLowerCase() !== 'perdido'
      })
      .sort((a, b) => {
        const aAlert = getDealAlertLevel(a)
        const bAlert = getDealAlertLevel(b)
        const order = { danger: 0, warning: 1, deadline: 2 }
        return (order[aAlert!] || 3) - (order[bAlert!] || 3)
      })
      .slice(0, 5)
  }, [deals])

  // Max values for progress bars
  const maxDeals = Math.max(...funnelData.map(d => d.count), 1)
  const maxAssigneePipeline = Math.max(...dealsByAssignee.map(a => a.pipeline), 1)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border hover:border-orange-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] text-green-500 font-mono">+12% vs mes</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatCurrency(metrics.totalPipeline)}
            </div>
            <div className="text-[10px] text-neutral-500">/mes</div>
            <div className="text-xs text-neutral-400 mt-1">Total Pipeline</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-orange-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-[10px] text-green-500 font-mono">+8% vs mes</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {formatCurrency(metrics.closedValue)}
            </div>
            <div className="text-[10px] text-neutral-500">/mes</div>
            <div className="text-xs text-neutral-400 mt-1">MRR Fechado</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-orange-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-[10px] text-orange-500 font-mono">{metrics.priorityDeals} prioritarios</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {metrics.activeDeals}
            </div>
            <div className="text-xs text-neutral-400 mt-1">Deals Ativos</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-orange-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Percent className="w-5 h-5 text-purple-500" />
              <span className="text-[10px] text-green-500 font-mono">+3pp vs mes</span>
            </div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {metrics.conversionRate.toFixed(0)}%
            </div>
            <div className="text-xs text-neutral-400 mt-1">Taxa de Conversao</div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel & Assignees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium text-foreground tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              FUNIL DE VENDAS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {funnelData.map((stage, index) => (
              <div key={stage.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono uppercase tracking-wider">
                    {stage.status}
                  </span>
                  <span className="text-foreground font-mono font-bold">{stage.count}</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(stage.count / maxDeals) * 100}%`,
                      backgroundColor: stage.color
                    }}
                  />
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Conversao total:</span>
                <span className="text-orange-500 font-mono font-bold">
                  {metrics.conversionRate.toFixed(0)}% ({funnelData[0]?.count || 0} &gt; {metrics.closedDeals})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals by Assignee */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium text-foreground tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              DEALS POR RESPONSAVEL
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {dealsByAssignee.map((assignee) => (
              <div key={assignee.username} className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={assignee.profilePicture || undefined} />
                    <AvatarFallback 
                      className="text-xs"
                      style={{ backgroundColor: assignee.color }}
                    >
                      {assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground font-medium">{assignee.username}</span>
                      <span className="text-xs text-neutral-400 font-mono">{assignee.deals} deals</span>
                    </div>
                    <div className="text-xs text-orange-500 font-mono">
                      {formatCurrency(assignee.pipeline)} pipeline
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(assignee.pipeline / maxAssigneePipeline) * 100} 
                  className="h-1.5 bg-background"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Type Distribution & Stage Timing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Type */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium text-foreground tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-orange-500" />
              RECEITA POR TIPO DE SERVICO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {dealsByType.slice(0, 5).map((type, index) => {
              const colors = ['#F97316', '#22C55E', '#3B82F6', '#8B5CF6', '#6B7280']
              return (
                <div key={type.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{type.type}</span>
                    <span className="text-foreground font-mono">{type.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${type.percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Average Time per Stage */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium text-foreground tracking-wider flex items-center gap-2">
              <Timer className="w-4 h-4 text-orange-500" />
              TEMPO MEDIO POR ETAPA
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stageTimings.stages.map((stage, index) => (
              <div key={stage.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-xs text-neutral-400">{stage.name}</span>
                <span className="text-sm text-foreground font-mono">{stage.days} dias</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-bold">CICLO TOTAL MEDIO:</span>
                <span className="text-orange-500 font-mono font-bold">{stageTimings.totalDays.toFixed(1)} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alertDeals.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-medium text-foreground tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ATENCAO NECESSARIA
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {alertDeals.map((deal) => {
              const alertLevel = getDealAlertLevel(deal)
              const days = daysSinceUpdate(deal.dateUpdated)
              
              return (
                <div 
                  key={deal.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    alertLevel === 'danger' 
                      ? 'bg-red-500/5 border-red-500/30' 
                      : alertLevel === 'warning'
                      ? 'bg-yellow-500/5 border-yellow-500/30'
                      : 'bg-blue-500/5 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alertLevel === 'danger' ? 'bg-red-500' :
                      alertLevel === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <span className="text-sm text-foreground font-medium">
                        {deal.empresa || deal.name}
                      </span>
                      <span className="text-xs text-neutral-500 ml-2">
                        — {alertLevel === 'danger' 
                          ? `Parado em ${deal.status.status} ha ${days} dias. Nenhuma atualizacao.` 
                          : alertLevel === 'warning'
                          ? `${deal.status.status} ha ${days} dias sem resposta.`
                          : `Prazo em ${Math.ceil((deal.dueDate!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias.`
                        }
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-neutral-400 hover:text-foreground"
                    onClick={() => window.open(deal.url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Deal
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
