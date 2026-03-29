"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ListTodo,
  Plus,
  Filter,
  Search,
  Clock,
  User,
  FolderKanban,
  CheckCircle2,
  Circle,
  AlertTriangle,
  MessageSquare,
  MoreVertical,
} from "lucide-react"

const tasks = [
  {
    id: "T-089",
    title: "Criar tela de login",
    description: "Implementar tela de login com autenticacao OAuth",
    project: "Projeto Alpha",
    projectId: "PRJ-042",
    sprint: "Sprint #7",
    assignee: "Joao",
    reviewer: "Gabriel",
    status: "review",
    priority: "alta",
    deadline: "03/07/2025",
    estimatedHours: 8,
    comments: 3,
    criteria: [
      { text: "Layout responsivo implementado", done: true },
      { text: "Integracao com OAuth", done: true },
      { text: "Testes unitarios", done: false },
    ],
  },
  {
    id: "T-090",
    title: "Integrar API de usuarios",
    description: "Conectar frontend com endpoints de usuarios",
    project: "App Beta",
    projectId: "PRJ-041",
    sprint: "Sprint #6",
    assignee: "Joao",
    reviewer: "Gabriel",
    status: "inProgress",
    priority: "alta",
    deadline: "05/07/2025",
    estimatedHours: 12,
    comments: 5,
    criteria: [
      { text: "Endpoints mapeados", done: true },
      { text: "Service layer criado", done: false },
      { text: "Error handling", done: false },
    ],
  },
  {
    id: "T-091",
    title: "Testes unitarios - modulo de pagamentos",
    description: "Escrever testes para o modulo de pagamentos",
    project: "Projeto Alpha",
    projectId: "PRJ-042",
    sprint: "Sprint #7",
    assignee: "Joao",
    reviewer: "Gabriel",
    status: "todo",
    priority: "media",
    deadline: "07/07/2025",
    estimatedHours: 6,
    comments: 1,
    criteria: [
      { text: "Cobertura minima de 80%", done: false },
      { text: "Testes de integracao", done: false },
    ],
  },
  {
    id: "T-092",
    title: "Configurar CI/CD",
    description: "Implementar pipeline de deploy automatizado",
    project: "Automacao X",
    projectId: "PRJ-040",
    sprint: "Sprint #5",
    assignee: "Pedro",
    reviewer: "DevSecOps",
    status: "done",
    priority: "alta",
    deadline: "01/07/2025",
    estimatedHours: 10,
    comments: 8,
    criteria: [
      { text: "GitHub Actions configurado", done: true },
      { text: "Deploy em staging", done: true },
      { text: "Deploy em producao", done: true },
    ],
  },
  {
    id: "T-093",
    title: "Documentacao da API",
    description: "Criar documentacao Swagger para todos os endpoints",
    project: "App Beta",
    projectId: "PRJ-041",
    sprint: "Sprint #6",
    assignee: "Maria",
    reviewer: "Gabriel",
    status: "todo",
    priority: "baixa",
    deadline: "10/07/2025",
    estimatedHours: 4,
    comments: 0,
    criteria: [
      { text: "Swagger configurado", done: false },
      { text: "Endpoints documentados", done: false },
    ],
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof Circle }> = {
  todo: { label: "A FAZER", color: "bg-neutral-500", icon: Circle },
  inProgress: { label: "EM PROGRESSO", color: "bg-blue-500", icon: Clock },
  review: { label: "EM REVISAO", color: "bg-yellow-500", icon: AlertTriangle },
  done: { label: "CONCLUIDO", color: "bg-green-500", icon: CheckCircle2 },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: "BAIXA", color: "border-neutral-500 text-neutral-400" },
  media: { label: "MEDIA", color: "border-yellow-500 text-yellow-500" },
  alta: { label: "ALTA", color: "border-red-500 text-red-500" },
  critica: { label: "CRITICA", color: "border-red-600 text-red-600 bg-red-500/10" },
}

function TaskCard({ task }: { task: typeof tasks[0] }) {
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const StatusIcon = status.icon
  const completedCriteria = task.criteria.filter((c) => c.done).length
  
  return (
    <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${task.status === "done" ? "text-green-500" : task.status === "review" ? "text-yellow-500" : task.status === "inProgress" ? "text-blue-500" : "text-neutral-500"}`} />
            <span className="text-xs text-orange-500 font-mono">{task.id}</span>
            <Badge variant="outline" className={`text-[9px] ${priority.color}`}>
              {priority.label}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-sm font-medium text-white mb-1">{task.title}</h3>
        <p className="text-[10px] text-neutral-500 mb-3">{task.description}</p>

        <div className="flex items-center gap-4 text-[10px] text-neutral-400 mb-3">
          <div className="flex items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            {task.projectId}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignee}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.estimatedHours}h
          </div>
        </div>

        {/* Criteria */}
        <div className="space-y-1 mb-3">
          {task.criteria.slice(0, 2).map((c, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[10px]">
              {c.done ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <Circle className="w-3 h-3 text-neutral-600" />
              )}
              <span className={c.done ? "text-neutral-500 line-through" : "text-neutral-400"}>
                {c.text}
              </span>
            </div>
          ))}
          {task.criteria.length > 2 && (
            <span className="text-[10px] text-neutral-500 ml-5">
              +{task.criteria.length - 2} criterios
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <Badge className={`text-[9px] ${status.color} text-white`}>
              {status.label}
            </Badge>
            <span className="text-[10px] text-neutral-500">
              {completedCriteria}/{task.criteria.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {task.comments > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                <MessageSquare className="w-3 h-3" />
                {task.comments}
              </div>
            )}
            <span className="text-[10px] text-neutral-500">{task.deadline}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TasksPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredTasks = statusFilter === "all" 
    ? tasks 
    : tasks.filter((t) => t.status === statusFilter)

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader title="TAREFAS" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Tarefas</h1>
              <p className="text-sm text-neutral-500">Gerenciamento de tasks por estagiario / tech lead</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg">
                <Search className="w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar tasks..."
                  className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none w-40"
                />
              </div>

              {/* Filter */}
              <Button variant="outline" className="border-[#2A2A2A] bg-[#141414] text-neutral-400 hover:text-white hover:border-orange-500/50">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>

              {/* New Task Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-display text-white flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-orange-500" />
                      Nova Task
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-xs">Projeto</Label>
                        <Select>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                            <SelectValue placeholder="Selecionar projeto" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                            <SelectItem value="prj-042">PRJ-042 - Projeto Alpha</SelectItem>
                            <SelectItem value="prj-041">PRJ-041 - App Beta</SelectItem>
                            <SelectItem value="prj-040">PRJ-040 - Automacao X</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-xs">Sprint</Label>
                        <Select>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                            <SelectValue placeholder="Selecionar sprint" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                            <SelectItem value="7">Sprint #7</SelectItem>
                            <SelectItem value="6">Sprint #6</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-xs">Atribuida para</Label>
                        <Select>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                            <SelectItem value="joao">Joao (Estagiario)</SelectItem>
                            <SelectItem value="maria">Maria (Estagiario)</SelectItem>
                            <SelectItem value="pedro">Pedro (Estagiario)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-xs">Revisada por</Label>
                        <Select>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                            <SelectItem value="gabriel">Gabriel (Tech Lead)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Titulo</Label>
                      <Input className="bg-[#0A0A0A] border-[#2A2A2A] text-white" placeholder="Titulo da task" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Descricao</Label>
                      <Textarea className="bg-[#0A0A0A] border-[#2A2A2A] text-white resize-none" placeholder="Descreva a task..." rows={3} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-xs">Prioridade</Label>
                        <Select>
                          <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                            <SelectValue placeholder="Prioridade" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Media</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="critica">Critica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-xs">Estimativa (horas)</Label>
                        <Input type="number" className="bg-[#0A0A0A] border-[#2A2A2A] text-white" placeholder="8" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-xs">Deadline</Label>
                        <Input type="date" className="bg-[#0A0A0A] border-[#2A2A2A] text-white" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" className="border-[#2A2A2A]" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        Criar Task
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
            <TabsList className="bg-[#141414] border border-[#2A2A2A]">
              <TabsTrigger value="all" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Todas ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="todo" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                A Fazer ({tasks.filter(t => t.status === "todo").length})
              </TabsTrigger>
              <TabsTrigger value="inProgress" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Em Progresso ({tasks.filter(t => t.status === "inProgress").length})
              </TabsTrigger>
              <TabsTrigger value="review" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Em Revisao ({tasks.filter(t => t.status === "review").length})
              </TabsTrigger>
              <TabsTrigger value="done" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Concluidas ({tasks.filter(t => t.status === "done").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
