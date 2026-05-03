"use client"

import { useMemo } from "react"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import {
  Calendar, Clock, Edit2, Trash2, CheckSquare,
  AlertTriangle, ChevronRight
} from "lucide-react"

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  a_fazer:       { label: "Pendente",      color: "text-[#EF9F27]", dot: "bg-[#EF9F27]" },
  em_progresso:  { label: "Em Progresso",  color: "text-[#378ADD]", dot: "bg-[#378ADD]" },
  em_andamento:  { label: "Em Progresso",  color: "text-[#378ADD]", dot: "bg-[#378ADD]" },
  em_revisao:    { label: "Em Revisão",    color: "text-[#A78BFA]", dot: "bg-[#A78BFA]" },
  concluida:     { label: "Concluída",     color: "text-[#97C459]", dot: "bg-[#97C459]" },
}

const priorityConfig: Record<string, { label: string; color: string; bar: string }> = {
  alta:  { label: "Alta",  color: "text-[#F09595]", bar: "#F09595" },
  media: { label: "Média", color: "text-[#EF9F27]", bar: "#EF9F27" },
  baixa: { label: "Baixa", color: "text-[#97C459]", bar: "#97C459" },
}

function fmtDate(d: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function getInitials(nome: string) {
  return nome?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"
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

export function TaskListView({
  searchQuery, assigneeFilter, priorityFilter, onEditTask
}: {
  searchQuery: string; assigneeFilter: string; priorityFilter: string
  onEditTask: (task: any) => void
}) {
  const { tasks, isLoading, mutate } = useTarefas()
  const { equipe } = useEquipe()
  const { projects } = useProjetos()

  const filtered = useMemo(() => {
    return (tasks || []).filter(t => {
      const s = !searchQuery || t.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) || t.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
      const a = assigneeFilter === "all" || t.responsavel_id === assigneeFilter
      const p = priorityFilter === "all" || t.prioridade === priorityFilter
      return s && a && p
    })
  }, [tasks, searchQuery, assigneeFilter, priorityFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return
    await supabase.from("tarefas").delete().eq("id", id)
    mutate()
  }

  if (isLoading) return <div className="p-8 text-center text-[#e87c2a] font-medium">Carregando lista...</div>

  return (
    <div className="bg-[#121212]/50 border border-[#222]/30 rounded-2xl overflow-hidden">
      {/* Header da tabela */}
      <div className="grid grid-cols-[1fr_120px_100px_100px_120px_90px_70px] gap-2 px-4 py-3 border-b border-[#222] text-[10px] text-[#555] uppercase tracking-wider font-medium">
        <span>Tarefa</span>
        <span>Responsável</span>
        <span>Status</span>
        <span>Prioridade</span>
        <span>Vencimento</span>
        <span>Progresso</span>
        <span className="text-right">Ações</span>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-[13px] text-[#333] font-medium italic">Nenhuma tarefa encontrada.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#1a1a1a]">
          {filtered.map(t => {
            const assignee = equipe?.find(e => e.id === t.responsavel_id)
            const project = projects?.find((p: any) => p.id === t.projeto_id)
            const prio = priorityConfig[t.prioridade] || priorityConfig.media
            const status = statusConfig[t.status] || statusConfig.a_fazer
            const dueBadge = getDueBadge(t.prazo)
            const checklist = t.checklist_items || []
            const checkDone = checklist.filter((i: any) => i.is_done).length
            const checkTotal = checklist.length
            const progressPct = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : t.status === "concluida" ? 100 : 0

            return (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_120px_100px_100px_120px_90px_70px] gap-2 px-4 py-3 items-center hover:bg-[#161616] transition-colors group cursor-pointer"
                onClick={() => onEditTask(t)}
              >
                {/* Tarefa */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-[3px] h-8 rounded-full flex-shrink-0" style={{ background: prio.bar }} />
                    <div className="min-w-0">
                      <p className="text-[13px] text-white font-medium truncate">{t.titulo}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {project && (
                          <span className="text-[10px] text-[#AFA9EC] bg-[#1a1a2e] px-1.5 py-[1px] rounded border-[0.5px] border-[#534AB7] truncate max-w-[120px]">
                            {project.nome}
                          </span>
                        )}
                        {t.descricao && <span className="text-[10px] text-[#444] truncate max-w-[150px]">{t.descricao}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Responsável */}
                <div className="flex items-center gap-2 min-w-0">
                  {assignee ? (
                    <>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 overflow-hidden" style={{ background: assignee.cor_avatar || "#e87c2a" }}>
                        {assignee.foto_url ? <img src={assignee.foto_url} alt="" className="w-full h-full object-cover" /> : getInitials(assignee.nome)}
                      </div>
                      <span className="text-[11px] text-[#aaa] truncate">{assignee.nome?.split(" ")[0]}</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-[#333]">—</span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", status.dot)} />
                  <span className={cn("text-[11px] truncate", status.color)}>{status.label}</span>
                </div>

                {/* Prioridade */}
                <span className={cn("text-[11px] font-medium", prio.color)}>{prio.label}</span>

                {/* Vencimento */}
                <div className="flex items-center gap-1">
                  {dueBadge ? (
                    <span className={cn("text-[10px] font-bold px-1.5 py-[1px] rounded border-[0.5px]", dueBadge.cls)}>
                      {dueBadge.label === "Vencida" && <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />}
                      {fmtDate(t.prazo)} {dueBadge.label === "Vencida" ? "⚠" : ""}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#555]">{fmtDate(t.prazo)}</span>
                  )}
                </div>

                {/* Progresso */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPct}%`,
                        background: progressPct === 100 ? "#97C459" : progressPct >= 50 ? "#EF9F27" : "#F09595"
                      }}
                    />
                  </div>
                  {checkTotal > 0 && <span className="text-[10px] text-[#555] flex-shrink-0">{checkDone}/{checkTotal}</span>}
                </div>

                {/* Ações */}
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); onEditTask(t) }} className="p-1.5 rounded hover:bg-[#252525] text-[#555] hover:text-white transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(t.id) }} className="p-1.5 rounded hover:bg-[#252525] text-[#555] hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[#222] flex items-center justify-between">
        <span className="text-[10px] text-[#444] font-medium">{filtered.length} {filtered.length === 1 ? "tarefa" : "tarefas"}</span>
        <div className="flex items-center gap-3 text-[10px] text-[#444]">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#EF9F27]" /> {filtered.filter(t => t.status === "a_fazer" || !t.status).length} Pendente</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#378ADD]" /> {filtered.filter(t => ["em_progresso", "em_andamento", "em_revisao"].includes(t.status)).length} Em Prog.</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#97C459]" /> {filtered.filter(t => t.status === "concluida").length} Concluída</span>
        </div>
      </div>
    </div>
  )
}
