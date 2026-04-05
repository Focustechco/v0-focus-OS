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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-xl font-display font-bold text-white tracking-wide">BACKLOG / COMMAND CENTER</h2>
        <p className="text-neutral-500 text-xs sm:text-sm font-mono mt-1">administracao centralizada</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#141414] border-[#2a2a2a] hover:border-orange-500/30 transition-colors">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-neutral-500 text-[10px] sm:text-xs font-mono tracking-wider mb-1 truncate">{stat.label.toUpperCase()}</p>
                  <p className="text-xl sm:text-3xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-neutral-600 text-[10px] sm:text-xs font-mono mt-1 truncate">{stat.change}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Scrollable on mobile */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="bg-transparent border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500 font-mono text-[10px] sm:text-xs tracking-widest uppercase whitespace-nowrap flex-shrink-0"
          >
            <action.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card className="bg-[#141414] border-[#2a2a2a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[240px] sm:h-[360px]">
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#1a1a1a] group-hover:bg-[#222] flex items-center justify-center text-orange-500 text-[10px] sm:text-xs font-bold font-mono flex-shrink-0">
                      {activity.user.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-white truncate">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-neutral-500">{activity.action}</span>{" "}
                        <span className="text-orange-500 hidden sm:inline">{activity.target}</span>
                      </p>
                      <p className="text-[10px] sm:text-xs text-neutral-600 font-mono">{activity.time} atras</p>
                    </div>
                    <Badge className={`${typeColors[activity.type]} text-[8px] sm:text-[10px] font-mono hidden sm:flex`}>
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
            <ScrollArea className="h-[240px] sm:h-[360px]">
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                {pendingItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 sm:p-3 rounded bg-[#1a1a1a] border border-[#2a2a2a] hover:border-l-2 hover:border-l-orange-500 hover:bg-[#1f1f1f] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-white font-medium line-clamp-2">{item.title}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-600 font-mono mt-1">Prazo: {item.dueDate}</p>
                      </div>
                      <Badge className={`${priorityColors[item.priority]} text-[8px] sm:text-[10px] font-mono border flex-shrink-0`}>
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
