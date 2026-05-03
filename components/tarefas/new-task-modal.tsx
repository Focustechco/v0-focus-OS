"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  X, ChevronDown, Plus, Clock, Calendar, Bell,
  CheckSquare, Square, Tag, Loader2, Trash2
} from "lucide-react"

/* ── Priority Config ── */
const prioConfig = {
  alta:  { bg: "bg-[#2e1010]", text: "text-[#F09595]", border: "border-[#993C1D]", bar: "#F09595" },
  media: { bg: "bg-[#2e2010]", text: "text-[#EF9F27]", border: "border-[#BA7517]", bar: "#EF9F27" },
  baixa: { bg: "bg-[#0d2010]", text: "text-[#97C459]", border: "border-[#3B6D11]", bar: "#97C459" },
}
const prioInactive = "bg-[#111] text-[#666] border-[#333]"

/* ── Interfaces ── */
interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  equipe: any[]
  projects: any[]
  editTask?: any | null
  isEditMode?: boolean
}

export function NewTaskModal({ isOpen, onClose, onSave, equipe, projects, editTask, isEditMode = false }: NewTaskModalProps) {
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [prioridade, setPrioridade] = useState<"alta" | "media" | "baixa">("media")
  const [status, setStatus] = useState("a_fazer")
  const [projetoId, setProjetoId] = useState("")
  const [responsavelId, setResponsavelId] = useState("")
  const [prazo, setPrazo] = useState("")
  const [tempoEstimado, setTempoEstimado] = useState("")
  const [checklist, setChecklist] = useState<string[]>([])
  const [newCheckItem, setNewCheckItem] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shakeTitle, setShakeTitle] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && editTask) {
      setTitulo(editTask.titulo || "")
      setDescricao(editTask.descricao || "")
      setPrioridade(editTask.prioridade || "media")
      setStatus(editTask.status || "a_fazer")
      setProjetoId(editTask.projeto_id || "")
      setResponsavelId(editTask.responsavel_id || "")
      setPrazo(editTask.prazo || "")
      setTempoEstimado(editTask.tempo_estimado?.toString() || "")
      setChecklist(editTask.checklist_items ? editTask.checklist_items.map((i: any) => i.title) : [])
      setTags([])
    } else if (!isEditMode) {
      resetForm()
    }
  }, [isEditMode, editTask, isOpen])

  // Animate open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setAnimating(true))
    } else {
      setAnimating(false)
    }
  }, [isOpen])

  const resetForm = () => {
    setTitulo(""); setDescricao(""); setPrioridade("media"); setStatus("a_fazer")
    setProjetoId(""); setResponsavelId(""); setPrazo(""); setTempoEstimado("")
    setChecklist([]); setTags([]); setNewCheckItem(""); setNewTag("")
    setChecklistOpen(false); setTagsOpen(false)
  }

  const handleClose = () => {
    setAnimating(false)
    setTimeout(onClose, 200)
  }

  const addCheckItem = () => {
    if (newCheckItem.trim()) {
      setChecklist([...checklist, newCheckItem.trim()])
      setNewCheckItem("")
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleCreate = async () => {
    if (!titulo.trim()) {
      setShakeTitle(true)
      setTimeout(() => setShakeTitle(false), 600)
      return
    }
    setSaving(true)
    try {
      await onSave({
        id: editTask?.id,
        titulo: titulo.trim(),
        descricao,
        prioridade,
        status,
        projeto_id: projetoId || null,
        responsavel_id: responsavelId || null,
        prazo: prazo || null,
        tempo_estimado: tempoEstimado ? parseInt(tempoEstimado) : null,
        checklist,
        tags,
      })
      resetForm()
      handleClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const assignee = equipe?.find(e => e.id === responsavelId)
  const selectedProject = projects?.find(p => p.id === projetoId)
  const prio = prioConfig[prioridade]
  const tempoLabel = tempoEstimado ? `${Math.floor(Number(tempoEstimado) / 60)}h ${Number(tempoEstimado) % 60}min` : ""

  if (!isOpen) return null

  /* ── Shared input classes ── */
  const inputCls = "w-full bg-[#111] border border-[#333] rounded-lg px-3 py-[9px] text-[13px] text-[#e0e0e0] placeholder:text-[#444] outline-none focus:border-[#e87c2a] transition-colors"
  const labelCls = "text-[11px] text-[#666] uppercase tracking-wider mb-[5px] block"
  const selectCls = cn(inputCls, "appearance-none cursor-pointer pr-7")

  /* ── Expandable section ── */
  const ExpandSection = ({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-2 border-t border-[#222] group cursor-pointer">
        <span className="text-[11px] text-[#666] uppercase tracking-wider flex items-center gap-1.5">
          <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", open && "rotate-180")} />
          {label}
        </span>
      </button>
      <div style={{ transition: "max-height 0.25s ease, opacity 0.2s ease" }} className={cn("overflow-hidden", open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0")}>
        {children}
      </div>
    </div>
  )

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className={cn("fixed inset-0 z-[100] bg-black/70 transition-opacity duration-200", animating ? "opacity-100" : "opacity-0")}
      />

      {/* Modal */}
      <div className={cn(
        "fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
      )}>
        <div
          className={cn(
            "bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto transition-all duration-[250ms]",
            animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          )}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#222] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e87c2a]/10 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-[#e87c2a]" />
              </div>
              <h2 className="text-[15px] font-semibold text-white">{isEditMode ? "Editar Task" : "Nova Task"}</h2>
            </div>
            <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[#252525] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Body (scrollable) ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#444 #2a2a2a" }}>

            {/* Título */}
            <div>
              <label className={labelCls}>Título <span className="text-[#e87c2a]">*</span></label>
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Implementar autenticação OAuth..."
                className={cn(inputCls, shakeTitle && "border-red-500 animate-[shake_0.3s_ease-in-out_2]", !titulo.trim() && shakeTitle && "border-red-500")}
              />
            </div>

            {/* Descrição */}
            <div>
              <label className={labelCls}>Descrição</label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Descreva o que precisa ser feito..."
                className={cn(inputCls, "h-[72px] resize-none")}
              />
            </div>

            {/* Prioridade — 3 toggle buttons */}
            <div>
              <label className={labelCls}>Prioridade</label>
              <div className="grid grid-cols-3 gap-2">
                {(["alta", "media", "baixa"] as const).map(p => {
                  const active = prioridade === p
                  const cfg = prioConfig[p]
                  return (
                    <button
                      key={p}
                      onClick={() => setPrioridade(p)}
                      className={cn(
                        "py-2 rounded-lg text-[12px] font-semibold border transition-all",
                        active ? cn(cfg.bg, cfg.text, cfg.border) : prioInactive
                      )}
                    >
                      {p === "alta" ? "Alta" : p === "media" ? "Média" : "Baixa"}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status + Projeto (2 cols) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Status inicial</label>
                <div className="relative">
                  <select value={status} onChange={e => setStatus(e.target.value)} className={selectCls}>
                    <option value="a_fazer">Pendente</option>
                    <option value="em_progresso">Em Progresso</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Projeto / Cliente</label>
                <div className="relative">
                  <select value={projetoId} onChange={e => setProjetoId(e.target.value)} className={selectCls}>
                    <option value="">Nenhum</option>
                    {projects?.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Atribuído + Vencimento (2 cols) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}><span className="inline-flex items-center gap-1">👤 Atribuído a</span></label>
                <div className="relative">
                  <select value={responsavelId} onChange={e => setResponsavelId(e.target.value)} className={selectCls}>
                    <option value="">Nenhum</option>
                    {equipe?.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555] pointer-events-none" />
                </div>
                {/* Notification hint */}
                {assignee && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[#e87c2a]">
                    <Bell className="w-3 h-3" />
                    <span>{assignee.nome} será notificado ao criar esta task</span>
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}><span className="inline-flex items-center gap-1">📅 Vencimento</span></label>
                <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} className={cn(inputCls, "[color-scheme:dark]")} />
              </div>
            </div>

            {/* Tempo estimado */}
            <div>
              <label className={labelCls}><span className="inline-flex items-center gap-1">⏱ Tempo estimado (min)</span></label>
              <input type="number" step={15} value={tempoEstimado} onChange={e => setTempoEstimado(e.target.value)} placeholder="Ex: 60" className={inputCls} />
            </div>

            {/* ── Checklist (expandable) ── */}
            <ExpandSection label="Checklist (opcional)" open={checklistOpen} onToggle={() => setChecklistOpen(!checklistOpen)}>
              <div className="space-y-2 pb-3">
                <div className="flex gap-2">
                  <input
                    value={newCheckItem}
                    onChange={e => setNewCheckItem(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCheckItem()}
                    placeholder="Item do checklist..."
                    className={cn(inputCls, "flex-1")}
                  />
                  <button onClick={addCheckItem} className="px-3 py-2 bg-[#252525] border border-[#333] rounded-lg text-[11px] text-[#888] hover:text-white hover:border-[#555] transition-colors flex-shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-1 py-1">
                    <Square className="w-4 h-4 text-[#555] flex-shrink-0" />
                    <span className="text-[12px] text-[#ccc] flex-1">{item}</span>
                    <button onClick={() => setChecklist(checklist.filter((_, j) => j !== i))} className="text-[#555] hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </ExpandSection>

            {/* ── Tags (expandable) ── */}
            <ExpandSection label="Tags (opcional)" open={tagsOpen} onToggle={() => setTagsOpen(!tagsOpen)}>
              <div className="space-y-2 pb-3">
                <div className="flex gap-2">
                  <input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addTag()}
                    placeholder="Nova tag..."
                    className={cn(inputCls, "flex-1")}
                  />
                  <button onClick={addTag} className="px-3 py-2 bg-[#252525] border border-[#333] rounded-lg text-[11px] text-[#888] hover:text-white hover:border-[#555] transition-colors flex-shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[10px] font-medium bg-[#1a1a2e] text-[#AFA9EC] border border-[#534AB7]">
                      {tag}
                      <button onClick={() => setTags(tags.filter((_, j) => j !== i))} className="hover:text-white transition-colors"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </ExpandSection>

            {/* ── Preview do card (live) ── */}
            <ExpandSection label="Preview do card" open={previewOpen} onToggle={() => setPreviewOpen(!previewOpen)}>
              <div className="pb-3">
                <div className="relative rounded-[10px] border border-[#2a2a2a] overflow-hidden" style={{ background: "#1e1e1e" }}>
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[10px]" style={{ background: prio.bar }} />
                  <div className="pl-4 pr-3.5 py-3">
                    <h4 className="text-[13px] font-medium text-white leading-snug mb-1 truncate">{titulo || "Título da task..."}</h4>
                    {descricao && <p className="text-[11px] text-[#666] truncate mb-2">{descricao}</p>}
                    {selectedProject && (
                      <div className="mb-2">
                        <span className="px-2 py-[2px] rounded-[5px] text-[10px] font-medium bg-[#1a1a2e] text-[#AFA9EC] border-[0.5px] border-[#534AB7]">{selectedProject.nome}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[#555]">
                      <span className={cn("px-2 py-0.5 rounded-[5px] text-[10px] font-bold border", prio.bg, prio.text, prio.border)}>{prioridade === "alta" ? "Alta" : prioridade === "media" ? "Média" : "Baixa"}</span>
                      {tempoEstimado && <span className="flex items-center gap-0.5 text-[10px]"><Clock className="w-3 h-3" />{tempoLabel}</span>}
                      {prazo && <span className="flex items-center gap-0.5 text-[10px]"><Calendar className="w-3 h-3" />{new Date(prazo).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>}
                      {checklist.length > 0 && <span className="text-[10px]">☑ 0/{checklist.length}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </ExpandSection>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#222] flex-shrink-0">
            <div className="min-w-0">
              {assignee ? (
                <div className="flex items-center gap-1.5 text-[11px] text-[#e87c2a]">
                  <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{assignee.nome} receberá uma notificação</span>
                </div>
              ) : <div />}
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button onClick={handleClose} className="px-4 py-2 bg-[#1e1e1e] border border-[#333] rounded-lg text-[12px] text-[#888] hover:text-white hover:border-[#555] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-5 py-2 bg-[#e87c2a] rounded-lg text-[12px] font-semibold text-white hover:bg-[#ff8e3e] disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {isEditMode ? "Salvar" : "Criar Task"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </>
  )
}
