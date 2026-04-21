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
  Trash2,
} from "lucide-react"

import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { useSprints } from "@/lib/hooks/use-sprints"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { useToast } from "../reports/toast-notification"
import { supabase } from "@/lib/supabase"

import { TaskCard } from "./task-card"
import { TaskDetailsModal } from "./task-details-modal"

export function TasksTab() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  const { tasks, addTask, isLoading, mutate } = useTarefas()
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
  
  const [checklistItems, setChecklistItems] = useState<{ title: string; assigned_to: string }[]>([])
  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemAssignedTo, setNewItemAssignedTo] = useState("")

  const handleCreateTask = async () => {
    if (!formData.titulo || !formData.projeto_id) {
      showToast("error", "Preencha o título e o projeto.")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await addTask(formData)
      if (result?.data) {
        const taskId = result.data.id

        // Salvar itens de checklist se houver
        if (checklistItems.length > 0) {
          await fetch('/api/checklist-items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              task_id: taskId,
              project_id: formData.projeto_id,
              items: checklistItems
            })
          })
          
          // Força atualização agressiva após inserir itens
          mutate() 
        }

        showToast("success", "Tarefa criada com sucesso!")
        setDialogOpen(false)
        setFormData({
          titulo: "", descricao: "", projeto_id: "", sprint_id: "", 
          responsavel_id: "", prioridade: "media", status: "a_fazer", prazo: ""
        })
        setChecklistItems([])
        mutate()
      }
    } catch (err) {
      showToast("error", "Erro ao criar tarefa.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa permanentemente? A exclusão também removerá os sub-itens do checklist atrelados a ela.")) return
    try {
      const { error } = await supabase.from("tarefas").delete().eq("id", id)
      if (error) throw error
      showToast("success", "Tarefa excluída com sucesso.")
      mutate()
    } catch (err) {
      console.error(err)
      showToast("error", "Erro ao excluir tarefa.")
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
            <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Tarefas</h1>
            <p className="text-xs sm:text-sm text-neutral-500">Gerenciamento centralizado de atividades</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar tasks..."
                className="bg-transparent text-sm text-foreground placeholder:text-neutral-600 outline-none w-full sm:w-32"
              />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-foreground">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Nova Tarefa</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg font-display text-foreground flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-orange-500" />
                    Criar Nova Tarefa
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Projeto *</Label>
                      <Select value={formData.projeto_id} onValueChange={(v) => setFormData({...formData, projeto_id: v})}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Selecionar projeto" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Sprint (Opcional)</Label>
                      <Select value={formData.sprint_id} onValueChange={(v) => setFormData({...formData, sprint_id: v})}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Selecionar sprint" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
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
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Selecionar membro" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {equipe.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-xs">Título *</Label>
                    <Input 
                      className="bg-background border-border text-foreground" 
                      placeholder="Titulo da task"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-neutral-400 text-xs">Descrição</Label>
                    <Textarea 
                      className="bg-background border-border text-foreground resize-none" 
                      placeholder="Descreva a task..." 
                      rows={3}
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Prioridade</Label>
                      <Select value={formData.prioridade} onValueChange={(v) => setFormData({...formData, prioridade: v})}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Status</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="a_fazer">A Fazer</SelectItem>
                          <SelectItem value="em_progresso">Em Progresso</SelectItem>
                          <SelectItem value="revisao">Revisão</SelectItem>
                          <SelectItem value="concluida">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-xs">Deadline</Label>
                      <Input 
                        type="date" 
                        className="bg-background border-border text-foreground [color-scheme:dark]"
                        value={formData.prazo}
                        onChange={(e) => setFormData({...formData, prazo: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Seção de Checklist */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <Label className="text-orange-500 text-xs font-mono uppercase tracking-widest">Itens de Checklist</Label>
                    
                    <div className="flex flex-col gap-3 p-3 bg-background border border-border rounded-lg">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input 
                          placeholder="Título do item..."
                          className="bg-card border-border text-xs h-8 flex-1"
                          value={newItemTitle}
                          onChange={(e) => setNewItemTitle(e.target.value)}
                        />
                        <Select value={newItemAssignedTo} onValueChange={setNewItemAssignedTo}>
                          <SelectTrigger className="bg-card border-border text-xs h-8 sm:w-40">
                            <SelectValue placeholder="Atribuir..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="none">Sem responsável</SelectItem>
                            {equipe.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-8 text-xs bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-foreground border border-orange-500/20"
                          type="button"
                          onClick={() => {
                            if (!newItemTitle) return
                            setChecklistItems([...checklistItems, { 
                              title: newItemTitle, 
                              assigned_to: newItemAssignedTo === "none" ? "" : newItemAssignedTo 
                            }])
                            setNewItemTitle("")
                            setNewItemAssignedTo("")
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>

                      {checklistItems.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {checklistItems.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-card rounded-md border border-border group">
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-xs text-foreground truncate">{item.title}</span>
                                {item.assigned_to && (
                                  <span className="text-[9px] text-orange-500 font-mono">
                                    Resp: {equipe.find(m => m.id === item.assigned_to)?.nome}
                                  </span>
                                )}
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 text-neutral-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                type="button"
                                onClick={() => setChecklistItems(checklistItems.filter((_, i) => i !== idx))}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" className="border-border" onClick={() => setDialogOpen(false)}>
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
        <div className="p-8 border border-dashed border-border rounded-lg text-center bg-card">
           <p className="text-neutral-500 uppercase font-mono tracking-widest text-sm">Nenhuma tarefa encontrada no banco</p>
        </div>
      ) : (
        <>
          <div className="mb-6 overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-card border border-border w-max sm:w-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground text-xs sm:text-sm px-2 sm:px-3">
                  Todas ({tasks.length})
                </TabsTrigger>
                <TabsTrigger value="a_fazer" className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground text-xs sm:text-sm px-2 sm:px-3">
                  A Fazer ({tasks.filter((t:any) => t.status === "a_fazer").length})
                </TabsTrigger>
                <TabsTrigger value="em_progresso" className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground text-xs sm:text-sm px-2 sm:px-3">
                  Progresso ({tasks.filter((t:any) => t.status === "em_progresso").length})
                </TabsTrigger>
                <TabsTrigger value="em_revisao" className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground text-xs sm:text-sm px-2 sm:px-3">
                  Revisão ({tasks.filter((t:any) => t.status === "em_revisao").length})
                </TabsTrigger>
                <TabsTrigger value="concluida" className="data-[state=active]:bg-orange-500 data-[state=active]:text-foreground text-xs sm:text-sm px-2 sm:px-3">
                  Concluídas ({tasks.filter((t:any) => t.status === "concluida").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredTasks.map((task: any) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={() => {
                  setSelectedTask(task)
                  setIsDetailsOpen(true)
                }}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          <TaskDetailsModal 
            task={selectedTask}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            onUpdate={mutate}
          />
        </>
      )}
    </div>
  )
}
