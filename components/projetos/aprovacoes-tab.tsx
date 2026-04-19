"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Eye,
  User,
  Calendar,
  FileText,
} from "lucide-react"

import { useAprovacoes, Aprovacao } from "@/lib/hooks/use-aprovacoes"

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: "URGENTE", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
  high: { label: "ALTA", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
  normal: { label: "NORMAL", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30" },
  low: { label: "BAIXA", color: "text-neutral-400", bg: "bg-neutral-500/10 border-neutral-500/30" },
}

const typeConfig: Record<string, { label: string; color: string }> = {
  stage_change: { label: "ETAPA", color: "bg-blue-500" },
  task_review: { label: "TASK", color: "bg-orange-500" },
  deploy: { label: "DEPLOY", color: "bg-purple-500" },
  proposal: { label: "PROPOSTA", color: "bg-green-500" },
  budget: { label: "ORÇAMENTO", color: "bg-yellow-500" },
}

function ApprovalCard({ approval, onAction }: { approval: Aprovacao, onAction: (status: "aprovado" | "reprovado") => void }) {
  const priority = priorityConfig[approval.priority || "normal"] || priorityConfig.normal
  const type = typeConfig[approval.approval_type || "task_review"] || typeConfig.task_review
  const [dialogOpen, setDialogOpen] = useState(false)
  
  return (
    <Card className={`bg-[#141414] border-[#2A2A2A] ${approval.priority === "urgent" ? "border-l-4 border-l-red-500" : ""} hover:border-orange-500/30 transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {approval.priority === "urgent" ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-500" />
            )}
            <Badge className={`text-[9px] ${type.color} text-white`}>
              {type.label}
            </Badge>
            <span className="text-xs text-orange-500 font-mono uppercase">{approval.projetos?.nome}</span>
          </div>
          <Badge variant="outline" className={`text-[9px] ${priority.bg} ${priority.color}`}>
            {priority.label}
          </Badge>
        </div>

        <h3 className="text-sm font-medium text-white mb-1">{approval.titulo}</h3>
        <p className="text-[10px] text-neutral-500 mb-3">{approval.descricao}</p>

        <div className="flex items-center gap-4 text-[10px] text-neutral-400 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {approval.solicitante_id}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(approval.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-[#2A2A2A]">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-[#2A2A2A] text-neutral-400 hover:text-white">
                <Eye className="w-3 h-3 mr-1" />
                Ver Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-display text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  {approval.titulo}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${type.color} text-white`}>{type.label}</Badge>
                  <span className="text-sm text-neutral-400">{approval.projetos?.nome}</span>
                </div>
                
                <p className="text-sm text-neutral-300">{approval.descricao}</p>

                <div className="space-y-2">
                  <label className="text-xs text-neutral-400">Comentário (opcional)</label>
                  <Textarea 
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white resize-none" 
                    placeholder="Adicione um comentário..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10" onClick={() => { onAction("reprovado"); setDialogOpen(false); }}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600" onClick={() => { onAction("aprovado"); setDialogOpen(false); }}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" variant="outline" className="h-8 text-xs border-red-500/50 text-red-500 hover:bg-red-500/10" onClick={() => onAction("reprovado")}>
            <XCircle className="w-3 h-3" />
          </Button>
          <Button size="sm" className="h-8 text-xs bg-green-500 hover:bg-green-600" onClick={() => onAction("aprovado")}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprovar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function AprovacoesTab() {
  const { aprovacoes, updateStatus, isLoading } = useAprovacoes()

  const urgentCount = aprovacoes.filter(a => a.priority === "urgent" && a.status === "pendente").length
  const pendingApprovals = aprovacoes.filter(a => a.status === "pendente")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-orange-500">
        Carregando aprovações pendentes...
      </div>
    )
  }

  return (
    <div className="flex-1 w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Aprovações</h1>
          <p className="text-sm text-neutral-500">Fila de aprovações reais do sistema</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500 font-mono">{urgentCount} urgentes</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-500 font-mono">{pendingApprovals.length} pendentes</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white font-mono">{pendingApprovals.length}</div>
              <div className="text-xs text-neutral-500">Total Pendentes</div>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white font-mono">{aprovacoes.filter((a: any) => a.status === "aprovado").length}</div>
              <div className="text-xs text-neutral-500">Aprovadas (Total)</div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-500 font-mono">{aprovacoes.filter((a: any) => a.status === "reprovado").length}</div>
              <div className="text-xs text-neutral-500">Rejeitadas</div>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-500 font-mono">{urgentCount}</div>
              <div className="text-xs text-neutral-500">Prioridade ALTA</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {pendingApprovals.length > 0 ? (
          pendingApprovals.sort((a, b) => ((a.priority === 'urgent' || a.priority === 'alta') ? -1 : 1)).map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} onAction={(status) => updateStatus(approval.id, status)} />
          ))
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-[#2A2A2A] rounded-xl">
             <CheckCircle2 className="w-12 h-12 text-green-500/20 mx-auto mb-4" />
             <p className="text-neutral-500 text-sm">Nenhuma aprovação pendente no momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
