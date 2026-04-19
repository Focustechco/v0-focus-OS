"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  ListTodo,
  Zap,
  Activity as ActivityIcon,
  Loader2,
  Users,
  Layers,
  TrendingUp,
  FileText,
} from "lucide-react"

import { useDashboard } from "@/lib/hooks/use-dashboard"
import { cn } from "@/lib/utils"
import { PerformanceSection } from "./dashboard/performance-section"

export function CommandCenter() {
  const { data, isLoading, isError } = useDashboard()

  if (isError) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">
              Erro de Autenticacao / Conexao
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Verifique se as variaveis <code className="rounded bg-[#0A0A0A] px-1 font-mono text-orange-500">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="rounded bg-[#0A0A0A] px-1 font-mono text-orange-500">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> estao definidas no seu arquivo .env.local.
            </p>
            <Button 
               variant="outline" 
               size="sm" 
               className="mt-4 border-red-500/30 text-red-500 hover:bg-red-500/10"
               onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Alertas Globais */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase">Alertas de Sistema</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading ? (
             Array(3).fill(0).map((_, i) => <SkeletonCard key={i} className="h-16" />)
          ) : !data?.alerts || data.alerts.length === 0 ? (
            <div className="col-span-full p-4 border border-dashed border-[#2A2A2A] rounded-lg text-center text-[10px] text-neutral-600 uppercase font-mono tracking-widest">
              Nenhum alerta critico detectado no momento
            </div>
          ) : (
            data.alerts.map((alert: any) => (
              <Link key={alert.id} href={alert.href}>
                <div className={cn(
                  "p-3 rounded-lg border flex items-center gap-3 transition-colors hover:bg-opacity-80 active:scale-[0.98]",
                  alert.severity === 'danger' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                  alert.severity === 'warning' ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" :
                  "bg-blue-500/10 border-blue-500/30 text-blue-500"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    alert.severity === 'danger' ? "bg-red-500" : alert.severity === 'warning' ? "bg-yellow-500" : "bg-blue-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase font-mono opacity-70 mb-0.5">{alert.type}</p>
                    <p className="text-[11px] font-medium truncate">{alert.message}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 opacity-50" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 2. Grid de Cards de Modulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card Projetos */}
        <DashboardCard 
          title="PROJETOS" 
          icon={FolderKanban}
          href="/projetos"
          isLoading={isLoading}
          footer="Ver projetos em Visao Geral"
        >
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-display font-bold text-white">{data?.projects?.active || 0}</span>
              <div className="flex items-center gap-1 text-[10px] text-green-500 font-mono">
                <TrendingUp className="w-3 h-3" />
                +{data?.projects?.recentCount || 0} novos
              </div>
            </div>
            <div className="space-y-2">
              {['Diagnóstico', 'MVP', 'Proposta', 'Sprints'].map((stage) => (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono uppercase">
                    <span>{stage}</span>
                    <span>{data?.projects?.byStage?.[stage] || 0}</span>
                  </div>
                  <Progress 
                    value={data?.projects?.total ? ((data?.projects?.byStage?.[stage] || 0) / data?.projects?.total) * 100 : 0} 
                    className="h-1 bg-[#1a1a1a]" 
                  />
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        {/* Card Tarefas */}
        <DashboardCard 
          title="TAREFAS" 
          icon={ListTodo}
          href="/projetos?tab=tasks"
          isLoading={isLoading}
          footer="Ver lista completa de tasks"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-display font-bold text-white text-blue-400">{data?.tasks?.total || 0}</span>
                <p className="text-[10px] text-neutral-500 font-mono">EM ABERTO</p>
              </div>
              {data?.tasks?.overdue && data?.tasks?.overdue > 0 ? (
                <Badge variant="destructive" className="bg-red-500 animate-bounce">
                  {data?.tasks?.overdue} VENCIDAS
                </Badge>
              ): null}
            </div>
            <div className="grid grid-cols-2 gap-2">
               <div className="p-2 bg-[#0A0A0A] rounded border border-[#2A2A2A]">
                  <p className="text-[9px] text-neutral-500 font-mono">EM ANDAMENTO</p>
                  <p className="text-lg font-bold text-white">{data?.tasks?.inProgress || 0}</p>
               </div>
               <div className="p-2 bg-[#0A0A0A] rounded border border-[#2A2A2A]">
                  <p className="text-[9px] text-neutral-500 font-mono">CONCLUIDAS (MES)</p>
                  <p className="text-lg font-bold text-green-500">{data?.tasks?.completionRate || 0}%</p>
               </div>
            </div>
          </div>
        </DashboardCard>

        {/* Card Sprints */}
        <DashboardCard 
          title="SPRINTS" 
          icon={Zap}
          href="/projetos?tab=sprints"
          isLoading={isLoading}
          footer="Acompanhar ciclos ativos"
        >
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-bold text-yellow-500">{data?.sprints?.active || 0}</span>
              <span className="text-[10px] text-neutral-500 font-mono mb-1.5 uppercase">ATIVAS HOJE</span>
            </div>
            <div className="space-y-2">
              {data?.sprints?.upcoming?.map((s: any, i: number) => {
                const isUrgent = Math.ceil((new Date(s.data_fim).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) < 7
                return (
                  <div key={i} className={cn(
                    "p-2 rounded border text-[10px] flex items-center justify-between",
                    isUrgent ? "bg-orange-500/5 border-orange-500/20 text-orange-500" : "bg-[#0A0A0A] border-[#2A2A2A] text-neutral-400"
                  )}>
                    <span className="font-medium truncate mr-2">{s.nome}</span>
                    <span className="font-mono flex-shrink-0">{new Date(s.data_fim).toLocaleDateString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </DashboardCard>

        {/* Card Aprovações */}
        <DashboardCard 
          title="APROVACOES" 
          icon={CheckCircle2}
          href="/projetos?tab=aprovacoes"
          isLoading={isLoading}
          footer="Liberar pendencias de clientes"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-display font-bold text-purple-400">{data?.approvals?.pending || 0}</span>
              {data?.approvals?.pending && data?.approvals?.pending > 0 ? (
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              ) : null}
            </div>
            <div className="space-y-2">
              {data?.approvals?.oldest?.map((a: any, i: number) => (
                <div key={i} className="p-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded">
                   <p className="text-[10px] text-white font-medium truncate">{a.titulo}</p>
                   <p className="text-[9px] text-neutral-600 font-mono uppercase truncate">{a.projeto_nome}</p>
                </div>
              ))}
              {(!data?.approvals?.oldest || data?.approvals?.oldest?.length === 0) && (
                <p className="text-center py-4 text-[10px] text-neutral-600 font-mono uppercase italic">Nenhuma pendencia</p>
              )}
            </div>
          </div>
        </DashboardCard>


        {/* Card Intelligence */}
        <DashboardCard 
          title="INTELLIGENCE" 
          icon={ActivityIcon}
          href="/intelligence"
          isLoading={isLoading}
          footer="Ver metricas estrategicas"
        >
          <div className="space-y-4">
             <div className="grid grid-cols-3 gap-2">
                <div>
                   <p className="text-[8px] text-neutral-500 font-mono">ATIVOS</p>
                   <p className="text-lg font-bold text-white">{data?.intelligence?.activeProjects || 0}</p>
                </div>
                <div>
                   <p className="text-[8px] text-neutral-500 font-mono">TASKS/M</p>
                   <p className="text-lg font-bold text-blue-400">{data?.intelligence?.completedTasksMonth || 0}</p>
                </div>
                <div>
                   <p className="text-[8px] text-neutral-500 font-mono">ON-TIME</p>
                   <p className="text-lg font-bold text-green-500">{data?.intelligence?.deliveryRate || 0}%</p>
                </div>
             </div>
             <div className="h-10 flex items-center justify-center p-2 bg-[#0A0A0A] rounded border border-orange-500/10">
                <p className="text-[10px] text-neutral-500 text-center italic">Sugerindo otimizacao de prazos...</p>
             </div>
          </div>
        </DashboardCard>

        {/* Card Comercial */}
        <DashboardCard 
          title="COMERCIAL" 
          icon={Briefcase}
          href="/comercial"
          isLoading={isLoading}
          footer="Gestao de leads e deals"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div>
                  <span className="text-3xl font-display font-bold text-green-500">{data?.crm?.totalLeads || 0}</span>
                  <p className="text-[10px] text-neutral-500 font-mono uppercase">LEADS ATIVOS</p>
               </div>
               <Badge className="bg-green-500/10 text-green-500 border-green-500/20">+{data?.crm?.newMonth || 0} MES</Badge>
            </div>
            <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg flex items-center justify-between">
               <span className="text-[10px] text-neutral-400 font-mono">EM NEGOCIACAO:</span>
               <span className="text-sm font-bold text-white">{data?.crm?.negotiating || 0}</span>
            </div>
          </div>
        </DashboardCard>

        {/* Card Equipe */}
        <DashboardCard 
          title="EQUIPE" 
          icon={Users}
          href="/equipe"
          isLoading={isLoading}
          footer="Performance e disponibilidade"
        >
          <div className="space-y-4">
             <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center p-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                   <p className="text-[10px] text-neutral-500 mb-1">MEMBROS</p>
                   <p className="text-2xl font-bold text-white">{data?.equipe?.activeMembers || 0}</p>
                </div>
                <div className="flex-1 text-center p-3 bg-[#1A1A1A] border border-orange-500/20 rounded-lg">
                   <p className="text-[10px] text-orange-500 mb-1">OCUPADOS</p>
                   <p className="text-2xl font-bold text-white">{data?.equipe?.busyMembers || 0}</p>
                </div>
             </div>
             <p className="text-[10px] text-neutral-600 text-center font-mono uppercase tracking-widest">Capacidade Atual: 89%</p>
          </div>
        </DashboardCard>
      </div>

      {/* 3. Performance & Desempenho */}
      <PerformanceSection />

      {/* Footer info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/5 text-[9px]">
             SUPABASE REALTIME ACTIVE
           </Badge>
           <span className="text-[10px] text-neutral-600 font-mono">
             REFRESH: AUTO (120S)
           </span>
        </div>
        <p className="text-right font-mono text-[10px] text-neutral-600 uppercase">
          Ultima atualizacao: {data?.updatedAt ? new Date(data.updatedAt).toLocaleTimeString("pt-BR") : "--:--:--"}
        </p>
      </div>
    </div>
  )
}

function DashboardCard({ 
  title, 
  icon: Icon, 
  children, 
  href, 
  isLoading,
  footer 
}: { 
  title: string
  icon: any
  children: React.ReactNode
  href: string
  isLoading?: boolean
  footer?: string
}) {
  return (
    <Card className="border-[#2A2A2A] bg-[#141414] overflow-hidden group hover:border-orange-500/30 transition-all flex flex-col">
      <CardHeader className="border-b border-[#2A2A2A] py-3 px-4 bg-[#0F0F0F]">
        <CardTitle className="text-[10px] font-mono font-bold tracking-[0.2em] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-orange-500" />
            {title}
          </div>
          <Link href={href}>
             <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-orange-500">
                <ArrowRight className="w-3 h-3" />
             </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        {isLoading ? <SkeletonContent /> : children}
      </CardContent>
      {footer && (
        <Link href={href} className="px-4 py-2 bg-[#0F0F0F] border-t border-[#2A2A2A] text-[9px] font-mono text-neutral-600 hover:text-orange-500 transition-colors uppercase">
          {footer} →
        </Link>
      )}
    </Card>
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-[#141414] border border-[#2A2A2A] rounded-lg animate-pulse", className)} />
  )
}

function SkeletonContent() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-16 bg-[#1A1A1A] rounded" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-[#1A1A1A] rounded" />
        <div className="h-4 w-3/4 bg-[#1A1A1A] rounded" />
      </div>
    </div>
  )
}
