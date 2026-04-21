"use client"

import { useState, useEffect, useMemo } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Edit2, MoreVertical, Trash2 } from "lucide-react"

const statusLabels: Record<string, string> = {
  a_fazer: "Pendente",
  em_progresso: "Em Progresso",
  concluida: "Concluída"
}

export function KanbanBoard({ 
  searchQuery, 
  assigneeFilter, 
  priorityFilter,
  onEditTask
}: { 
  searchQuery: string, 
  assigneeFilter: string, 
  priorityFilter: string,
  onEditTask: (task: any) => void
}) {
  const { tasks, isLoading, mutate } = useTarefas()
  const { equipe } = useEquipe()
  const [localTasks, setLocalTasks] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      // Evita loop infinito: só atualiza se os dados realmente mudarem
      const hasChanged = JSON.stringify(tasks) !== JSON.stringify(localTasks)
      if (hasChanged) {
        setLocalTasks(tasks)
      }
    } else if (tasks && tasks.length === 0 && localTasks.length > 0) {
       setLocalTasks([])
    }
  }, [tasks, localTasks])

  const filteredTasks = useMemo(() => {
    return localTasks.filter(t => {
      if (searchQuery && !t.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) && !t.descricao?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (assigneeFilter && assigneeFilter !== "all" && t.responsavel_id !== assigneeFilter) return false;
      if (priorityFilter && priorityFilter !== "all" && t.prioridade !== priorityFilter) return false;
      return true;
    })
  }, [localTasks, searchQuery, assigneeFilter, priorityFilter])

  const columns = useMemo(() => {
    return {
      a_fazer: filteredTasks.filter(t => t.status === "a_fazer" || !t.status),
      em_progresso: filteredTasks.filter(t => ["em_progresso", "em_revisao", "em_andamento"].includes(t.status)),
      concluida: filteredTasks.filter(t => t.status === "concluida"),
    }
  }, [filteredTasks])

  if (!mounted) return null
  if (isLoading) return <div className="p-8 text-center text-orange-500">Carregando quadro...</div>

  const onDragEnd = async (result: any) => {
    if (!result.destination) return
    const { source, destination, draggableId } = result
    
    if (source.droppableId === destination.droppableId) return // same column
    
    const newStatus = destination.droppableId
    
    // Update locally for instant feedback
    setLocalTasks(prev => prev.map(t => 
      t.id === draggableId ? { ...t, status: newStatus } : t
    ))

    // Send to server
    await fetch(`/api/tarefas/${draggableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
    
    mutate() // Refresh background
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return
    setLocalTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from("tarefas").delete().eq("id", id)
    mutate()
  }

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    const today = new Date()
    today.setHours(0,0,0,0)
    return d < today
  }

  const renderCard = (t: any, index: number) => {
    const isPrioAlta = t.prioridade === "alta"
    const assignedUser = equipe?.find(e => e.id === t.responsavel_id)
    const avatar = assignedUser?.nome ? assignedUser.nome.substring(0, 2).toUpperCase() : "TL"

    return (
      <Draggable draggableId={t.id} index={index} key={t.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
              bg-background p-3 rounded-lg border border-border relative flex flex-col gap-2 
              hover:border-orange-500/30 transition-all group select-none
              ${isPrioAlta ? "border-l-4 border-l-red-500" : ""}
              ${snapshot.isDragging ? "opacity-50 shadow-xl shadow-black/50" : ""}
            `}
          >
            {/* Action Header */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onEditTask(t) }} className="p-1 hover:bg-[#2A2A2A] rounded text-neutral-400 hover:text-foreground">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={(e) => handleDelete(t.id, e)} className="p-1 hover:bg-red-500/20 rounded text-neutral-400 hover:text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Title & Desc */}
            <div className="pr-12">
              <h4 className="text-foreground text-sm font-bold line-clamp-2 leading-tight">{t.titulo}</h4>
              {t.descricao && <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{t.descricao}</p>}
            </div>

            {/* Footer tags */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1A1A1A]">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-[9px] uppercase h-5 font-mono 
                   ${t.prioridade === 'alta' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                     t.prioridade === 'media' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                     'bg-neutral-500/10 text-neutral-400 border-neutral-700'}
                `}>
                  {t.prioridade || "MÉDIA"}
                </Badge>
                
                {t.tempo_estimado && (
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                    <Clock className="w-3 h-3" />
                    {t.tempo_estimado}m
                  </div>
                )}
                
                {t.prazo && (
                  <div className={`flex items-center gap-1 text-[10px] font-mono ${isOverdue(t.prazo) ? 'text-red-500' : 'text-neutral-400'}`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(t.prazo).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
              
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-border flex items-center justify-center text-[8px] font-bold text-orange-500 flex-shrink-0">
                 {avatar}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px] pb-8">
        
        {/* COLUNA PENDENTE */}
        <div className="flex flex-col gap-3 min-w-[300px]">
          <div className="flex items-center gap-2 border-b-2 border-[#d97706] pb-2">
            <h3 className="text-foreground font-bold font-display tracking-wide">Pendente</h3>
            <Badge className="bg-[#1A1A1A] text-neutral-400 border-border">{columns.a_fazer.length}</Badge>
          </div>
          <Droppable droppableId="a_fazer">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className={`flex-1 bg-card/50 border border-[#1E1E1E] rounded-xl p-3 flex flex-col gap-3 transition-colors ${snapshot.isDraggingOver ? 'bg-[#1A1A1A]/80' : ''}`}
              >
                {columns.a_fazer.length === 0 && <p className="text-center text-xs text-neutral-600 font-mono py-8">Nenhuma tarefa aqui.</p>}
                {columns.a_fazer.map((t, i) => renderCard(t, i))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* COLUNA EM PROGRESSO */}
        <div className="flex flex-col gap-3 min-w-[300px]">
          <div className="flex items-center gap-2 border-b-2 border-[#3b82f6] pb-2">
            <h3 className="text-foreground font-bold font-display tracking-wide">Em Progresso</h3>
            <Badge className="bg-[#1A1A1A] text-neutral-400 border-border">{columns.em_progresso.length}</Badge>
          </div>
          <Droppable droppableId="em_progresso">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className={`flex-1 bg-card/50 border border-[#1E1E1E] rounded-xl p-3 flex flex-col gap-3 transition-colors ${snapshot.isDraggingOver ? 'bg-[#1A1A1A]/80' : ''}`}
              >
                {columns.em_progresso.length === 0 && <p className="text-center text-xs text-neutral-600 font-mono py-8">Nenhuma tarefa aqui.</p>}
                {columns.em_progresso.map((t, i) => renderCard(t, i))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* COLUNA CONCLUÍDA */}
        <div className="flex flex-col gap-3 min-w-[300px]">
          <div className="flex items-center gap-2 border-b-2 border-[#22c55e] pb-2">
            <h3 className="text-foreground font-bold font-display tracking-wide">Concluída</h3>
            <Badge className="bg-[#1A1A1A] text-neutral-400 border-border">{columns.concluida.length}</Badge>
          </div>
          <Droppable droppableId="concluida">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className={`flex-1 bg-card/50 border border-[#1E1E1E] rounded-xl p-3 flex flex-col gap-3 transition-colors ${snapshot.isDraggingOver ? 'bg-[#1A1A1A]/80' : ''}`}
              >
                {columns.concluida.length === 0 && <p className="text-center text-xs text-neutral-600 font-mono py-8">Nenhuma tarefa aqui.</p>}
                {columns.concluida.map((t, i) => renderCard(t, i))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

      </div>
    </DragDropContext>
  )
}
