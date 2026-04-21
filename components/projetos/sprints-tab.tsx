"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Zap, Calendar, Plus, TrendingDown, CheckSquare, Square, User
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts"
import { useSprints } from "@/lib/hooks/use-sprints"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { supabase } from "@/lib/supabase"

function getInitials(nome: string) {
  return nome?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"
}

function fmtDate(d: string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

// Gera dados do burndown baseado na sprint
function getBurndownData(sprint: any, tasks: any[]) {
  if (!sprint?.data_inicio || !sprint?.data_fim) return []
  const start = new Date(sprint.data_inicio)
  const end = new Date(sprint.data_fim)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const totalTasks = tasks.length
  if (totalDays <= 0 || totalTasks === 0) return []

  const today = new Date()
  const data = []

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dayLabel = `${date.getDate()}/${date.getMonth() + 1}`

    // Linha ideal: diminui linearmente
    const ideal = Math.round(totalTasks - (totalTasks / totalDays) * i)

    // Linha real: conta tasks restantes naquela data (simplificado)
    let real: number | undefined = undefined
    if (date <= today) {
      // Conta tasks que não estão concluídas (simplificação: usa estado atual)
      const remaining = tasks.filter(t => t.status !== "concluida" && t.status !== "concluída").length
      // Simula progresso gradual
      const progress = i / totalDays
      real = Math.round(totalTasks - (totalTasks - remaining) * Math.min(progress * 2, 1))
      if (real < remaining) real = remaining
    }

    data.push({ name: dayLabel, ideal: Math.max(ideal, 0), real })
  }

  return data
}

export function SprintsTab() {
  const { sprints, addSprint, isLoading: loadingSprints } = useSprints()
  const { projects } = useProjetos()
  const { equipe } = useEquipe()

  const [newSprintOpen, setNewSprintOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "", projeto_id: "", objetivo: "", data_inicio: "", data_fim: "",
  })

  const activeSprint = sprints?.find((s: any) => s.status === "ativa") || sprints?.[0]
  const completedSprints = sprints?.filter((s: any) => s.status === "concluida") || []
  const { tasks: sprintTasks, isLoading: loadingTasks } = useTarefas(activeSprint?.id)

  // Progresso da sprint
  const totalTasks = sprintTasks?.length || 0
  const doneTasks = sprintTasks?.filter((t: any) => t.status === "concluida" || t.status === "concluída").length || 0
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  // Membros ativos com contagem de tasks
  const membrosAtivos = useMemo(() => {
    if (!sprintTasks?.length || !equipe?.length) return []
    const countMap = new Map<string, number>()
    sprintTasks.forEach((t: any) => {
      if (t.responsavel_id) {
        countMap.set(t.responsavel_id, (countMap.get(t.responsavel_id) || 0) + 1)
      }
    })
    return equipe
      .filter(m => countMap.has(m.id))
      .map(m => ({ ...m, taskCount: countMap.get(m.id) || 0 }))
  }, [sprintTasks, equipe])

  // Burndown data
  const burndownData = useMemo(() =>
    getBurndownData(activeSprint, sprintTasks || []),
    [activeSprint, sprintTasks]
  )

  const handleCreateSprint = async () => {
    if (!formData.nome || !formData.projeto_id || !formData.data_inicio || !formData.data_fim) return
    await addSprint({ ...formData, status: "ativa" })
    setNewSprintOpen(false)
    setFormData({ nome: "", projeto_id: "", objetivo: "", data_inicio: "", data_fim: "" })
  }

  const handleDeleteSprint = async (id: string) => {
    if (!confirm("Excluir esta sprint permanentemente?")) return
    await supabase.from("sprints").delete().eq("id", id)
    window.location.reload()
  }

  if (loadingSprints || loadingTasks) {
    return <div className="flex items-center justify-center p-20 text-primary">Carregando Sprints...</div>
  }

  return (
    <div className="flex-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Sprints</h1>
          <p className="text-xs text-muted-foreground">Gerenciamento de sprints ativas do projeto</p>
        </div>
        <Dialog open={newSprintOpen} onOpenChange={setNewSprintOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Nova Sprint
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Criar Nova Sprint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-[10px] font-mono uppercase">Nome</Label>
                <Input placeholder="Ex: Sprint 4 — Design System" className="bg-background border-border"
                  value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-[10px] font-mono uppercase">Projeto</Label>
                <Select value={formData.projeto_id} onValueChange={v => setFormData({ ...formData, projeto_id: v })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-[10px] font-mono uppercase">Objetivo</Label>
                <Textarea placeholder="O que queremos entregar..." className="bg-background border-border min-h-[60px]"
                  value={formData.objetivo} onChange={e => setFormData({ ...formData, objetivo: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-[10px] font-mono uppercase">Início</Label>
                  <Input type="date" className="bg-background border-border" value={formData.data_inicio}
                    onChange={e => setFormData({ ...formData, data_inicio: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-[10px] font-mono uppercase">Fim</Label>
                  <Input type="date" className="bg-background border-border" value={formData.data_fim}
                    onChange={e => setFormData({ ...formData, data_fim: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleCreateSprint} className="w-full bg-primary hover:bg-primary/90">Criar Sprint</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!activeSprint ? (
        <div className="text-muted-foreground text-center p-12 bg-card rounded-xl border border-dashed border-border">
          Nenhuma Sprint cadastrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ─── Coluna principal (2/3) ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Sprint Ativa */}
            <Card className="bg-card border-border border-l-4 border-l-primary">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">{activeSprint.nome}</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px]">ATIVA</Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {fmtDate(activeSprint.data_inicio)} — {fmtDate(activeSprint.data_fim)}
                    </span>
                  </div>
                </div>

                {activeSprint.objetivo && (
                  <div className="text-xs text-muted-foreground mb-4 pl-6 border-l-2 border-border">
                    Objetivo: <span className="text-foreground">{activeSprint.objetivo}</span>
                  </div>
                )}

                {/* Progresso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Progresso da Sprint</span>
                    <span className="text-sm font-bold text-foreground">{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{doneTasks} de {totalTasks} tarefas concluídas</p>
                </div>

                {/* Tasks da Sprint */}
                <div className="mb-4">
                  <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Tarefas desta Sprint</h3>
                  <div className="space-y-1">
                    {sprintTasks?.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">Nenhuma tarefa nesta sprint</p>
                    )}
                    {sprintTasks?.map((task: any) => {
                      const isDone = task.status === "concluida" || task.status === "concluída"
                      const assignee = equipe.find(m => m.id === task.responsavel_id)
                      return (
                        <div key={task.id} className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors">
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={`text-xs flex-1 ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {task.titulo}
                          </span>
                          {assignee && (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary flex-shrink-0"
                              title={assignee.nome}>
                              {getInitials(assignee.nome)}
                            </div>
                          )}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isDone ? "bg-green-500" :
                            task.status === "em_revisao" ? "bg-purple-500" :
                            task.status === "em_andamento" || task.status === "em_progresso" ? "bg-yellow-500" :
                            "bg-muted-foreground/30"
                          }`} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Gráfico Burndown */}
                <div>
                  <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Gráfico Burndown</h3>
                  <div className="h-40 bg-background rounded-lg border border-border p-2">
                    {burndownData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={burndownData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#555" }} axisLine={{ stroke: "#222" }} />
                          <YAxis tick={{ fontSize: 9, fill: "#555" }} axisLine={{ stroke: "#222" }} />
                          <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 11 }} />
                          <Line type="monotone" dataKey="ideal" stroke="#333" strokeDasharray="5 5" dot={false} name="Ideal" />
                          <Line type="monotone" dataKey="real" stroke="#FF6B00" strokeWidth={2} dot={{ r: 3, fill: "#FF6B00" }} name="Real" connectNulls={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        <TrendingDown className="w-5 h-5 mr-2 opacity-30" />
                        Sem dados suficientes para o burndown
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Sidebar (1/3) ─── */}
          <div className="space-y-5">
            {/* Histórico de Sprints */}
            <div>
              <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Histórico de Sprints</h2>
              <div className="space-y-2">
                {completedSprints.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4 bg-card rounded-lg border border-border">
                    Nenhuma sprint concluída
                  </p>
                )}
                {completedSprints.map((s: any) => (
                  <Card key={s.id} className="bg-card border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground">{s.nome}</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[8px]">CONCLUÍDA</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {fmtDate(s.data_inicio)} - {fmtDate(s.data_fim)} · 100%
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {sprints?.filter((s: any) => s.status !== "ativa" && s.status !== "concluida").map((s: any) => (
                  <Card key={s.id} className="bg-card border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground">{s.nome}</span>
                        <Badge variant="outline" className="text-[8px] text-muted-foreground">{s.status?.toUpperCase()}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {fmtDate(s.data_inicio)} - {fmtDate(s.data_fim)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Membros Ativos */}
            <div>
              <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Membros Ativos</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-3 space-y-2">
                  {membrosAtivos.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">Sem membros atribuídos</p>
                  )}
                  {membrosAtivos.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                          {getInitials(m.nome)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{m.nome}</p>
                          <p className="text-[9px] text-muted-foreground capitalize">{m.cargo || m.tipo || "Dev"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-primary">{m.taskCount} tasks</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
