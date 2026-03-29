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
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Mock data para relatorios salvos
const savedReports = [
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

export default function RelatoriosPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const handleWizardComplete = (config: EditorConfig) => {
    setEditorConfig(config)
  }

  const handleBackFromEditor = () => {
    setEditorConfig(null)
  }

  const filteredReports = savedReports.filter(report => {
    const matchesSearch = report.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = filterProject === "all" || report.projectId === filterProject
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    return matchesSearch && matchesProject && matchesStatus
  })

  // Se estiver no editor, mostrar apenas ele
  if (editorConfig) {
    return <ReportEditor config={editorConfig} onBack={handleBackFromEditor} />
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader title="RELATORIOS" />

        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Relatorios de Projeto</h1>
              <p className="text-sm text-neutral-500">Gerencie e exporte relatorios para clientes</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setWizardOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Relatorio
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500 tracking-wider">TOTAL RELATORIOS</p>
                    <p className="text-2xl font-bold text-white font-mono">{savedReports.length}</p>
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
                      {savedReports.filter(r => r.status === "draft").length}
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
                      {savedReports.filter(r => r.status === "exported").length}
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
                      {new Set(savedReports.map(r => r.projectId)).size}
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
                {Array.from(new Set(savedReports.map(r => r.projectId))).map(pid => {
                  const report = savedReports.find(r => r.projectId === pid)
                  return (
                    <SelectItem key={pid} value={pid} className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                      {pid} - {report?.projectName}
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
                <SelectItem value="draft" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                  Rascunho
                </SelectItem>
                <SelectItem value="exported" className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
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
              {filteredReports.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-neutral-700 mb-4" />
                  <p className="text-sm text-neutral-500">Nenhum relatorio encontrado</p>
                  <Button
                    onClick={() => setWizardOpen(true)}
                    variant="outline"
                    className="mt-4 border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro relatorio
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[#2A2A2A]">
                  {filteredReports.map(report => (
                    <div
                      key={report.id}
                      className="p-4 hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-white group-hover:text-orange-500 transition-colors">
                                {report.projectName}
                              </h3>
                              <Badge className="text-[9px] bg-[#2A2A2A] text-neutral-400">
                                {report.typeName}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                              <span className="text-orange-500 font-mono">{report.projectId}</span>
                              <span>{report.period}</span>
                              <span>{report.periodRange}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Criado: {report.createdAt}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {report.createdBy}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            className={cn(
                              "text-[10px]",
                              report.status === "draft"
                                ? "bg-orange-500/20 text-orange-500"
                                : "bg-green-500/20 text-green-500"
                            )}
                          >
                            {report.status === "draft" ? "RASCUNHO" : `EXPORTADO - ${report.exportedAs?.toUpperCase()}`}
                          </Badge>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Exportar
                            </Button>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-neutral-500 hover:text-white"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                              <DropdownMenuItem className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white cursor-pointer">
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer">
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
