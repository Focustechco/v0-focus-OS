"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Activity,
  Radio,
  FolderOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Briefcase,
  TrendingUp,
  Zap,
  Calendar,
  Grid3X3,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"

// ============ DATA ============
const kpiData = [
  { id: 1, icon: FolderOpen, value: 23, label: "Projetos em Andamento", badge: "+3 novos", badgeColor: "green", bottom: "4 em risco", bottomColor: "yellow" },
  { id: 2, icon: Zap, value: 7, label: "Sprints Correntes", badge: "ATIVO", badgeColor: "orange", bottom: "2 encerrando hoje", bottomColor: "neutral" },
  { id: 3, icon: Clock, value: 89, label: "Tasks Abertas", badge: "5 pendentes", badgeColor: "yellow", bottom: "12 atrasadas", bottomColor: "red" },
  { id: 4, icon: CheckCircle, value: 156, label: "Entregas Realizadas", badge: "94%", badgeColor: "green", bottom: "taxa de conclusão do mês", bottomColor: "neutral" },
  { id: 5, icon: TrendingUp, value: 87, label: "Sprint Completion Rate", badge: "Meta: 90%", badgeColor: "neutral", bottom: "↓ 3% vs sprint anterior", bottomColor: "yellow", isPercent: true },
]

const teamMembers = [
  { id: 1, name: "Gabriel", role: "CTO / Dev Full-stack", status: "ativo", color: "bg-green-500", workload: 85 },
  { id: 2, name: "Dev do Projeto", role: "Desenvolvedor", status: "em-sprint", color: "bg-orange-500", workload: 70 },
  { id: 3, name: "DevSecOps", role: "Infraestrutura", status: "stand-by", color: "bg-neutral-500", workload: 30 },
  { id: 4, name: "Consultor Técnico", role: "Estagiário", status: "em-task", color: "bg-blue-500", workload: 55 },
]

const activityLog = [
  { time: "25/06 09:29", actor: "Gabriel", action: "completou revisão de PR", project: "Projeto Alpha" },
  { time: "25/06 08:12", actor: "Estagiario_01", action: "entregou task #47", project: "App Beta" },
  { time: "24/06 22:55", actor: "DevSecOps", action: "configurou ambiente de staging", project: "Automacao X" },
  { time: "24/06 21:33", actor: "Dev_02", action: "iniciou sprint #7", project: "Sistema Y" },
  { time: "24/06 19:45", actor: "Gabriel", action: "aprovou deploy #142", project: "Projeto Alpha" },
]

const devopsKpis = [
  { label: "Deployment Frequency", value: "3x/semana", status: "healthy", statusLabel: "SAUDÁVEL" },
  { label: "Change Failure Rate", value: "8%", status: "healthy", statusLabel: "< 15% ✓" },
  { label: "MTTR", value: "2h 14min", status: "warning", statusLabel: "MONITORAR" },
  { label: "Lead Time commit→prod", value: "4h 30min", status: "healthy", statusLabel: "OK" },
]

const qualityMetrics = [
  { label: "Bug Rate", value: "2.3/release", trend: "down", trendLabel: "↓" },
  { label: "Defect Escape Rate", value: "0.4%", status: "healthy", statusLabel: "ÓTIMO" },
  { label: "Retrabalho", value: "7%", status: "healthy", statusLabel: "< 10% ✓" },
  { label: "Code Review Time", value: "18h avg", status: "warning", statusLabel: "MONITORAR" },
  { label: "Test Coverage", value: "74%", status: "healthy", statusLabel: "META 70% ✓" },
]

const pendingApprovals = [
  { id: 1, title: "PR #89 — Merge para main", age: "2d", requester: "Dev_02" },
  { id: 2, title: "Deploy Projeto Alpha v2.1", age: "5h", requester: "Gabriel" },
  { id: 3, title: "Acesso staging — Estagiario_01", age: "1d", requester: "DevSecOps" },
]

const agendaToday = [
  { time: "10:00", title: "Daily Standup", tag: "REUNIÃO", tagColor: "blue" },
  { time: "14:00", title: "Review Sprint #7", tag: "SPRINT", tagColor: "orange" },
  { time: "16:30", title: "Deploy Projeto Alpha", tag: "DEPLOY", tagColor: "green" },
  { time: "18:00", title: "1:1 Gabriel × Dev_02", tag: "GESTÃO", tagColor: "purple" },
]

const agendaTomorrow = [
  { time: "09:00", title: "Onboarding Dev_03", tag: "REUNIÃO", tagColor: "blue" },
  { time: "11:00", title: "Apresentação Cliente", tag: "COMERCIAL", tagColor: "yellow" },
]

const performanceData = [
  { dev: "Gabriel", tasksTotal: 18, completed: 15, inProgress: 2, delayed: 1, avgTime: "3.2h", adherence: 94, score: 92 },
  { dev: "Dev_02", tasksTotal: 14, completed: 10, inProgress: 3, delayed: 1, avgTime: "4.1h", adherence: 87, score: 78 },
  { dev: "DevSecOps", tasksTotal: 9, completed: 6, inProgress: 3, delayed: 0, avgTime: "5.8h", adherence: 100, score: 85 },
  { dev: "Estagiario_01", tasksTotal: 11, completed: 7, inProgress: 3, delayed: 1, avgTime: "6.2h", adherence: 80, score: 71 },
  { dev: "Consultor Técnico", tasksTotal: 6, completed: 3, inProgress: 2, delayed: 1, avgTime: "7.1h", adherence: 67, score: 54 },
]

const projectsData = [
  { name: "Diagnóstico", status: "em-andamento", progress: 65, sprint: "Sprint #3", nextDelivery: "30/06", responsible: "Gabriel", score: 88 },
  { name: "App Beta", status: "em-andamento", progress: 40, sprint: "Sprint #7", nextDelivery: "15/07", responsible: "Dev_02", score: 72 },
  { name: "Automacao X", status: "em-risco", progress: 20, sprint: "Sprint #2", nextDelivery: "ATRASADO", responsible: "DevSecOps", score: 51 },
  { name: "Sistema Y", status: "parado", progress: 5, sprint: "—", nextDelivery: "—", responsible: "Consultor Técnico", score: 38 },
  { name: "Projeto Alpha", status: "concluido", progress: 100, sprint: "—", nextDelivery: "—", responsible: "Gabriel", score: 96 },
  { name: "Portal Interno", status: "em-andamento", progress: 55, sprint: "Sprint #4", nextDelivery: "10/07", responsible: "Estagiario_01", score: 74 },
]

const alertsData = [
  { id: 1, severity: "critical", title: "Automacao X atrasada", description: "Sprint #2 com 20% concluída — prazo em 3 dias", time: "há 2h", action: "Ver Projeto →" },
  { id: 2, severity: "warning", title: "Code Review acumulado", description: "3 PRs aguardando >24h", time: "há 5h", action: "Revisar →" },
  { id: 3, severity: "warning", title: "Dev sobrecarregado", description: "Gabriel com 94% de carga", time: "há 1d", action: "Ver Tasks →" },
  { id: 4, severity: "critical", title: "Sistema Y parado", description: "Nenhuma atividade há 5 dias", time: "há 5d", action: "Ativar →" },
]

// ============ COMPONENTS ============

function AnimatedNumber({ value, isPercent = false }: { value: number; isPercent?: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 800
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return <span>{count}{isPercent ? "%" : ""}</span>
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    ativo: { label: "ATIVO", className: "bg-green-500/20 text-green-500 border-green-500/30" },
    "em-sprint": { label: "EM SPRINT", className: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
    "stand-by": { label: "STAND-BY", className: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30" },
    "em-task": { label: "EM TASK", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  }
  const config = statusConfig[status] || statusConfig["stand-by"]
  return (
    <Badge variant="outline" className={`text-[9px] font-mono ${config.className}`}>
      {config.label}
    </Badge>
  )
}

function ProjectStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    "em-andamento": { label: "EM ANDAMENTO", className: "bg-green-500/20 text-green-500 border-green-500/30" },
    "em-risco": { label: "EM RISCO", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
    "parado": { label: "PARADO", className: "bg-red-500/20 text-red-500 border-red-500/30" },
    "concluido": { label: "CONCLUÍDO", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  }
  const config = statusConfig[status] || statusConfig["em-andamento"]
  return (
    <Badge variant="outline" className={`text-[8px] font-mono ${config.className}`}>
      {config.label}
    </Badge>
  )
}

function ScoreDot({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
  return <div className={`w-2 h-2 rounded-full ${color}`} />
}

function getBadgeColor(color: string) {
  const colors: Record<string, string> = {
    green: "bg-green-500/20 text-green-500 border-green-500/30",
    orange: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    yellow: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    red: "bg-red-500/20 text-red-500 border-red-500/30",
    neutral: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  }
  return colors[color] || colors.neutral
}

function getBottomColor(color: string) {
  const colors: Record<string, string> = {
    green: "text-green-500",
    yellow: "text-yellow-500",
    red: "text-red-500",
    neutral: "text-neutral-500",
  }
  return colors[color] || colors.neutral
}

function getTagColor(color: string) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    orange: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    green: "bg-green-500/20 text-green-500 border-green-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    yellow: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  }
  return colors[color] || colors.blue
}

// ============ MAIN COMPONENT ============

export function CommandCenter() {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([])
  const [alertsCollapsed, setAlertsCollapsed] = useState(false)

  const visibleAlerts = alertsData.filter(a => !dismissedAlerts.includes(a.id))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ROW 1 — KPI STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.id} className="bg-[#111111] border-[#2A2A2A] hover:border-orange-500/30 hover:shadow-[0_0_16px_rgba(249,115,22,0.15)] transition-all duration-200 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <Badge variant="outline" className={`text-[8px] sm:text-[10px] font-mono ${getBadgeColor(kpi.badgeColor)}`}>
                  {kpi.badge}
                </Badge>
              </div>
              <div className="text-2xl sm:text-4xl font-bold font-mono text-white">
                <AnimatedNumber value={kpi.value} isPercent={kpi.isPercent} />
              </div>
              <div className="text-[9px] sm:text-[11px] text-neutral-500 mt-1">{kpi.label}</div>
              <div className={`text-[8px] sm:text-[10px] mt-2 font-mono ${getBottomColor(kpi.bottomColor)}`}>
                {kpi.bottom}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ROW 2 — PIPELINE COMERCIAL BANNER */}
      <Card className="bg-[#111111] border-[#2A2A2A] hover:border-orange-500/30 hover:shadow-[0_0_16px_rgba(249,115,22,0.15)] transition-all duration-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 bg-orange-500 rounded-full hidden sm:block" />
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider">PIPELINE COMERCIAL</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs mt-1">
                  <span className="text-neutral-400">23 deals</span>
                  <span className="text-orange-500 font-mono font-semibold">R$ 47.8k em negociação</span>
                  <span className="text-neutral-500">Ticket médio R$ 2.1k</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-[10px] font-mono bg-red-500/10 text-red-500 border-red-500/30">
                  3 parados
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                  5 prioritários
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono bg-green-500/10 text-green-500 border-green-500/30">
                  8 avançando
                </Badge>
              </div>
              <Link href="/comercial">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-10 px-4 font-semibold">
                  VER PIPELINE
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROW 3 — THREE COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* LEFT: EQUIPE */}
        <Card className="lg:col-span-3 bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <CardTitle className="text-xs font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              EQUIPE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Chips */}
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className="text-[10px] font-mono bg-[#1A1A1A] border-[#2A2A2A] text-neutral-300">
                4 Leads
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono bg-[#1A1A1A] border-[#2A2A2A] text-neutral-300">
                12 Estag.
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono bg-[#1A1A1A] border-[#2A2A2A] text-neutral-300">
                3 DevOps
              </Badge>
            </div>

            {/* Team List */}
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] hover:border-orange-500/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${member.color}`} />
                      <div>
                        <div className="text-xs text-white font-semibold">{member.name}</div>
                        <div className="text-[10px] text-neutral-500">{member.role}</div>
                      </div>
                    </div>
                    <StatusBadge status={member.status} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-neutral-500">carga atual</span>
                      <span className="text-neutral-400 font-mono">{member.workload}%</span>
                    </div>
                    <Progress value={member.workload} className="h-1 bg-[#2A2A2A]" />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/time" className="block mt-4 text-[11px] text-orange-500 hover:text-orange-400 font-medium">
              Ver time completo →
            </Link>
          </CardContent>
        </Card>

        {/* CENTER: ACTIVITY LOG + DEVOPS STATUS */}
        <Card className="lg:col-span-6 bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <CardTitle className="text-xs font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              ACTIVITY LOG
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse ml-2" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Activity Timeline */}
            <div className="space-y-3 mb-6">
              {activityLog.map((log, index) => (
                <div
                  key={index}
                  className="border-l-2 border-orange-500 pl-3 py-1 hover:bg-[#1A1A1A] rounded-r transition-colors"
                >
                  <div className="text-[10px] text-neutral-500 font-mono">{log.time}</div>
                  <div className="text-xs text-white mt-0.5">
                    <span className="text-orange-500 font-semibold">{log.actor}</span>{" "}
                    <span className="text-neutral-400">{log.action}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono mt-1 bg-[#1A1A1A] border-[#2A2A2A] text-neutral-400">
                    {log.project}
                  </Badge>
                </div>
              ))}
            </div>
            <Link href="/activity" className="block text-[11px] text-orange-500 hover:text-orange-400 font-medium mb-6">
              Ver log completo →
            </Link>

            {/* DEVOPS STATUS */}
            <div className="border-t border-[#2A2A2A] pt-4">
              <h4 className="text-xs font-medium text-neutral-300 tracking-wider mb-4">DEVOPS STATUS</h4>
              <div className="grid grid-cols-2 gap-3">
                {devopsKpis.map((kpi, index) => (
                  <div key={index} className="p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                    <div className="text-[10px] text-neutral-500 mb-1">{kpi.label}</div>
                    <div className="text-sm text-white font-mono font-semibold">{kpi.value}</div>
                    <Badge 
                      variant="outline" 
                      className={`text-[8px] font-mono mt-2 ${
                        kpi.status === "healthy" ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                      }`}
                    >
                      {kpi.statusLabel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: QUALIDADE + CANAL INTERNO */}
        <Card className="lg:col-span-3 bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <CardTitle className="text-xs font-medium text-neutral-300 tracking-wider">QUALIDADE DO CÓDIGO</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Quality Metrics */}
            <div className="space-y-3 mb-6">
              {qualityMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-mono">{metric.value}</span>
                    {metric.trend && (
                      <span className="text-green-500 text-[10px]">{metric.trendLabel}</span>
                    )}
                    {metric.status && (
                      <Badge 
                        variant="outline" 
                        className={`text-[8px] font-mono ${
                          metric.status === "healthy" ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                        }`}
                      >
                        {metric.statusLabel}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CANAL INTERNO */}
            <div className="border-t border-[#2A2A2A] pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-neutral-300 tracking-wider">CANAL INTERNO</span>
              </div>

              {/* Radar Animation */}
              <div className="flex justify-center mb-4">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-2 border-orange-500/40 rounded-full animate-pulse" style={{ animationDuration: "2s" }} />
                  <div className="absolute inset-3 border border-orange-500/30 rounded-full animate-pulse" style={{ animationDuration: "2.5s" }} />
                  <div className="absolute inset-6 border border-orange-500/20 rounded-full animate-pulse" style={{ animationDuration: "3s" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="text-center text-[10px] text-green-500 font-mono mb-4">
                ● CANAL SEGURO ATIVO
              </div>

              {/* Terminal */}
              <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#2A2A2A] text-[9px] font-mono space-y-1">
                <div className="text-neutral-500"># 2025-06-25 14:25 UTC</div>
                <div className="text-white">{"> [Gabriel] Sprint #7 finalizada"}</div>
                <div className="text-orange-500">{"> [Sistema] Deploy #142 em prod"}</div>
                <div className="text-white">{"> [DevSecOps] Staging atualizado"}</div>
                <div className="text-neutral-400">{"> Reunião: 26/06 10:00"}</div>
              </div>

              <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                <MessageSquare className="w-4 h-4 mr-2" />
                Abrir Canal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 4 — TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* APROVAÇÕES PENDENTES */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                APROVAÇÕES PENDENTES
              </CardTitle>
              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-[10px] font-mono">
                {pendingApprovals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] hover:border-orange-500/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white truncate">{approval.title}</span>
                    <Badge variant="outline" className="text-[8px] font-mono bg-[#222] text-neutral-400 border-[#2A2A2A]">
                      {approval.age}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">{approval.requester}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[10px] border-orange-500/50 text-orange-500 hover:bg-orange-500/10">
                    Revisar →
                  </Button>
                  <button className="text-neutral-500 hover:text-neutral-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <Link href="/aprovacoes" className="block text-[11px] text-orange-500 hover:text-orange-400 font-medium">
              Ver todas as aprovações →
            </Link>
          </CardContent>
        </Card>

        {/* AGENDA */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <CardTitle className="text-xs font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              AGENDA
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* TODAY */}
            <div className="mb-4">
              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-[10px] font-mono mb-3">
                HOJE — 25 JUN
              </Badge>
              <div className="space-y-2">
                {agendaToday.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 hover:bg-[#1A1A1A] rounded transition-colors">
                    <span className="text-xs text-orange-500 font-mono font-semibold w-12">{event.time}</span>
                    <span className="text-xs text-white flex-1">{event.title}</span>
                    <Badge variant="outline" className={`text-[8px] font-mono ${getTagColor(event.tagColor)}`}>
                      {event.tag}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* TOMORROW */}
            <div>
              <Badge variant="outline" className="bg-neutral-500/10 text-neutral-400 border-neutral-500/30 text-[10px] font-mono mb-3">
                AMANHÃ — 26 JUN
              </Badge>
              <div className="space-y-2">
                {agendaTomorrow.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 hover:bg-[#1A1A1A] rounded transition-colors">
                    <span className="text-xs text-neutral-400 font-mono w-12">{event.time}</span>
                    <span className="text-xs text-neutral-300 flex-1">{event.title}</span>
                    <Badge variant="outline" className={`text-[8px] font-mono ${getTagColor(event.tagColor)}`}>
                      {event.tag}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 5 — PERFORMANCE DO TIME */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="pb-3 border-b border-[#2A2A2A]">
          <CardTitle className="text-xs font-medium text-neutral-300 tracking-wider">
            PERFORMANCE DO TIME — SPRINT ATUAL
          </CardTitle>
          <p className="text-[10px] text-neutral-500 mt-1">
            Score baseado em entrega, qualidade, consistência e prazo
          </p>
        </CardHeader>
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-[10px] text-neutral-500 border-b border-[#2A2A2A]">
                <th className="text-left pb-3 font-medium">Dev</th>
                <th className="text-center pb-3 font-medium">Tasks Total</th>
                <th className="text-center pb-3 font-medium">Concluídas</th>
                <th className="text-center pb-3 font-medium">Em Andamento</th>
                <th className="text-center pb-3 font-medium">Atrasos</th>
                <th className="text-center pb-3 font-medium">Tempo Médio/Task</th>
                <th className="text-center pb-3 font-medium">Aderência %</th>
                <th className="text-center pb-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((row, index) => (
                <tr key={index} className="text-xs border-b border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-3 text-white font-medium">{row.dev}</td>
                  <td className="py-3 text-center text-neutral-300 font-mono">{row.tasksTotal}</td>
                  <td className="py-3 text-center text-green-500 font-mono">{row.completed}</td>
                  <td className="py-3 text-center text-yellow-500 font-mono">{row.inProgress}</td>
                  <td className="py-3 text-center text-red-500 font-mono">{row.delayed}</td>
                  <td className="py-3 text-center text-neutral-300 font-mono">{row.avgTime}</td>
                  <td className="py-3 text-center text-neutral-300 font-mono">{row.adherence}%</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <ScoreDot score={row.score} />
                      <span className="font-mono font-semibold text-white">{row.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ROW 6 — STATUS DOS PROJETOS */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="pb-3 border-b border-[#2A2A2A]">
          <CardTitle className="text-xs font-medium text-neutral-300 tracking-wider flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-orange-500" />
            VISÃO GERAL DE PROJETOS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-[10px] text-neutral-500 border-b border-[#2A2A2A]">
                <th className="text-left pb-3 font-medium">Projeto</th>
                <th className="text-center pb-3 font-medium">Status</th>
                <th className="text-center pb-3 font-medium">Progresso</th>
                <th className="text-center pb-3 font-medium">Sprint Atual</th>
                <th className="text-center pb-3 font-medium">Próxima Entrega</th>
                <th className="text-center pb-3 font-medium">Responsável</th>
                <th className="text-center pb-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {projectsData.map((project, index) => (
                <tr key={index} className="text-xs border-b border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                  <td className="py-3 text-white font-medium">{project.name}</td>
                  <td className="py-3 text-center">
                    <ProjectStatusBadge status={project.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={project.progress} 
                        className={`h-1.5 w-20 bg-[#2A2A2A] ${
                          project.status === "em-andamento" ? "[&>div]:bg-green-500" :
                          project.status === "em-risco" ? "[&>div]:bg-yellow-500" :
                          project.status === "parado" ? "[&>div]:bg-red-500" :
                          "[&>div]:bg-blue-500"
                        }`} 
                      />
                      <span className="text-neutral-400 font-mono text-[10px]">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-neutral-300 font-mono">{project.sprint}</td>
                  <td className={`py-3 text-center font-mono ${project.nextDelivery === "ATRASADO" ? "text-red-500" : "text-neutral-300"}`}>
                    {project.nextDelivery}
                  </td>
                  <td className="py-3 text-center text-neutral-300">{project.responsible}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <ScoreDot score={project.score} />
                      <span className="font-mono font-semibold text-white">{project.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ROW 7 — ALERTAS AUTOMÁTICOS */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="pb-3 border-b border-[#2A2A2A]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              ALERTAS DO SISTEMA
              <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-[10px] font-mono ml-2">
                {visibleAlerts.length}
              </Badge>
            </CardTitle>
            <button
              onClick={() => setAlertsCollapsed(!alertsCollapsed)}
              className="text-neutral-500 hover:text-neutral-300"
            >
              {alertsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </CardHeader>
        {!alertsCollapsed && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.severity === "critical" 
                      ? "bg-red-500/5 border-red-500/30" 
                      : "bg-yellow-500/5 border-yellow-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                        alert.severity === "critical" ? "text-red-500" : "text-yellow-500"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-[8px] font-mono ${
                              alert.severity === "critical" 
                                ? "bg-red-500/20 text-red-500 border-red-500/30" 
                                : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                            }`}
                          >
                            {alert.severity === "critical" ? "CRÍTICO" : "ATENÇÃO"}
                          </Badge>
                          <span className="text-xs text-white font-medium">{alert.title}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1">{alert.description}</p>
                        <span className="text-[10px] text-neutral-500 font-mono">{alert.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
                      className="text-neutral-500 hover:text-neutral-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`mt-3 h-7 text-[10px] ${
                      alert.severity === "critical" 
                        ? "border-red-500/50 text-red-500 hover:bg-red-500/10" 
                        : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                    }`}
                  >
                    {alert.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* STICKY FOOTER BAR */}
      <div className="sticky bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#2A2A2A] py-3 px-4 -mx-4 sm:-mx-6 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs">
          <span className="text-neutral-500 font-medium">FOCUS OS — OPERACIONAL</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Sprint Atual: <span className="text-white">#7</span> — encerra 28/06</span>
            <span className="hidden sm:inline">|</span>
            <span>Próximo Deploy: <span className="text-orange-500">hoje 16:30</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 font-mono">TODOS OS SISTEMAS OPERACIONAIS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
