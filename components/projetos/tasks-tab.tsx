"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  Loader2,
} from "lucide-react"

import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { useSprints } from "@/lib/hooks/use-sprints"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { useToast } from "../reports/toast-notification"

import { TaskCard } from "./task-card"

export function TasksTab() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { tasks, addTask, isLoading } = useTarefas()
  const { projects } = useProjetos()
  const { sprints } = useSprints()
  const { equipe } = useEquipe()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    projeto_id: "",
    sprint_id: "",
    responsavel_id: "",
    prioridade: "media",
    status: "a_fazer",
    prazo: ""
  })

  const handleCreateTask = async () => {
    if (!formData.titulo || !formData.projeto_id) {
      showToast("error", "Preencha o título e o projeto.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await addTask(formData)
      if (result?.data) {
        showToast("success", "Tarefa criada com sucesso!")
        setDialogOpen(false)
        setFormData({
          titulo: "", descricao: "", projeto_id: "", sprint_id: "", 
          responsavel_id: "", prioridade: "media", status: "a_fazer", prazo: ""
        })
      }
    } catch (err) {
      showToast("error", "Erro ao criar tarefa.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
       <div className="flex items-center justify-center p-20 text-orange-500">
         Carregando Tarefas do banco...
      </div>
    )
  }

  const filteredTasks = statusFilter === "all" 
    ? tasks 
    : tasks.filter((t: any) => t.status === statusFilter)

  return (
    <div className="flex-1 w-full relative">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-white">Tarefas</h1>
            <p className="text-xs sm:text-sm text-neutral-500">Gerenciamento centralizado de atividades</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2A2A2A] rounded-lg flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar tasks..."
                className="bg-transparent text-sm text-neutral-300 placeholder:text-neutral-600 outline-none w-full sm:w-32"
              />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nova Tarefa</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg font-display text-white flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-orange-500" />
                    Criar Nova Tarefa
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Projeto *</Label>
                      <Select value={formData.projeto_id} onValueChange={(v) => setFormData({...formData, projeto_id: v})}>
                        <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                          <SelectValue placeholder="Selecionar projeto" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Sprint (Opcional)</Label>
                      <Select value={formData.sprint_id} onValueChange={(v) => setFormData({...formData, sprint_id: v})}>
                        <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                          <SelectValue placeholder="Selecionar sprint" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                          {sprints.filter(s => s.projeto_id === formData.projeto_id).map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-xs">Atribuída para</Label>
                    <Select value={formData.responsavel_id} onValueChange={(v) => setFormData({...formData, responsavel_id: v})}>
                      <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                        <SelectValue placeholder="Selecionar membro" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                        {equipe.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-xs">Título *</Label>
                    <Input 
                      className="bg-[#0A0A0A] border-[#2A2A2A] text-white" 
                      placeholder="Titulo da task"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-xs">Descrição</Label>
                    <Textarea 
                      className="bg-[#0A0A0A] border-[#2A2A2A] text-white resize-none" 
                      placeholder="Descreva a task..." 
                      rows={3}
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Prioridade</Label>
                      <Select value={formData.prioridade} onValueChange={(v) => setFormData({...formData, prioridade: v})}>
                        <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Deadline</Label>
                      <Input 
                        type="date" 
                        className="bg-[#0A0A0A] border-[#2A2A2A] text-white [color-scheme:dark]"
                        value={formData.prazo}
                        onChange={(e) => setFormData({...formData, prazo: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" className="border-[#2A2A2A]" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={handleCreateTask}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Criar Tarefa"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 border border-dashed border-[#2A2A2A] rounded-lg text-center bg-[#141414]">
           <p className="text-neutral-500 uppercase font-mono tracking-widest text-sm">Nenhuma tarefa encontrada no banco</p>
        </div>
      ) : (
        <>
          <div className="mb-6 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-[#141414] border border-[#2A2A2A] w-max sm:w-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
                  Todas ({tasks.length})
                </TabsTrigger>
                <TabsTrigger value="a_fazer" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
                  A Fazer ({tasks.filter((t:any) => t.status === "a_fazer").length})
                </TabsTrigger>
                <TabsTrigger value="em_progresso" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
                  Progresso ({tasks.filter((t:any) => t.status === "em_progresso").length})
                </TabsTrigger>
                <TabsTrigger value="em_revisao" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
                  Revisão ({tasks.filter((t:any) => t.status === "em_revisao").length})
                </TabsTrigger>
                <TabsTrigger value="concluida" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
                  Concluídas ({tasks.filter((t:any) => t.status === "concluida").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredTasks.map((task: any) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
