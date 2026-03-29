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

const approvals = [
  {
    id: 1,
    type: "etapa",
    project: "PRJ-038",
    projectName: "Sistema de Gestao",
    title: "Diagnostico -> MVP",
    description: "Diagnostico concluido. Escopo validado e precificacao aprovada.",
    requestedBy: "Comercial",
    requestedAt: "23/06/2025",
    waitingDays: 2,
    priority: "urgente",
    reviewer: "Gabriel",
    details: {
      escopo: "Sistema completo de gestao empresarial com modulos de RH, Financeiro e Operacoes",
      preco: "R$ 45.000,00",
      prazo: "90 dias",
      complexidade: "Alta",
    },
  },
  {
    id: 2,
    type: "task",
    project: "PRJ-041",
    projectName: "App Mobile",
    title: "Task #089 - Tela de Login",
    description: "Estagiario Joao entregou: Tela de login implementada com OAuth",
    requestedBy: "Joao",
    requestedAt: "24/06/2025",
    waitingDays: 1,
    priority: "normal",
    reviewer: "Gabriel",
    details: {
      criterios: ["Layout responsivo", "Integracao OAuth", "Validacoes de formulario"],
      horasEstimadas: 8,
      horasReais: 10,
    },
  },
  {
    id: 3,
    type: "proposta",
    project: "PRJ-035",
    projectName: "Portal do Cliente",
    title: "Proposta de Fechamento",
    description: "MVP apresentado. Comercial aguarda assinatura do cliente.",
    requestedBy: "Comercial",
    requestedAt: "25/06/2025",
    waitingDays: 0,
    priority: "aguardando",
    reviewer: "Cliente",
    details: {
      valorProposta: "R$ 28.000,00",
      formaPagamento: "50% entrada + 50% na entrega",
      prazoValidade: "15 dias",
    },
  },
  {
    id: 4,
    type: "deploy",
    project: "PRJ-037",
    projectName: "Sistema de Tickets",
    title: "Deploy em Producao",
    description: "Ambiente de staging validado. Aguardando aprovacao para deploy final.",
    requestedBy: "DevSecOps",
    requestedAt: "24/06/2025",
    waitingDays: 1,
    priority: "normal",
    reviewer: "Gabriel",
    details: {
      ambiente: "AWS - us-east-1",
      versao: "v1.2.3",
      checklist: ["Testes de integracao OK", "Performance OK", "Seguranca OK"],
    },
  },
  {
    id: 5,
    type: "sprint",
    project: "PRJ-042",
    projectName: "Projeto Alpha",
    title: "Encerramento Sprint #6",
    description: "Sprint #6 finalizada. 18/20 tasks concluidas. 2 movidas para proxima sprint.",
    requestedBy: "Gabriel",
    requestedAt: "22/06/2025",
    waitingDays: 3,
    priority: "normal",
    reviewer: "Gabriel",
    details: {
      tasksConcluidas: 18,
      tasksMovidas: 2,
      horasUtilizadas: 120,
      horasPlanejadas: 128,
    },
  },
]

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  urgente: { label: "URGENTE", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
  normal: { label: "NORMAL", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30" },
  aguardando: { label: "AGUARDANDO", color: "text-neutral-400", bg: "bg-neutral-500/10 border-neutral-500/30" },
}

const typeConfig: Record<string, { label: string; color: string }> = {
  etapa: { label: "ETAPA", color: "bg-blue-500" },
  task: { label: "TASK", color: "bg-orange-500" },
  proposta: { label: "PROPOSTA", color: "bg-green-500" },
  deploy: { label: "DEPLOY", color: "bg-purple-500" },
  sprint: { label: "SPRINT", color: "bg-yellow-500" },
}

function ApprovalCard({ approval }: { approval: typeof approvals[0] }) {
  const priority = priorityConfig[approval.priority]
  const type = typeConfig[approval.type]
  const [dialogOpen, setDialogOpen] = useState(false)
  
  return (
    <Card className={`bg-[#141414] border-[#2A2A2A] ${approval.priority === "urgente" ? "border-l-4 border-l-red-500" : ""} hover:border-orange-500/30 transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {approval.priority === "urgente" ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : approval.priority === "aguardando" ? (
              <Clock className="w-4 h-4 text-neutral-500" />
            ) : (
              <Clock className="w-4 h-4 text-yellow-500" />
            )}
            <Badge className={`text-[9px] ${type.color} text-white`}>
              {type.label}
            </Badge>
            <span className="text-xs text-orange-500 font-mono">{approval.project}</span>
          </div>
          <Badge variant="outline" className={`text-[9px] ${priority.bg} ${priority.color}`}>
            {priority.label}
          </Badge>
        </div>

        <h3 className="text-sm font-medium text-white mb-1">{approval.title}</h3>
        <p className="text-[10px] text-neutral-500 mb-3">{approval.description}</p>

        <div className="flex items-center gap-4 text-[10px] text-neutral-400 mb-4">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {approval.requestedBy}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {approval.requestedAt}
          </div>
          {approval.waitingDays > 0 && (
            <div className={`flex items-center gap-1 ${approval.waitingDays >= 2 ? "text-red-500" : "text-yellow-500"}`}>
              <Clock className="w-3 h-3" />
              {approval.waitingDays}d aguardando
            </div>
          )}
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
                  {approval.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${type.color} text-white`}>{type.label}</Badge>
                  <span className="text-sm text-orange-500 font-mono">{approval.project}</span>
                  <span className="text-sm text-neutral-400">- {approval.projectName}</span>
                </div>
                
                <p className="text-sm text-neutral-300">{approval.description}</p>

                <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] space-y-2">
                  {Object.entries(approval.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-neutral-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-white font-mono">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-neutral-400">Comentario (opcional)</label>
                  <Textarea 
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white resize-none" 
                    placeholder="Adicione um comentario..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" variant="outline" className="h-8 text-xs border-red-500/50 text-red-500 hover:bg-red-500/10">
            <XCircle className="w-3 h-3" />
          </Button>
          <Button size="sm" className="h-8 text-xs bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprovar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AprovacoesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const urgentCount = approvals.filter(a => a.priority === "urgente").length
  const normalCount = approvals.filter(a => a.priority === "normal").length
  const waitingCount = approvals.filter(a => a.priority === "aguardando").length

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader title="APROVACOES" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Aprovacoes</h1>
              <p className="text-sm text-neutral-500">Fila de aprovacoes pendentes</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500 font-mono">{urgentCount} urgentes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-500 font-mono">{normalCount} normais</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-500/10 border border-neutral-500/30 rounded-lg">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-400 font-mono">{waitingCount} aguardando</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">{approvals.length}</div>
                  <div className="text-xs text-neutral-500">Total Pendentes</div>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">3</div>
                  <div className="text-xs text-neutral-500">Aguardando Gabriel</div>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </CardContent>
            </Card>
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">1</div>
                  <div className="text-xs text-neutral-500">Aguardando Cliente</div>
                </div>
                <User className="w-8 h-8 text-green-500" />
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
            <h2 className="text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              URGENTES
            </h2>
            {approvals.filter(a => a.priority === "urgente").map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}

            <h2 className="text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2 pt-4">
              <Clock className="w-4 h-4 text-yellow-500" />
              NORMAIS
            </h2>
            {approvals.filter(a => a.priority === "normal").map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}

            <h2 className="text-sm font-medium text-neutral-400 tracking-wider flex items-center gap-2 pt-4">
              <Clock className="w-4 h-4 text-neutral-500" />
              AGUARDANDO RESPOSTA EXTERNA
            </h2>
            {approvals.filter(a => a.priority === "aguardando").map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
