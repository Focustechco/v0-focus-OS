"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LayoutGrid,
  List,
  Calendar,
  Plus,
  Filter,
  Search,
  MoreVertical,
  User,
  Clock,
  ArrowRight,
} from "lucide-react"

const stages = [
  { id: "diagnostico", label: "Diagnostico", color: "bg-blue-500" },
  { id: "mvp", label: "MVP", color: "bg-purple-500" },
  { id: "proposta", label: "Proposta", color: "bg-yellow-500" },
  { id: "sprints", label: "Sprints", color: "bg-orange-500" },
  { id: "deploy", label: "Deploy", color: "bg-green-500" },
  { id: "suporte", label: "Suporte MRR", color: "bg-neutral-500" },
]

const projects = [
  {
    id: "PRJ-042",
    name: "Sistema de Gestao Empresarial",
    client: "Empresa XYZ",
    stage: "sprints",
    progress: 80,
    techLead: "Gabriel",
    dev: "Joao",
    deadline: "15/07/2025",
    daysLeft: 8,
    status: "em-andamento",
  },
  {
    id: "PRJ-041",
    name: "App Mobile E-commerce",
    client: "Loja ABC",
    stage: "sprints",
    progress: 45,
    techLead: "Gabriel",
    dev: "Maria",
    deadline: "20/07/2025",
    daysLeft: 13,
    status: "em-andamento",
  },
  {
    id: "PRJ-040",
    name: "Automacao de Vendas",
    client: "Vendas Corp",
    stage: "mvp",
    progress: 60,
    techLead: "Gabriel",
    dev: "Pedro",
    deadline: "10/07/2025",
    daysLeft: 3,
    status: "atrasado",
  },
  {
    id: "PRJ-039",
    name: "Dashboard Analytics",
    client: "Data Inc",
    stage: "diagnostico",
    progress: 20,
    techLead: "Gabriel",
    dev: "-",
    deadline: "25/07/2025",
    daysLeft: 18,
    status: "no-prazo",
  },
  {
    id: "PRJ-038",
    name: "Integracao ERP",
    client: "Industria Z",
    stage: "proposta",
    progress: 100,
    techLead: "Gabriel",
    dev: "-",
    deadline: "05/07/2025",
    daysLeft: 0,
    status: "aguardando",
  },
  {
    id: "PRJ-037",
    name: "Portal do Cliente",
    client: "Servicos Y",
    stage: "deploy",
    progress: 95,
    techLead: "Gabriel",
    dev: "Ana",
    deadline: "07/07/2025",
    daysLeft: 2,
    status: "em-andamento",
  },
  {
    id: "PRJ-036",
    name: "Sistema de Tickets",
    client: "Suporte TI",
    stage: "suporte",
    progress: 100,
    techLead: "Gabriel",
    dev: "Carlos",
    deadline: "-",
    daysLeft: -1,
    status: "concluido",
  },
]

function ProjectCard({ project }: { project: typeof projects[0] }) {
  const stageConfig = stages.find((s) => s.id === project.stage)
  
  const statusConfig: Record<string, { border: string; badge: string; label: string }> = {
    "em-andamento": { border: "border-l-orange-500", badge: "bg-orange-500/20 text-orange-500", label: "Em Andamento" },
    "atrasado": { border: "border-l-red-500", badge: "bg-red-500/20 text-red-500", label: "Atrasado" },
    "no-prazo": { border: "border-l-green-500", badge: "bg-green-500/20 text-green-500", label: "No Prazo" },
    "aguardando": { border: "border-l-neutral-500", badge: "bg-neutral-500/20 text-neutral-400", label: "Aguardando" },
    "concluido": { border: "border-l-green-600", badge: "bg-green-600/20 text-green-500", label: "Concluido" },
  }
  
  const status = statusConfig[project.status] || statusConfig["em-andamento"]

  return (
    <Card className={`bg-[#141414] border-[#2A2A2A] border-l-4 ${status.border} hover:border-orange-500/30 transition-colors cursor-pointer group`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-orange-500 font-mono">{project.id}</span>
              <Badge className={`text-[9px] ${stageConfig?.color} text-white`}>
                {stageConfig?.label}
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-white group-hover:text-orange-500 transition-colors truncate">
              {project.name}
            </h3>
            <p className="text-[10px] text-neutral-500 truncate">Cliente: {project.client}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-white flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-neutral-500">Progresso</span>
              <span className="text-white font-mono">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5 bg-[#2A2A2A]" />
          </div>

          <div className="flex items-center justify-between text-[10px] flex-wrap gap-2">
            <div className="flex items-center gap-1 text-neutral-400">
              <User className="w-3 h-3" />
              <span>{project.techLead}</span>
              {project.dev !== "-" && <span className="text-neutral-600">/ {project.dev}</span>}
            </div>
            {project.daysLeft >= 0 && (
              <div className={`flex items-center gap-1 ${project.daysLeft <= 3 ? "text-red-500" : "text-neutral-400"}`}>
                <Clock className="w-3 h-3" />
                <span>{project.daysLeft}d restantes</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2A] flex-wrap gap-2">
            <Badge variant="outline" className={`text-[9px] ${status.badge}`}>
              {status.label}
            </Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-6 text-[10px] text-neutral-400 hover:text-white hidden sm:flex">
                Ver Tasks
              </Button>
              <Button size="sm" className="h-6 text-[10px] bg-orange-500 hover:bg-orange-600">
                Abrir
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProjetosPage() {
  const [viewMode, setViewMode] = useState("kanban")

  const getProjectsByStage = (stageId: string) => projects.filter((p) => p.stage === stageId)

  return (
    <PageWrapper title="PROJETOS">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-white">Projetos</h1>
            <p className="text-xs sm:text-sm text-neutral-500">Gerencie todos os projetos da Focus</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none w-full sm:w-32 lg:w-40"
              />
            </div>

            {/* Filter */}
            <Button variant="outline" size="sm" className="border-[#2A2A2A] bg-[#141414] text-neutral-400 hover:text-white hover:border-orange-500/50">
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>

            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="bg-[#141414] border border-[#2A2A2A] h-9">
                <TabsTrigger value="kanban" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-2 sm:px-3">
                  <LayoutGrid className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-2 sm:px-3 hidden sm:flex">
                  <List className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-2 sm:px-3 hidden md:flex">
                  <Calendar className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* New Project */}
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo Projeto</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6 snap-x snap-mandatory">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-72 sm:w-80 snap-start">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="text-xs font-medium text-neutral-400 tracking-wider">
                    {stage.label.toUpperCase()}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] border-[#2A2A2A] text-neutral-500">
                  {getProjectsByStage(stage.id).length}
                </Badge>
              </div>
              <div className="space-y-3">
                {getProjectsByStage(stage.id).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                {getProjectsByStage(stage.id).length === 0 && (
                  <div className="p-8 border border-dashed border-[#2A2A2A] rounded-lg text-center">
                    <p className="text-xs text-neutral-600">Nenhum projeto</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="bg-[#141414] border-[#2A2A2A] overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left p-3 sm:p-4 text-[10px] text-neutral-500 font-medium tracking-wider">ID</th>
                  <th className="text-left p-3 sm:p-4 text-[10px] text-neutral-500 font-medium tracking-wider">PROJETO</th>
                  <th className="text-left p-3 sm:p-4 text-[10px] text-neutral-500 font-medium tracking-wider">CLIENTE</th>
                  <th className="text-left p-3 sm:p-4 text-[10px] text-neutral-500 font-medium tracking-wider">ETAPA</th>
                  <th className="text-left p-3 sm:p-4 text-[10px] text-neutral-500 font-medium tracking-wider">PROGRESSO</th>
                  <th className="text-left p-3 sm:p-4 text-[10px] text-neutral-500 font-medium tracking-wider">PRAZO</th>
                  <th className="text-left p-3 sm:p-4 text-[10px] text-neutral-500 font-medium tracking-wider">ACOES</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const stageConfig = stages.find((s) => s.id === project.stage)
                  return (
                    <tr key={project.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A] transition-colors">
                      <td className="p-3 sm:p-4 text-xs text-orange-500 font-mono">{project.id}</td>
                      <td className="p-3 sm:p-4">
                        <div className="text-sm text-white">{project.name}</div>
                      </td>
                      <td className="p-3 sm:p-4 text-xs text-neutral-400">{project.client}</td>
                      <td className="p-3 sm:p-4">
                        <Badge className={`text-[9px] ${stageConfig?.color} text-white`}>
                          {stageConfig?.label}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="w-16 sm:w-20 h-1.5 bg-[#2A2A2A]" />
                          <span className="text-xs text-neutral-400 font-mono">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-xs text-neutral-400 font-mono">{project.deadline}</td>
                      <td className="p-3 sm:p-4">
                        <Button size="sm" className="h-6 text-[10px] bg-orange-500 hover:bg-orange-600">
                          Abrir
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <Card className="bg-[#141414] border-[#2A2A2A] p-6">
          <div className="text-center text-neutral-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
            <p className="text-sm">Visualizacao de Timeline em desenvolvimento</p>
          </div>
        </Card>
      )}
    </PageWrapper>
  )
}
