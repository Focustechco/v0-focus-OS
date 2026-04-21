"use client"

import { useState, useMemo } from "react"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isWithinInterval,
  parseISO,
  startOfDay
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User, 
  FolderKanban, 
  Edit2,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Project, useProjetos } from "@/lib/hooks/use-projetos"
import { useSprints } from "@/lib/hooks/use-sprints"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  planejamento: "bg-blue-500",
  em_curso: "bg-orange-500",
  revisao: "bg-yellow-500",
  concluido: "bg-green-500",
  atrasado: "bg-red-500",
}

export function ProjectCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const { projects, addProjeto, updateProjeto, isLoading } = useProjetos()
  const { sprints } = useSprints()
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [newProjectForm, setNewProjectForm] = useState({
    nome: "",
    data_inicio: "",
    prazo: ""
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const handleSaveProject = async () => {
    setIsSaving(true)
    const success = await addProjeto({
      nome: newProjectForm.nome,
      data_inicio: newProjectForm.data_inicio,
      prazo: newProjectForm.prazo,
      status: "planejamento"
    })
    
    if (success) {
      setIsNewProjectModalOpen(false)
      setNewProjectForm({ nome: "", data_inicio: "", prazo: "" })
    }
    setIsSaving(false)
  }

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editForm, setEditForm] = useState({ data_inicio: "", prazo: "" })

  const handleUpdateDates = async () => {
    if (!editingProject) return
    setIsSaving(true)
    const success = await updateProjeto(editingProject.id, {
      data_inicio: editForm.data_inicio,
      prazo: editForm.prazo
    })
    if (success) setIsEditModalOpen(false)
    setIsSaving(false)
  }

  const projectsWithDates = useMemo(() => {
    return projects.filter(p => p.data_inicio || p.prazo)
  }, [projects])

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  if (isLoading) return <div className="p-20 text-center animate-pulse text-neutral-500 font-mono">SINCRONIZANDO CALENDARIO...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-display font-bold text-foreground capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-1 bg-background rounded p-1 border border-border">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-foreground" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] font-mono text-neutral-400 hover:text-foreground" onClick={goToToday}>
              HOJE
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-foreground" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Select value={selectedProjectId || "all"} onValueChange={(val) => setSelectedProjectId(val === "all" ? null : val)}>
              <SelectTrigger className="h-9 bg-background border-border text-xs font-mono uppercase text-neutral-400">
                <SelectValue placeholder="BUSCAR PROJETO..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all" className="text-xs font-mono">TODOS OS PROJETOS</SelectItem>
                {projectsWithDates.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs font-mono">{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-background">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="py-2 text-center text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-5 min-h-[600px]">
          {calendarDays.map((day, dayIdx) => {
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, currentDate)
            
            const dayProjects = projectsWithDates.filter(p => {
              if (!p.data_inicio || !p.prazo) return false
              const start = startOfDay(parseISO(p.data_inicio))
              const end = startOfDay(parseISO(p.prazo))
              return isWithinInterval(startOfDay(day), { start, end })
            })

            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "relative min-h-[120px] p-2 border-r border-b border-border transition-colors group",
                  dayIdx % 7 === 6 && "border-r-0",
                  !isCurrentMonth ? "bg-secondary/50" : "hover:bg-[#1a1a1a]/50 cursor-pointer"
                )}
              >
                <span className={cn(
                  "text-[11px] font-mono font-bold block mb-2",
                  !isCurrentMonth ? "text-neutral-800" : isToday ? "text-orange-500" : "text-neutral-600"
                )}>
                  {format(day, "d")}
                </span>

                <div className="space-y-1">
                  {dayProjects.slice(0, 3).map((project) => (
                    <ProjectBar 
                      key={project.id} 
                      project={project} 
                      currentDay={day} 
                      isDimmed={selectedProjectId !== null && selectedProjectId !== project.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProjectId(project.id)
                      }}
                      onEditDates={(p) => {
                        setEditingProject(p)
                        setEditForm({
                          data_inicio: p.data_inicio || "",
                          prazo: p.prazo || ""
                        })
                        setIsEditModalOpen(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedProject && (
        <section className="bg-card p-6 rounded-lg border border-orange-500/20 animate-in fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-foreground font-bold">{selectedProject.nome}</h3>
                <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest">{selectedProject.clientes?.nome || "Sem Cliente"}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-neutral-500 hover:text-foreground" onClick={() => setSelectedProjectId(null)}>
              FECHAR DETALHES ×
            </Button>
          </div>
          
          <div className="relative pt-10 pb-16 px-12">
            <div className="absolute top-[68px] left-12 right-12 h-1 bg-[#2A2A2A] rounded-full" />
            <div className="flex justify-between relative">
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-4 h-4 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                <span className="text-[10px] font-mono font-bold text-orange-500">INICIO</span>
                <span className="text-[9px] font-mono text-neutral-600">
                  {selectedProject.data_inicio ? format(parseISO(selectedProject.data_inicio), "dd/MM/yy") : "--/--"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                <span className="text-[10px] font-mono font-bold text-green-500">ENTREGA</span>
                <span className="text-[9px] font-mono text-neutral-600">
                  {selectedProject.prazo ? format(parseISO(selectedProject.prazo), "dd/MM/yy") : "--/--"}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal Novo Projeto */}
      <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-mono tracking-widest uppercase">Novo Projeto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-mono text-neutral-500">NOME</Label>
              <Input 
                id="name" 
                placeholder="Projeto X" 
                value={newProjectForm.nome}
                onChange={(e) => setNewProjectForm({...newProjectForm, nome: e.target.value})}
                className="col-span-3 bg-card border-border" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-mono text-neutral-500">INICIO</Label>
              <Input 
                type="date" 
                value={newProjectForm.data_inicio}
                onChange={(e) => setNewProjectForm({...newProjectForm, data_inicio: e.target.value})}
                className="col-span-3 bg-card border-border [color-scheme:dark]" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-mono text-neutral-500">PRAZO</Label>
              <Input 
                type="date" 
                value={newProjectForm.prazo}
                onChange={(e) => setNewProjectForm({...newProjectForm, prazo: e.target.value})}
                className="col-span-3 bg-card border-border [color-scheme:dark]" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsNewProjectModalOpen(false)}>CANCELAR</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSaveProject} disabled={isSaving}>SALVAR</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Datas */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-mono tracking-widest uppercase">Editar Cronograma</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-mono text-neutral-500">INICIO</Label>
              <Input 
                type="date" 
                value={editForm.data_inicio}
                onChange={(e) => setEditForm({...editForm, data_inicio: e.target.value})}
                className="col-span-3 bg-card border-border [color-scheme:dark]" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs font-mono text-neutral-500">PRAZO</Label>
              <Input 
                type="date" 
                value={editForm.prazo}
                onChange={(e) => setEditForm({...editForm, prazo: e.target.value})}
                className="col-span-3 bg-card border-border [color-scheme:dark]" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>CANCELAR</Button>
            <Button className="bg-orange-500" onClick={handleUpdateDates} disabled={isSaving}>ATUALIZAR</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProjectBar({ project, currentDay, onClick, isDimmed, onEditDates }: any) {
  const start = parseISO(project.data_inicio!)
  const isStartDay = isSameDay(currentDay, start)
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div 
          onClick={onClick}
          className={cn(
            "h-5 rounded-sm px-1.5 flex items-center transition-all cursor-pointer overflow-hidden",
            STATUS_COLORS[project.status] || "bg-neutral-600",
            isStartDay ? "ml-0" : "-ml-2 rounded-l-none border-l-0",
            isDimmed ? "opacity-20 scale-[0.95]" : "opacity-100 hover:brightness-110 shadow-sm"
          )}
        >
          {isStartDay && (
            <span className="text-[9px] font-bold text-foreground truncate drop-shadow-sm">
              {project.nome}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background border-border p-0 shadow-2xl overflow-hidden z-50">
        <div className={cn("h-1", STATUS_COLORS[project.status] || "bg-neutral-600")} />
        <div className="p-4 space-y-4">
           <div>
             <div className="flex items-center justify-between mb-1">
               <span className="text-[10px] text-orange-500 font-mono font-bold tracking-widest">{project.codigo}</span>
               <Badge className={cn("text-[9px] uppercase", STATUS_COLORS[project.status])}>
                 {project.status}
               </Badge>
             </div>
             <h4 className="text-lg font-bold text-foreground leading-tight">{project.nome}</h4>
             <p className="text-xs text-neutral-500">{project.clientes?.nome || "Sem Cliente"}</p>
           </div>
           <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-mono uppercase">Cronograma</span>
                <div className="flex items-center gap-2 text-[11px] text-foreground">
                  <Clock className="w-3 h-3 text-neutral-500" />
                  {project.data_inicio ? format(parseISO(project.data_inicio), "dd/MM") : ""} → {project.prazo ? format(parseISO(project.prazo), "dd/MM") : ""}
                </div>
              </div>
           </div>
           <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] text-neutral-500 font-mono uppercase">Progresso</span>
                 <span className="text-[10px] text-foreground font-mono">{project.progresso}%</span>
              </div>
              <Progress value={project.progresso} className="h-1.5 bg-[#1A1A1A]" />
           </div>
           <div className="flex items-center gap-2 pt-2">
              <Button size="sm" className="flex-1 bg-orange-500 text-black font-bold text-[10px]" onClick={(e) => e.stopPropagation()}>
                VER DETALHES
              </Button>
              <Button size="sm" variant="outline" className="h-8 group" onClick={() => onEditDates(project)}>
                <Edit2 className="w-3.5 h-3.5 group-hover:text-orange-500" />
              </Button>
           </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
