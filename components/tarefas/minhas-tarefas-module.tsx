"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { useMinhasTarefas, type MinhasTarefasItem } from "@/lib/hooks/use-minhas-tarefas"
import { usePermissoes } from "@/lib/hooks/use-permissoes"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  Calendar,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ListTodo,
  CalendarDays,
  Search,
  Filter,
  Plus,
  LayoutKanban
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgendaModule } from "@/components/agenda-module"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { KanbanBoard } from "./kanban-board"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { supabase } from "@/lib/supabase"

const prioridadeConfig = {
  alta: { label: "Alta", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  media: { label: "Média", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  baixa: { label: "Baixa", color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  a_fazer:      { label: "A Fazer",     color: "text-neutral-400",  icon: Clock },
  em_andamento: { label: "Em andamento",color: "text-blue-400",     icon: Clock },
  em_progresso: { label: "Em Progresso",color: "text-blue-400",     icon: Clock },
  revisao:      { label: "Revisão",     color: "text-purple-400",   icon: AlertCircle },
  concluida:    { label: "Concluída",   color: "text-green-500",    icon: CheckCircle2 },
  bloqueada:    { label: "Bloqueada",   color: "text-red-500",      icon: AlertCircle },
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function TarefaCard({ tarefa }: { tarefa: MinhasTarefasItem }) {
  const [expanded, setExpanded] = useState(false)
  const { toggleChecklist } = useMinhasTarefas()
  const router = useRouter()

  const prio = prioridadeConfig[tarefa.prioridade] || prioridadeConfig.media
  const statusInfo = statusConfig[tarefa.status] || statusConfig.a_fazer
  const StatusIcon = statusInfo.icon

  const progressPct = tarefa.checklistTotal > 0
    ? Math.round((tarefa.checklistDone / tarefa.checklistTotal) * 100)
    : (tarefa.status === "concluida" ? 100 : 0)

  // Subtarefas a exibir: se é owner mostra todas, se não, mostra só as suas
  const checklistToShow = tarefa.isOwner ? tarefa.checklist_items : tarefa.myChecklist

  const handleGoToTask = () => {
    router.push(`/projetos?projetoId=${tarefa.projeto_id}&tab=tarefas&taskId=${tarefa.id}`)
  }

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all",
      tarefa.isOwner
        ? "bg-card border-border hover:border-orange-500/30"
        : "bg-background border-[#1E1E1E] hover:border-border"
    )}>
      {/* Header da tarefa */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Coluna esquerda: botão de expandir */}
          <button
            onClick={() => setExpanded(!expanded)}
            disabled={checklistToShow.length === 0}
            className={cn(
              "mt-0.5 w-6 h-6 rounded flex items-center justify-center transition-all flex-shrink-0",
              checklistToShow.length > 0
                ? "text-neutral-400 hover:text-foreground hover:bg-[#2A2A2A]"
                : "text-neutral-700 cursor-default"
            )}
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")} />
          </button>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {/* Título + badges de info */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <button
                onClick={handleGoToTask}
                className={cn(
                  "text-sm font-medium text-left leading-snug hover:text-orange-400 transition-colors",
                  tarefa.isOwner ? "text-foreground" : "text-neutral-400"
                )}
              >
                {tarefa.titulo}
              </button>
              <Badge
                variant="outline"
                className={cn("text-[9px] uppercase tracking-wider flex-shrink-0 h-5 font-bold", prio.bg, prio.color)}
              >
                {prio.label}
              </Badge>
            </div>

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                <FolderKanban className="w-3 h-3" />
                <span className="font-mono">{tarefa.projeto_nome}</span>
              </div>
              {tarefa.prazo && (
                <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                  <Calendar className="w-3 h-3" />
                  <span className="font-mono">{formatDate(tarefa.prazo)}</span>
                </div>
              )}
              <div className={cn("flex items-center gap-1 text-[10px]", statusInfo.color)}>
                <StatusIcon className="w-3 h-3" />
                <span className="font-mono">{statusInfo.label}</span>
              </div>
            </div>

            {/* Progresso e contador de subtarefas */}
            {tarefa.checklistTotal > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 font-mono">
                    <span className={tarefa.checklistDone === tarefa.checklistTotal ? "text-green-500" : "text-foreground"}>
                      {tarefa.checklistDone}
                    </span>
                    {" de "}{tarefa.checklistTotal} subtarefas concluídas
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-1 bg-[#1A1A1A]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checklist expandido */}
      {expanded && checklistToShow.length > 0 && (
        <div className="border-t border-[#1E1E1E] bg-background">
          <div className="p-3 space-y-1">
            {checklistToShow.map((ci) => {
              const ciStatus = ci.is_done ? statusConfig.concluida : statusConfig.a_fazer
              return (
                <div
                  key={ci.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                    tarefa.myChecklist.some((m) => m.id === ci.id)
                      ? "bg-card hover:bg-accent/10"
                      : "hover:bg-background opacity-60"
                  )}
                >
                  <Checkbox
                    id={`ci-${ci.id}`}
                    checked={ci.is_done}
                    onCheckedChange={(checked) => toggleChecklist(ci.id, checked as boolean)}
                    className="border-[#3A3A3A] data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <label
                    htmlFor={`ci-${ci.id}`}
                    className={cn(
                      "flex-1 text-xs cursor-pointer leading-tight",
                      ci.is_done ? "line-through text-neutral-600" : "text-foreground"
                    )}
                  >
                    {ci.title}
                  </label>
                  {ci.prazo && (
                    <span className="text-[10px] text-neutral-600 font-mono flex-shrink-0">
                      {formatDate(ci.prazo)}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] h-4 px-1.5 font-bold uppercase tracking-widest flex-shrink-0",
                      ci.is_done
                        ? "border-green-500/20 text-green-500 bg-green-500/5"
                        : "border-border text-neutral-500 bg-transparent"
                    )}
                  >
                    {ci.is_done ? "OK" : "—"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function AbaMinhasTarefas() {
  const {
    tarefas,
    isLoading,
    totalItems,
    doneItems,
    progressGlobal,
  } = useMinhasTarefas()
  
  const router = useRouter()
  const { canCreateTask } = usePermissoes()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Card Minha Pauta do Dia */}
      <div className="p-5 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-display font-bold text-foreground tracking-tight">Tasks do Dia</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">Tarefas e subtarefas atribuídas a você</p>
          </div>
          {canCreateTask && (
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-foreground h-8 text-xs"
              onClick={() => router.push("/projetos?new-task=true")}
            >
              + Nova Tarefa
            </Button>
          )}
        </div>

        {/* Contador global */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">{doneItems}</span>
            <span className="text-neutral-500 text-sm font-mono">/ {totalItems} CONCLUÍDAS</span>
          </div>
          <span className="text-xs font-mono text-neutral-500">{progressGlobal}%</span>
        </div>
        <Progress value={progressGlobal} className="h-2 bg-[#1A1A1A]" />
      </div>

      {/* Lista de tarefas */}
      {tarefas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
            <ListTodo className="w-7 h-7 text-neutral-700" />
          </div>
          <h3 className="text-foreground font-medium mb-1">Você está livre!</h3>
          <p className="text-neutral-500 text-sm max-w-xs">
            Nenhuma tarefa ou subtarefa está atribuída a você no momento.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
            onClick={() => router.push("/projetos")}
          >
            Ver Projetos
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              {tarefas.length} {tarefas.length === 1 ? "tarefa" : "tarefas"} atribuídas
            </p>
          </div>
          {tarefas.map((tarefa) => (
            <TarefaCard key={tarefa.id} tarefa={tarefa} />
          ))}
        </div>
      )}
    </div>
  )
}

export function MinhasTarefasModule() {
  const [activeTab, setActiveTab] = useState("quadro")
  const [searchQuery, setSearchQuery] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addTask, mutate } = useTarefas()
  const { equipe } = useEquipe()
  const { projects } = useProjetos()

  const [formData, setFormData] = useState({
    id: "",
    titulo: "",
    descricao: "",
    status: "a_fazer",
    prioridade: "media",
    responsavel_id: "",
    prazo: "",
    tempo_estimado: "",
    meta_id: "none"
  })

  const openNewTask = () => {
    setIsEditMode(false)
    setFormData({ id: "", titulo: "", descricao: "", status: "a_fazer", prioridade: "media", responsavel_id: "", prazo: "", tempo_estimado: "", meta_id: "none" })
    setIsModalOpen(true)
  }

  const openEditTask = (task: any) => {
    setIsEditMode(true)
    setFormData({
      id: task.id,
      titulo: task.titulo || "",
      descricao: task.descricao || "",
      status: task.status || "a_fazer",
      prioridade: task.prioridade || "media",
      responsavel_id: task.responsavel_id || "",
      prazo: task.prazo || "",
      tempo_estimado: task.tempo_estimado || "",
      meta_id: task.meta_id || "none"
    })
    setIsModalOpen(true)
  }

  const handleSaveTask = async () => {
    if (!formData.titulo) return alert("Título é obrigatório!")
    setIsSubmitting(true)
    try {
      const payload: any = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        status: formData.status,
        prioridade: formData.prioridade,
        responsavel_id: formData.responsavel_id === "none" ? null : formData.responsavel_id,
        prazo: formData.prazo || null,
        // Enviar os novos campos caso o bd suporte (se não suportar, a sdk pode ignorar ou lançar erro, mas como eles nao existem, melhor silenciar no script anterior e agora mockar)
        // Como o script falhou, não vou enviar tempo e meta para a tabela principal nativamente, ou enviarei no mutate local, mas aqui vamos tentar e se der erro removemos.
        // O supabase insert ignora colunas não existentes as vezes, mas as vezes dá erro. Vamos enviar apenas os seguros, mais tempo_estimado para testar.
      }
      if (formData.tempo_estimado) payload.tempo_estimado = parseInt(formData.tempo_estimado)

      if (isEditMode) {
        await fetch(`/api/tarefas/${formData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      } else {
        const fallBackProject = projects[0]?.id || ""
        await addTask({ ...payload, projeto_id: fallBackProject })
      }
      
      mutate()
      setIsModalOpen(false)
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar a tarefa. Verifique se o BD possui todas as colunas de Kanban.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* HEADER KANBAN */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground tracking-tight">Gerenciador de Tarefas</h1>
        <p className="text-sm text-neutral-500 mt-1">Organize, delegue e acompanhe o progresso da sua equipe.</p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-[#1E1E1E] p-3 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scroolbar-hide">
          <div className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg min-w-[150px]">
            <Search className="w-4 h-4 text-neutral-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-foreground placeholder:text-neutral-600 outline-none w-full"
            />
          </div>
          
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="bg-background border-border text-xs h-9 min-w-[140px]">
              <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5"/> <SelectValue placeholder="Responsável" /></div>
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Qualquer responsável</SelectItem>
              {equipe.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-background border-border text-xs h-9 min-w-[120px]">
              <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5"/> <SelectValue placeholder="Prioridade" /></div>
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Qualquer prioridade</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={openNewTask} className="bg-[#e65c00] hover:bg-[#ff7a1f] text-foreground flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <TabsList className="bg-transparent border-b border-[#1E1E1E] w-full justify-start rounded-none h-auto p-0 gap-6">
          <TabsTrigger 
            value="checklist" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#e65c00] data-[state=active]:text-[#e65c00] rounded-none py-3 px-1 text-sm font-medium text-neutral-500"
          >
            Checklist
          </TabsTrigger>
          <TabsTrigger 
            value="quadro" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#e65c00] data-[state=active]:text-[#e65c00] rounded-none py-3 px-1 text-sm font-medium text-neutral-500"
          >
            Quadro
          </TabsTrigger>
          <TabsTrigger 
            value="calendario" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#e65c00] data-[state=active]:text-[#e65c00] rounded-none py-3 px-1 text-sm font-medium text-neutral-500"
          >
            Calendário
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 flex-1">
          <TabsContent value="checklist" className="mt-0 h-full">
            <AbaMinhasTarefas />
          </TabsContent>
          <TabsContent value="quadro" className="mt-0 h-full">
            <KanbanBoard 
              searchQuery={searchQuery}
              assigneeFilter={assigneeFilter}
              priorityFilter={priorityFilter}
              onEditTask={openEditTask}
            />
          </TabsContent>
          <TabsContent value="calendario" className="mt-0 h-full">
            <AgendaModule />
          </TabsContent>
        </div>
      </Tabs>

      {/* MODAL NOVA/EDITAR TAREFA */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-display">{isEditMode ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs uppercase">Título da Tarefa *</Label>
              <Input 
                className="bg-[#1A1A1A] border-border" 
                value={formData.titulo} 
                onChange={e => setFormData({...formData, titulo: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs uppercase">Descrição</Label>
              <Textarea 
                className="bg-[#1A1A1A] border-border" 
                value={formData.descricao} 
                onChange={e => setFormData({...formData, descricao: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs uppercase">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger className="bg-[#1A1A1A] border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="a_fazer">Pendente</SelectItem>
                    <SelectItem value="em_progresso">Em Progresso</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs uppercase">Prioridade</Label>
                <Select value={formData.prioridade} onValueChange={v => setFormData({...formData, prioridade: v})}>
                  <SelectTrigger className="bg-[#1A1A1A] border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs uppercase">Atribuído a</Label>
                <Select value={formData.responsavel_id} onValueChange={v => setFormData({...formData, responsavel_id: v})}>
                  <SelectTrigger className="bg-[#1A1A1A] border-border"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">Nenhum membro</SelectItem>
                    {equipe.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 text-xs uppercase">Vencimento</Label>
                <Input 
                  type="date" 
                  className="bg-[#1A1A1A] border-border [color-scheme:dark]" 
                  value={formData.prazo} 
                  onChange={e => setFormData({...formData, prazo: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-neutral-400 text-xs uppercase">Tempo Estimado (min)</Label>
                <Input 
                  type="number" 
                  className="bg-[#1A1A1A] border-border" 
                  placeholder="Ex: 60"
                  value={formData.tempo_estimado} 
                  onChange={e => setFormData({...formData, tempo_estimado: e.target.value})} 
                />
              </div>
               <div className="space-y-2">
                <Label className="text-neutral-400 text-xs uppercase">Vincular a Meta</Label>
                <Select value={formData.meta_id} onValueChange={v => setFormData({...formData, meta_id: v})}>
                  <SelectTrigger className="bg-[#1A1A1A] border-border text-neutral-500"><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="none">Sem meta vinculada</SelectItem>
                    <SelectItem value="meta1">Aumentar Receita (Mock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#1A1A1A]">
              <Button variant="outline" className="border-border" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveTask} disabled={isSubmitting} className="bg-[#e65c00] hover:bg-[#ff7a1f] text-foreground">
                {isEditMode ? "Salvar" : "Criar Tarefa"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
