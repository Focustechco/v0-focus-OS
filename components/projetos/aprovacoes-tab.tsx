"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Clock, CheckCircle2, XCircle, AlertTriangle, Eye,
  User, Calendar, ListChecks, Send, Loader2
} from "lucide-react"
import { useAprovacoes, type Aprovacao } from "@/lib/hooks/use-aprovacoes"
import { useTarefas } from "@/lib/hooks/use-tarefas"
import { supabase } from "@/lib/supabase"

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return "agora"
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: "URGENTE", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  high:   { label: "ALTA",    color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  alta:   { label: "ALTA",    color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
  normal: { label: "MÉDIA",   color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  media:  { label: "MÉDIA",   color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  low:    { label: "BAIXA",   color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  baixa:  { label: "BAIXA",   color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
}

// ─── APPROVAL CARD ──────────────────────────────────────────────────────────
function ApprovalCard({
  approval, tarefa, onAction
}: {
  approval: Aprovacao & { tarefa?: any }
  tarefa: any
  onAction: (status: "aprovado" | "reprovado", motivo?: string) => Promise<void>
}) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [loading, setLoading] = useState<string | null>(null)

  const prioCfg = PRIORITY_CONFIG[approval.priority || "normal"] || PRIORITY_CONFIG.normal
  const checklist = tarefa?.checklist_items || []
  const checkDone = checklist.filter((i: any) => i.is_done).length
  const checkTotal = checklist.length

  const handleAprovar = async () => {
    setLoading("aprovar")
    await onAction("aprovado")
    setLoading(null)
  }

  const handleNegar = async () => {
    if (!rejectReason.trim()) return
    setLoading("negar")
    await onAction("reprovado", rejectReason)
    setRejectDialogOpen(false)
    setRejectReason("")
    setLoading(null)
  }

  return (
    <Card className="bg-card border-border hover:border-primary/20 transition-all">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-foreground">{approval.titulo}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Entregue por <span className="text-foreground">{approval.assigned_to}</span>
              {" · "}
              <span>{approval.projetos?.nome}</span>
              {" · "}
              <span>{timeAgo(approval.created_at)}</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant="outline" className={`text-[9px] font-bold ${prioCfg.bg} ${prioCfg.color}`}>
              {prioCfg.label}
            </Badge>
            <Badge className="bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[9px]">
              EM REVISÃO
            </Badge>
          </div>
        </div>

        {/* Subtarefas entregues */}
        {checkTotal > 0 && (
          <div className="mt-3 mb-3">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
              Subtarefas Entregues
            </p>
            <div className="space-y-1">
              {checklist.map((item: any) => (
                <div key={item.id} className="flex items-center gap-2 py-0.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.is_done ? "bg-green-500" : "bg-red-400"}`} />
                  <span className={`text-xs ${item.is_done ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 text-xs border-border text-muted-foreground hover:text-foreground"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver tarefa
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setRejectDialogOpen(true)}
            className="flex-1 h-9 text-xs border-border text-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Negar — volta para Pendente
          </Button>

          <Button
            size="sm"
            onClick={handleAprovar}
            disabled={loading === "aprovar"}
            className="flex-1 h-9 text-xs bg-card border border-border text-foreground hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30"
          >
            {loading === "aprovar" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Aprovar e concluir</>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Dialog de rejeição */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="w-4 h-4" /> Negar Tarefa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground">
              A tarefa <span className="text-foreground font-medium">"{approval.titulo}"</span> será devolvida ao
              status Pendente. O motivo é obrigatório.
            </p>
            <Textarea
              placeholder="Descreva o motivo da rejeição..."
              className="bg-background border-border min-h-[80px]"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setRejectDialogOpen(false)} className="border-border">
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleNegar}
                disabled={!rejectReason.trim() || loading === "negar"}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading === "negar" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                )}
                Negar Tarefa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function AprovacoesTab() {
  const { aprovacoes, updateStatus, isLoading, mutate } = useAprovacoes()
  const { tasks, mutate: mutateTasks } = useTarefas()

  const [activeTab, setActiveTab] = useState("aguardando")

  // Contagens
  const pendentes = aprovacoes.filter(a => a.status === "pendente")
  const aprovadas = aprovacoes.filter(a => a.status === "aprovado")
  const negadas = aprovacoes.filter(a => a.status === "reprovado")
  const urgentes = aprovacoes.filter(a => (a.priority === "urgent" || a.priority === "high" || a.priority === "alta") && a.status === "pendente")

  // Mapa tarefa_id -> tarefa com checklist
  const tarefaMap = useMemo(() => {
    const m = new Map()
    tasks.forEach((t: any) => m.set(t.id, t))
    return m
  }, [tasks])

  const handleAction = async (approvalId: string, tarefa_id: string | undefined, status: "aprovado" | "reprovado", motivo?: string) => {
    // 1. Atualiza aprovação
    await updateStatus(approvalId, status)

    // 2. Atualiza status da tarefa vinculada
    if (tarefa_id) {
      if (status === "aprovado") {
        await supabase.from("tarefas").update({ status: "concluida" }).eq("id", tarefa_id)
      } else {
        // Negada → volta para pendente
        await supabase.from("tarefas").update({ status: "a_fazer" }).eq("id", tarefa_id)
      }
      mutateTasks()
    }
  }

  const currentList = activeTab === "aguardando" ? pendentes :
                      activeTab === "aprovadas" ? aprovadas : negadas

  if (isLoading) {
    return <div className="flex items-center justify-center p-20 text-primary">Carregando Aprovações...</div>
  }

  return (
    <div className="flex-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Aprovações</h1>
          <p className="text-xs text-muted-foreground">Tarefas aguardando revisão do Tech Lead / Administrador</p>
        </div>
        <div className="flex items-center gap-2">
          {urgentes.length > 0 && (
            <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] gap-1">
              <AlertTriangle className="w-3 h-3" /> {urgentes.length} urgente{urgentes.length > 1 ? "s" : ""}
            </Badge>
          )}
          <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px] gap-1">
            <Clock className="w-3 h-3" /> {pendentes.length} pendentes
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-foreground font-mono">{pendentes.length}</div>
              <div className="text-[10px] text-muted-foreground">Aguardando revisão</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-foreground font-mono">{aprovadas.length}</div>
              <div className="text-[10px] text-muted-foreground">Aprovadas total</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-400 font-mono">{negadas.length}</div>
              <div className="text-[10px] text-muted-foreground">Negadas</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-400 font-mono">{urgentes.length}</div>
              <div className="text-[10px] text-muted-foreground">Prioridade alta</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        {[
          { key: "aguardando", label: "Aguardando", count: pendentes.length },
          { key: "aprovadas",  label: "Aprovadas",  count: aprovadas.length },
          { key: "negadas",    label: "Negadas",    count: negadas.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Lista */}
      {currentList.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-border rounded-xl">
          <CheckCircle2 className="w-10 h-10 text-green-500/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {activeTab === "aguardando" ? "Nenhuma aprovação pendente no momento." :
             activeTab === "aprovadas" ? "Nenhuma tarefa aprovada." :
             "Nenhuma tarefa negada."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList
            .sort((a, b) => {
              // Urgentes primeiro
              const aPrio = (a.priority === "urgent" || a.priority === "high" || a.priority === "alta") ? 0 : 1
              const bPrio = (b.priority === "urgent" || b.priority === "high" || b.priority === "alta") ? 0 : 1
              return aPrio - bPrio
            })
            .map(approval => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                tarefa={tarefaMap.get(approval.tarefa_id)}
                onAction={(status, motivo) => handleAction(approval.id, approval.tarefa_id, status, motivo)}
              />
            ))}
        </div>
      )}
    </div>
  )
}
