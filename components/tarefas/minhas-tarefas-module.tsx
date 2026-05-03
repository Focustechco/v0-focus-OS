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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Calendar as CalendarIcon } from "lucide-react"
import { KanbanBoard } from "./kanban-board"
import { TaskListView } from "./task-list-view"
import { NewTaskModal } from "./new-task-modal"
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

  const handleSaveTask = async (modalData: any) => {
    if (!modalData.titulo) return
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const payload: any = {
        titulo: modalData.titulo,
        descricao: modalData.descricao,
        status: modalData.status,
        prioridade: modalData.prioridade,
        responsavel_id: modalData.responsavel_id || null,
        prazo: modalData.prazo || null,
        projeto_id: modalData.projeto_id || null,
      }
      if (modalData.tempo_estimado) payload.tempo_estimado = modalData.tempo_estimado

      let shouldNotifyAssign = false
      let statusChanged = false
      let oldStatus = ""
      let assignedUserId = payload.responsavel_id
      let finalTaskId = modalData.id || ""

      if (isEditMode && modalData.id) {
        const { data: oldTask } = await supabase.from("tarefas").select("responsavel_id, status").eq("id", modalData.id).single()
        if (oldTask) {
          if (oldTask.responsavel_id !== assignedUserId) shouldNotifyAssign = true
          if (oldTask.status !== payload.status) {
            statusChanged = true
            oldStatus = oldTask.status
          }
        }

        await fetch(`/api/tarefas/${modalData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      } else {
        shouldNotifyAssign = !!assignedUserId
        const fallBackProject = modalData.projeto_id || projects[0]?.id || ""
        const res = await addTask({ ...payload, projeto_id: fallBackProject })
        if (res.data) {
          finalTaskId = res.data.id
          // Salvar itens do checklist se houver
          if (modalData.checklist && modalData.checklist.length > 0) {
            const checkItems = modalData.checklist.map((title: string) => ({
              task_id: finalTaskId,
              title,
              is_done: false
            }))
            const { error } = await supabase.from("checklist_items").insert(checkItems)
            if (error) console.error("Erro ao salvar checklist:", error)
          }
        }
      }
      
      // Disparar Notificação de ATRIBUIÇÃO
      if (shouldNotifyAssign && assignedUserId && user) {
        try {
          await fetch('/api/notifications/dispatch', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: assignedUserId,
              triggeredBy: user.id,
              eventType: 'nova_task',
              data: {
                title: 'Nova task atribuída a você',
                message: `${payload.titulo} — Prioridade ${payload.prioridade.charAt(0).toUpperCase() + payload.prioridade.slice(1)}`,
                ref_type: 'tarefas',
                ref_id: finalTaskId,
                ref_title: payload.titulo
              }
            })
          })
        } catch (e) {
          console.error("Erro no dispatch assign:", e)
        }
      }

      // Disparar Notificação de STATUS
      if (statusChanged && assignedUserId && user) {
        try {
          const statusLabels: Record<string, string> = {
            a_fazer: "Pendente", em_progresso: "Em Progresso", em_andamento: "Em Progresso",
            em_revisao: "Em Revisão", concluida: "Concluída",
          }
          const evType = payload.status === "concluida" ? "task_concluida" : "task_status_changed"
          const evTitle = payload.status === "concluida" ? "Task concluída ✓" : "Status da sua task foi atualizado"
          
          await fetch('/api/notifications/dispatch', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: assignedUserId,
              triggeredBy: user.id,
              eventType: evType,
              data: {
                title: evTitle,
                message: `${payload.titulo}: ${statusLabels[oldStatus] || oldStatus} → ${statusLabels[payload.status] || payload.status}`,
                ref_type: 'tarefas',
                ref_id: finalTaskId,
                ref_title: payload.titulo
              }
            })
          })
        } catch (e) {
          console.error("Erro no dispatch status:", e)
        }
      }

      mutate()
      setIsModalOpen(false)
    } catch (e) {
      console.error(e)
      alert("Erro ao salvar a tarefa.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 flex flex-col h-full bg-[#0f0f0f] relative pb-20">
      {/* ─── CABEÇALHO DA PÁGINA ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-1">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Gerenciador de Tasks</h1>
          <p className="text-[13px] text-[#666] mt-2">Organize, delegue e acompanhe o progresso da sua equipe.</p>
        </div>

        {/* Botões de Visualização */}
        <div className="flex items-center gap-2">
          {[
            { id: "checklist", label: "Checklist", icon: List },
            { id: "quadro", label: "Quadro", icon: LayoutGrid },
            { id: "calendario", label: "Calendário", icon: CalendarIcon },
          ].map((mode) => {
            const active = activeTab === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => setActiveTab(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all border",
                  active 
                    ? "bg-[#e87c2a] border-transparent text-white shadow-lg shadow-[#e87c2a]/10" 
                    : "bg-transparent border-[#222] text-[#aaa] hover:border-[#333] hover:text-white"
                )}
              >
                <mode.icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── BARRA DE FERRAMENTAS ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        {/* Lado Esquerdo: Busca */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-[#222] rounded-lg w-full sm:w-[220px] focus-within:border-[#e87c2a]/50 transition-colors">
            <Search className="w-4 h-4 text-[#666] flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[13px] text-white placeholder:text-[#444] outline-none w-full"
            />
          </div>
          
          {/* Ícones de visualização (Lista) no centro/lado da busca */}
          <div className="hidden sm:flex items-center gap-1 text-[#444]">
            <List className="w-4 h-4" />
            <LayoutGrid className="w-4 h-4" />
          </div>
        </div>

        {/* Lado Direito: Filtros e Botão */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="bg-[#161616] border-[#222] text-xs h-9 w-[180px] rounded-lg text-neutral-300">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="bg-[#161616] border-[#222] text-white">
              <SelectItem value="all">Todos</SelectItem>
              {equipe.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-[#161616] border-[#222] text-xs h-9 w-[130px] rounded-lg text-neutral-300">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent className="bg-[#161616] border-[#222] text-white">
              <SelectItem value="all">Qualquer</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={openNewTask} 
            className="bg-[#e87c2a] hover:bg-[#e87c2a]/90 text-white font-bold h-9 px-5 rounded-lg transition-all shadow-lg shadow-[#e87c2a]/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Task
          </Button>
        </div>
      </div>

      {/* ─── CONTEÚDO PRINCIPAL ─── */}
      <div className="flex-1 mt-2">
        {activeTab === "checklist" && (
          <TaskListView
            searchQuery={searchQuery}
            assigneeFilter={assigneeFilter}
            priorityFilter={priorityFilter}
            onEditTask={openEditTask}
          />
        )}
        {activeTab === "quadro" && (
          <KanbanBoard 
            searchQuery={searchQuery}
            assigneeFilter={assigneeFilter}
            priorityFilter={priorityFilter}
            onEditTask={openEditTask}
          />
        )}
        {activeTab === "calendario" && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-600 bg-[#161616] rounded-2xl border border-[#222]">
            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Visualização em Calendário indisponível.</p>
          </div>
        )}
      </div>

      {/* ─── BOTÃO FLUTUANTE (FAB) ─── */}
      <button
        onClick={openNewTask}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#e87c2a] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#e87c2a]/40 hover:scale-110 active:scale-95 transition-all z-50 border border-white/10"
      >
        <Plus className="w-7 h-7 stroke-[3px]" />
      </button>

      {/* MODAL NOVA/EDITAR TAREFA */}
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        equipe={equipe}
        projects={projects}
        editTask={isEditMode ? formData : null}
        isEditMode={isEditMode}
      />
    </div>
  )
}
