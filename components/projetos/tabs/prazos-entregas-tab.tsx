"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  FolderKanban,
} from "lucide-react"

const deliveries = [
  {
    id: "PRJ-038",
    name: "Sistema de Gestao",
    client: "Empresa XYZ",
    delivery: "Entrega do MVP",
    deadline: "05/07/2025",
    daysLeft: 2,
    progress: 95,
    responsible: "Gabriel",
    status: "risco",
  },
  {
    id: "PRJ-041",
    name: "App Mobile E-commerce",
    client: "Loja ABC",
    delivery: "Sprint #3 - Modulo Carrinho",
    deadline: "15/07/2025",
    daysLeft: 12,
    progress: 45,
    responsible: "Maria",
    status: "no-prazo",
  },
  {
    id: "PRJ-042",
    name: "Sistema de Gestao Empresarial",
    client: "Industria Z",
    delivery: "Deploy em Producao",
    deadline: "30/07/2025",
    daysLeft: 27,
    progress: 80,
    responsible: "Joao",
    status: "no-prazo",
  },
  {
    id: "PRJ-035",
    name: "Portal do Cliente",
    client: "Servicos Y",
    delivery: "Entrega Final",
    deadline: "28/06/2025",
    daysLeft: 0,
    progress: 100,
    responsible: "Ana",
    status: "entregue",
  },
  {
    id: "PRJ-040",
    name: "Automacao de Vendas",
    client: "Vendas Corp",
    delivery: "Integracao com CRM",
    deadline: "01/07/2025",
    daysLeft: -2,
    progress: 70,
    responsible: "Pedro",
    status: "atrasado",
  },
]

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  "no-prazo": { label: "NO PRAZO", color: "text-green-500", bg: "bg-green-500" },
  "risco": { label: "EM RISCO", color: "text-yellow-500", bg: "bg-yellow-500" },
  "atrasado": { label: "ATRASADO", color: "text-red-500", bg: "bg-red-500" },
  "entregue": { label: "ENTREGUE", color: "text-green-600", bg: "bg-green-600" },
}

function DeliveryCard({ delivery }: { delivery: typeof deliveries[0] }) {
  const status = statusConfig[delivery.status]
  
  return (
    <Card className={`bg-[#141414] border-[#2A2A2A] ${delivery.status === "atrasado" ? "border-l-4 border-l-red-500" : delivery.status === "risco" ? "border-l-4 border-l-yellow-500" : ""} hover:border-orange-500/30 transition-colors`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-orange-500 font-mono">{delivery.id}</span>
              <Badge className={`text-[9px] ${status.bg} text-white`}>
                {status.label}
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-white truncate">{delivery.name}</h3>
            <p className="text-[10px] text-neutral-500 truncate">{delivery.client}</p>
          </div>
          <div className="flex-shrink-0">
            {delivery.status === "atrasado" ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : delivery.status === "risco" ? (
              <Clock className="w-5 h-5 text-yellow-500" />
            ) : delivery.status === "entregue" ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Calendar className="w-5 h-5 text-neutral-500" />
            )}
          </div>
        </div>

        <div className="p-2 sm:p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] mb-3">
          <div className="text-[10px] text-neutral-400 mb-1">Entrega:</div>
          <div className="text-xs sm:text-sm text-white truncate">{delivery.delivery}</div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-[10px]">
            <span className="text-neutral-500">Progresso</span>
            <span className="text-white font-mono">{delivery.progress}%</span>
          </div>
          <Progress value={delivery.progress} className="h-1.5 bg-[#2A2A2A]" />
        </div>

        <div className="flex items-center justify-between text-[10px] pt-3 border-t border-[#2A2A2A] flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 text-neutral-400">
              <User className="w-3 h-3" />
              {delivery.responsible}
            </div>
            <div className="flex items-center gap-1 text-neutral-400">
              <Calendar className="w-3 h-3" />
              {delivery.deadline}
            </div>
          </div>
          {delivery.daysLeft !== 0 && (
            <span className={`font-mono ${delivery.daysLeft < 0 ? "text-red-500" : delivery.daysLeft <= 3 ? "text-yellow-500" : "text-neutral-400"}`}>
              {delivery.daysLeft < 0 ? `${Math.abs(delivery.daysLeft)}d atrasado` : `${delivery.daysLeft}d restantes`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function PrazosEntregasTab() {
  const atrasados = deliveries.filter(d => d.status === "atrasado").length
  const emRisco = deliveries.filter(d => d.status === "risco").length
  const noPrazo = deliveries.filter(d => d.status === "no-prazo").length
  const entregues = deliveries.filter(d => d.status === "entregue").length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-white">Prazos & Entregas</h1>
          <p className="text-xs sm:text-sm text-neutral-500">Timeline e deadlines dos projetos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-red-500 font-mono">{atrasados}</div>
              <div className="text-[10px] sm:text-xs text-red-400">Atrasados</div>
            </div>
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-500 font-mono">{emRisco}</div>
              <div className="text-[10px] sm:text-xs text-yellow-400">Em Risco</div>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-green-500 font-mono">{noPrazo}</div>
              <div className="text-[10px] sm:text-xs text-green-400">No Prazo</div>
            </div>
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white font-mono">{entregues}</div>
              <div className="text-[10px] sm:text-xs text-neutral-400">Entregues (mes)</div>
            </div>
            <FolderKanban className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
          </CardContent>
        </Card>
      </div>

      {/* Timeline Visual */}
      <Card className="bg-[#141414] border-[#2A2A2A] mb-6 overflow-hidden">
        <CardHeader className="border-b border-[#2A2A2A] p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-orange-500" />
            TIMELINE - JULHO 2025
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 p-3 sm:p-6 overflow-x-auto">
          <div className="space-y-3 min-w-[400px]">
            {deliveries.filter(d => d.status !== "entregue").sort((a, b) => a.daysLeft - b.daysLeft).map((delivery) => {
              const status = statusConfig[delivery.status]
              return (
                <div key={delivery.id} className="flex items-center gap-2 sm:gap-4">
                  <div className="w-16 sm:w-20 text-xs text-orange-500 font-mono flex-shrink-0">{delivery.id}</div>
                  <div className="flex-1 h-6 bg-[#0A0A0A] rounded relative overflow-hidden min-w-[120px]">
                    <div 
                      className={`h-full ${status.bg} transition-all duration-500`}
                      style={{ width: `${delivery.progress}%` }}
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white font-medium truncate max-w-[100px] sm:max-w-[200px]">
                      {delivery.name}
                    </span>
                  </div>
                  <div className={`w-16 sm:w-24 text-right text-[10px] sm:text-xs font-mono ${status.color} flex-shrink-0`}>
                    {delivery.daysLeft < 0 ? `${Math.abs(delivery.daysLeft)}d atras.` : `${delivery.daysLeft}d`}
                  </div>
                  <div className="w-16 sm:w-20 text-[10px] sm:text-xs text-neutral-500 font-mono flex-shrink-0 hidden sm:block">{delivery.deadline}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {deliveries.map((delivery) => (
          <DeliveryCard key={delivery.id} delivery={delivery} />
        ))}
      </div>
    </div>
  )
}
