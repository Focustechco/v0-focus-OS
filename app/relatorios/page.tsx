"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { PageWrapper } from "@/components/page-wrapper"
import { supabase } from "@/lib/supabase"
import { ClientLogoPopover } from "@/components/reports/client-logo-popover"
import { ReportEditorV2 } from "@/components/reports/report-editor-v2"
import { TranscriptModal } from "@/components/reports/transcript-modal"
import { ToastProvider, useToast } from "@/components/reports/toast-notification"
import { NovoRelatorioWizard } from "@/components/reports/novo-relatorio-wizard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Building2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useAllReports, useReports } from "@/lib/hooks/use-relatorios"
import { useProjects } from "@/lib/hooks/use-projetos"

function RelatoriosContent() {
  const { showToast } = useToast()
  
  // Real DB Hooks
  const { reports, deleteReport, isLoading } = useAllReports()
  // Reusing intelligence hook addReport
  const { addReport } = useReports() 
  const { projects } = useProjects()

  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [editorReportId, setEditorReportId] = useState<string | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    const editId = searchParams.get("edit")
    if (editId) {
      setEditorReportId(editId)
      // Remove a prop ?edit= da url silenciosamente para que possamos navegar tranquilamente
      window.history.replaceState({}, "", "/relatorios")
    }
  }, [searchParams])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  
  const [activeLogoPopover, setActiveLogoPopover] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Novo Relatorio State
  const [newReportOpen, setNewReportOpen] = useState(false)

  // Computed metrics
  const savedCount = reports.filter(r => r.status === "salvo").length

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = filterProject === "all" || report.projeto_id === filterProject
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    return matchesSearch && matchesProject && matchesStatus
  })

  const handleCreateSuccess = (reportId: string) => {
    setEditorReportId(reportId)
    showToast("success", "Relatório inteligente gerado com sucesso!")
  }

  const handleSaveLogo = async (reportId: string, logo: string | null) => {
    setActiveLogoPopover(null)
    
    const report = reports.find(r => r.id === reportId)
    if (!report) return

    const baseContent = report.conteudo || report.conteudo_json || {}
    const config = baseContent.configuracao || {}

    const newConteudo = {
      ...baseContent,
      configuracao: {
        ...config,
        incluirLogoCliente: !!logo,
        logoClienteFile: logo,
      }
    }

    const { error } = await supabase
      .from("relatorios")
      .update({ conteudo: newConteudo })
      .eq("id", reportId)

    if (error) {
      showToast("error", "Erro ao salvar a logo no banco.")
    } else {
      showToast("success", logo ? "Logo do cliente salva! Gerando..." : "Logo removida")
      // Recarrega apos 1 segundo para o hook useAllReports (SWR) atualizar o doc
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    setActiveDropdown(null)
    const { error } = await deleteReport(reportId)
    if (!error) showToast("info", "Relatorio excluido do banco de dados")
  }

  // Renderiza o Editor Real ao inves config
  if (editorReportId) {
    return <ReportEditorV2 reportId={editorReportId} onBack={() => { setEditorReportId(null); window.location.reload(); }} />
  }

  return (
    <PageWrapper title="RELATORIOS" breadcrumb="RELATORIOS">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Relatorios de Projeto</h1>
              <p className="text-sm text-neutral-500">Gerencie e exporte relatórios para clientes sincronizado com DB</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setTranscriptOpen(true)}
                variant="outline"
                className="bg-[#1e1e1e] border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00]/10"
              >
                <FileUp className="w-4 h-4 mr-2" />
                Ler Transcrição
              </Button>
              
              <Button 
                onClick={() => setNewReportOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Relatório
              </Button>

              <NovoRelatorioWizard open={newReportOpen} onOpenChange={setNewReportOpen} onSuccess={handleCreateSuccess} />
            </div>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-orange-500 animate-pulse font-mono">Montando Acervo Centralizado do Supabase...</div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-[#141414] border-[#2A2A2A]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-500 tracking-wider">TOTAL RELATORIOS</p>
                        <p className="text-2xl font-bold text-white font-mono">{reports.length}</p>
                        {savedCount > 0 && (
                          <p className="text-xs text-[#818cf8] mt-1 flex items-center gap-1">
                            <Save className="w-3 h-3" />
                            {savedCount} salvos
                          </p>
                        )}
                      </div>
                      <FileText className="w-8 h-8 text-neutral-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#141414] border-[#2A2A2A]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-500 tracking-wider">RASCUNHOS</p>
                        <p className="text-2xl font-bold text-orange-500 font-mono">
                          {reports.filter(r => r.status === "rascunho").length}
                        </p>
                      </div>
                      <Edit2 className="w-8 h-8 text-orange-500/50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#141414] border-[#2A2A2A]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-500 tracking-wider">EXPORTADOS</p>
                        <p className="text-2xl font-bold text-green-500 font-mono">
                          {reports.filter(r => r.status === "exportado").length}
                        </p>
                      </div>
                      <Download className="w-8 h-8 text-green-500/50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#141414] border-[#2A2A2A]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-neutral-500 tracking-wider">PROJETOS COBERTOS</p>
                        <p className="text-2xl font-bold text-white font-mono">
                          {new Set(reports.map(r => r.projeto_id)).size}
                        </p>
                      </div>
                      <FolderOpen className="w-8 h-8 text-neutral-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg flex-1 max-w-md">
                  <Search className="w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Buscar relatorios..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none flex-1"
                  />
                </div>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="w-48 bg-[#141414] border-[#2A2A2A] text-neutral-300">
                    <SelectValue placeholder="Projeto" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                      Todos os projetos
                    </SelectItem>
                    {Array.from(new Set(reports.map(r => r.projeto_id))).map(pid => {
                      const report = reports.find(r => r.projeto_id === pid)
                      return (
                        <SelectItem key={pid as string} value={pid as string} className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                          {report?.projetos?.name}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-[#141414] border-[#2A2A2A] text-neutral-300">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                      Todos
                    </SelectItem>
                    <SelectItem value="rascunho" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                      Rascunho
                    </SelectItem>
                    <SelectItem value="salvo" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                      Salvo
                    </SelectItem>
                    <SelectItem value="exportado" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                      Exportado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reports List */}
              <Card className="bg-[#141414] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                  <CardTitle className="text-sm font-medium text-neutral-400 tracking-wider">
                    RELATORIOS DE PROJETO
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#2A2A2A]">
                    {filteredReports.map(report => (
                      <div
                        key={report.id}
                        className="p-4 hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveLogoPopover(activeLogoPopover === report.id ? null : report.id)
                                }}
                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 border-2 border-dashed border-[#2a2a2a] hover:border-[#ff6b00]"
                                title="Adicionar logo do cliente"
                              >
                                <Building2 className="w-4 h-4 text-[#444]" />
                              </button>
                              {activeLogoPopover === report.id && (
                                <ClientLogoPopover
                                  logo={null}
                                  onSave={(logo) => handleSaveLogo(report.id, logo)}
                                  onClose={() => setActiveLogoPopover(null)}
                                />
                              )}
                            </div>

                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-medium text-white group-hover:text-orange-500 transition-colors">
                                  {report.titulo}
                                </h3>
                                <Badge className="text-[9px] bg-[#2A2A2A] text-neutral-400">
                                  {report.tipo?.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-neutral-500">
                                <span className="text-orange-500 font-mono">{report.codigo || report.projetos?.name}</span>
                                <span>{report.periodo_inicio} a {report.periodo_fim}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Criado: {new Date(report.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Status badges */}
                            <div className="flex items-center gap-2">
                              {report.status === "salvo" && (
                                <Badge className="text-[10px] bg-[rgba(99,102,241,0.15)] text-[#818cf8]">
                                  SALVO
                                </Badge>
                              )}
                              <Badge
                                className={cn(
                                  "text-[10px]",
                                  report.status === "rascunho"
                                    ? "bg-orange-500/20 text-orange-500"
                                    : "bg-green-500/20 text-green-500"
                                )}
                              >
                                {report.status.toUpperCase()}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditorReportId(report.id)
                                }}
                                className="h-8 text-neutral-400 hover:text-white"
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Editar Relatório
                              </Button>
                            </div>

                            {/* Dropdown Menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveDropdown(activeDropdown === report.id ? null : report.id)
                                }}
                                className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {activeDropdown === report.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40"
                                    onClick={() => setActiveDropdown(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 z-50 bg-[#1e1e1e] border border-[#333] rounded-[10px] shadow-lg py-1 min-w-[180px]">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setEditorReportId(report.id)
                                      }}
                                      className="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-[#252525] flex items-center gap-2 transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                      Editar Relatório
                                    </button>
                                    <div className="h-px bg-[#333] my-1" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteReport(report.id)
                                      }}
                                      className="w-full px-3 py-2 text-left text-xs text-[#ef4444] hover:bg-[#ef4444]/10 flex items-center gap-2 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Excluir Definitivamente
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
                </CardContent>
              </Card>
            </>
          )}

      <TranscriptModal
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />
    </PageWrapper>
  )
}

export default function RelatoriosPage() {
  return (
    <ToastProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-[#0A0A0A]">
          <div className="text-orange-500 font-mono tracking-widest text-sm animate-pulse">
            CARREGANDO MÓDULO DE RELATÓRIOS...
          </div>
        </div>
      }>
        <RelatoriosContent />
      </Suspense>
    </ToastProvider>
  )
}
