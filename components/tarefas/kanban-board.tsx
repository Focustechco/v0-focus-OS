"use client"

import { useState, useEffect, useMemo } from "react"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { KanbanCard } from "./kanban-card"

const statusConfig = {
  a_fazer:       { label: "Pendente",      color: "#EF9F27", bg: "bg-[#EF9F27]/10" },
  em_progresso:  { label: "Em Progresso",  color: "#378ADD", bg: "bg-[#378ADD]/10" },
  concluida:     { label: "Concluída",     color: "#97C459", bg: "bg-[#97C459]/10" },
}

const statusLabels: Record<string, string> = {
  a_fazer: "Pendente", em_progresso: "Em Progresso", em_andamento: "Em Progresso",
  em_revisao: "Em Revisão", concluida: "Concluída",
}

export function KanbanBoard({
  searchQuery, assigneeFilter, priorityFilter, onEditTask
}: {
  searchQuery: string; assigneeFilter: string; priorityFilter: string;
  onEditTask: (task: any) => void
}) {
  const { tasks, isLoading, mutate } = useTarefas()
  const { equipe } = useEquipe()
  const { projects } = useProjetos()
  const [localTasks, setLocalTasks] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (tasks) setLocalTasks(tasks) }, [tasks])

  const filteredTasks = useMemo(() => {
    return localTasks.filter(t => {
      const matchesSearch = !searchQuery || t.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) || t.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesAssignee = assigneeFilter === "all" || t.responsavel_id === assigneeFilter
      const matchesPriority = priorityFilter === "all" || t.prioridade === priorityFilter
      return matchesSearch && matchesAssignee && matchesPriority
    })
  }, [localTasks, searchQuery, assigneeFilter, priorityFilter])

  const columns = useMemo(() => ({
    a_fazer: filteredTasks.filter(t => t.status === "a_fazer" || !t.status),
    em_progresso: filteredTasks.filter(t => ["em_progresso", "em_revisao", "em_andamento"].includes(t.status)),
    concluida: filteredTasks.filter(t => t.status === "concluida"),
  }), [filteredTasks])

  if (!mounted) return null
  if (isLoading) return <div className="p-8 text-center text-[#e87c2a] font-medium">Carregando quadro...</div>

  // Shared: move task + dispatch notification
  const moveTask = async (taskId: string, newStatus: string) => {
    const task = localTasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    await fetch(`/api/tarefas/${taskId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })

    const { data: { session } } = await supabase.auth.getSession()
    if (task.responsavel_id && session) {
      try {
        const oldLabel = statusLabels[task.status] || task.status
        const newLabel = statusLabels[newStatus] || newStatus
        await fetch("/api/notifications/dispatch", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: task.responsavel_id, triggeredBy: session.user.id,
            eventType: newStatus === "concluida" ? "task_concluida" : "task_status_changed",
            data: {
              title: newStatus === "concluida" ? "Task concluída ✓" : "Status da sua task foi atualizado",
              message: `${task.titulo}: ${oldLabel} → ${newLabel}`,
              ref_type: "tarefas", ref_id: taskId, ref_title: task.titulo
            }
          })
        })
      } catch (err) { console.error("[kanban] Erro ao notificar:", err) }
    }
    mutate()
  }

  // Assign task + dispatch notification
  const assignTask = async (taskId: string, userId: string) => {
    const task = localTasks.find(t => t.id === taskId)
    if (!task) return

    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, responsavel_id: userId } : t))

    await supabase.from("tarefas").update({ responsavel_id: userId }).eq("id", taskId)

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      try {
        await fetch("/api/notifications/dispatch", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId, triggeredBy: session.user.id, eventType: "nova_task",
            data: {
              title: "Nova tarefa atribuída a você",
              message: `${task.titulo} — Prioridade ${(task.prioridade || "media").charAt(0).toUpperCase() + (task.prioridade || "media").slice(1)}`,
              ref_type: "tarefas", ref_id: taskId, ref_title: task.titulo
            }
          })
        })
      } catch (err) { console.error("[kanban] Erro ao notificar atribuição:", err) }
    }
    mutate()
  }

  const onDragEnd = async (result: any) => {
    if (!result.destination) return
    const { source, destination, draggableId } = result
    if (source.droppableId === destination.droppableId) return
    await moveTask(draggableId, destination.droppableId)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return
    setLocalTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from("tarefas").delete().eq("id", id)
    mutate()
  }

  const renderColumn = (status: keyof typeof statusConfig, colTasks: any[]) => {
    const config = statusConfig[status]
    return (
      <div className="flex flex-col gap-4 flex-1 min-w-0 h-full max-h-[calc(100vh-280px)]">
        <div className="flex items-center justify-between px-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-[15px] uppercase tracking-wider" style={{ color: config.color }}>{config.label}</h3>
            <div className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold", config.bg)} style={{ color: config.color }}>{colTasks.length}</div>
          </div>
        </div>
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps}
              className={cn(
                "flex-1 bg-[#121212]/50 border border-[#222]/30 rounded-2xl p-3 flex flex-col gap-3 overflow-y-auto scrollbar-hide transition-colors min-h-0",
                snapshot.isDraggingOver && "bg-[#161616] border-[#333]/50"
              )}>
              <div className="flex flex-col gap-3 min-h-full">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    <p className="text-[13px] text-[#333] font-medium italic">Nenhuma tarefa aqui.</p>
                  </div>
                ) : (
                  colTasks.map((t, i) => (
                    <KanbanCard key={t.id} task={t} index={i} equipe={equipe} projects={projects}
                      onEdit={onEditTask} onDelete={handleDelete} onMutate={mutate}
                      onMoveTask={moveTask} onAssignTask={assignTask} />
                  ))
                )}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-5 h-full min-h-[500px] pb-6 items-stretch w-full">
        {renderColumn("a_fazer", columns.a_fazer)}
        {renderColumn("em_progresso", columns.em_progresso)}
        {renderColumn("concluida", columns.concluida)}
      </div>
    </DragDropContext>
  )
}
