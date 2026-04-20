"use client"

import { useState, useEffect } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  ArrowRight, 
  DollarSign, 
  Target, 
  PieChart,
  Filter,
  Zap,
  Phone,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useComercialIntel } from "@/lib/hooks/use-comercial"

// Formatters
const formatBRL = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export default function SetorComercialPage() {
  const { metrics, isLoading, refresh } = useComercialIntel()
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))

  useEffect(() => {
    if (!isLoading) {
      setLastSync(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }
  }, [metrics, isLoading])

  const kpis = [
    { label: "Oportunidades Ativas", value: metrics?.kpis?.oportunidadesAtivas || 0, icon: Filter, color: "text-blue-500" },
    { label: "MRR Total (Mes)", value: formatBRL(metrics?.kpis?.mrrTotal || 0), icon: DollarSign, color: "text-green-500" },
    { label: "Taxa de Conversão", value: `${Math.round(metrics?.kpis?.conversionRate || 0)}%`, icon: Target, color: "text-orange-500" },
    { label: "Ticket Médio", value: formatBRL(metrics?.kpis?.ticketMedio || 0), icon: TrendingUp, color: "text-purple-500" },
  ]

  return (
    <PageWrapper title="SETOR COMERCIAL" breadcrumb="INTELIGENCE > COMERCIAL">
      <main className="flex-1 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-display font-bold text-white tracking-wider">Dashboard Comercial</h1>
            <p className="text-sm text-neutral-500">Operação em tempo real conectada ao ClickUp</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                SYNC CLICKUP: ONLINE
             </div>
             <span>ULTIMA ATUALIZACAO: {lastSync}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-orange-500 font-mono animate-pulse">
            Sincronizando Matrizes de Vendas...
          </div>
        ) : (
          <>
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi, idx) => (
                <Card key={idx} className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/20 transition-all">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-neutral-500 tracking-widest mb-1 uppercase">{kpi.label}</p>
                      <div className="text-xl font-bold text-white font-mono">{kpi.value}</div>
                    </div>
                    <div className={cn("p-2 rounded-lg bg-white/5", kpi.color)}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sub-Sector Grid 2x2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SDR Card */}
              <Card className="bg-[#141414] border-[#2A2A2A] border-l-4 border-l-blue-500">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-white tracking-wider">SDR (PROSPECÇÃO)</CardTitle>
                      <p className="text-[10px] text-neutral-500">Geração de pipeline e agendamento</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-500 text-[10px]">Meta: {metrics?.sdr?.metaLeads} leads</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-[#0A0A0A] rounded text-center">
                      <div className="text-lg font-bold text-white font-mono">{metrics?.sdr?.leadsGerados}</div>
                      <div className="text-[9px] text-neutral-500 uppercase">Leads</div>
                    </div>
                    <div className="p-2 bg-[#0A0A0A] rounded text-center">
                      <div className="text-lg font-bold text-white font-mono">{metrics?.sdr?.contatosRealizados}</div>
                      <div className="text-[9px] text-neutral-500 uppercase">Contatos</div>
                    </div>
                    <div className="p-2 bg-[#0A0A0A] rounded text-center">
                      <div className="text-lg font-bold text-white font-mono">{metrics?.sdr?.reunioesAgendadas}</div>
                      <div className="text-[9px] text-neutral-500 uppercase">Reuniões</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-neutral-500 uppercase">Progresso da Meta</span>
                      <span className="text-blue-500 font-mono">{Math.round((metrics?.sdr?.leadsGerados / metrics?.sdr?.metaLeads) * 100)}%</span>
                    </div>
                    <Progress value={(metrics?.sdr?.leadsGerados / metrics?.sdr?.metaLeads) * 100} className="h-1.5 bg-[#2A2A2A]" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-neutral-500 flex items-center gap-1 uppercase tracking-wider">
                      <Users className="w-3 h-3" /> Equipe SDR
                    </p>
                    {metrics?.equipe?.filter((m: any) => m.setor === 'sdr').map((member: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded">
                        <span className="text-xs text-white">{member.nome}</span>
                        <span className="text-[9px] text-neutral-500 uppercase">{member.cargo || 'SDR'}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-[10px] font-bold h-9">
                    VER DETALHES CRM <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Closer Card */}
              <Card className="bg-[#141414] border-[#2A2A2A] border-l-4 border-l-orange-500">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-white tracking-wider">CLOSER (FECHAMENTO)</CardTitle>
                      <p className="text-[10px] text-neutral-500">Propostas e assinatura de contrato</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-500 text-[10px]">Meta: {metrics?.closer?.metaFechamentos}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-[#0A0A0A] rounded text-center">
                      <div className="text-lg font-bold text-white font-mono">{metrics?.closer?.propostasEnviadas}</div>
                      <div className="text-[9px] text-neutral-500 uppercase">Propostas</div>
                    </div>
                    <div className="p-2 bg-[#0A0A0A] rounded text-center">
                      <div className="text-lg font-bold text-white font-mono">{metrics?.closer?.emNegociacao}</div>
                      <div className="text-[9px] text-neutral-500 uppercase">Negociações</div>
                    </div>
                    <div className="p-2 bg-[#0A0A0A] rounded text-center">
                      <div className="text-lg font-bold text-white font-mono">{metrics?.closer?.fechadosMes}</div>
                      <div className="text-[9px] text-neutral-500 uppercase">Ganhos</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-neutral-500 uppercase">Taxa de Sucesso</span>
                      <span className="text-orange-500 font-mono">{Math.round((metrics?.closer?.fechadosMes / metrics?.closer?.metaFechamentos) * 100)}%</span>
                    </div>
                    <Progress value={(metrics?.closer?.fechadosMes / metrics?.closer?.metaFechamentos) * 100} className="h-1.5 bg-[#2A2A2A] [&>div]:bg-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-neutral-500 flex items-center gap-1 uppercase tracking-wider">
                      <Users className="w-3 h-3" /> Closers
                    </p>
                    {metrics?.equipe?.filter((m: any) => m.setor === 'closer').map((member: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded">
                        <span className="text-xs text-white">{member.nome}</span>
                        <span className="text-[9px] text-neutral-500 uppercase">{member.cargo || 'Closer'}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-[10px] font-bold h-9">
                    PIPELINE FECHAMENTO <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Pipeline Card */}
              <Card className="bg-[#141414] border-[#2A2A2A] border-l-4 border-l-purple-500">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <PieChart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-white tracking-wider">PIPELINE (OPORTUNIDADES)</CardTitle>
                      <p className="text-[10px] text-neutral-500">Visão geral do funil de vendas</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[#0A0A0A] rounded">
                      <div className="text-xs text-neutral-500 mb-1 uppercase tracking-tight">Total no Funil</div>
                      <div className="text-xl font-bold text-white font-mono">{metrics?.kpis?.oportunidadesAtivas}</div>
                    </div>
                    <div className="p-3 bg-[#0A0A0A] rounded">
                      <div className="text-xs text-neutral-500 mb-1 uppercase tracking-tight">Valor Pipeline</div>
                      <div className="text-lg font-bold text-purple-500 font-mono">{formatBRL(metrics?.kpis?.mrrTotal * 3)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Distribuição por Etapa</p>
                    {['prospect', 'qualificado', 'reuniao_agendada', 'proposta_enviada', 'negociacao'].map((etapa) => (
                      <div key={etapa} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-neutral-400 capitalize">{etapa.replace('_', ' ')}</span>
                          <span className="text-white font-mono">{metrics?.pipeline?.[etapa] || 0}</span>
                        </div>
                        <Progress value={((metrics?.pipeline?.[etapa] || 0) / metrics?.kpis?.oportunidadesAtivas) * 100} className="h-1 bg-[#2A2A2A] [&>div]:bg-purple-500" />
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-[10px] font-bold h-9">
                    VER FUNIL COMPLETO <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Estratégia Card */}
              <Card className="bg-[#141414] border-[#2A2A2A] border-l-4 border-l-green-500">
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-white tracking-wider">ESTRATÉGIA & METAS</CardTitle>
                      <p className="text-[10px] text-neutral-500">Objetivos mensais e taxas reais</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="p-4 bg-[#0A0A0A] rounded-lg border border-white/5">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase">Receita Realizada</p>
                          <div className="text-xl font-bold text-white font-mono">{formatBRL(metrics?.kpis?.mrrTotal)}</div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-neutral-500 uppercase">Meta (R$ 100k)</p>
                          <div className={cn(
                            "text-sm font-bold font-mono",
                            (metrics?.kpis?.mrrTotal / 100000) >= 0.8 ? "text-green-500" :
                            (metrics?.kpis?.mrrTotal / 100000) >= 0.5 ? "text-yellow-500" : "text-red-500"
                          )}>
                            {Math.round((metrics?.kpis?.mrrTotal / 100000) * 100)}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(metrics?.kpis?.mrrTotal / 100000) * 100} 
                        className="h-2 bg-[#2A2A2A]"
                        // Dynamic color via custom style if possible or class based on conditions
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-neutral-500 uppercase">Conversão</p>
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-bold text-white font-mono">{Math.round(metrics?.kpis?.conversionRate)}%</span>
                           <TrendingUp className="w-3 h-3 text-green-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-neutral-500 uppercase">Ticket Médio</p>
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-bold text-white font-mono">{formatBRL(metrics?.kpis?.ticketMedio / 1000)}k</span>
                        </div>
                      </div>
                   </div>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white text-[10px] font-bold h-9">
                      RELATÓRIO COMERCIAL <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </>
        )}
      </main>
    </PageWrapper>
  )
}
