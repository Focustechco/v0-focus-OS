import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Calendar, Target, Clock, Loader2, Hourglass, ArrowRight } from "lucide-react"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { TaskCard } from "./task-card"
import { useRouter } from "next/navigation"

export function SprintDetailsModal({ open, onOpenChange, sprint }: any) {
  // Call useTarefas safely only passing ID when sprint exists
  const { tasks, isLoading } = useTarefas(sprint?.id)
  const router = useRouter()

  if (!sprint) return null

  const endDate = new Date(sprint.data_fim)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Tarefas prontas para revisão: progress 100% ou status em_revisao
  const tarefasParaRevisao = (tasks || []).filter(
    (t: any) => t.status === "em_revisao" || (t.progress ?? 0) === 100
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-orange-500" />
            <DialogTitle className="font-display tracking-tight text-xl">
              {sprint.nome?.toUpperCase()}
            </DialogTitle>
            <Badge className={sprint.status === "ativa" ? "bg-orange-500 hover:bg-orange-600" : "bg-neutral-600"}>
              {sprint.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-background border border-border rounded-lg p-4">
            <div className="text-xs text-neutral-500 font-mono flex items-center gap-2 mb-2 uppercase">
              <Target className="w-3 h-3 text-orange-500" />
              Objetivo da Sprint
            </div>
            <p className="text-sm text-foreground">
              {sprint.objetivo || "Nenhum objetivo definido."}
            </p>
          </div>
          
          <div className="bg-background border border-border rounded-lg p-4 flex flex-col justify-center">
            <div className="text-xs text-neutral-500 font-mono flex items-center gap-2 mb-2 uppercase">
              <Calendar className="w-3 h-3 text-neutral-500" />
              Período
            </div>
            <div className="text-sm text-foreground font-mono mb-2">
              {new Date(sprint.data_inicio).toLocaleDateString("pt-BR")} - {new Date(sprint.data_fim).toLocaleDateString("pt-BR")}
            </div>
            {sprint.status === "ativa" && (
              <div className="flex items-center gap-2">
                <Clock className={`w-3 h-3 ${daysLeft <= 2 ? "text-red-500" : "text-orange-500"}`} />
                <span className={`text-xs font-mono ${daysLeft <= 2 ? "text-red-500" : "text-orange-500"}`}>
                  {daysLeft > 0 ? `${daysLeft} dias restantes` : "O prazo já esgotou"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-medium text-foreground tracking-wider font-mono">
              TAREFAS DESTA SPRINT ({tasks?.length || 0})
            </h3>
            {tarefasParaRevisao.length > 0 && (
              <button
                onClick={() => { onOpenChange(false); router.push("/projetos?tab=aprovacoes") }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
              >
                <Hourglass className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-mono font-bold text-amber-400">
                  {tarefasParaRevisao.length} aguardando TL
                </span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-neutral-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-orange-500" />
              Buscando tarefas...
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded-lg text-center bg-background">
              <p className="text-neutral-500 uppercase font-mono tracking-widest text-xs">
                Nenhuma tarefa vinculada a esta Sprint
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
