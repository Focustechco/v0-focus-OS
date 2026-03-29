"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Activity,
  Radio,
  FolderKanban,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Briefcase,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

const teamMembers = [
  { id: 1, name: "Gabriel", role: "CTO / Dev Full-stack", status: "ativo", color: "bg-orange-500" },
  { id: 2, name: "Dev do Projeto", role: "Desenvolvedor", status: "em-sprint", color: "bg-blue-500" },
  { id: 3, name: "DevSecOps", role: "Infraestrutura", status: "stand-by", color: "bg-purple-500" },
  { id: 4, name: "Consultor Tecnico", role: "Estagiario", status: "em-task", color: "bg-neutral-500" },
  { id: 5, name: "Comercial", role: "Vendas", status: "reuniao", color: "bg-green-500" },
]

const activityLog = [
  { time: "25/06 09:29", actor: "Gabriel", action: "completou revisao de PR", project: "Projeto Alpha" },
  { time: "25/06 08:12", actor: "Estagiario_01", action: "entregou task #47", project: "App Beta" },
  { time: "24/06 22:55", actor: "DevSecOps", action: "configurou ambiente", project: "Automacao X" },
  { time: "24/06 21:33", actor: "Dev_02", action: "iniciou sprint #7", project: "Sistema Y" },
  { time: "24/06 19:45", actor: "Gabriel", action: "aprovou deploy", project: "Projeto Alpha" },
]

const pendingApprovals = [
  { id: 1, project: "PRJ-038", title: "Etapa 1 -> Etapa 2", priority: "alta", days: 2 },
  { id: 2, project: "PRJ-041", title: "Task #089 em Revisao", priority: "normal", days: 1 },
  { id: 3, project: "PRJ-035", title: "Proposta de Fechamento", priority: "baixa", days: 0 },
]

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    ativo: { label: "ATIVO", className: "bg-green-500/20 text-green-500 border-green-500/30" },
    "em-sprint": { label: "EM SPRINT", className: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
    "stand-by": { label: "STAND-BY", className: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30" },
    "em-task": { label: "EM TASK", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    reuniao: { label: "REUNIAO", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  }

  const config = statusConfig[status] || statusConfig["stand-by"]

  return (
    <Badge variant="outline" className={`text-[9px] font-mono ${config.className}`}>
      {config.label}
    </Badge>
  )
}

export function CommandCenter() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FolderKanban className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] text-green-500 font-mono">+3 esta semana</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">23</div>
            <div className="text-xs text-neutral-500">Projetos Ativos</div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-[10px] text-orange-500 font-mono">7 em curso</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">7</div>
            <div className="text-xs text-neutral-500">Sprints Ativas</div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-[10px] text-red-500 font-mono">5 pendentes</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">89</div>
            <div className="text-xs text-neutral-500">Tasks Abertas</div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-[10px] text-green-500 font-mono">94% taxa</span>
            </div>
            <div className="text-3xl font-bold font-mono text-white">156</div>
            <div className="text-xs text-neutral-500">Entregas no Mes</div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Comercial Card */}
      <Card className="bg-gradient-to-r from-[#141414] to-[#1A1A1A] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-1">PIPELINE COMERCIAL</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-white font-mono">23 deals ativos</span>
                  <span className="text-orange-500 font-mono">R$ 47.800 pipeline</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 text-yellow-500 text-[10px]">
                  <AlertTriangle className="w-3 h-3" />
                  <span>3 deals parados</span>
                </div>
                <div className="flex items-center gap-1 text-green-500 text-[10px] mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>5 prioritarios</span>
                </div>
              </div>
              <Link href="/comercial">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  VER PIPELINE
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Allocation */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              ALOCACAO DE EQUIPE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                <div className="text-2xl font-bold text-white font-mono">4</div>
                <div className="text-[10px] text-neutral-500">Tech Leads</div>
              </div>
              <div className="text-center p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                <div className="text-2xl font-bold text-white font-mono">12</div>
                <div className="text-[10px] text-neutral-500">Estagiarios</div>
              </div>
              <div className="text-center p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                <div className="text-2xl font-bold text-white font-mono">3</div>
                <div className="text-[10px] text-neutral-500">DevSecOps</div>
              </div>
            </div>

            {/* Team List */}
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-orange-500/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${member.color}`} />
                    <div>
                      <div className="text-sm text-white font-medium">{member.name}</div>
                      <div className="text-[10px] text-neutral-500">{member.role}</div>
                    </div>
                  </div>
                  <StatusBadge status={member.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              ACTIVITY LOG
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {activityLog.map((log, index) => (
                <div
                  key={index}
                  className="border-l-2 border-orange-500 pl-3 py-2 hover:bg-[#1A1A1A] rounded-r transition-colors"
                >
                  <div className="text-[10px] text-neutral-500 font-mono">{log.time}</div>
                  <div className="text-xs text-white mt-1">
                    <span className="text-orange-500 font-mono">{log.actor}</span>{" "}
                    <span className="text-neutral-400">{log.action}</span>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">{log.project}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Internal Communication Channel */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-500" />
              CANAL INTERNO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Radar Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                {/* Radar circles */}
                <div className="absolute inset-0 border-2 border-orange-500/30 rounded-full" />
                <div className="absolute inset-4 border border-orange-500/20 rounded-full" />
                <div className="absolute inset-8 border border-orange-500/10 rounded-full" />
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                </div>
                {/* Sweep line */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-transparent origin-left animate-[radar-sweep_4s_linear_infinite]" />
                </div>
                {/* Status text */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-green-500 font-mono whitespace-nowrap">
                  CANAL SEGURO ATIVO
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-2 text-[10px] font-mono bg-[#0A0A0A] p-3 rounded-lg border border-[#2A2A2A]">
              <div className="text-neutral-500"># 2025-06-25 14:23 UTC</div>
              <div className="text-white">{"> [Gabriel] Sprint #7 finalizada com sucesso"}</div>
              <div className="text-orange-500">{"> [Sistema] Deploy #142 em producao"}</div>
              <div className="text-white">{"> [DevSecOps] Ambiente staging atualizado"}</div>
              <div className="text-neutral-400 mt-2">
                {'> Proxima reuniao: 26/06 10:00 - Review semanal'}
              </div>
            </div>

            <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white text-xs">
              <MessageSquare className="w-4 h-4 mr-2" />
              Abrir Canal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                APROVACOES PENDENTES
              </CardTitle>
              <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-[10px]">
                {pendingApprovals.length} pendentes
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {approval.priority === "alta" ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : approval.priority === "normal" ? (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-neutral-500" />
                  )}
                  <div>
                    <div className="text-xs text-white font-mono">{approval.project}</div>
                    <div className="text-[10px] text-neutral-500">{approval.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {approval.days > 0 && (
                    <span className="text-[10px] text-red-500 font-mono">
                      {approval.days}d aguardando
                    </span>
                  )}
                  <Button size="sm" className="h-7 text-[10px] bg-orange-500 hover:bg-orange-600">
                    Revisar
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Project Overview */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-3 border-b border-[#2A2A2A]">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-orange-500" />
              VISAO GERAL DE PROJETOS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Project stats by stage */}
            {[
              { stage: "Diagnostico Inicial", count: 3, color: "bg-blue-500" },
              { stage: "MVP / Prototipo", count: 4, color: "bg-purple-500" },
              { stage: "Proposta e Fechamento", count: 2, color: "bg-yellow-500" },
              { stage: "Sprints de Desenvolvimento", count: 8, color: "bg-orange-500" },
              { stage: "Deploy e Entrega", count: 4, color: "bg-green-500" },
              { stage: "Suporte Recorrente (MRR)", count: 2, color: "bg-neutral-500" },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">{item.stage}</span>
                  <span className="text-white font-mono">{item.count}</span>
                </div>
                <Progress
                  value={(item.count / 23) * 100}
                  className="h-1.5 bg-[#2A2A2A]"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
