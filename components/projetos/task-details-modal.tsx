"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ListTodo, 
  Clock, 
  User, 
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  MessageSquare
} from "lucide-react"
import { statusConfig, priorityConfig } from "./task-card"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { toast } from "sonner"

interface TaskDetailsModalProps {
  task: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function TaskDetailsModal({ task, open, onOpenChange, onUpdate }: TaskDetailsModalProps) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { equipe } = useEquipe()

  useEffect(() => {
    if (open && task?.id) {
      fetchChecklistItems()
    }
  }, [open, task?.id])

  async function fetchChecklistItems() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/checklist-items?task_id=${task.id}`)
      if (!res.ok) throw new Error("Erro ao buscar itens")
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar checklist")
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleItem(itemId: string, isDone: boolean) {
    try {
      const res = await fetch(`/api/checklist-items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_done: isDone })
      })
      if (!res.ok) throw new Error("Erro ao atualizar item")
      
      // Update local state
      setItems(items.map(item => item.id === itemId ? { ...item, is_done: isDone } : item))
      
      if (isDone) {
        toast.success("Item concluído e enviado para aprovação!")
      }

      if (onUpdate) onUpdate()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar item")
    }
  }

  if (!task) return null

  const status = statusConfig[task.status] || statusConfig.a_fazer
  const priority = priorityConfig[task.prioridade] || priorityConfig.media
  const StatusIcon = status.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-[#2A2A2A] pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={`${status.color} text-white text-[10px]`}>{status.label}</Badge>
            <Badge variant="outline" className={`${priority.color} text-[10px]`}>{priority.label}</Badge>
            <span className="text-xs text-neutral-500 font-mono">#{task.id.substring(0, 8)}</span>
          </div>
          <DialogTitle className="text-xl font-display font-bold text-white flex items-center gap-2">
            <StatusIcon className="w-5 h-5 text-orange-500" />
            {task.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h4 className="text-[10px] font-mono uppercase text-neutral-500 mb-2 tracking-widest">Descrição</h4>
              <p className="text-sm text-neutral-300 bg-[#0A0A0A] p-4 rounded-lg border border-[#2A2A2A] min-h-[100px]">
                {task.descricao || "Nenhuma descrição fornecida."}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">Checklist de Entrega</h4>
                <span className="text-[10px] text-orange-500 font-mono">
                  {items.filter(i => i.is_done).length}/{items.length} CONCLUÍDOS
                </span>
              </div>
              
              <div className="space-y-2 bg-[#0A0A0A] p-2 rounded-lg border border-[#2A2A2A]">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                ) : items.length > 0 ? (
                  items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-start gap-3 p-3 rounded-md transition-colors ${item.is_done ? 'bg-green-500/5' : 'hover:bg-white/5'}`}
                    >
                      <Checkbox 
                        id={item.id} 
                        checked={item.is_done}
                        onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                        className="mt-0.5 border-[#2A2A2A] data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <div className="flex-1 space-y-1">
                        <label 
                          htmlFor={item.id}
                          className={`text-xs font-medium cursor-pointer ${item.is_done ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}
                        >
                          {item.title}
                        </label>
                        {item.assigned_to && (
                          <div className="flex items-center gap-1.5 text-[10px] text-orange-500/70">
                            <User className="w-3 h-3" />
                            Responsável: {equipe.find(m => m.id === item.assigned_to)?.nome || "Membro"}
                          </div>
                        )}
                      </div>
                      {item.is_done && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center border border-dashed border-[#2A2A2A] rounded-md">
                    <ListTodo className="w-8 h-8 text-neutral-700 mx-auto mb-2 opacity-30" />
                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono">Nenhum item vinculado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                  <User className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase font-mono tracking-tighter">Atribuída para</p>
                  <p className="text-xs text-white">
                    {equipe.find(m => m.id === task.responsavel_id)?.nome || "Não atribuída"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase font-mono tracking-tighter">Prazo</p>
                  <p className="text-xs text-white font-mono">{task.prazo || "Sem prazo"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                  <MessageSquare className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase font-mono tracking-tighter">Comentários</p>
                  <p className="text-xs text-neutral-600 italic">Em breve</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-[#2A2A2A]">
              <Button 
                variant="outline" 
                className="w-full border-[#2A2A2A] text-neutral-400 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                Fechar Detalhes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
