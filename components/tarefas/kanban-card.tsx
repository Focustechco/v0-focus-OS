"use client"

import { useState, useEffect } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  Calendar, Clock, Edit2, Trash2, ChevronDown, ChevronUp,
  CheckSquare, Square, MessageCircle, AlertTriangle,
  User, FolderKanban, Loader2, Send
} from "lucide-react"

/* ── configs ── */
const priorityConfig: Record<string, { bar: string; bg: string; text: string; border: string; label: string }> = {
  alta:  { bar: "#F09595", bg: "bg-[#2e1010]", text: "text-[#F09595]", border: "border-[#993C1D]", label: "Alta" },
  media: { bar: "#EF9F27", bg: "bg-[#2e2010]", text: "text-[#EF9F27]", border: "border-[#BA7517]", label: "Média" },
  baixa: { bar: "#97C459", bg: "bg-[#0d2010]", text: "text-[#97C459]", border: "border-[#3B6D11]", label: "Baixa" },
}

const statusLabels: Record<string, string> = {
  a_fazer: "Pendente", em_progresso: "Em Progresso", em_andamento: "Em Progresso",
  em_revisao: "Em Revisão", concluida: "Concluída",
}

/* ── helpers ── */
function getInitials(nome: string) {
  return nome?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"
}
function fmtDate(d: string) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.round(diff / 60000)
  if (min < 1) return "agora"
  if (min < 60) return `há ${min} min`
  const hr = Math.round(min / 60)
  if (hr < 24) return `há ${hr}h`
  const d = Math.round(hr / 24)
  return d === 1 ? "há 1 dia" : `há ${d} dias`
}
function getDueBadge(prazo: string | null) {
  if (!prazo) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(prazo); due.setHours(0, 0, 0, 0)
  const diff = due.getTime() - today.getTime()
  if (diff < 0) return { label: "Vencida", cls: "bg-[#2a1010] text-[#F09595] border-[#993C1D]/40" }
  if (diff === 0) return { label: "Hoje", cls: "bg-[#2a1e00] text-[#EF9F27] border-[#BA7517]/40" }
  return null
}

/* ── types ── */
interface KanbanCardProps {
  task: any
  index: number
  equipe: any[]
  projects: any[]
  onEdit: (t: any) => void
  onDelete: (id: string, e: React.MouseEvent) => void
  onMutate: () => void
  onMoveTask: (id: string, newStatus: string) => void
  onAssignTask: (id: string, userId: string) => void
}

/* ══════════════════════════════════════════════
   KANBAN CARD
   ══════════════════════════════════════════════ */
export function KanbanCard({ task: t, index, equipe, projects, onEdit, onDelete, onMutate, onMoveTask, onAssignTask }: KanbanCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [sendingComment, setSendingComment] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  const prio = priorityConfig[t.prioridade] || priorityConfig.media
  const assignee = equipe?.find(e => e.id === t.responsavel_id)
  const project = projects?.find((p: any) => p.id === t.projeto_id)
  const checklist = t.checklist_items || []
  const checkDone = checklist.filter((i: any) => i.is_done).length
  const checkTotal = checklist.length
  const dueBadge = getDueBadge(t.prazo)

  // Load comments on expand
  useEffect(() => {
    if (expanded && comments.length === 0) {
      setLoadingComments(true)
      supabase.from("task_comments").select("*, equipe(nome, foto_url, cor_avatar)")
        .eq("tarefa_id", t.id).order("created_at", { ascending: false }).limit(10)
        .then(({ data }) => { setComments(data || []); setLoadingComments(false) })
        .catch(() => setLoadingComments(false))
    }
  }, [expanded, t.id])

  const toggleSubtask = async (itemId: string, done: boolean) => {
    setToggling(itemId)
    try {
      await supabase.from("checklist_items").update({ is_done: !done }).eq("id", itemId)
      onMutate()
    } finally { setToggling(null) }
  }

  const addComment = async () => {
    if (!comment.trim()) return
    setSendingComment(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const member = equipe?.find(e => e.email === user.email)
      await supabase.from("task_comments").insert({ tarefa_id: t.id, user_id: member?.id || user.id, content: comment.trim() })
      
      // Notificar o dono da task se quem comentou não for o dono
      if (t.responsavel_id && (member?.id || user.id) !== t.responsavel_id) {
        try {
          await fetch('/api/notifications/dispatch', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: t.responsavel_id,
              triggeredBy: member?.id || user.id,
              eventType: 'task_status_changed', // Usar um tipo genérico ou criar um novo
              data: {
                title: 'Novo comentário na sua task',
                message: `${member?.nome || 'Alguém'} comentou: "${comment.trim()}"`,
                ref_type: 'tarefas',
                ref_id: t.id,
                ref_title: t.titulo
              }
            })
          })
        } catch (e) {
          console.error("Erro ao notificar comentário:", e)
        }
      }

      setComment("")
      const { data } = await supabase.from("task_comments").select("*, equipe(nome, foto_url, cor_avatar)")
        .eq("tarefa_id", t.id).order("created_at", { ascending: false }).limit(10)
      setComments(data || [])
    } finally { setSendingComment(false) }
  }

  /* ── Render: Section divider ── */
  const Divider = ({ label }: { label: string }) => (
    <div className="relative flex items-center my-3">
      <div className="flex-1 h-[0.5px] bg-[#2a2a2a]" />
      <span className="px-2.5 text-[10px] text-[#444] uppercase tracking-[0.08em] font-medium bg-[#1e1e1e]">{label}</span>
      <div className="flex-1 h-[0.5px] bg-[#2a2a2a]" />
    </div>
  )

  /* ── Render: Avatar ── */
  const Avatar = ({ user: u, size = 24 }: { user: any; size?: number }) => (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0 border border-[#2a2a2a]"
      style={{ width: size, height: size, fontSize: size * 0.38, background: u?.cor_avatar || "#e87c2a" }}
      title={u?.nome}
    >
      {u?.foto_url ? <img src={u.foto_url} alt="" className="w-full h-full object-cover" /> : getInitials(u?.nome || "?")}
    </div>
  )

  return (
    <Draggable draggableId={t.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
          className={cn(
            "relative rounded-[10px] border-[0.5px] border-[#2a2a2a] group select-none",
            "flex flex-col w-full",
            "hover:border-[#444] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
            "transition-[border-color,box-shadow] duration-200",
            snapshot.isDragging && "opacity-70 shadow-2xl scale-[1.02]"
          )}
          style={{ ...provided.draggableProps.style, background: "#1e1e1e" }}
        >
          {/* ─ Priority left bar ─ */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[10px]" style={{ background: prio.bar }} />

          {/* ════════════════════════════════
              COLLAPSED CARD (always visible)
              ════════════════════════════════ */}
          <div className="pl-4 pr-3.5 pt-3.5 pb-3 w-full overflow-hidden">
            {/* Row 1: Title + action icons */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="text-[13px] font-semibold text-white leading-snug line-clamp-2 flex-1">{t.titulo}</h4>
              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); onEdit(t) }} className="w-6 h-6 rounded flex items-center justify-center text-[#555] hover:text-white hover:bg-[#2a2a2a] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={e => onDelete(t.id, e)} className="w-6 h-6 rounded flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-[#2a2a2a] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Row 2: Description (1 line) */}
            {t.descricao && <p className="text-[11px] text-[#666] truncate leading-relaxed mb-2">{t.descricao}</p>}

            {/* Row 3: Tags */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
              {project && (
                <span className="px-2 py-[2px] rounded-[5px] text-[10px] font-medium bg-[#1a1a2e] text-[#AFA9EC] border-[0.5px] border-[#534AB7]">
                  {project.nome}
                </span>
              )}
              {dueBadge && (
                <span className={cn("px-2 py-[2px] rounded-[5px] text-[9px] font-bold border-[0.5px]", dueBadge.cls)}>
                  {dueBadge.label}
                </span>
              )}
            </div>

            {/* Row 4: Priority badge + meta icons + avatar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#555] flex-wrap">
                <span className={cn("px-2 py-0.5 rounded-[5px] text-[10px] font-bold border", prio.bg, prio.text, prio.border)}>{prio.label}</span>
                <span className="flex items-center gap-0.5 text-[10px]"><Clock className="w-3 h-3" />{t.tempo_estimado ? `${t.tempo_estimado}h` : "1h"}</span>
                <span className="flex items-center gap-0.5 text-[10px]"><Calendar className="w-3 h-3" />{t.prazo ? fmtDate(t.prazo) : "—"}</span>
                {checkTotal > 0 && <span className="flex items-center gap-0.5 text-[10px]">~{checkDone}/{checkTotal}</span>}
                {comments.length > 0 && <span className="flex items-center gap-0.5 text-[10px]"><MessageCircle className="w-3 h-3" />{comments.length}</span>}
              </div>
              {assignee && <Avatar user={assignee} size={26} />}
            </div>

            {/* Row 5: Expand / Collapse button */}
            <div className="flex justify-center mt-3">
              <button
                onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] text-[#888] hover:text-white bg-[#161616] hover:bg-[#222] border border-[#2a2a2a] hover:border-[#444] transition-all cursor-pointer"
              >
                {expanded ? "Recolher" : "Ver detalhes"}
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* ════════════════════════════════
              EXPANDED DETAILS
              ════════════════════════════════ */}
          <div
            style={{ transition: "max-height 0.3s ease, opacity 0.25s ease" }}
            className={cn("overflow-hidden w-full", expanded ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0")}
          >
            <div className="px-4 pb-4 pt-1">
              {/* ── DETALHES ── */}
              <Divider label="Detalhes" />

              {t.descricao && (
                <p className="text-[12px] text-[#888] leading-relaxed whitespace-pre-wrap mb-3">{t.descricao}</p>
              )}

              {/* Metadata rows */}
              <div className="space-y-2">
                {assignee && (
                  <div className="flex items-center gap-2.5">
                    <User className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
                    <span className="text-[11px] text-[#555] w-[85px] flex-shrink-0">Atribuído a</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Avatar user={assignee} size={18} />
                      <span className="text-[12px] text-[#ccc] font-medium truncate">{assignee.nome}</span>
                    </div>
                  </div>
                )}
                {project && (
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
                    <span className="text-[11px] text-[#555] w-[85px] flex-shrink-0">Projeto</span>
                    <span className="text-[12px] text-[#ccc] truncate">{project.nome}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
                  <span className="text-[11px] text-[#555] w-[85px] flex-shrink-0">Tempo est.</span>
                  <span className="text-[12px] text-[#ccc]">{t.tempo_estimado ? `${t.tempo_estimado}h` : "—"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-3.5 h-3.5 text-[#555] flex-shrink-0" />
                  <span className="text-[11px] text-[#555] w-[85px] flex-shrink-0">Vencimento</span>
                  <span className={cn("text-[12px]", dueBadge?.label === "Vencida" ? "text-[#F09595]" : dueBadge?.label === "Hoje" ? "text-[#EF9F27]" : "text-[#ccc]")}>
                    {t.prazo ? fmtDate(t.prazo) : "—"}
                    {dueBadge && <span className="ml-1 text-[10px]">({dueBadge.label.toLowerCase()})</span>}
                  </span>
                </div>
              </div>

              {/* ── CHECKLIST ── */}
              {checkTotal > 0 && (
                <>
                  <Divider label="Checklist" />
                  <div className="space-y-0.5 mb-2.5">
                    {checklist.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={e => { e.stopPropagation(); toggleSubtask(item.id, item.is_done) }}
                        disabled={toggling === item.id}
                        className="flex items-center gap-2.5 w-full text-left py-1.5 px-1 rounded hover:bg-[#252525] transition-colors"
                      >
                        {toggling === item.id
                          ? <Loader2 className="w-4 h-4 animate-spin text-[#e87c2a] flex-shrink-0" />
                          : item.is_done
                            ? <CheckSquare className="w-4 h-4 text-[#97C459] flex-shrink-0" />
                            : <Square className="w-4 h-4 text-[#555] flex-shrink-0" />}
                        <span className={cn("text-[12px] leading-snug", item.is_done ? "line-through text-[#555]" : "text-[#ccc]")}>{item.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-[3px] rounded-full bg-[#2a2a2a] overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(checkDone / checkTotal) * 100}%`,
                          background: (checkDone / checkTotal) === 1 ? "#97C459" : (checkDone / checkTotal) >= 0.5 ? "#EF9F27" : "#F09595"
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-[#555] flex-shrink-0">{checkDone}/{checkTotal} concluídos</span>
                  </div>
                </>
              )}

              {/* ── COMENTÁRIOS ── */}
              <Divider label="Comentários" />

              {loadingComments ? (
                <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-[#555]" /></div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 mb-3 max-h-[160px] overflow-y-auto">
                  {comments.map((c: any) => {
                    const author = c.equipe || equipe?.find(e => e.id === c.user_id)
                    return (
                      <div key={c.id} className="flex gap-2.5">
                        <Avatar user={author} size={24} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] text-[#aaa] font-semibold">{author?.nome || "Usuário"}</span>
                            <span className="text-[10px] text-[#444]">{relativeTime(c.created_at)}</span>
                          </div>
                          <p className="text-[12px] text-[#777] leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}

              {/* Comment input */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addComment()}
                  placeholder="Adicionar comentário..."
                  className="flex-1 min-w-0 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-[#444] outline-none focus:border-[#e87c2a]/40 transition-colors"
                />
                <button
                  onClick={addComment}
                  disabled={sendingComment || !comment.trim()}
                  className="px-3.5 py-2 bg-[#e87c2a] text-white rounded-lg text-[11px] font-semibold hover:bg-[#ff8e3e] disabled:opacity-30 transition-colors flex-shrink-0"
                >
                  {sendingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
