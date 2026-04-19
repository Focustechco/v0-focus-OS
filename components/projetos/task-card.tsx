"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FolderKanban,
  User,
  MoreVertical,
  ListTodo,
} from "lucide-react"

export const statusConfig: Record<string, { label: string; color: string; icon: typeof Circle }> = {
  a_fazer: { label: "A FAZER", color: "bg-neutral-500", icon: Circle },
  em_progresso: { label: "EM PROGRESSO", color: "bg-blue-500", icon: Clock },
  em_revisao: { label: "EM REVISAO", color: "bg-yellow-500", icon: AlertTriangle },
  concluida: { label: "CONCLUIDO", color: "bg-green-500", icon: CheckCircle2 },
}

export const priorityConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: "BAIXA", color: "border-neutral-500 text-neutral-400" },
  media: { label: "MEDIA", color: "border-yellow-500 text-yellow-500" },
  alta: { label: "ALTA", color: "border-red-500 text-red-500" },
}

export function TaskCard({ task, onClick }: { task: any, onClick?: () => void }) {
  const status = statusConfig[task.status] || statusConfig["a_fazer"]
  const priority = priorityConfig[task.prioridade] || priorityConfig["media"]
  const StatusIcon = status.icon
  
  return (
    <Card 
      className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusIcon className={`w-4 h-4 ${task.status === "concluida" ? "text-green-500" : task.status === "em_revisao" ? "text-yellow-500" : task.status === "em_progresso" ? "text-blue-500" : "text-neutral-500"}`} />
            <span className="text-xs text-orange-500 font-mono">{task.codigo_tarefa || task.id.substring(0,8)}</span>
            <Badge variant="outline" className={`text-[9px] ${priority.color}`}>
              {priority.label}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-white flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-sm font-medium text-white mb-1 line-clamp-2">{task.titulo}</h3>
        <p className="text-[10px] text-neutral-500 mb-3 line-clamp-2">{task.descricao || "Sem descrição"}</p>

        <div className="flex items-center gap-2 sm:gap-4 text-[10px] text-neutral-400 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            {task.sprint_id ? "Sprints" : "Geral"}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.responsavel_id ? "Atribuída" : "Não atribuída"}
          </div>
          {task.checklist_total > 0 && (
            <div className="flex items-center gap-1 text-orange-500 font-mono">
              <ListTodo className="w-3 h-3" />
              {task.checklist_done}/{task.checklist_total}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A] flex-wrap gap-2">
          <Badge className={`text-[9px] ${status.color} text-white`}>
            {status.label}
          </Badge>
          <span className="text-[10px] text-neutral-500">{task.prazo || "-"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
