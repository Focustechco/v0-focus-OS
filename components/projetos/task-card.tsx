"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FolderKanban,
  User,
  MoreVertical,
  Send,
  Hourglass,
  Trash2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSWRConfig } from "swr"
import { usePermissoes } from "@/lib/hooks/use-permissoes"

export const statusConfig: Record<string, { label: string; color: string; icon: typeof Circle }> = {
  a_fazer: { label: "A FAZER", color: "bg-neutral-500", icon: Circle },
  em_progresso: { label: "EM PROGRESSO", color: "bg-blue-500", icon: Clock },
  em_revisao: { label: "EM REVISÃO", color: "bg-yellow-500", icon: AlertTriangle },
  concluida: { label: "CONCLUÍDO", color: "bg-green-500", icon: CheckCircle2 },
}

export const priorityConfig: Record<string, { label: string; color: string; bar: string }> = {
  baixa: { label: "BAIXA", color: "border-neutral-500 text-neutral-400", bar: "bg-neutral-700" },
  media: { label: "MÉDIA", color: "border-yellow-500/50 text-yellow-500", bar: "bg-primary" }, // amber escuro
  alta: { label: "ALTA", color: "border-red-500/50 text-red-500", bar: "bg-red-800" },
}

export function TaskCard({ task, onClick, onDelete }: { task: any, onClick?: () => void, onDelete?: (id: string) => void }) {
  const { mutate } = useSWRConfig()
  const [optimisticTask, setOptimisticTask] = useState(task)
  const [requestingReview, setRequestingReview] = useState(false)
  const { canCreateTask, canRequestReview } = usePermissoes()

  useEffect(() => {
    setOptimisticTask(task)
  }, [task])

  const checklistItems = optimisticTask.checklist_items || []
  const hasChecklist = checklistItems.length > 0
  const doneItems = checklistItems.filter((i: any) => i.is_done).length
  const totalItems = checklistItems.length
  
  const currentProgress = optimisticTask.progress ?? 0
  const status = statusConfig[optimisticTask.status] || statusConfig["a_fazer"]
  const priority = priorityConfig[optimisticTask.prioridade] || priorityConfig["media"]

  const isCompleted = optimisticTask.status === "concluida"
  const isReadyForReview = currentProgress === 100 && !isCompleted
  const isAwaitingReview = optimisticTask.status === "em_revisao"

  // Zona 1 - Accent Bar color
  const accentBarColor = isCompleted ? "bg-green-800" : priority.bar

  // Progresso color
  let progressColor = "bg-orange-500"
  if (currentProgress >= 50 && currentProgress < 100) progressColor = "bg-yellow-500"
  if (currentProgress === 100) progressColor = "bg-green-500"

  const handleRequestReview = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setRequestingReview(true)
    
    // Muda status para "em_revisao"
    setOptimisticTask({ ...optimisticTask, status: "em_revisao" })
    
    await fetch(`/api/tarefas/${optimisticTask.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'em_revisao' }),
      headers: { 'Content-Type': 'application/json' }
    })
    
    mutate(key => typeof key === 'string' && key.startsWith('tarefas'))
    setRequestingReview(false)
  }

  const handleToggleCircle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = isCompleted ? "a_fazer" : "concluida"
    const newProgress = isCompleted ? 0 : 100
    
    // Optimistic update
    setOptimisticTask({
      ...optimisticTask,
      status: newStatus,
      progress: newProgress,
      checklist_items: checklistItems.map((item: any) => ({ ...item, is_done: !isCompleted }))
    })

    // Back-end call
    await fetch(`/api/tarefas/${optimisticTask.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, progress: newProgress, update_checklist: true }),
      headers: { 'Content-Type': 'application/json' }
    })
    
    mutate(key => typeof key === 'string' && key.startsWith('tarefas'))
  }

  const handleChecklistItem = async (e: React.MouseEvent, itemId: string, currentIsDone: boolean) => {
    e.stopPropagation()
    const newIsDone = !currentIsDone
    
    // Recalculate optimistically
    const newChecklist = checklistItems.map((item: any) => 
      item.id === itemId ? { ...item, is_done: newIsDone } : item
    )
    const newDoneItems = newChecklist.filter((i: any) => i.is_done).length
    const newProgress = totalItems > 0 ? Math.round((newDoneItems / totalItems) * 100) : 0
    
    let newStatus = 'a_fazer'
    if (newProgress > 0 && newProgress < 50) newStatus = 'em_progresso'
    if (newProgress >= 50 && newProgress < 100) newStatus = 'em_revisao'
    if (newProgress === 100) newStatus = 'concluida'

    setOptimisticTask({
      ...optimisticTask,
      status: newStatus,
      progress: newProgress,
      checklist_items: newChecklist
    })

    await fetch(`/api/checklist-items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_done: newIsDone }),
      headers: { 'Content-Type': 'application/json' }
    })

    mutate(key => typeof key === 'string' && key.startsWith('tarefas'))
  }

  return (
    <Card 
      onClick={onClick}
      className={`bg-card border-border hover:border-orange-500/30 transition-colors cursor-pointer relative overflow-hidden flex flex-col`}
    >
      {/* Zona 1: Barra de acento */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentBarColor}`} />

      <CardContent className="p-4 flex flex-col gap-4">
        
        {/* Zona 2: Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
            <button 
              onClick={handleToggleCircle}
              className="text-neutral-500 hover:text-foreground transition-colors flex-shrink-0"
            >
              {isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
            </button>
            <span className="text-xs text-neutral-500 font-mono flex-shrink-0">
              {optimisticTask.codigo_tarefa || optimisticTask.id.substring(0,8)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className={`text-[9px] uppercase ${priority.color}`}>
              {priority.label}
            </Badge>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-neutral-500 hover:text-red-500 hover:bg-red-500/10"
                onClick={(e) => { e.stopPropagation(); onDelete(optimisticTask.id); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-foreground" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className={`text-sm font-medium line-clamp-2 ${isCompleted ? 'text-neutral-500 line-through' : 'text-foreground'}`}>
            {optimisticTask.titulo}
          </h3>
          <p className="text-[10px] text-neutral-500 line-clamp-1 mt-1">
            {optimisticTask.descricao || "Sem projeto"}
          </p>
        </div>

        {/* Badge: Aguardando Revisão do TL */}
        {(isReadyForReview || isAwaitingReview) && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 animate-pulse">
            <Hourglass className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              {isAwaitingReview ? "Aguardando TL" : "Pronto p/ Revisão"}
            </span>
          </div>
        )}

        {/* Zona 3: Meta */}
        <div className="flex items-center gap-3 text-[10px] text-neutral-500">
          <div className="flex items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            {optimisticTask.sprint_id ? "Sprint 4" : "Geral"}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {optimisticTask.responsavel_id ? "DV" : "TL"}
          </div>
        </div>

        {/* Zona 4: Barra de Progresso */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
            <span>Progresso</span>
            <span className={isCompleted ? "text-green-500" : (currentProgress > 0 ? "text-orange-500" : "")}>
              {currentProgress}%
            </span>
          </div>
          <div className="h-[3px] bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressColor} transition-all duration-300`} 
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        {/* Zona 5: Checklist */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] font-mono uppercase text-neutral-500">
            <span>Checklist de entrega</span>
            <span>{doneItems}/{totalItems} concluídos</span>
          </div>
          <div className="space-y-2 mt-2">
            {!hasChecklist && (
              <p className="text-[10px] text-neutral-600 italic">Nenhum item vinculado</p>
            )}
            {checklistItems.map((item: any) => (
              <div key={item.id} className="flex items-start gap-2 group">
                <Checkbox 
                  checked={item.is_done}
                  onCheckedChange={() => {}}
                  onClick={(e) => handleChecklistItem(e as any, item.id, item.is_done)}
                  className="mt-0.5"
                />
                <span className={`text-xs flex-1 ${item.is_done ? 'text-neutral-600 line-through' : 'text-foreground'}`}>
                  {item.title}
                </span>
                <span className="text-[9px] font-mono text-neutral-600 ml-2 group-hover:text-neutral-400">
                  {item.assigned_to ? "TL" : "DV"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Zona 6: Rodapé */}
        <div className="flex justify-between items-center pt-3 border-t border-border mt-auto">
          <Badge className={`text-[9px] uppercase ${isCompleted ? 'bg-transparent border border-neutral-700 text-neutral-500' : 'bg-transparent border border-neutral-700 text-neutral-400 hover:text-foreground'}`}>
            {status.label}
          </Badge>
          <div className="flex items-center gap-2">
            {/* Botão Solicitar Revisão — apenas para devs quando tarefa 100% */}
            {canRequestReview && isReadyForReview && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[9px] border-amber-500/40 text-amber-400 hover:bg-amber-500/10 px-2 py-0"
                onClick={handleRequestReview}
                disabled={requestingReview}
              >
                <Send className="w-2.5 h-2.5 mr-1" />
                Solicitar Revisão
              </Button>
            )}
            <span className="text-[9px] font-mono text-red-500">
              {optimisticTask.prazo ? new Date(optimisticTask.prazo).toISOString().split('T')[0] : "Sem prazo"}
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
