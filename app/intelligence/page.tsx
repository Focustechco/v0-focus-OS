"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { ReportWizard } from "@/components/reports/report-wizard"
import { ReportEditor } from "@/components/reports/report-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  FileText,
  Plus,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  ArrowRight,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useIntelligence } from "@/lib/hooks/use-intelligence"
import { useReports } from "@/lib/hooks/use-relatorios"
import { useProjects } from "@/lib/hooks/use-projetos"

// Map stages natively
const stageConfigMap: Record<string, { label: string; color: string }> = {
  diagnostico: { label: "Diagnóstico", color: "bg-blue-500" },
  mvp: { label: "MVP", color: "bg-purple-500" },
  proposta: { label: "Proposta", color: "bg-yellow-500" },
  sprints: { label: "Sprints", color: "bg-orange-500" },
  deploy: { label: "Deploy", color: "bg-green-500" },
  suporte: { label: "Suporte MRR", color: "bg-neutral-500" },
}

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
  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null)
  
  // Real DB Hooks
  const { metrics, isLoading: loadingMetrics } = useIntelligence()
  const { reports, addReport, isLoading: loadingReports } = useReports()
  const { projects } = useProjects() // To populate the New Report modal

  // Form states
  const [newReportOpen, setNewReportOpen] = useState(false)
  const [reportForm, setReportForm] = useState({
    titulo: "",
    projeto_id: "",
    periodo_inicio: "",
    periodo_fim: "",
    tipo: "Mensal",
    observacoes: ""
  })

  // Format real KPIs
  const activeProjects = metrics?.kpis?.activeProjects || { count: 0, change: 0 }
  const completedTasks = metrics?.kpis?.completedTasks || { count: 0, change: 0 }
  const activeSprints = metrics?.kpis?.activeSprints || 0
  const deliveryRate = metrics?.kpis?.deliveryRate || 0

  const kpis = [
    { label: "Projetos Ativos", value: activeProjects.count, change: activeProjects.change, trend: activeProjects.change >= 0 ? "up" : "down", icon: FolderOpen },
    { label: "Tasks Concluidas (mes)", value: completedTasks.count, change: completedTasks.change, trend: completedTasks.change >= 0 ? "up" : "down", icon: CheckCircle2 },
    { label: "Sprints em Andamento", value: activeSprints, change: 0, trend: "stable", icon: Zap },
    { label: "Taxa de Entrega no Prazo", value: deliveryRate, suffix: "%", change: 0, trend: "stable", icon: Target },
  ]

  // Map Real Stage stats
  const projectsByStage = (metrics?.stageStats || []).map((s: any) => ({
    stage: stageConfigMap[s.etapa]?.label || s.etapa,
    count: Number(s.total),
    color: stageConfigMap[s.etapa]?.color || "bg-neutral-500"
  }))

  const sectorPerformance = (metrics?.sectorStats || []).map((s: any) => ({
    sector: s.setor,
    tasks: Number(s.total),
    completed: Number(s.concluidas),
    velocity: Number(s.total) > 0 ? Math.round((Number(s.concluidas) / Number(s.total)) * 100) : 0
  }))

  // Combine Real Alerts
  const dbAlerts = []
  if (metrics?.alerts?.projects) {
    metrics.alerts.projects.forEach((p: any) => {
      dbAlerts.push({ type: "warning", message: `Projeto ${p.nome}: Prazo em aproximacao (${p.prazo})` })
    })
  }
  if (metrics?.alerts?.tasks) {
    metrics.alerts.tasks.forEach((t: any) => {
      dbAlerts.push({ type: "danger", message: `Task '${t.titulo}': Bloqueada/Atrasada ha ${t.dias_parada} dias` })
    })
  }
  if (metrics?.alerts?.approvalsCount > 0) {
    dbAlerts.push({ type: "info", message: `${metrics.alerts.approvalsCount} aprovacoes pendentes aguardando cliente` })
  }

  const handleWizardComplete = (config: EditorConfig) => {
    setEditorConfig(config)
  }

  const handleBackFromEditor = () => {
    setEditorConfig(null)
  }

  const handleCreateReport = async () => {
    if(!reportForm.titulo || !reportForm.projeto_id) return
    const { error } = await addReport(reportForm)
    if(!error) setNewReportOpen(false)
  }

  // Se estiver no editor, mostrar apenas ele
  if (editorConfig) {
    return <ReportEditor config={editorConfig} onBack={handleBackFromEditor} />
  }

  return (
    <div className="flex h-screen h-[100dvh] bg-[#0A0A0A] overflow-hidden">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader title="INTELLIGENCE CENTER" />

        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Intelligence Center</h1>
              <p className="text-sm text-neutral-500">Metricas conectadas em tempo real com o Supabase</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Relatorios Anteriores DRAWER (Sheet) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Relatorios Anteriores
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-[#0f0f0f] border-[#2A2A2A] text-white w-full sm:w-[540px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-white font-display">Acervo de Relatorios</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4">
                    {reports.map((report: any) => (
                      <div key={report.id} className="p-4 bg-[#141414] border border-[#2A2A2A] rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-sm">{report.titulo}</h3>
                            <p className="text-xs text-neutral-500">Projeto: {report.projetos?.name}</p>
                          </div>
                          <Badge className={cn("text-[10px]", report.status === "rascunho" ? "bg-orange-500/20 text-orange-500" : "bg-green-500/20 text-green-500")}>
                            {report.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#2A2A2A]">
                          <span className="text-[10px] text-neutral-500">{new Date(report.created_at).toLocaleDateString()}</span>
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-orange-500 hover:text-orange-400">
                             <Download className="w-3 h-3 mr-1" /> Exportar
                          </Button>
                        </div>
                      </div>
                    ))}
                    {reports.length === 0 && <p className="text-xs text-neutral-500 text-center py-10">Nenhum relatorio gerado</p>}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Novo Relatorio Modal */}
              <Dialog open={newReportOpen} onOpenChange={setNewReportOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Relatorio
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white">
                  <DialogHeader>
                    <DialogTitle className="font-display">Gerar Novo Relatorio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    <div>
                      <Label className="text-xs text-neutral-400">Titulo do Relatorio</Label>
                      <Input className="bg-[#1A1A1A] border-[#2A2A2A]" value={reportForm.titulo} onChange={e => setReportForm({...reportForm, titulo: e.target.value})} />
                    </div>
                    <div>
                      <Label className="text-xs text-neutral-400">Projeto Vinculado</Label>
                      <Select value={reportForm.projeto_id} onValueChange={v => setReportForm({...reportForm, projeto_id: v})}>
                        <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A]"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          {projects?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-neutral-400">Data Inicio</Label>
                        <Input type="date" className="bg-[#1A1A1A] border-[#2A2A2A] [color-scheme:dark]" value={reportForm.periodo_inicio} onChange={e => setReportForm({...reportForm, periodo_inicio: e.target.value})} />
                      </div>
                      <div>
                        <Label className="text-xs text-neutral-400">Data Fim</Label>
                        <Input type="date" className="bg-[#1A1A1A] border-[#2A2A2A] [color-scheme:dark]" value={reportForm.periodo_fim} onChange={e => setReportForm({...reportForm, periodo_fim: e.target.value})} />
                      </div>
                    </div>
                    <div>
                       <Label className="text-xs text-neutral-400">Tipo</Label>
                       <Select value={reportForm.tipo} onValueChange={v => setReportForm({...reportForm, tipo: v})}>
                        <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A]"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <SelectItem value="Mensal">Mensal</SelectItem>
                          <SelectItem value="Sprint">Sprint</SelectItem>
                          <SelectItem value="Projeto">Fechamento de Projeto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-neutral-400">Observacoes</Label>
                      <Textarea className="bg-[#1A1A1A] border-[#2A2A2A]" value={reportForm.observacoes} onChange={e => setReportForm({...reportForm, observacoes: e.target.value})} />
                    </div>
                    <Button onClick={handleCreateReport} className="w-full bg-orange-500 hover:bg-orange-600 mt-2">Criar Relatório e Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {(loadingMetrics) ? (
            <div className="flex h-40 items-center justify-center text-orange-500 font-mono text-sm animate-pulse">
               Estabelecendo conexao Realtime com as Matrizes do Supabase...
            </div>
          ) : (
            <>
              {/* KPIs Realtime */}
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
                          {kpi.trend !== "stable" && (
                            <div className={cn(
                              "flex items-center gap-1 mt-1 text-xs",
                              kpi.trend === "up" ? "text-green-500" :
                              kpi.trend === "down" ? "text-red-500" : "text-neutral-500"
                            )}>
                              {kpi.trend === "up" && <TrendingUp className="w-3 h-3" />}
                              {kpi.trend === "down" && <TrendingDown className="w-3 h-3" />}
                              <span>{kpi.change > 0 ? "+" : ""}{kpi.change} vs mes anterior</span>
                            </div>
                          )}
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
                      {projectsByStage.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full", item.color)} />
                          <span className="flex-1 text-sm text-neutral-300">{item.stage}</span>
                          <span className="text-sm font-mono text-white">{item.count}</span>
                        </div>
                      ))}
                      {projectsByStage.length === 0 && <p className="text-xs text-neutral-500 text-center py-4">Sem projetos mapeados nas etapas.</p>}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Total Global</span>
                        <span className="font-mono text-white">{projectsByStage.reduce((a: any, b: any) => a + b.count, 0)}</span>
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
                      {sectorPerformance.map((sector: any, index: number) => (
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
                      {sectorPerformance.length === 0 && <p className="text-xs text-neutral-500 text-center py-4">Sem historico de performance dos setores.</p>}
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
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {dbAlerts.map((alert, idx) => (
                          <div
                            key={idx}
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
                        {dbAlerts.length === 0 && (
                          <div className="text-xs text-neutral-500 text-center py-4 border border-dashed border-[#2A2A2A] rounded-lg">Sistema saudavel. Nenhum alerta pendente.</div>
                        )}
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
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {reports.map((report: any) => (
                          <div
                            key={report.id}
                            className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-neutral-500" />
                              <div className="w-[140px] md:w-[100px] xl:w-[140px]">
                                <p className="text-xs text-white truncate">{report.titulo}</p>
                                <p className="text-[10px] text-neutral-500 truncate">{report.projetos?.name}</p>
                              </div>
                            </div>
                            <Badge className={cn(
                              "text-[9px]",
                              report.status === "rascunho"
                                ? "bg-orange-500/20 text-orange-500"
                                : "bg-green-500/20 text-green-500"
                            )}>
                              {report.status.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                        {reports.length === 0 && <p className="text-xs text-neutral-500 text-center py-2">Sem relatórios recentes.</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Legacy Wizard Modal */}
      <ReportWizard
        open={false}
        onOpenChange={() => {}}
        onComplete={handleWizardComplete}
      />
    </div>
  )
}
