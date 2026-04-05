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
    <div className="space-y-4 sm:space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span className="text-[8px] sm:text-[10px] text-green-500 font-mono">+3</span>
            </div>
            <div className="text-xl sm:text-3xl font-bold font-mono text-white">23</div>
            <div className="text-[10px] sm:text-xs text-neutral-500 truncate">Projetos</div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              <span className="text-[8px] sm:text-[10px] text-orange-500 font-mono">ativo</span>
            </div>
            <div className="text-xl sm:text-3xl font-bold font-mono text-white">7</div>
            <div className="text-[10px] sm:text-xs text-neutral-500 truncate">Sprints</div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-[8px] sm:text-[10px] text-red-500 font-mono">5 pend</span>
            </div>
            <div className="text-xl sm:text-3xl font-bold font-mono text-white">89</div>
            <div className="text-[10px] sm:text-xs text-neutral-500 truncate">Tasks</div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <span className="text-[8px] sm:text-[10px] text-green-500 font-mono">94%</span>
            </div>
            <div className="text-xl sm:text-3xl font-bold font-mono text-white">156</div>
            <div className="text-[10px] sm:text-xs text-neutral-500 truncate">Entregas</div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Comercial Card */}
      <Card className="bg-gradient-to-r from-[#141414] to-[#1A1A1A] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider mb-1">PIPELINE COMERCIAL</h3>
                <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
                  <span className="text-white font-mono">23 deals</span>
                  <span className="text-orange-500 font-mono">R$ 47.8k</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="text-left sm:text-right">
                <div className="flex items-center gap-1 text-yellow-500 text-[9px] sm:text-[10px]">
                  <AlertTriangle className="w-3 h-3" />
                  <span>3 parados</span>
                </div>
                <div className="flex items-center gap-1 text-green-500 text-[9px] sm:text-[10px] mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>5 prioritarios</span>
                </div>
              </div>
              <Link href="/comercial">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 sm:h-10 px-3 sm:px-4">
                  <span className="hidden sm:inline">VER PIPELINE</span>
                  <span className="sm:hidden">VER</span>
                  <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Team Allocation */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-2 sm:pb-3 border-b border-[#2A2A2A] px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              EQUIPE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center p-2 sm:p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                <div className="text-lg sm:text-2xl font-bold text-white font-mono">4</div>
                <div className="text-[8px] sm:text-[10px] text-neutral-500">Leads</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                <div className="text-lg sm:text-2xl font-bold text-white font-mono">12</div>
                <div className="text-[8px] sm:text-[10px] text-neutral-500">Estag.</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                <div className="text-lg sm:text-2xl font-bold text-white font-mono">3</div>
                <div className="text-[8px] sm:text-[10px] text-neutral-500">DevOps</div>
              </div>
            </div>

            {/* Team List */}
            <div className="space-y-1 sm:space-y-2 max-h-[180px] sm:max-h-[280px] overflow-y-auto">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-orange-500/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${member.color}`} />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-white font-medium truncate">{member.name}</div>
                      <div className="text-[9px] sm:text-[10px] text-neutral-500 truncate">{member.role}</div>
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
          <CardHeader className="pb-2 sm:pb-3 border-b border-[#2A2A2A] px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              ACTIVITY LOG
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
            <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2">
              {activityLog.map((log, index) => (
                <div
                  key={index}
                  className="border-l-2 border-orange-500 pl-2 sm:pl-3 py-1 sm:py-2 hover:bg-[#1A1A1A] rounded-r transition-colors"
                >
                  <div className="text-[9px] sm:text-[10px] text-neutral-500 font-mono">{log.time}</div>
                  <div className="text-[10px] sm:text-xs text-white mt-0.5 sm:mt-1">
                    <span className="text-orange-500 font-mono">{log.actor}</span>{" "}
                    <span className="text-neutral-400 hidden sm:inline">{log.action}</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-neutral-500 mt-0.5 font-mono truncate">{log.project}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Internal Communication Channel */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-2 sm:pb-3 border-b border-[#2A2A2A] px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-500" />
              CANAL INTERNO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
            {/* Radar Animation - Hidden on mobile */}
            <div className="hidden sm:flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-2 border-orange-500/30 rounded-full" />
                <div className="absolute inset-4 border border-orange-500/20 rounded-full" />
                <div className="absolute inset-8 border border-orange-500/10 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-transparent origin-left animate-[radar-sweep_4s_linear_infinite]" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-green-500 font-mono whitespace-nowrap">
                  CANAL SEGURO ATIVO
                </div>
              </div>
            </div>

            {/* Mobile status indicator */}
            <div className="flex sm:hidden items-center justify-center gap-2 mb-3 p-2 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-green-500 font-mono">CANAL ATIVO</span>
            </div>

            {/* Messages */}
            <div className="space-y-1 sm:space-y-2 text-[9px] sm:text-[10px] font-mono bg-[#0A0A0A] p-2 sm:p-3 rounded-lg border border-[#2A2A2A] max-h-[120px] sm:max-h-none overflow-y-auto">
              <div className="text-neutral-500"># 2025-06-25 14:23 UTC</div>
              <div className="text-white truncate">{"> [Gabriel] Sprint #7 finalizada"}</div>
              <div className="text-orange-500 truncate">{"> [Sistema] Deploy #142 em prod"}</div>
              <div className="text-white truncate">{"> [DevSecOps] Staging atualizado"}</div>
              <div className="text-neutral-400 mt-1 sm:mt-2 truncate">
                {'> Reuniao: 26/06 10:00'}
              </div>
            </div>

            <Button className="w-full mt-3 sm:mt-4 bg-orange-500 hover:bg-orange-600 text-white text-[10px] sm:text-xs h-8 sm:h-10">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Abrir Canal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pending Approvals */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-2 sm:pb-3 border-b border-[#2A2A2A] px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="hidden sm:inline">APROVACOES PENDENTES</span>
                <span className="sm:hidden">APROVACOES</span>
              </CardTitle>
              <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-[8px] sm:text-[10px]">
                {pendingApprovals.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 space-y-2 sm:space-y-3">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-orange-500/30 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {approval.priority === "alta" ? (
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                  ) : approval.priority === "normal" ? (
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs text-white font-mono">{approval.project}</div>
                    <div className="text-[9px] sm:text-[10px] text-neutral-500 truncate">{approval.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {approval.days > 0 && (
                    <span className="text-[8px] sm:text-[10px] text-red-500 font-mono hidden sm:inline">
                      {approval.days}d
                    </span>
                  )}
                  <Button size="sm" className="h-6 sm:h-7 text-[9px] sm:text-[10px] bg-orange-500 hover:bg-orange-600 px-2 sm:px-3">
                    <span className="hidden sm:inline">Revisar</span>
                    <ArrowRight className="w-3 h-3 sm:ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Project Overview */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="pb-2 sm:pb-3 border-b border-[#2A2A2A] px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">VISAO GERAL DE PROJETOS</span>
              <span className="sm:hidden">PROJETOS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 space-y-2 sm:space-y-4">
            {[
              { stage: "Diagnostico", count: 3 },
              { stage: "MVP/Prototipo", count: 4 },
              { stage: "Fechamento", count: 2 },
              { stage: "Desenvolvimento", count: 8 },
              { stage: "Deploy", count: 4 },
              { stage: "Suporte (MRR)", count: 2 },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-neutral-400 truncate">{item.stage}</span>
                  <span className="text-white font-mono ml-2">{item.count}</span>
                </div>
                <Progress
                  value={(item.count / 23) * 100}
                  className="h-1 sm:h-1.5 bg-[#2A2A2A]"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
