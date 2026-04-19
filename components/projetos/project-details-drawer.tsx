"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Users,
  CheckCircle2,
  FileText,
  History,
  LayoutGrid,
  ExternalLink,
  Plus,
  MoreVertical,
  Clock,
  ArrowUpRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSprints } from "@/lib/hooks/use-sprints"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useAllReports } from "@/lib/hooks/use-relatorios"
import { TaskCard } from "./task-card"
import { SprintCard } from "./sprint-card"
import { NovoRelatorioWizard } from "@/components/reports/novo-relatorio-wizard"
import { useRouter } from "next/navigation"

interface ProjectDetailsDrawerProps {
  project: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDetailsDrawer({ project, open, onOpenChange }: ProjectDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState("visao-geral")
  const [isReportWizardOpen, setIsReportWizardOpen] = useState(false)
  const router = useRouter()

  // SWR Hooks integrados com o sistema central
  const { sprints } = useSprints()
  const { tasks } = useTarefas(undefined, project?.id) // Busca direta e filtrada
  const { reports } = useAllReports()

  if (!project) return null

  // Filtros client-side das dependências exclusivas deste projeto
  const projectSprints = sprints?.filter((s: any) => s.projeto_id === project.id) || []
  const projectReports = reports?.filter((r: any) => r.projeto_id === project.id) || []

  // Mapeamento de cores por etapa
  const stageStyles: Record<string, { label: string; color: string; bg: string }> = {
    diagnostico: { label: "Diagnóstico", color: "text-blue-500", bg: "bg-blue-500/10" },
    mvp: { label: "MVP", color: "text-purple-500", bg: "bg-purple-500/10" },
    proposta: { label: "Proposta", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    sprints: { label: "Sprints", color: "text-orange-500", bg: "bg-orange-500/10" },
    deploy: { label: "Deploy", color: "text-green-500", bg: "bg-green-500/10" },
    suporte_mrr: { label: "Suporte MRR", color: "text-neutral-500", bg: "bg-neutral-500/10" },
    concluido: { label: "Concluído", color: "text-green-600", bg: "bg-green-600/10" },
  }

  const currentStage = stageStyles[project.status] || stageStyles["diagnostico"]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#0f0f0f] border-l border-[#2A2A2A] text-white w-full sm:w-[500px] md:w-[600px] lg:w-[40%] p-0">
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="p-6 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-orange-500 tracking-widest uppercase">
                {project.codigo}
              </span>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-[9px] uppercase tracking-wider", currentStage.bg, currentStage.color)}>
                  {currentStage.label}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="text-2xl font-display font-bold text-white flex items-center gap-2">
                {project.nome}
                <ArrowUpRight className="w-4 h-4 text-neutral-600" />
              </SheetTitle>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>Cliente:</span>
                <button className="text-orange-500 hover:underline flex items-center gap-1">
                  {project.client_name}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2A2A2A] flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">Prazo</p>
                    <p className="text-xs text-white font-mono">{project.prazo || "Sem data"}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-2 uppercase tracking-widest">
                    <span className="text-neutral-500">Progresso Geral</span>
                    <span className="text-white font-mono">{project.progresso}%</span>
                  </div>
                  <Progress value={project.progresso} className="h-1.5 bg-[#1A1A1A]" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] text-neutral-500 uppercase tracking-tighter">Membros Atribuídos</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <Avatar className="w-8 h-8 border-2 border-[#0f0f0f]">
                      <AvatarImage src={`https://avatar.vercel.sh/${project.tech_lead}`} />
                      <AvatarFallback className="bg-orange-500 text-[10px]">{project.tech_lead?.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-8 h-8 border-2 border-[#0f0f0f]">
                      <AvatarImage src={`https://avatar.vercel.sh/${project.dev}`} />
                      <AvatarFallback className="bg-neutral-700 text-[10px]">{project.dev?.substring(0,2)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-[10px] text-neutral-400 leading-tight">
                    <p className="text-white font-medium">{project.tech_lead}</p>
                    <p>Secundário: {project.dev}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-6 border-b border-[#2A2A2A] overflow-x-auto no-scrollbar">
              <TabsList className="bg-transparent h-12 p-0 gap-6 w-full justify-start">
                <TabsTrigger value="visao-geral" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-0 font-mono text-[9px] uppercase tracking-widest">
                  <LayoutGrid className="w-3.5 h-3.5 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="sprints" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-0 font-mono text-[9px] uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  Sprints
                </TabsTrigger>
                <TabsTrigger value="tarefas" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-0 font-mono text-[9px] uppercase tracking-widest">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                  Tarefas
                </TabsTrigger>
                <TabsTrigger value="relatorios" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-0 font-mono text-[9px] uppercase tracking-widest">
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  Relatórios
                </TabsTrigger>
                <TabsTrigger value="historico" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-0 font-mono text-[9px] uppercase tracking-widest">
                  <History className="w-3.5 h-3.5 mr-2" />
                  Histórico
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <TabsContent value="visao-geral" className="m-0 space-y-6">
                <div>
                   <h4 className="text-[10px] font-mono uppercase text-neutral-500 mb-3 tracking-widest">Descrição do Projeto</h4>
                   <p className="text-sm text-neutral-400 leading-relaxed bg-[#141414] p-4 rounded-xl border border-[#2A2A2A]">
                     {project.descricao || "Nenhuma descrição fornecida para este projeto."}
                   </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#141414] border border-[#2A2A2A] rounded-xl">
                    <h4 className="text-[9px] font-mono uppercase text-neutral-500 mb-1">Data Início</h4>
                    <p className="text-sm text-white font-mono">{project.data_inicio}</p>
                  </div>
                  <div className="p-4 bg-[#141414] border border-[#2A2A2A] rounded-xl">
                    <h4 className="text-[9px] font-mono uppercase text-neutral-500 mb-1">Data Final (Estimada)</h4>
                    <p className="text-sm text-white font-mono">{project.data_fim || "TBD"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sprints" className="m-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">Sprints Vinculadas</h4>
                </div>
                <div className="space-y-4">
                   {projectSprints.length === 0 ? (
                     <div className="p-10 border border-dashed border-[#2A2A2A] rounded-xl text-center flex flex-col items-center">
                       <Clock className="w-8 h-8 text-neutral-600 mb-2 opacity-50" />
                       <p className="text-xs text-neutral-600">Nenhuma sprint cadastrada ainda.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 gap-4">
                       {projectSprints.map((sprint: any) => (
                         <SprintCard key={sprint.id} sprint={sprint} />
                       ))}
                     </div>
                   )}
                </div>
              </TabsContent>

              <TabsContent value="tarefas" className="m-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">Lista de Tarefas</h4>
                </div>
                <div className="space-y-4">
                   {tasks.length === 0 ? (
                     <div className="p-10 border border-dashed border-[#2A2A2A] rounded-xl text-center flex flex-col items-center">
                       <CheckCircle2 className="w-8 h-8 text-neutral-600 mb-2 opacity-50" />
                       <p className="text-xs text-neutral-600">O backlog de tarefas está vazio.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {tasks.map((task: any) => (
                         <TaskCard key={task.id} task={task} />
                       ))}
                     </div>
                   )}
                </div>
              </TabsContent>

              <TabsContent value="relatorios" className="m-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">Relatórios Gerados</h4>
                  <Button size="sm" className="h-7 text-[10px] bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setIsReportWizardOpen(true)}>
                    Gerar Novo <Plus className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                   {projectReports.length === 0 ? (
                     <div className="p-10 border border-dashed border-[#2A2A2A] rounded-xl text-center flex flex-col items-center">
                       <FileText className="w-8 h-8 text-neutral-600 mb-2 opacity-50" />
                       <p className="text-xs text-neutral-600">Nenhum relatório emitido.</p>
                     </div>
                   ) : (
                     projectReports.map((report: any) => (
                        <div key={report.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[#141414] border border-[#2A2A2A] rounded-lg gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white line-clamp-1">{report.titulo}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="text-[8px] sm:text-[9px] bg-[#2A2A2A] text-neutral-400">
                                  {report.status?.toUpperCase() || "SALVO"}
                                </Badge>
                                <span className="text-[10px] text-neutral-500 font-mono">
                                  {new Date(report.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-xs text-neutral-400 hover:text-white" onClick={() => router.push("/relatorios")}>
                            Acessar Central
                          </Button>
                        </div>
                     ))
                   )}
                </div>
              </TabsContent>

              <TabsContent value="historico" className="m-0">
                <h4 className="text-[10px] font-mono uppercase text-neutral-500 mb-4 tracking-widest">Log de Atividades</h4>
                <div className="space-y-6 relative ml-4 border-l border-[#2A2A2A] pl-6 pb-6 pt-2">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/10" />
                    <p className="text-xs text-white  mb-1">Projeto criado no sistema</p>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase">{new Date(project.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-6 border-t border-[#2A2A2A] bg-[#141414]">
            <Button className="w-full bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A]" onClick={() => onOpenChange(false)}>
               Fechar Detalhes
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Relatorio Generation Modal Linked to Project */}
      {project && (
        <NovoRelatorioWizard 
          open={isReportWizardOpen}
          onOpenChange={setIsReportWizardOpen}
          defaultProjetoId={project.id}
          onSuccess={(id) => {
            setIsReportWizardOpen(false)
            onOpenChange(false)
            router.push(`/relatorios?edit=${id}`)
          }}
        />
      )}
    </Sheet>
  )
}
