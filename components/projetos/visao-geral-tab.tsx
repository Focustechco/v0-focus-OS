"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  LayoutGrid,
  List,
  Calendar,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Clock,
  Loader2,
  Check,
  ChevronsUpDown,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { useProjects } from "@/lib/hooks/use-projetos"
import { useClientes } from "@/lib/hooks/use-clientes"
import { MemberSelect } from "@/components/ui/member-select"
import { ProjectCalendar } from "./project-calendar"
import { ProjectDetailsDrawer } from "./project-details-drawer"
import { useToast } from "../reports/toast-notification"

const stages = [
  { id: "diagnostico", label: "Diagnostico", color: "bg-blue-500" },
  { id: "mvp", label: "MVP", color: "bg-purple-500" },
  { id: "proposta", label: "Proposta", color: "bg-yellow-500" },
  { id: "sprints", label: "Sprints", color: "bg-orange-500" },
  { id: "deploy", label: "Deploy", color: "bg-green-500" },
  { id: "suporte", label: "Suporte MRR", color: "bg-neutral-500" },
]

function ProjectCard({ project, onClick }: { project: any; onClick: () => void }) {
  const stageConfig = stages.find((s) => s.id === project.status)

  const isOverdue = project.prazo && new Date(project.prazo) < new Date()
  const isNearDeadline =
    project.prazo &&
    !isOverdue &&
    new Date(project.prazo).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

  const deadlineColor = isOverdue
    ? "text-red-500"
    : isNearDeadline
    ? "text-yellow-500"
    : "text-foreground"

  return (
    <Card
      onClick={onClick}
      className="bg-card border-border border-b-2 border-b-transparent hover:border-b-orange-500 transition-all cursor-pointer group hover:bg-accent/10"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-orange-500 font-mono tracking-tighter">
                {project.codigo}
              </span>
              <Badge className={cn("text-[8px] uppercase tracking-widest", stageConfig?.color, "text-foreground")}>
                {stageConfig?.label}
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-orange-500 transition-colors truncate mb-0.5">
              {project.nome}
            </h3>
            <p className="text-[10px] text-neutral-500 truncate">
              {project.client_name || project.clientes?.nome || "—"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-4 w-4 text-neutral-500 hover:text-foreground -mr-1">
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="flex -space-x-1">
              <Avatar className="w-2.5 h-2.5 border border-[#141414]">
                <AvatarFallback className="bg-orange-500 text-[5px]">
                  {project.tech_lead?.substring(0, 2) ?? "TL"}
                </AvatarFallback>
              </Avatar>
              <Avatar className="w-2.5 h-2.5 border border-[#141414]">
                <AvatarFallback className="bg-neutral-700 text-[5px]">
                  {project.dev?.substring(0, 2) ?? "DV"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-neutral-500 uppercase tracking-widest mb-0.5">Prazo</p>
              <div className={cn("flex items-center gap-1 text-[10px] font-mono", deadlineColor)}>
                <Clock className="w-2.5 h-2.5" />
                {project.prazo || "N/A"}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between text-[9px] mb-1.5 uppercase tracking-tighter">
              <span className="text-neutral-500">Progresso</span>
              <span className="text-foreground font-mono">{project.progresso ?? 0}%</span>
            </div>
            <Progress value={project.progresso ?? 0} className="h-1 bg-[#2A2A2A]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function VisaoGeralTab() {
  const [viewMode, setViewMode] = useState("kanban")

  const { projects, addProject, isLoading } = useProjects()
  const { clientes } = useClientes()
  const { showToast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [isClientLocked, setIsClientLocked] = useState(false)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [clientSearchOpen, setClientSearchOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emptyForm = {
    nome: "",
    cliente_id: "",
    status: "diagnostico",
    tech_lead_id: "",
    dev_secundario_id: "",
    prazo: "",
    descricao: "",
  }

  const [formData, setFormData] = useState(emptyForm)

  // Handle query params to auto-open the modal with a pre-selected client
  useEffect(() => {
    const isNew = searchParams.get("new") === "true"
    const urlClienteId = searchParams.get("clienteId")

    if (isNew) {
      setFormData({ ...emptyForm, cliente_id: urlClienteId ?? "" })
      setIsClientLocked(!!urlClienteId)
      setNewProjectOpen(true)
      router.replace("/projetos", { scroll: false })
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenNewProject = () => {
    setFormData(emptyForm)
    setIsClientLocked(false)
    setNewProjectOpen(true)
  }

  const getProjectsByStage = (stageId: string) =>
    projects.filter((p) => p.status === stageId)

  const isPastDate =
    formData.prazo && new Date(formData.prazo) < new Date(new Date().setHours(0, 0, 0, 0))

  const handleCreateProject = async () => {
    if (!formData.nome || !formData.cliente_id) {
      showToast("error", "Preencha o nome e o cliente associado.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await addProject({ ...formData, progresso: 0 } as any)

      if (result?.data) {
        showToast("success", `Projeto ${result.data.codigo} criado com sucesso!`)
        setNewProjectOpen(false)
        setFormData(emptyForm)
      } else {
        showToast("error", "Erro ao criar projeto. Verifique os dados.")
      }
    } catch {
      showToast("error", "Erro inesperado ao criar projeto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDrawer = (project: any) => {
    setSelectedProject(project)
    setDetailsDrawerOpen(true)
  }

  const selectedClienteNome = clientes.find((c) => c.id === formData.cliente_id)?.nome
    ?? clientes.find((c) => c.id === formData.cliente_id)?.empresa

  return (
    <div className="flex-1 w-full relative">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Projetos</h1>
            <p className="text-xs sm:text-sm text-neutral-500">Gerencie todos os projetos da Focus</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar projetos..."
                className="bg-transparent text-sm text-foreground placeholder:text-neutral-600 outline-none w-full sm:w-32 lg:w-40"
              />
            </div>

            {/* Filter */}
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card text-neutral-400 hover:text-foreground hover:border-orange-500/50"
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>

            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="bg-card border border-border h-9">
                <TabsTrigger
                  value="kanban"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground px-2 sm:px-3"
                >
                  <LayoutGrid className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground px-2 sm:px-3 hidden sm:flex"
                >
                  <List className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground px-2 sm:px-3 hidden md:flex"
                >
                  <Calendar className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Novo Projeto */}
            <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  onClick={handleOpenNewProject}
                  className="bg-orange-500 hover:bg-orange-600 text-foreground"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Novo Projeto</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="font-display">Criar Novo Projeto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest">
                      Nome do Projeto *
                    </Label>
                    <Input
                      placeholder="Ex: Landing Page TechCorp"
                      className="bg-[#1A1A1A] border-border focus:border-orange-500"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>

                  {/* Cliente */}
                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest">
                      Cliente Associado *
                    </Label>
                    <Popover
                      open={isClientLocked ? false : clientSearchOpen}
                      onOpenChange={isClientLocked ? undefined : setClientSearchOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={isClientLocked}
                          className={cn(
                            "w-full justify-between bg-[#1A1A1A] border-border text-neutral-400 font-normal hover:bg-[#2A2A2A]",
                            isClientLocked && "opacity-70 cursor-not-allowed"
                          )}
                        >
                          {formData.cliente_id
                            ? (selectedClienteNome ?? "Cliente selecionado")
                            : "Selecione um cliente..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#1A1A1A] border-border">
                        <Command className="bg-transparent">
                          <CommandInput placeholder="Buscar cliente..." className="h-9" />
                          <CommandList className="scrollbar-hide">
                            <CommandEmpty className="py-3 px-2 text-xs text-neutral-500">
                              Nenhum cliente encontrado.
                            </CommandEmpty>
                            <CommandGroup>
                              {clientes.map((c) => (
                                <CommandItem
                                  key={c.id}
                                  value={c.nome ?? c.empresa ?? c.id}
                                  onSelect={() => {
                                    setFormData({ ...formData, cliente_id: c.id })
                                    setClientSearchOpen(false)
                                  }}
                                  className="text-xs text-foreground aria-selected:bg-[#2A2A2A] aria-selected:text-foreground"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.cliente_id === c.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {c.nome ?? c.empresa}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Tech Lead + Dev — usando MemberSelect reutilizável */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest">
                        Tech Lead
                      </Label>
                      <MemberSelect
                        value={formData.tech_lead_id}
                        onValueChange={(v) => setFormData({ ...formData, tech_lead_id: v })}
                        placeholder="Selecione o Tech Lead..."
                        filter={(m) => m.setor === "tech" || m.cargo?.toLowerCase().includes("lead") || true}
                        triggerClassName="bg-[#1A1A1A] border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest">
                        Dev Secundario
                      </Label>
                      <MemberSelect
                        value={formData.dev_secundario_id}
                        onValueChange={(v) => setFormData({ ...formData, dev_secundario_id: v })}
                        placeholder="Dev secundário..."
                        exclude={formData.tech_lead_id ? [formData.tech_lead_id] : []}
                        triggerClassName="bg-[#1A1A1A] border-border"
                      />
                    </div>
                  </div>

                  {/* Etapa + Prazo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest">
                        Etapa Inicial
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(v) => setFormData({ ...formData, status: v })}
                      >
                        <SelectTrigger className="bg-[#1A1A1A] border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-border">
                          {stages.map((s) => (
                            <SelectItem key={s.id} value={s.id} className="text-xs">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest">
                        Prazo / Deadline
                      </Label>
                      <Input
                        type="date"
                        className={cn(
                          "bg-[#1A1A1A] border-border [color-scheme:dark]",
                          isPastDate && "border-yellow-500 text-yellow-500"
                        )}
                        value={formData.prazo}
                        onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                      />
                      {isPastDate && (
                        <p className="text-[10px] text-yellow-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Data no passado
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateProject}
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 mt-4 text-foreground font-bold h-12"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Criar Projeto Agora
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-orange-500 font-mono animate-pulse">
          Carregando projetos...
        </div>
      ) : (
        <>
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
                    <Badge variant="outline" className="text-[10px] border-border text-neutral-500">
                      {getProjectsByStage(stage.id).length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {getProjectsByStage(stage.id).map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => openDrawer(project)}
                      />
                    ))}
                    {getProjectsByStage(stage.id).length === 0 && (
                      <div className="p-8 border border-dashed border-border rounded-lg text-center">
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
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 sm:p-4 text-[10px] text-neutral-500 font-medium tracking-wider">CODE</th>
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
                      const stageConfig = stages.find((s) => s.id === project.status)
                      return (
                        <tr
                          key={project.id}
                          onClick={() => openDrawer(project)}
                          className="border-b border-border hover:bg-accent/10 transition-colors cursor-pointer group"
                        >
                          <td className="p-3 sm:p-4 text-xs text-orange-500 font-mono">{project.codigo}</td>
                          <td className="p-3 sm:p-4">
                            <div className="text-sm text-foreground group-hover:text-orange-500 transition-colors">
                              {project.nome}
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-xs text-neutral-400">
                            {project.client_name ?? project.clientes?.nome ?? "—"}
                          </td>
                          <td className="p-3 sm:p-4">
                            <Badge className={`text-[8px] uppercase tracking-widest ${stageConfig?.color} text-foreground`}>
                              {stageConfig?.label}
                            </Badge>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                              <Progress value={project.progresso ?? 0} className="w-16 sm:w-20 h-1.5 bg-[#2A2A2A]" />
                              <span className="text-xs text-neutral-400 font-mono">{project.progresso ?? 0}%</span>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-xs text-neutral-400 font-mono">{project.prazo}</td>
                          <td className="p-3 sm:p-4">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-neutral-500 hover:text-foreground">
                              <MoreVertical className="w-4 h-4" />
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
          {viewMode === "timeline" && <ProjectCalendar />}
        </>
      )}

      {/* Modais Auxiliares */}

      <ProjectDetailsDrawer
        project={selectedProject}
        open={detailsDrawerOpen}
        onOpenChange={setDetailsDrawerOpen}
      />
    </div>
  )
}
