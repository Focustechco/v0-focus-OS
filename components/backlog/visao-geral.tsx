"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Users,
  ClipboardList,
  FolderOpen,
  Plus,
  Upload,
  Clock,
  AlertTriangle,
} from "lucide-react"

const stats = [
  { label: "Contratos Ativos", value: "47", icon: FileText, change: "+3 este mes" },
  { label: "Tarefas ADM", value: "23", icon: ClipboardList, change: "8 pendentes" },
  { label: "Clientes", value: "156", icon: Users, change: "+12 novos" },
  { label: "Docs Pendentes", value: "8", icon: FolderOpen, change: "2 urgentes" },
]

const quickActions = [
  { label: "Novo Contrato", icon: FileText },
  { label: "Add Cliente", icon: Users },
  { label: "Upload Doc", icon: Upload },
  { label: "Nova Tarefa", icon: Plus },
]

const recentActivity = [
  { user: "Carlos Silva", action: "adicionou contrato", target: "TechCorp Ltda", time: "2 min", type: "JURIDICO" },
  { user: "Ana Santos", action: "atualizou cliente", target: "Startup XYZ", time: "15 min", type: "CLIENTE" },
  { user: "Pedro Lima", action: "concluiu tarefa", target: "Revisao fiscal Q1", time: "32 min", type: "ADM" },
  { user: "Mariana Costa", action: "enviou contrato", target: "Beta Solutions", time: "1h", type: "JURIDICO" },
  { user: "Lucas Ferreira", action: "criou proposta", target: "Alpha Inc", time: "2h", type: "CLIENTE" },
  { user: "Julia Alves", action: "arquivou doc", target: "NDA_2025_v3", time: "3h", type: "ADM" },
  { user: "Ricardo Souza", action: "aprovou contrato", target: "Delta Corp", time: "4h", type: "JURIDICO" },
  { user: "Fernanda Reis", action: "atualizou dados", target: "Gamma SA", time: "5h", type: "CLIENTE" },
]

const pendingItems = [
  { title: "Contrato TechCorp - Aguardando assinatura", priority: "URGENTE", dueDate: "Hoje" },
  { title: "Revisao NDA Startup XYZ", priority: "URGENTE", dueDate: "Hoje" },
  { title: "Pagamento fornecedor #4521", priority: "NORMAL", dueDate: "Amanha" },
  { title: "Atualizar cadastro Beta Solutions", priority: "NORMAL", dueDate: "Em 2 dias" },
  { title: "Backup mensal documentos", priority: "BAIXO", dueDate: "Em 5 dias" },
  { title: "Renovacao licencas software", priority: "BAIXO", dueDate: "Em 7 dias" },
]

const priorityColors: Record<string, string> = {
  URGENTE: "bg-red-500/20 text-red-500 border-red-500/30",
  NORMAL: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  BAIXO: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
}

const typeColors: Record<string, string> = {
  JURIDICO: "bg-blue-500/20 text-blue-400",
  ADM: "bg-purple-500/20 text-purple-400",
  CLIENTE: "bg-green-500/20 text-green-400",
}

export function VisaoGeral() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-white tracking-wide">BACKLOG / COMMAND CENTER</h2>
        <p className="text-neutral-500 text-sm font-mono mt-1">administracao centralizada</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#141414] border-[#2a2a2a] hover:border-orange-500/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-neutral-500 text-xs font-mono tracking-wider mb-1">{stat.label.toUpperCase()}</p>
                  <p className="text-3xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-neutral-600 text-xs font-mono mt-1">{stat.change}</p>
                </div>
                <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="bg-transparent border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 font-mono text-xs tracking-widest uppercase"
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-[#141414] border-[#2a2a2a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[360px]">
              <div className="px-4 pb-4 space-y-1">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded bg-[#1a1a1a] group-hover:bg-[#222] flex items-center justify-center text-orange-500 text-xs font-bold font-mono">
                      {activity.user.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-neutral-500">{activity.action}</span>{" "}
                        <span className="text-orange-500">{activity.target}</span>
                      </p>
                      <p className="text-xs text-neutral-600 font-mono">{activity.time} atras</p>
                    </div>
                    <Badge className={`${typeColors[activity.type]} text-[10px] font-mono`}>
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card className="bg-[#141414] border-[#2a2a2a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Itens Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[360px]">
              <div className="px-4 pb-4 space-y-2">
                {pendingItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded bg-[#1a1a1a] border border-[#2a2a2a] hover:border-l-2 hover:border-l-orange-500 hover:bg-[#1f1f1f] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{item.title}</p>
                        <p className="text-xs text-neutral-600 font-mono mt-1">Prazo: {item.dueDate}</p>
                      </div>
                      <Badge className={`${priorityColors[item.priority]} text-[10px] font-mono border`}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
