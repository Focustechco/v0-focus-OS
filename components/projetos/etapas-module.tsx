"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  Plus, Check, Edit2, ChevronDown, Clock, User, Calendar,
  CheckSquare, Square, Loader2, X, AlertTriangle, ExternalLink
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import useSWR from "swr"

/* ─── Types ─── */
interface Stage {
  id: string
  project_id: string
  name: string
  description?: string
  status: "done" | "active" | "pending" | "blocked"
  responsible_id?: string
  due_date?: string
  order_index: number
  created_at: string
  updated_at: string
  tasks?: StageTask[]
}

interface StageTask {
  id: string
  titulo: string
  status: string
  responsavel_id?: string
}

/* ─── Status Config ─── */
const statusCfg: Record<string, { color: string; border: string; bg: string; label: string }> = {
  done:    { color: "#97C459", border: "#639922", bg: "rgba(151,196,89,0.1)", label: "Concluída" },
  active:  { color: "#e87c2a", border: "#e87c2a", bg: "rgba(232,124,42,0.1)", label: "Em andamento" },
  pending: { color: "#555",    border: "#333",    bg: "rgba(26,26,26,0.5)",   label: "Pendente" },
  blocked: { color: "#F09595", border: "#993C1D", bg: "rgba(240,149,149,0.1)", label: "Bloqueada" },
}

/* ─── Helpers ─── */
function getInitials(nome: string) {
  return nome?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"
}
function fmtDate(d: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}
function isOverdue(d: string) {
  if (!d) return false
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return new Date(d) < today
}

/* ═══════════════════════════════════════════
   HOOK: useProjectStages
   ═══════════════════════════════════════════ */
function useProjectStages(projectId: string | null) {
  const fetcher = async () => {
    if (!projectId) return []
    const { data, error } = await supabase
      .from("project_stages")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true })
    if (error) throw error

    // Fetch tasks linked to stages via stage_id
    const stagesWithTasks = await Promise.all(
      (data || []).map(async (s: any) => {
        const { data: tasks } = await supabase
          .from("tarefas")
          .select("id, titulo, status, responsavel_id")
          .eq("stage_id", s.id)
        return { ...s, tasks: tasks || [] }
      })
    )
    return stagesWithTasks as Stage[]
  }

  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `project-stages-${projectId}` : null, fetcher
  )

  useEffect(() => {
    if (!projectId) return
    const ch = supabase.channel(`stages_rt_${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "project_stages", filter: `project_id=eq.${projectId}` }, () => mutate())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [projectId, mutate])

  return { stages: (data || []) as Stage[], isLoading, error, mutate }
}

/* ═══════════════════════════════════════════
   MAIN MODULE
   ═══════════════════════════════════════════ */
export function EtapasModule() {
  const { projects, isLoading: projLoading } = useProjetos()
  const { equipe } = useEquipe()

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [activeStageId, setActiveStageId] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<Stage | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formStatus, setFormStatus] = useState<string>("pending")
  const [formResponsible, setFormResponsible] = useState("")
  const [formDueDate, setFormDueDate] = useState("")

  const pipelineRef = useRef<HTMLDivElement>(null)

  // Auto-select first project
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const { stages, isLoading: stagesLoading, mutate } = useProjectStages(selectedProjectId)

  // Auto-select first stage
  useEffect(() => {
    if (stages.length > 0 && !activeStageId) {
      setActiveStageId(stages[0].id)
    }
  }, [stages, activeStageId])

  // Reset on project change
  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id)
    setActiveStageId(null)
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const activeStage = stages.find(s => s.id === activeStageId)

  // Progress
  const doneCount = stages.filter(s => s.status === "done").length
  const progressPct = stages.length > 0 ? Math.round((doneCount / stages.length) * 100) : 0

  /* ─── CRUD ─── */
  const handleAddStage = async () => {
    if (!selectedProjectId) return
    const name = prompt("Nome da nova etapa:")
    if (!name?.trim()) return

    const { data, error } = await supabase.from("project_stages").insert({
      project_id: selectedProjectId,
      name: name.trim(),
      status: "pending",
      order_index: stages.length + 1,
    }).select().single()

    if (error) { toast.error("Erro ao criar etapa"); return }
    toast.success("Etapa criada!")
    mutate()
    if (data) {
      setActiveStageId(data.id)
      openEditModal(data as Stage)
    }
  }

  const openEditModal = (stage: Stage) => {
    setEditingStage(stage)
    setFormName(stage.name || "")
    setFormDesc(stage.description || "")
    setFormStatus(stage.status || "pending")
    setFormResponsible(stage.responsible_id || "")
    setFormDueDate(stage.due_date || "")
    setEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!editingStage) return
    setSaving(true)
    try {
      const oldStatus = editingStage.status
      const { error } = await supabase.from("project_stages").update({
        name: formName,
        description: formDesc,
        status: formStatus,
        responsible_id: formResponsible || null,
        due_date: formDueDate || null,
        updated_at: new Date().toISOString(),
      }).eq("id", editingStage.id)

      if (error) throw error

      // Notification: blocked
      if (formStatus === "blocked" && oldStatus !== "blocked") {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await fetch("/api/notifications/dispatch", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: formResponsible || user.id,
                eventType: "task_status_changed",
                data: { title: "Etapa bloqueada ⚠️", message: `"${formName}" foi marcada como bloqueada`, ref_type: "projetos", ref_id: selectedProjectId }
              })
            })
          }
        } catch {}
      }

      toast.success("Etapa salva!")
      setEditModalOpen(false)
      mutate()
    } catch (e: any) {
      toast.error("Erro: " + e.message)
    } finally { setSaving(false) }
  }

  const handleDeleteStage = async () => {
    if (!editingStage) return
    if (!confirm(`Excluir etapa "${editingStage.name}"?`)) return
    await supabase.from("project_stages").delete().eq("id", editingStage.id)
    setEditModalOpen(false)
    setActiveStageId(null)
    mutate()
    toast.success("Etapa removida")
  }

  /* ─── Render helpers ─── */
  const inputCls = "w-full bg-[#111] border border-[#333] rounded-lg px-3 py-[9px] text-[13px] text-[#e0e0e0] placeholder:text-[#444] outline-none focus:border-[#e87c2a] transition-colors"
  const labelCls = "text-[11px] text-[#555] uppercase tracking-wider mb-[5px] block"
  const selectCls = cn(inputCls, "appearance-none cursor-pointer pr-7")

  if (projLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#e87c2a]" /></div>

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Fluxo de Etapas</h1>
          <p className="text-[13px] text-[#555] mt-0.5">Acompanhe todas as etapas do projeto em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddStage} className="bg-[#e87c2a] hover:bg-[#ff8e3e] text-white rounded-lg h-9 px-4 text-[12px] font-semibold gap-1.5">
            <Plus className="w-4 h-4" /> Nova Etapa
          </Button>
        </div>
      </div>

      {/* ── PROJECT SELECTOR + BADGES ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#555] uppercase tracking-wider">Projeto:</span>
          <div className="relative">
            <select
              value={selectedProjectId || ""}
              onChange={e => handleProjectChange(e.target.value)}
              className={cn(selectCls, "min-w-[240px]")}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nome || p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555] pointer-events-none" />
          </div>
        </div>
        {selectedProject && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#e87c2a]/10 text-[#e87c2a] border border-[#e87c2a]/30">
              {selectedProject.status === "concluido" ? "Concluído" : selectedProject.status === "pausado" ? "Pausado" : "Em andamento"}
            </span>
            {selectedProject.prazo && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1a1a2e] text-[#AFA9EC] border border-[#534AB7]/30">
                Prazo: {fmtDate(selectedProject.prazo)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-[#555] uppercase tracking-wider whitespace-nowrap">Progresso geral</span>
        <div className="flex-1 h-[6px] bg-[#1e1e1e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: progressPct === 100 ? "#97C459" : "#e87c2a" }}
          />
        </div>
        <span className="text-[13px] font-bold" style={{ color: progressPct === 100 ? "#97C459" : "#e87c2a" }}>
          {progressPct}%
        </span>
      </div>

      {/* ── PIPELINE HORIZONTAL ── */}
      {stagesLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#555]" /></div>
      ) : stages.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-[#333] rounded-xl">
          <p className="text-[#555] text-sm mb-3">Nenhuma etapa criada para este projeto.</p>
          <Button onClick={handleAddStage} variant="outline" className="border-[#333] text-[#888] hover:text-white hover:border-[#555] gap-1.5">
            <Plus className="w-4 h-4" /> Criar primeira etapa
          </Button>
        </div>
      ) : (
        <div ref={pipelineRef} className="overflow-x-auto pb-2 scrollbar-thin" style={{ scrollbarColor: "#333 transparent" }}>
          <div className="flex items-center gap-0 min-w-max px-2 py-4">
            {stages.map((stage, i) => {
              const cfg = statusCfg[stage.status] || statusCfg.pending
              const isActive = stage.id === activeStageId
              const prevStage = i > 0 ? stages[i - 1] : null
              const lineColor = prevStage?.status === "done" ? "#639922" : prevStage?.status === "blocked" ? "#993C1D" : "#2a2a2a"

              return (
                <div key={stage.id} className="flex items-center">
                  {/* Connector line */}
                  {i > 0 && <div className="w-8 sm:w-12 h-[2px] flex-shrink-0" style={{ background: lineColor }} />}

                  {/* Stage node */}
                  <button
                    onClick={() => setActiveStageId(stage.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 px-3 py-2 rounded-lg transition-all min-w-[80px] sm:min-w-[100px]",
                      isActive ? "bg-[#1a1a1a]" : "hover:bg-[#161616]"
                    )}
                  >
                    {/* Circle */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all"
                      style={{
                        background: cfg.bg,
                        borderColor: cfg.border,
                        color: cfg.color,
                        boxShadow: isActive ? `0 0 0 3px rgba(232,124,42,0.2)` : "none",
                      }}
                    >
                      {stage.status === "done" ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    {/* Label */}
                    <span className={cn(
                      "text-[10px] sm:text-[11px] font-medium text-center leading-tight max-w-[90px] truncate",
                      isActive ? "text-white" : "text-[#888]"
                    )}>
                      {stage.name}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── DETAIL PANEL ── */}
      {activeStage && <StageDetailPanel stage={activeStage} equipe={equipe} onEdit={() => openEditModal(activeStage)} />}

      {/* ── EDIT MODAL ── */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-foreground sm:max-w-[450px] p-0">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-[15px] font-bold text-white">Editar Etapa</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 space-y-4">
            <div>
              <Label className={labelCls}>Nome da etapa</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} className={inputCls} placeholder="Ex: Design UI" />
            </div>
            <div>
              <Label className={labelCls}>Status</Label>
              <div className="relative">
                <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className={selectCls}>
                  <option value="pending">Pendente</option>
                  <option value="active">Em andamento</option>
                  <option value="done">Concluída</option>
                  <option value="blocked">Bloqueada</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555] pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelCls}>Responsável</Label>
                <div className="relative">
                  <select value={formResponsible} onChange={e => setFormResponsible(e.target.value)} className={selectCls}>
                    <option value="">Nenhum</option>
                    {equipe?.map((m: any) => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555] pointer-events-none" />
                </div>
              </div>
              <div>
                <Label className={labelCls}>Prazo</Label>
                <Input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className={cn(inputCls, "[color-scheme:dark]")} />
              </div>
            </div>
            <div>
              <Label className={labelCls}>Descrição</Label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Descreva a etapa..." className={cn(inputCls, "h-[72px] resize-none")} />
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#222]">
            <button onClick={handleDeleteStage} className="text-[12px] text-red-400 hover:text-red-300 transition-colors">Excluir etapa</button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setEditModalOpen(false)} className="h-8 px-3 text-[12px] bg-[#1e1e1e] border border-[#333] text-[#888] hover:text-white">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !formName.trim()} className="h-8 px-5 text-[12px] font-semibold bg-[#e87c2a] hover:bg-[#ff8e3e] text-white">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STAGE DETAIL PANEL
   ═══════════════════════════════════════════ */
function StageDetailPanel({ stage, equipe, onEdit }: { stage: Stage; equipe: any[]; onEdit: () => void }) {
  const cfg = statusCfg[stage.status] || statusCfg.pending
  const responsible = equipe?.find(e => e.id === stage.responsible_id)
  const tasks = stage.tasks || []
  const doneTasks = tasks.filter(t => t.status === "concluida").length
  const taskPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0
  const overdue = stage.due_date ? isOverdue(stage.due_date) && stage.status !== "done" : false

  return (
    <div className="bg-[#161616] border border-[#222] rounded-[10px] p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2"
            style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
          >
            {stage.status === "done" ? <Check className="w-4 h-4" /> : stage.order_index}
          </span>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-white truncate">{stage.name}</h3>
            {stage.description && <p className="text-[12px] text-[#666] mt-0.5 truncate">{stage.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold border" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
            {cfg.label}
          </span>
          <Button onClick={onEdit} variant="ghost" className="h-8 px-3 text-[12px] bg-[#1e1e1e] border border-[#333] text-[#888] hover:text-white gap-1">
            <Edit2 className="w-3 h-3" /> Editar
          </Button>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetaItem icon={<User className="w-3.5 h-3.5" />} label="Responsável" value={responsible?.nome || "—"} />
        <MetaItem
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="Prazo"
          value={stage.due_date ? fmtDate(stage.due_date) : "—"}
          valueColor={overdue ? "#F09595" : stage.status === "done" ? "#97C459" : "#ccc"}
        />
        <MetaItem
          icon={<CheckSquare className="w-3.5 h-3.5" />}
          label="Tasks"
          value={`${doneTasks}/${tasks.length} concluídas`}
          valueColor={taskPct === 100 ? "#97C459" : taskPct > 0 ? "#EF9F27" : "#ccc"}
        />
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-[#555]" />
            <span className="text-[11px] text-[#555] uppercase tracking-wider">Progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-[4px] bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{
                width: `${taskPct}%`,
                background: taskPct === 100 ? "#97C459" : taskPct >= 50 ? "#EF9F27" : "#F09595"
              }} />
            </div>
            <span className="text-[11px] font-bold" style={{ color: taskPct === 100 ? "#97C459" : "#ccc" }}>{isNaN(taskPct) ? 0 : taskPct}%</span>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length > 0 && (
        <div>
          <h4 className="text-[11px] text-[#555] uppercase tracking-wider mb-2">Tasks desta etapa</h4>
          <div className="space-y-1">
            {tasks.map(t => {
              const isDone = t.status === "concluida"
              const assignee = equipe?.find(e => e.id === t.responsavel_id)
              return (
                <div key={t.id} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-[#1e1e1e] transition-colors group">
                  {isDone
                    ? <CheckSquare className="w-4 h-4 text-[#97C459] flex-shrink-0" />
                    : <Square className="w-4 h-4 text-[#555] flex-shrink-0" />
                  }
                  <span className={cn("text-[12px] flex-1 truncate", isDone ? "line-through text-[#555]" : "text-[#ccc]")}>
                    {t.titulo}
                  </span>
                  {assignee && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                      style={{ background: assignee.cor_avatar || "#e87c2a" }}
                      title={assignee.nome}
                    >
                      {getInitials(assignee.nome)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-[12px] text-[#444] italic text-center py-3">Nenhuma task vinculada a esta etapa.</p>
      )}
    </div>
  )
}

/* ─── MetaItem ─── */
function MetaItem({ icon, label, value, valueColor = "#ccc" }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[#555]">{icon}</span>
        <span className="text-[11px] text-[#555] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-[12px] font-medium" style={{ color: valueColor }}>{value}</span>
    </div>
  )
}
