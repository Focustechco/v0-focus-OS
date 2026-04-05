"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { ReportWizard } from "@/components/reports/report-wizard"
import { ReportEditor } from "@/components/reports/report-editor"
import { TranscriptModal } from "@/components/reports/transcript-modal"
import { ToastProvider, useToast } from "@/components/reports/toast-notification"
import { ClientLogoPopover } from "@/components/reports/client-logo-popover"
import { SaveReportModal } from "@/components/reports/save-report-modal"
import { ExportPdfModal } from "@/components/reports/export-pdf-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  FileText,
  Eye,
  Edit2,
  Download,
  MoreVertical,
  Calendar,
  User,
  FolderOpen,
  FileUp,
  Save,
  Check,
  Building2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data para relatorios salvos
const initialReports = [
  {
    id: "RPT-001",
    projectId: "PRJ-042",
    projectName: "Sistema de Gestao Empresarial",
    client: "Empresa XYZ",
    type: "progress",
    typeName: "Progresso",
    period: "15 dias",
    periodRange: "20/06 - 05/07/2025",
    createdBy: "Gabriel",
    createdAt: "05/07/2025",
    status: "draft",
    exportedAs: null,
    saved: false,
    clientLogo: null,
  },
  {
    id: "RPT-002",
    projectId: "PRJ-038",
    projectName: "Integracao ERP",
    client: "Industria Z",
    type: "progress",
    typeName: "Progresso",
    period: "Mensal",
    periodRange: "Jun 2025",
    createdBy: "Pedro",
    createdAt: "01/07/2025",
    status: "exported",
    exportedAs: "pdf",
    saved: true,
    clientLogo: null,
  },
  {
    id: "RPT-003",
    projectId: "PRJ-041",
    projectName: "App Mobile E-commerce",
    client: "Loja ABC",
    type: "sprint",
    typeName: "Sprint Report",
    period: "Sprint 1",
    periodRange: "15/06 - 28/06/2025",
    createdBy: "Ana",
    createdAt: "28/06/2025",
    status: "exported",
    exportedAs: "google_docs",
    saved: false,
    clientLogo: null,
  },
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

function RelatoriosContent() {
  const { showToast } = useToast()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  
  // New state for features
  const [reports, setReports] = useState(initialReports)
  const [activeLogoPopover, setActiveLogoPopover] = useState<string | null>(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveModalReport, setSaveModalReport] = useState<typeof reports[0] | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportModalReport, setExportModalReport] = useState<typeof reports[0] | null>(null)
  const [savingReportId, setSavingReportId] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const handleWizardComplete = (config: EditorConfig) => {
    setEditorConfig(config)
  }

  const handleBackFromEditor = () => {
    setEditorConfig(null)
  }

  const handleSaveLogo = (reportId: string, logo: string | null) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, clientLogo: logo } : r
    ))
    setActiveLogoPopover(null)
    showToast("success", logo ? "Logo do cliente salva!" : "Logo removida")
  }

  const handleQuickSave = async (reportId: string) => {
    setSavingReportId(reportId)
    await new Promise(resolve => setTimeout(resolve, 600))
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, saved: true } : r
    ))
    setSavingReportId(null)
    showToast("success", "Relatorio salvo com sucesso!")
  }

  const handleSaveAs = (data: { fileName: string; version: string; notes: string; visibility: string }) => {
    if (saveModalReport) {
      setReports(prev => prev.map(r => 
        r.id === saveModalReport.id ? { ...r, saved: true } : r
      ))
      showToast("success", "Relatorio salvo com sucesso!")
    }
    setSaveModalOpen(false)
    setSaveModalReport(null)
  }

  const handleExport = () => {
    if (exportModalReport) {
      setReports(prev => prev.map(r => 
        r.id === exportModalReport.id ? { ...r, status: "exported", exportedAs: "pdf" } : r
      ))
      showToast("success", "PDF exportado com sucesso!", {
        label: "Abrir arquivo",
        onClick: () => {},
      })
    }
    setExportModalOpen(false)
    setExportModalReport(null)
  }

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId))
    setActiveDropdown(null)
    showToast("info", "Relatorio excluido")
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = filterProject === "all" || report.projectId === filterProject
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    return matchesSearch && matchesProject && matchesStatus
  })

  const savedCount = reports.filter(r => r.saved).length

  if (editorConfig) {
    return (
      <ReportEditor config={editorConfig} onBack={handleBackFromEditor} />
    )
  }

  return (
    <PageWrapper title="RELATORIOS">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-base sm:text-xl font-display font-bold text-white">Relatorios de Projeto</h1>
            <p className="text-xs sm:text-sm text-neutral-500">Gerencie e exporte relatorios</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setTranscriptOpen(true)}
              variant="outline"
              size="sm"
              className="bg-[#1e1e1e] border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00]/10 text-[10px] sm:text-xs h-8 sm:h-9 flex-1 sm:flex-none"
            >
              <FileUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Ler Transcricao</span>
              <span className="sm:hidden">Transcricao</span>
            </Button>
            <Button
              onClick={() => setWizardOpen(true)}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] sm:text-xs h-8 sm:h-9 flex-1 sm:flex-none"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Novo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 tracking-wider">TOTAL</p>
                  <p className="text-xl sm:text-2xl font-bold text-white font-mono">{reports.length}</p>
                  {savedCount > 0 && (
                    <p className="text-[10px] text-[#818cf8] mt-1 items-center gap-1 hidden sm:flex">
                      <Save className="w-3 h-3" />
                      {savedCount} salvos
                    </p>
                  )}
                </div>
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 tracking-wider">RASCUNHOS</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-500 font-mono">
                    {reports.filter(r => r.status === "draft").length}
                  </p>
                </div>
                <Edit2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 tracking-wider">EXPORTADOS</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-500 font-mono">
                    {reports.filter(r => r.status === "exported").length}
                  </p>
                </div>
                <Download className="w-6 h-6 sm:w-8 sm:h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-neutral-500 tracking-wider">PROJETOS</p>
                  <p className="text-xl sm:text-2xl font-bold text-white font-mono">
                    {new Set(reports.map(r => r.projectId)).size}
                  </p>
                </div>
                <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg flex-1">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-neutral-300 placeholder:text-neutral-600 outline-none flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="flex-1 sm:w-40 bg-[#141414] border-[#2A2A2A] text-neutral-300 text-xs sm:text-sm h-9">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="all" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white text-xs">
                  Todos
                </SelectItem>
                {Array.from(new Set(reports.map(r => r.projectId))).map(pid => {
                  const report = reports.find(r => r.projectId === pid)
                  return (
                    <SelectItem key={pid} value={pid} className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white text-xs">
                      {pid}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="flex-1 sm:w-32 bg-[#141414] border-[#2A2A2A] text-neutral-300 text-xs sm:text-sm h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="all" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white text-xs">
                  Todos
                </SelectItem>
                <SelectItem value="draft" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white text-xs">
                  Rascunho
                </SelectItem>
                <SelectItem value="exported" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white text-xs">
                  Exportado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reports List */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A] px-3 sm:px-6 py-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wider">
              RELATORIOS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredReports.length === 0 ? (
              <div className="p-6 sm:p-12 text-center">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-neutral-700 mb-4" />
                <p className="text-xs sm:text-sm text-neutral-500">Nenhum relatorio encontrado</p>
                <Button
                  onClick={() => setWizardOpen(true)}
                  variant="outline"
                  size="sm"
                  className="mt-4 border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent text-xs"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#2A2A2A] max-h-[50vh] sm:max-h-none overflow-y-auto">
                {filteredReports.map(report => (
                  <div
                    key={report.id}
                    className="p-3 sm:p-4 hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        {/* Client Logo Area - Hidden on mobile */}
                        <div className="relative hidden sm:block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveLogoPopover(activeLogoPopover === report.id ? null : report.id)
                            }}
                            className={`
                              w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150
                              ${report.clientLogo 
                                ? "bg-white border border-[#2a2a2a]" 
                                : "border-2 border-dashed border-[#2a2a2a] hover:border-[#ff6b00]"
                              }
                            `}
                            title={report.clientLogo ? "Alterar logo do cliente" : "Adicionar logo do cliente"}
                          >
                            {report.clientLogo ? (
                              <img 
                                src={report.clientLogo} 
                                alt="Client logo" 
                                className="w-full h-full object-contain rounded-lg"
                              />
                            ) : (
                              <Building2 className="w-4 h-4 text-[#444]" />
                            )}
                          </button>
                          {activeLogoPopover === report.id && (
                            <ClientLogoPopover
                              logo={report.clientLogo}
                              onSave={(logo) => handleSaveLogo(report.id, logo)}
                              onClose={() => setActiveLogoPopover(null)}
                            />
                          )}
                        </div>

                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-medium text-white group-hover:text-orange-500 transition-colors truncate">
                              {report.projectName}
                            </h3>
                            <Badge className="text-[8px] sm:text-[9px] bg-[#2A2A2A] text-neutral-400">
                              {report.typeName}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-neutral-500 flex-wrap">
                            <span className="text-orange-500 font-mono">{report.projectId}</span>
                            <span className="hidden sm:inline">{report.period}</span>
                            <span className="hidden sm:inline">{report.periodRange}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-[10px] sm:text-xs text-neutral-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {report.createdAt}
                            </span>
                            <span className="flex items-center gap-1 hidden sm:flex">
                              <User className="w-3 h-3" />
                              {report.createdBy}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Status badges */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          {report.saved && (
                            <Badge className="text-[8px] sm:text-[10px] bg-[rgba(99,102,241,0.15)] text-[#818cf8] hidden sm:flex">
                              SALVO
                            </Badge>
                          )}
                          <Badge
                            className={cn(
                              "text-[8px] sm:text-[10px]",
                              report.status === "draft"
                                ? "bg-orange-500/20 text-orange-500"
                                : "bg-green-500/20 text-green-500"
                            )}
                          >
                            {report.status === "draft" ? "RASC" : "EXP"}
                          </Badge>
                        </div>

                        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-neutral-400 hover:text-white"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-neutral-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-neutral-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExportModalReport(report)
                              setExportModalOpen(true)
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                          </Button>
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleQuickSave(report.id)
                          }}
                          disabled={savingReportId === report.id}
                          className={`
                            w-6 h-6 sm:w-[30px] sm:h-[30px] rounded-md border flex items-center justify-center transition-all duration-150
                            ${savingReportId === report.id
                              ? "bg-green-500/10 border-green-500 text-green-500"
                              : "bg-[#1a1a1a] border-[#333] text-[#666] hover:border-[#ff6b00] hover:text-[#ff6b00] hover:bg-[rgba(255,107,0,0.08)]"
                            }
                          `}
                          title="Salvar relatorio"
                        >
                          {savingReportId === report.id ? (
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                        </button>

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDropdown(activeDropdown === report.id ? null : report.id)
                            }}
                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeDropdown === report.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveDropdown(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 z-50 bg-[#1e1e1e] border border-[#333] rounded-[10px] shadow-lg py-1 min-w-[140px] sm:min-w-[180px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-[10px] sm:text-xs text-neutral-300 hover:bg-[#252525] flex items-center gap-2 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  Ver
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-[10px] sm:text-xs text-neutral-300 hover:bg-[#252525] flex items-center gap-2 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSaveModalReport(report)
                                    setSaveModalOpen(true)
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-[10px] sm:text-xs text-neutral-300 hover:bg-[#252525] flex items-center gap-2 transition-colors"
                                >
                                  <Save className="w-4 h-4" />
                                  Salvar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setExportModalReport(report)
                                    setExportModalOpen(true)
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-[10px] sm:text-xs text-neutral-300 hover:bg-[#252525] flex items-center gap-2 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Exportar
                                </button>
                                <div className="h-px bg-[#333] my-1" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteReport(report.id)
                                  }}
                                  className="w-full px-3 py-2 text-left text-[10px] sm:text-xs text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Excluir
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wizard Modal */}
      <ReportWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onComplete={handleWizardComplete}
      />

      {/* Transcript Modal */}
      <TranscriptModal
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />

      {/* Save Modal */}
      <SaveReportModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        reportName={saveModalReport ? `${saveModalReport.projectName} - ${saveModalReport.projectId}` : ""}
        onSave={handleSaveAs}
      />

      {/* Export PDF Modal */}
      {exportModalReport && (
        <ExportPdfModal
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
          report={{
            projectName: exportModalReport.projectName,
            projectId: exportModalReport.projectId,
            client: exportModalReport.client,
            createdAt: exportModalReport.createdAt,
            createdBy: exportModalReport.createdBy,
          }}
          clientLogo={exportModalReport.clientLogo}
          onExport={handleExport}
        />
      )}
    </PageWrapper>
  )
}

export default function RelatoriosPage() {
  return (
    <ToastProvider>
      <RelatoriosContent />
    </ToastProvider>
  )
}
