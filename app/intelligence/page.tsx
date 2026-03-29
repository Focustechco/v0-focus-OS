"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { ReportWizard } from "@/components/reports/report-wizard"
import { ReportEditor } from "@/components/reports/report-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  FileText,
  Plus,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Calendar,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader title="INTELLIGENCE CENTER" />

        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Intelligence Center</h1>
              <p className="text-sm text-neutral-500">Metricas, analytics e insights dos projetos</p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/relatorios">
                <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Relatorios Anteriores
                </Button>
              </Link>
              <Button
                onClick={() => setWizardOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Relatorio
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi, index) => (
              <Card key={index} className="bg-[#141414] border-[#2A2A2A]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-neutral-500 tracking-wider mb-1">{kpi.label.toUpperCase()}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white font-mono">{kpi.value}</span>
                        {kpi.suffix && <span className="text-lg text-white">{kpi.suffix}</span>}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 mt-1 text-xs",
                        kpi.trend === "up" ? "text-green-500" :
                        kpi.trend === "down" ? "text-red-500" : "text-neutral-500"
                      )}>
                        {kpi.trend === "up" && <TrendingUp className="w-3 h-3" />}
                        {kpi.trend === "down" && <TrendingDown className="w-3 h-3" />}
                        <span>{kpi.change > 0 ? "+" : ""}{kpi.change} vs mes anterior</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <kpi.icon className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Projetos por Etapa */}
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-orange-500" />
                  PROJETOS POR ETAPA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectsByStage.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", item.color)} />
                      <span className="flex-1 text-sm text-neutral-300">{item.stage}</span>
                      <span className="text-sm font-mono text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Total de projetos</span>
                    <span className="font-mono text-white">{projectsByStage.reduce((a, b) => a + b.count, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance por Setor */}
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  PERFORMANCE POR SETOR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectorPerformance.map((sector, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-neutral-300">{sector.sector}</span>
                        <span className="text-neutral-500">
                          {sector.completed}/{sector.tasks} ({sector.velocity}%)
                        </span>
                      </div>
                      <Progress
                        value={sector.velocity}
                        className="h-1.5 bg-[#2A2A2A]"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertas e Relatorios */}
            <div className="space-y-6">
              {/* Alertas */}
              <Card className="bg-[#141414] border-[#2A2A2A]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ALERTAS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-2 rounded-lg border-l-2 text-xs",
                          alert.type === "danger" ? "bg-red-500/10 border-red-500 text-red-400" :
                          alert.type === "warning" ? "bg-yellow-500/10 border-yellow-500 text-yellow-400" :
                          "bg-blue-500/10 border-blue-500 text-blue-400"
                        )}
                      >
                        {alert.message}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Relatorios Recentes */}
              <Card className="bg-[#141414] border-[#2A2A2A]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      RELATORIOS RECENTES
                    </CardTitle>
                    <Link href="/relatorios">
                      <Button size="sm" variant="ghost" className="h-6 text-xs text-neutral-500 hover:text-white">
                        Ver todos
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentReports.map(report => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-neutral-500" />
                          <div>
                            <p className="text-xs text-white">{report.project}</p>
                            <p className="text-[10px] text-neutral-500">{report.date}</p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-[9px]",
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
            <CardHeader>
              <CardTitle className="text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                ATIVIDADE RECENTE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "Hoje 14:32", action: "Deploy realizado", project: "PRJ-037", user: "Pedro", type: "deploy" },
                  { time: "Hoje 11:15", action: "Sprint 7 iniciada", project: "PRJ-042", user: "Gabriel", type: "sprint" },
                  { time: "Hoje 09:45", action: "5 tasks concluidas", project: "PRJ-041", user: "Maria", type: "task" },
                  { time: "Ontem 17:20", action: "Relatorio exportado", project: "PRJ-038", user: "Ana", type: "report" },
                  { time: "Ontem 14:00", action: "Aprovacao recebida", project: "PRJ-040", user: "Cliente", type: "approval" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-xs text-neutral-500 w-24 font-mono">{item.time}</span>
                    <span className="text-sm text-neutral-300 flex-1">{item.action}</span>
                    <Badge variant="outline" className="text-[10px] border-[#2A2A2A] text-neutral-500">
                      {item.project}
                    </Badge>
                    <span className="text-xs text-neutral-500">{item.user}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Wizard Modal */}
      <ReportWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={handleWizardComplete}
      />
    </div>
  )
}
