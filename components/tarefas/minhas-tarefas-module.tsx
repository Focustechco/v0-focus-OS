"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { useMinhasTarefas, type MinhasTarefasItem } from "@/lib/hooks/use-minhas-tarefas"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  Calendar,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ListTodo,
} from "lucide-react"

const prioridadeConfig = {
  alta: { label: "Alta", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
  media: { label: "Média", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
  baixa: { label: "Baixa", color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  a_fazer:      { label: "A Fazer",     color: "text-neutral-400",  icon: Clock },
  em_andamento: { label: "Em andamento",color: "text-blue-400",     icon: Clock },
  em_progresso: { label: "Em Progresso",color: "text-blue-400",     icon: Clock },
  revisao:      { label: "Revisão",     color: "text-purple-400",   icon: AlertCircle },
  concluida:    { label: "Concluída",   color: "text-green-500",    icon: CheckCircle2 },
  bloqueada:    { label: "Bloqueada",   color: "text-red-500",      icon: AlertCircle },
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function TarefaCard({ tarefa }: { tarefa: MinhasTarefasItem }) {
  const [expanded, setExpanded] = useState(false)
  const { toggleChecklist } = useMinhasTarefas()
  const router = useRouter()

  const prio = prioridadeConfig[tarefa.prioridade] || prioridadeConfig.media
  const statusInfo = statusConfig[tarefa.status] || statusConfig.a_fazer
  const StatusIcon = statusInfo.icon

  const progressPct = tarefa.checklistTotal > 0
    ? Math.round((tarefa.checklistDone / tarefa.checklistTotal) * 100)
    : (tarefa.status === "concluida" ? 100 : 0)

  // Subtarefas a exibir: se é owner mostra todas, se não, mostra só as suas
  const checklistToShow = tarefa.isOwner ? tarefa.checklist_items : tarefa.myChecklist

  const handleGoToTask = () => {
    router.push(`/projetos?projetoId=${tarefa.projeto_id}&tab=tarefas&taskId=${tarefa.id}`)
  }

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all",
      tarefa.isOwner
        ? "bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30"
        : "bg-[#0F0F0F] border-[#1E1E1E] hover:border-[#2A2A2A]"
    )}>
      {/* Header da tarefa */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Coluna esquerda: botão de expandir */}
          <button
            onClick={() => setExpanded(!expanded)}
            disabled={checklistToShow.length === 0}
            className={cn(
              "mt-0.5 w-6 h-6 rounded flex items-center justify-center transition-all flex-shrink-0",
              checklistToShow.length > 0
                ? "text-neutral-400 hover:text-white hover:bg-[#2A2A2A]"
                : "text-neutral-700 cursor-default"
            )}
          >
            <ChevronRight className={cn("w-4 h-4 transition-transform", expanded && "rotate-90")} />
          </button>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {/* Título + badges de info */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <button
                onClick={handleGoToTask}
                className={cn(
                  "text-sm font-medium text-left leading-snug hover:text-orange-400 transition-colors",
                  tarefa.isOwner ? "text-white" : "text-neutral-400"
                )}
              >
                {tarefa.titulo}
              </button>
              <Badge
                variant="outline"
                className={cn("text-[9px] uppercase tracking-wider flex-shrink-0 h-5 font-bold", prio.bg, prio.color)}
              >
                {prio.label}
              </Badge>
            </div>

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                <FolderKanban className="w-3 h-3" />
                <span className="font-mono">{tarefa.projeto_nome}</span>
              </div>
              {tarefa.prazo && (
                <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                  <Calendar className="w-3 h-3" />
                  <span className="font-mono">{formatDate(tarefa.prazo)}</span>
                </div>
              )}
              <div className={cn("flex items-center gap-1 text-[10px]", statusInfo.color)}>
                <StatusIcon className="w-3 h-3" />
                <span className="font-mono">{statusInfo.label}</span>
              </div>
            </div>

            {/* Progresso e contador de subtarefas */}
            {tarefa.checklistTotal > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500 font-mono">
                    <span className={tarefa.checklistDone === tarefa.checklistTotal ? "text-green-500" : "text-white"}>
                      {tarefa.checklistDone}
                    </span>
                    {" de "}{tarefa.checklistTotal} subtarefas concluídas
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{progressPct}%</span>
                </div>
                <Progress value={progressPct} className="h-1 bg-[#1A1A1A]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checklist expandido */}
      {expanded && checklistToShow.length > 0 && (
        <div className="border-t border-[#1E1E1E] bg-[#0A0A0A]">
          <div className="p-3 space-y-1">
            {checklistToShow.map((ci) => {
              const ciStatus = ci.is_done ? statusConfig.concluida : statusConfig.a_fazer
              return (
                <div
                  key={ci.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                    tarefa.myChecklist.some((m) => m.id === ci.id)
                      ? "bg-[#141414] hover:bg-[#1A1A1A]"
                      : "hover:bg-[#111111] opacity-60"
                  )}
                >
                  <Checkbox
                    id={`ci-${ci.id}`}
                    checked={ci.is_done}
                    onCheckedChange={(checked) => toggleChecklist(ci.id, checked as boolean)}
                    className="border-[#3A3A3A] data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <label
                    htmlFor={`ci-${ci.id}`}
                    className={cn(
                      "flex-1 text-xs cursor-pointer leading-tight",
                      ci.is_done ? "line-through text-neutral-600" : "text-neutral-300"
                    )}
                  >
                    {ci.title}
                  </label>
                  {ci.prazo && (
                    <span className="text-[10px] text-neutral-600 font-mono flex-shrink-0">
                      {formatDate(ci.prazo)}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[8px] h-4 px-1.5 font-bold uppercase tracking-widest flex-shrink-0",
                      ci.is_done
                        ? "border-green-500/20 text-green-500 bg-green-500/5"
                        : "border-[#2A2A2A] text-neutral-500 bg-transparent"
                    )}
                  >
                    {ci.is_done ? "OK" : "—"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function MinhasTarefasModule() {
  const {
    tarefas,
    isLoading,
    totalItems,
    doneItems,
    progressGlobal,
  } = useMinhasTarefas()
  
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Card Minha Pauta do Dia */}
      <div className="p-5 bg-[#141414] border border-[#2A2A2A] rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-display font-bold text-white tracking-tight">Tasks do Dia</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">Tarefas e subtarefas atribuídas a você</p>
          </div>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs"
            onClick={() => router.push("/projetos?new-task=true")}
          >
            + Nova Tarefa
          </Button>
        </div>

        {/* Contador global */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-white">{doneItems}</span>
            <span className="text-neutral-500 text-sm font-mono">/ {totalItems} CONCLUÍDAS</span>
          </div>
          <span className="text-xs font-mono text-neutral-500">{progressGlobal}%</span>
        </div>
        <Progress value={progressGlobal} className="h-2 bg-[#1A1A1A]" />
      </div>

      {/* Lista de tarefas */}
      {tarefas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#2A2A2A] flex items-center justify-center mb-4">
            <ListTodo className="w-7 h-7 text-neutral-700" />
          </div>
          <h3 className="text-white font-medium mb-1">Você está livre!</h3>
          <p className="text-neutral-500 text-sm max-w-xs">
            Nenhuma tarefa ou subtarefa está atribuída a você no momento.
          </p>
          <Button
            variant="outline"
            className="mt-6 border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
            onClick={() => router.push("/projetos")}
          >
            Ver Projetos
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              {tarefas.length} {tarefas.length === 1 ? "tarefa" : "tarefas"} atribuídas
            </p>
          </div>
          {tarefas.map((tarefa) => (
            <TarefaCard key={tarefa.id} tarefa={tarefa} />
          ))}
        </div>
      )}
    </div>
  )
}
