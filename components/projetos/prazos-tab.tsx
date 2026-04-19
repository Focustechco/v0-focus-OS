"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useProjetos, Project } from "@/lib/hooks/use-projetos"

import {
  User,
  FolderKanban,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import { ProjectCalendar } from "./project-calendar"

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  "no-prazo": { label: "NO PRAZO", color: "text-green-500", bg: "bg-green-500" },
  "risco": { label: "EM RISCO", color: "text-yellow-500", bg: "bg-yellow-500" },
  "atrasado": { label: "ATRASADO", color: "text-red-500", bg: "bg-red-500" },
  "entregue": { label: "ENTREGUE", color: "text-green-600", bg: "bg-green-600" },
}

export function PrazosTab() {
  const { projects, isLoading } = useProjetos()

  const calculateDaysLeft = (dateStr?: string) => {
    if (!dateStr) return 0
    const deadline = new Date(dateStr)
    const today = new Date()
    const diff = deadline.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const deliveries = projects.map(p => {
    const daysLeft = calculateDaysLeft(p.prazo)
    let status = "no-prazo"
    
    if (p.status === "concluido") status = "entregue"
    else if (daysLeft < 0) status = "atrasado"
    else if (daysLeft <= 3) status = "risco"

    const statusInfo = statusConfig[status]

    return {
      id: p.codigo,
      name: p.nome,
      client: p.clientes?.nome || "Sem Cliente",
      delivery: p.status ? p.status.toUpperCase() : "N/A",
      deadline: p.prazo ? new Date(p.prazo).toLocaleDateString("pt-BR") : "Sem prazo",
      daysLeft,
      progress: p.progresso || 0,
      responsible: p.team_lead?.nome || "Não atribuído",
      status,
      statusLabel: statusInfo.label,
      statusColor: statusInfo.color,
      statusBg: statusInfo.bg
    }
  })

  const atrasados = deliveries.filter(d => d.status === "atrasado").length
  const emRisco = deliveries.filter(d => d.status === "risco").length
  const noPrazo = deliveries.filter(d => d.status === "no-prazo").length
  const entregues = deliveries.filter(d => d.status === "entregue").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-orange-500">
        Carregando prazos dos projetos...
      </div>
    )
  }

  return (
    <div className="flex-1 w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Prazos & Entregas</h1>
          <p className="text-sm text-neutral-500">Timeline e deadlines dos projetos reais</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-500 font-mono">{atrasados}</div>
              <div className="text-xs text-red-400">Atrasados</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-500 font-mono">{emRisco}</div>
              <div className="text-xs text-yellow-400">Em Risco</div>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-500 font-mono">{noPrazo}</div>
              <div className="text-xs text-green-400">No Prazo</div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white font-mono">{entregues}</div>
              <div className="text-xs text-neutral-400">Entregues</div>
            </div>
            <FolderKanban className="w-8 h-8 text-orange-500" />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Calendar View */}
      <ProjectCalendar />

      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {deliveries.map((delivery) => (
          <DeliveryCard key={delivery.id} delivery={delivery} />
        ))}
      </div>
    </div>
  )
}

function DeliveryCard({ delivery }: { delivery: any }) {
  return (
    <Card className={`bg-[#141414] border-[#2A2A2A] ${delivery.status === "atrasado" ? "border-l-4 border-l-red-500" : delivery.status === "risco" ? "border-l-4 border-l-yellow-500" : ""} hover:border-orange-500/30 transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-orange-500 font-mono">{delivery.id}</span>
              <Badge className={`text-[9px] ${delivery.statusBg} text-white`}>
                {delivery.statusLabel}
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-white">{delivery.name}</h3>
            <p className="text-[10px] text-neutral-500">{delivery.client}</p>
          </div>
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

        <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] mb-3">
          <div className="text-xs text-neutral-400 mb-1">Fase Atual:</div>
          <div className="text-sm text-white uppercase">{delivery.delivery}</div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-[10px]">
            <span className="text-neutral-500">Progresso</span>
            <span className="text-white font-mono">{delivery.progress}%</span>
          </div>
          <Progress value={delivery.progress} className="h-1.5 bg-[#2A2A2A]" />
        </div>

        <div className="flex items-center justify-between text-[10px] pt-3 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-neutral-400">
              <User className="w-3 h-3" />
              {delivery.responsible}
            </div>
            <div className="flex items-center gap-1 text-neutral-400">
              <Calendar className="w-3 h-3" />
              {delivery.deadline}
            </div>
          </div>
          {delivery.daysLeft !== 0 && delivery.status !== "entregue" && (
            <span className={`font-mono ${delivery.daysLeft < 0 ? "text-red-500" : delivery.daysLeft <= 3 ? "text-yellow-500" : "text-neutral-400"}`}>
              {delivery.daysLeft < 0 ? `${Math.abs(delivery.daysLeft)}d atrasado` : `${delivery.daysLeft}d restantes`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
