"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { ReportWizard } from "@/components/reports/report-wizard"
import { ReportEditor } from "@/components/reports/report-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Plus,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// KPIs data
const kpis = [
  { label: "Projetos Ativos", value: 23, change: +3, trend: "up", icon: FolderOpen },
  { label: "Tasks Concluidas (mes)", value: 187, change: +12, trend: "up", icon: CheckCircle2 },
  { label: "Sprints em Andamento", value: 7, change: 0, trend: "stable", icon: Zap },
  { label: "Taxa de Entrega no Prazo", value: 94, suffix: "%", change: +2, trend: "up", icon: Target },
]

// Projetos por etapa
const projectsByStage = [
  { stage: "Diagnostico", count: 2, color: "bg-blue-500" },
  { stage: "MVP", count: 3, color: "bg-purple-500" },
  { stage: "Proposta", count: 1, color: "bg-yellow-500" },
  { stage: "Sprints", count: 12, color: "bg-orange-500" },
  { stage: "Deploy", count: 3, color: "bg-green-500" },
  { stage: "Suporte MRR", count: 5, color: "bg-neutral-500" },
]

// Alertas
const alerts = [
  { id: 1, type: "warning", message: "PRJ-040 - Automacao de Vendas: Prazo em 3 dias", project: "PRJ-040" },
  { id: 2, type: "danger", message: "PRJ-037 - Portal do Cliente: Task bloqueada ha 2 dias", project: "PRJ-037" },
  { id: 3, type: "info", message: "3 aprovacoes pendentes aguardando cliente", project: null },
]

// Relatorios recentes
const recentReports = [
  { id: "RPT-001", project: "Sistema de Gestao", date: "05/07", status: "draft" },
  { id: "RPT-002", project: "Integracao ERP", date: "01/07", status: "exported" },
  { id: "RPT-003", project: "App E-commerce", date: "28/06", status: "exported" },
]

// Performance por setor
const sectorPerformance = [
  { sector: "Backend", tasks: 45, completed: 42, velocity: 93 },
  { sector: "Frontend", tasks: 38, completed: 35, velocity: 92 },
  { sector: "Mobile", tasks: 28, completed: 24, velocity: 86 },
  { sector: "DevOps", tasks: 15, completed: 15, velocity: 100 },
  { sector: "Design", tasks: 22, completed: 20, velocity: 91 },
]

interface EditorConfig {
  projectId: string
  projectName: string
  clientName: string
  period: string
  periodStart: Date
  periodEnd: Date
  reportType: string
  sections: Array<{ id: string; name: string; enabled: boolean }>
  recipientName: string
  recipientRole: string
  preparedBy: string
  includeFocusLogo: boolean
  includeClientLogo: boolean
}

export default function IntelligencePage() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null)

  const handleWizardComplete = (config: EditorConfig) => {
    setEditorConfig(config)
  }

  const handleBackFromEditor = () => {
    setEditorConfig(null)
  }

  // Se estiver no editor, mostrar apenas ele
  if (editorConfig) {
    return <ReportEditor config={editorConfig} onBack={handleBackFromEditor} />
  }

  return (
    <PageWrapper title="INTELLIGENCE CENTER">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-white">Intelligence Center</h1>
            <p className="text-xs sm:text-sm text-neutral-500">Metricas, analytics e insights dos projetos</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/relatorios">
              <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
                <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Relatorios Anteriores</span>
                <span className="sm:hidden">Relatorios</span>
              </Button>
            </Link>
            <Button
              onClick={() => setWizardOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Relatorio</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index} className="bg-[#141414] border-[#2A2A2A]">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-neutral-500 tracking-wider mb-1 truncate">{kpi.label.toUpperCase()}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-2xl font-bold text-white font-mono">{kpi.value}</span>
                      {kpi.suffix && <span className="text-sm sm:text-lg text-white">{kpi.suffix}</span>}
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 mt-1 text-[9px] sm:text-xs",
                      kpi.trend === "up" ? "text-green-500" :
                      kpi.trend === "down" ? "text-red-500" : "text-neutral-500"
                    )}>
                      {kpi.trend === "up" && <TrendingUp className="w-3 h-3" />}
                      {kpi.trend === "down" && <TrendingDown className="w-3 h-3" />}
                      <span className="hidden sm:inline">{kpi.change > 0 ? "+" : ""}{kpi.change} vs mes anterior</span>
                      <span className="sm:hidden">{kpi.change > 0 ? "+" : ""}{kpi.change}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 ml-2">
                    <kpi.icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Projetos por Etapa */}
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-orange-500" />
                PROJETOS POR ETAPA
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-2 sm:space-y-3">
                {projectsByStage.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0", item.color)} />
                    <span className="flex-1 text-xs sm:text-sm text-neutral-300 truncate">{item.stage}</span>
                    <span className="text-xs sm:text-sm font-mono text-white">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#2A2A2A]">
                <div className="flex justify-between text-[10px] sm:text-xs text-neutral-500">
                  <span>Total de projetos</span>
                  <span className="font-mono text-white">{projectsByStage.reduce((a, b) => a + b.count, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance por Setor */}
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                PERFORMANCE POR SETOR
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="space-y-3 sm:space-y-4">
                {sectorPerformance.map((sector, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
                      <span className="text-neutral-300">{sector.sector}</span>
                      <span className="text-neutral-500">
                        <span className="hidden sm:inline">{sector.completed}/{sector.tasks}</span> ({sector.velocity}%)
                      </span>
                    </div>
                    <Progress
                      value={sector.velocity}
                      className="h-1 sm:h-1.5 bg-[#2A2A2A]"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertas e Relatorios */}
          <div className="space-y-4 sm:space-y-6">
            {/* Alertas */}
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  ALERTAS
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-2 rounded-lg border-l-2 text-[10px] sm:text-xs",
                        alert.type === "danger" ? "bg-red-500/10 border-red-500 text-red-400" :
                        alert.type === "warning" ? "bg-yellow-500/10 border-yellow-500 text-yellow-400" :
                        "bg-blue-500/10 border-blue-500 text-blue-400"
                      )}
                    >
                      <span className="line-clamp-2">{alert.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Relatorios Recentes */}
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span className="hidden sm:inline">RELATORIOS RECENTES</span>
                    <span className="sm:hidden">RELATORIOS</span>
                  </CardTitle>
                  <Link href="/relatorios">
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] sm:text-xs text-neutral-500 hover:text-white px-1 sm:px-2">
                      <span className="hidden sm:inline">Ver todos</span>
                      <ArrowRight className="w-3 h-3 sm:ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-2">
                  {recentReports.map(report => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs text-white truncate">{report.project}</p>
                          <p className="text-[9px] sm:text-[10px] text-neutral-500">{report.date}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[8px] sm:text-[9px] flex-shrink-0",
                        report.status === "draft"
                          ? "bg-orange-500/20 text-orange-500"
                          : "bg-green-500/20 text-green-500"
                      )}>
                        {report.status === "draft" ? "RASCUNHO" : "EXPORTADO"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline de Atividade */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              ATIVIDADE RECENTE
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="space-y-3 sm:space-y-4">
              {[
                { time: "Hoje 14:32", action: "Deploy realizado", project: "PRJ-037", user: "Pedro", type: "deploy" },
                { time: "Hoje 11:15", action: "Sprint 7 iniciada", project: "PRJ-042", user: "Gabriel", type: "sprint" },
                { time: "Hoje 09:45", action: "5 tasks concluidas", project: "PRJ-041", user: "Maria", type: "task" },
                { time: "Ontem 17:20", action: "Relatorio exportado", project: "PRJ-038", user: "Ana", type: "report" },
                { time: "Ontem 14:00", action: "Aprovacao recebida", project: "PRJ-040", user: "Cliente", type: "approval" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-4">
                  <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  <span className="text-[9px] sm:text-xs text-neutral-500 w-16 sm:w-24 font-mono flex-shrink-0">{item.time}</span>
                  <span className="text-[10px] sm:text-sm text-neutral-300 flex-1 truncate">{item.action}</span>
                  <Badge variant="outline" className="text-[8px] sm:text-[10px] border-[#2A2A2A] text-neutral-500 hidden sm:flex">
                    {item.project}
                  </Badge>
                  <span className="text-[9px] sm:text-xs text-neutral-500 hidden sm:inline">{item.user}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wizard Modal */}
      <ReportWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={handleWizardComplete}
      />
    </PageWrapper>
  )
}
