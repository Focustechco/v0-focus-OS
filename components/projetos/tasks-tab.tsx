"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus, Filter, Calendar, CheckSquare, Square,
  Loader2, Send, AlertTriangle
} from "lucide-react"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useSprints } from "@/lib/hooks/use-sprints"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { supabase } from "@/lib/supabase"

function getInitials(nome: string) {
  return nome?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"
}

function fmtDate(d: string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  a_fazer:       { label: "PENDENTE",      color: "text-neutral-400", bg: "bg-neutral-500/10 border-neutral-500/30" },
  pendente:      { label: "PENDENTE",      color: "text-neutral-400", bg: "bg-neutral-500/10 border-neutral-500/30" },
  em_andamento:  { label: "EM PROGRESSO",  color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30" },
  em_progresso:  { label: "EM PROGRESSO",  color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30" },
  em_revisao:    { label: "EM REVISÃO",    color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/30" },
  concluida:     { label: "CONCLUÍDA",     color: "text-green-400",   bg: "bg-green-500/10 border-green-500/30" },
  concluída:     { label: "CONCLUÍDA",     color: "text-green-400",   bg: "bg-green-500/10 border-green-500/30" },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  alta:  { label: "ALTA",  color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30" },
  media: { label: "MÉDIA", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  baixa: { label: "BAIXA", color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30" },
}

const FILTER_TABS = [
  { key: "todas", label: "Todas" },
  { key: "a_fazer", label: "A Fazer" },
  { key: "em_progresso", label: "Em Progresso" },
  { key: "em_revisao", label: "Em Revisão" },
  { key: "concluida", label: "Concluídas" },
]

// ─── TASK CARD ──────────────────────────────────────────────────────────────
function TaskCardNew({ task, equipe, sprints, onMutate }: {
  task: any; equipe: any[]; sprints: any[]; onMutate: () => void
}) {
  const [toggling, setToggling] = useState<string | null>(null)
  const [sendingReview, setSendingReview] = useState(false)

  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.a_fazer
  const prioCfg = PRIORITY_CONFIG[task.prioridade] || PRIORITY_CONFIG.media
  const assignee = equipe.find(m => m.id === task.responsavel_id)
  const sprint = sprints.find((s: any) => s.id === task.sprint_id)

  const checklist = task.checklist_items || []
  const checkDone = checklist.filter((i: any) => i.is_done).length
  const checkTotal = checklist.length
  const progressPct = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0
  const allDone = checkTotal > 0 && checkDone === checkTotal

  // Toggle subtarefa
  const toggleSubtask = async (itemId: string, currentDone: boolean) => {
    setToggling(itemId)
    try {
      await supabase
        .from("checklist_items")
        .update({ is_done: !currentDone })
        .eq("id", itemId)

      // Se é a primeira subtarefa sendo marcada e status é pendente, muda para em_progresso
      if (!currentDone && (task.status === "a_fazer" || task.status === "pendente")) {
        await supabase
          .from("tarefas")
          .update({ status: "em_andamento" })
          .eq("id", task.id)
      }
      onMutate()
    } finally {
      setToggling(null)
    }
  }

  // Enviar para revisão
  const enviarParaRevisao = async () => {
    setSendingReview(true)
    try {
      await supabase.from("tarefas").update({ status: "em_revisao" }).eq("id", task.id)

      // Cria registro de aprovação
      await supabase.from("aprovacoes").insert({
        titulo: task.titulo,
        descricao: `Tarefa "${task.titulo}" enviada para revisão`,
        tarefa_id: task.id,
        projeto_id: task.projeto_id,
        assigned_to: assignee?.nome || "Membro",
        status: "pendente",
        approval_type: "task_review",
        priority: task.prioridade === "alta" ? "high" : "normal",
      })

      onMutate()
    } finally {
      setSendingReview(false)
    }
  }

  return (
    <Card className={`bg-card border-border hover:border-primary/20 transition-all ${
      task.status === "concluida" || task.status === "concluída" ? "opacity-70" : ""
    }`}>
      <CardContent className="p-4">
        {/* Header: ID + Sprint + Priority */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span className="text-primary">#{task.id?.slice(0, 6)}</span>
            <span>·</span>
            <span>{sprint?.nome || "Sem sprint"}</span>
          </div>
          <Badge variant="outline" className={`text-[9px] font-bold ${prioCfg.bg} ${prioCfg.color}`}>
            {prioCfg.label}
          </Badge>
        </div>

        {/* Título */}
        <h3 className="text-sm font-semibold text-foreground mb-2">{task.titulo}</h3>

        {/* Assignee + Prazo + Sprint badge */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {assignee && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                {getInitials(assignee.nome)}
              </div>
              <span className="text-[11px] text-foreground">{assignee.nome}</span>
            </div>
          )}
          {task.prazo && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {fmtDate(task.prazo)}
            </div>
          )}
          {sprint && (
            <Badge variant="outline" className="text-[9px] text-muted-foreground border-border h-4 px-1.5">
              {sprint.nome}
            </Badge>
          )}
        </div>

        {/* Subtarefas */}
        {checkTotal > 0 && (
          <div className="mb-3">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">
              Subtarefas · {checkDone}/{checkTotal} concluídas
            </p>
            <div className="space-y-1">
              {checklist.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => toggleSubtask(item.id, item.is_done)}
                  disabled={toggling === item.id}
                  className="flex items-center gap-2 w-full text-left py-0.5 hover:bg-secondary/50 rounded px-1 -mx-1 transition-colors"
                >
                  {toggling === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary flex-shrink-0" />
                  ) : item.is_done ? (
                    <CheckSquare className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-xs ${item.is_done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status + Progress bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Badge variant="outline" className={`text-[9px] font-bold ${statusCfg.bg} ${statusCfg.color}`}>
            {statusCfg.label}
          </Badge>

          {checkTotal > 0 && (
            <div className="flex items-center gap-2 flex-1 ml-3">
              <Progress value={progressPct} className="h-1.5 flex-1" />
              <span className="text-[10px] font-mono text-muted-foreground">{progressPct}%</span>
            </div>
          )}
        </div>

        {/* Botão enviar para revisão */}
        {allDone && task.status !== "em_revisao" && task.status !== "concluida" && task.status !== "concluída" && (
          <Button
            size="sm"
            onClick={enviarParaRevisao}
            disabled={sendingReview}
            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs"
          >
            {sendingReview ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="w-3 h-3 mr-1" /> Enviar para revisão</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function TasksTab() {
  const { tasks, addTask, isLoading, mutate } = useTarefas()
  const { sprints } = useSprints()
  const { projects } = useProjetos()
  const { equipe } = useEquipe()

  const [filter, setFilter] = useState("todas")
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [form, setForm] = useState({
    titulo: "", descricao: "", prioridade: "media", sprint_id: "", projeto_id: "",
    responsavel_id: "", prazo: "",
  })

  // Contagens por status
  const counts = useMemo(() => {
    const c: Record<string, number> = { todas: 0, a_fazer: 0, em_progresso: 0, em_revisao: 0, concluida: 0 }
    tasks.forEach((t: any) => {
      c.todas++
      if (t.status === "a_fazer" || t.status === "pendente") c.a_fazer++
      else if (t.status === "em_andamento" || t.status === "em_progresso") c.em_progresso++
      else if (t.status === "em_revisao") c.em_revisao++
      else if (t.status === "concluida" || t.status === "concluída") c.concluida++
    })
    return c
  }, [tasks])

  // Filtrar tasks
  const filtered = useMemo(() => {
    if (filter === "todas") return tasks
    return tasks.filter((t: any) => {
      if (filter === "a_fazer") return t.status === "a_fazer" || t.status === "pendente"
      if (filter === "em_progresso") return t.status === "em_andamento" || t.status === "em_progresso"
      if (filter === "em_revisao") return t.status === "em_revisao"
      if (filter === "concluida") return t.status === "concluida" || t.status === "concluída"
      return true
    })
  }, [tasks, filter])

  const handleCreate = async () => {
    if (!form.titulo.trim()) return
    await addTask(form)
    setNewTaskOpen(false)
    setForm({ titulo: "", descricao: "", prioridade: "media", sprint_id: "", projeto_id: "", responsavel_id: "", prazo: "" })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-20 text-primary">Carregando Tarefas...</div>
  }

  return (
    <div className="flex-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Tarefas</h1>
          <p className="text-xs text-muted-foreground">Todas as tarefas do projeto com subtarefas e progresso</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-border text-muted-foreground">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filtrar
          </Button>
          <Button size="sm" onClick={() => setNewTaskOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label} ({counts[tab.key] || 0})
          </button>
        ))}
      </div>

      {/* Task Grid */}
      {filtered.length === 0 ? (
        <div className="text-muted-foreground text-center p-12 bg-card rounded-xl border border-dashed border-border">
          Nenhuma tarefa encontrada para este filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((task: any) => (
            <TaskCardNew
              key={task.id}
              task={task}
              equipe={equipe}
              sprints={sprints}
              onMutate={mutate}
            />
          ))}
        </div>
      )}

      {/* Modal Nova Tarefa */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> Nova Tarefa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-muted-foreground">Título *</Label>
              <Input placeholder="Ex: Implementar componente Button" className="bg-background border-border"
                value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-muted-foreground">Descrição</Label>
              <Textarea placeholder="Detalhes da tarefa..." className="bg-background border-border min-h-[60px]"
                value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground">Prioridade</Label>
                <Select value={form.prioridade} onValueChange={v => setForm({ ...form, prioridade: v })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground">Sprint</Label>
                <Select value={form.sprint_id} onValueChange={v => setForm({ ...form, sprint_id: v })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {sprints.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground">Responsável</Label>
                <Select value={form.responsavel_id} onValueChange={v => setForm({ ...form, responsavel_id: v })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {equipe.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground">Prazo</Label>
                <Input type="date" className="bg-background border-border" value={form.prazo}
                  onChange={e => setForm({ ...form, prazo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase text-muted-foreground">Projeto</Label>
              <Select value={form.projeto_id} onValueChange={v => setForm({ ...form, projeto_id: v })}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} className="w-full bg-primary hover:bg-primary/90" disabled={!form.titulo.trim()}>
              Criar Tarefa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
