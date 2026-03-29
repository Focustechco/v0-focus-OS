"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Zap,
  Calendar,
  Clock,
  Users,
  ListTodo,
  ArrowRight,
  Plus,
  TrendingDown,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react"

const sprints = [
  {
    id: 7,
    project: "Projeto Alpha",
    projectId: "PRJ-042",
    startDate: "23/06/2025",
    endDate: "07/07/2025",
    daysLeft: 6,
    progress: 75,
    tasks: { todo: 4, inProgress: 3, review: 2, done: 11 },
    team: ["Gabriel", "Joao"],
    status: "active",
  },
  {
    id: 6,
    project: "App Beta",
    projectId: "PRJ-041",
    startDate: "16/06/2025",
    endDate: "30/06/2025",
    daysLeft: 2,
    progress: 90,
    tasks: { todo: 1, inProgress: 2, review: 3, done: 14 },
    team: ["Gabriel", "Maria"],
    status: "active",
  },
  {
    id: 5,
    project: "Automacao X",
    projectId: "PRJ-040",
    startDate: "09/06/2025",
    endDate: "23/06/2025",
    daysLeft: 0,
    progress: 100,
    tasks: { todo: 0, inProgress: 0, review: 0, done: 18 },
    team: ["Gabriel", "Pedro"],
    status: "completed",
  },
]

const activeSprint = sprints[0]

const burndownData = [
  { day: 1, ideal: 20, actual: 20 },
  { day: 2, ideal: 18, actual: 19 },
  { day: 3, ideal: 16, actual: 18 },
  { day: 4, ideal: 14, actual: 16 },
  { day: 5, ideal: 12, actual: 13 },
  { day: 6, ideal: 10, actual: 11 },
  { day: 7, ideal: 8, actual: 9 },
  { day: 8, ideal: 6, actual: 7 },
  { day: 9, ideal: 4, actual: 5 },
  { day: 10, ideal: 2, actual: null },
  { day: 11, ideal: 0, actual: null },
]

const sprintTasks = [
  { id: "T-089", title: "Criar tela de login", status: "done", assignee: "Joao", priority: "alta" },
  { id: "T-090", title: "Integrar API de usuarios", status: "inProgress", assignee: "Joao", priority: "alta" },
  { id: "T-091", title: "Implementar dashboard", status: "inProgress", assignee: "Maria", priority: "media" },
  { id: "T-092", title: "Testes unitarios", status: "review", assignee: "Joao", priority: "media" },
  { id: "T-093", title: "Documentacao API", status: "todo", assignee: "Maria", priority: "baixa" },
]

function SprintCard({ sprint }: { sprint: typeof sprints[0] }) {
  const totalTasks = sprint.tasks.todo + sprint.tasks.inProgress + sprint.tasks.review + sprint.tasks.done
  
  return (
    <Card className={`bg-[#141414] border-[#2A2A2A] ${sprint.status === "active" ? "border-l-4 border-l-orange-500" : ""} hover:border-orange-500/30 transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-white font-mono">SPRINT #{sprint.id}</span>
              <Badge className={sprint.status === "active" ? "bg-orange-500" : "bg-green-500"}>
                {sprint.status === "active" ? "ATIVA" : "CONCLUIDA"}
              </Badge>
            </div>
            <p className="text-sm text-neutral-400">{sprint.project}</p>
            <p className="text-[10px] text-orange-500 font-mono">{sprint.projectId}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-500">Periodo</div>
            <div className="text-xs text-neutral-300 font-mono">{sprint.startDate} - {sprint.endDate}</div>
            {sprint.daysLeft > 0 && (
              <div className={`text-xs font-mono mt-1 ${sprint.daysLeft <= 2 ? "text-red-500" : "text-orange-500"}`}>
                {sprint.daysLeft} dias restantes
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-neutral-500">Progresso</span>
              <span className="text-white font-mono">{sprint.progress}%</span>
            </div>
            <Progress value={sprint.progress} className="h-2 bg-[#2A2A2A]" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 bg-[#0A0A0A] rounded text-center">
              <div className="text-lg font-bold text-neutral-400 font-mono">{sprint.tasks.todo}</div>
              <div className="text-[9px] text-neutral-600">TO DO</div>
            </div>
            <div className="p-2 bg-[#0A0A0A] rounded text-center">
              <div className="text-lg font-bold text-blue-500 font-mono">{sprint.tasks.inProgress}</div>
              <div className="text-[9px] text-neutral-600">IN PROGRESS</div>
            </div>
            <div className="p-2 bg-[#0A0A0A] rounded text-center">
              <div className="text-lg font-bold text-yellow-500 font-mono">{sprint.tasks.review}</div>
              <div className="text-[9px] text-neutral-600">REVIEW</div>
            </div>
            <div className="p-2 bg-[#0A0A0A] rounded text-center">
              <div className="text-lg font-bold text-green-500 font-mono">{sprint.tasks.done}</div>
              <div className="text-[9px] text-neutral-600">DONE</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-500" />
              <span className="text-[10px] text-neutral-400">{sprint.team.join(", ")}</span>
            </div>
            <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600">
              Ver Sprint
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SprintsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader title="SPRINTS" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Sprints</h1>
              <p className="text-sm text-neutral-500">Gerenciamento de sprints ativas</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova Sprint
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Sprint Detail */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sprint Header */}
              <Card className="bg-[#141414] border-[#2A2A2A] border-l-4 border-l-orange-500">
                <CardHeader className="border-b border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      SPRINT #{activeSprint.id} — {activeSprint.project.toUpperCase()}
                    </CardTitle>
                    <Badge className="bg-orange-500 text-white">{activeSprint.daysLeft} dias restantes</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Calendar className="w-4 h-4" />
                        {activeSprint.startDate} - {activeSprint.endDate}
                      </div>
                    </div>
                    <Progress value={activeSprint.progress} className="w-48 h-2 bg-[#2A2A2A]" />
                    <span className="text-sm font-mono text-white">{activeSprint.progress}%</span>
                  </div>

                  {/* Burndown Chart */}
                  <div className="h-48 bg-[#0A0A0A] rounded-lg p-4 relative">
                    <div className="absolute top-2 left-2 text-[10px] text-neutral-500 flex items-center gap-2">
                      <TrendingDown className="w-3 h-3" />
                      BURNDOWN CHART
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid meet">
                      {/* Grid */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line key={i} x1="40" y1={30 + i * 30} x2="380" y2={30 + i * 30} stroke="#2A2A2A" strokeWidth="1" />
                      ))}
                      {/* Ideal line */}
                      <polyline
                        points={burndownData.map((d, i) => `${40 + i * 34},${30 + (1 - d.ideal / 20) * 120}`).join(" ")}
                        fill="none"
                        stroke="#525252"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      {/* Actual line */}
                      <polyline
                        points={burndownData
                          .filter((d) => d.actual !== null)
                          .map((d, i) => `${40 + i * 34},${30 + (1 - (d.actual || 0) / 20) * 120}`)
                          .join(" ")}
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="2"
                      />
                      {/* Y axis labels */}
                      <text x="10" y="35" className="fill-neutral-500 text-[8px]">20</text>
                      <text x="10" y="95" className="fill-neutral-500 text-[8px]">10</text>
                      <text x="10" y="155" className="fill-neutral-500 text-[8px]">0</text>
                    </svg>
                    <div className="absolute bottom-2 right-4 flex items-center gap-4 text-[9px]">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-neutral-500" />
                        <span className="text-neutral-500">Ideal</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-orange-500" />
                        <span className="text-neutral-500">Atual</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sprint Tasks */}
              <Card className="bg-[#141414] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-orange-500" />
                    TASKS DA SPRINT
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#2A2A2A]">
                    {sprintTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 hover:bg-[#1A1A1A] transition-colors">
                        <div className="flex items-center gap-3">
                          {task.status === "done" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : task.status === "inProgress" ? (
                            <Circle className="w-4 h-4 text-blue-500" />
                          ) : task.status === "review" ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-600" />
                          )}
                          <div>
                            <div className="text-xs text-orange-500 font-mono">{task.id}</div>
                            <div className={`text-sm ${task.status === "done" ? "text-neutral-500 line-through" : "text-white"}`}>
                              {task.title}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={`text-[9px] ${
                            task.priority === "alta" ? "border-red-500 text-red-500" :
                            task.priority === "media" ? "border-yellow-500 text-yellow-500" :
                            "border-neutral-500 text-neutral-500"
                          }`}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-neutral-400">{task.assignee}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Meetings */}
              <Card className="bg-[#141414] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    CADENCIA DE REUNIOES
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-sm text-white font-medium">Reuniao Interna Semanal</span>
                    </div>
                    <p className="text-xs text-neutral-400 ml-4">
                      Acompanhamento de todos os projetos em curso, status de sprints, bloqueios e realocacao de recursos.
                    </p>
                    <p className="text-[10px] text-neutral-500 ml-4 mt-1">
                      Participantes: Gabriel + devs ativos + DevSecOps quando relevante
                    </p>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm text-white font-medium">Reuniao com Cliente Quinzenal</span>
                    </div>
                    <p className="text-xs text-neutral-400 ml-4">
                      Apresentacao de entregas, validacao/aprovacao do cliente, coleta de ajustes para proxima sprint.
                    </p>
                    <p className="text-[10px] text-neutral-500 ml-4 mt-1">
                      Participantes: Gabriel + Dev do projeto + cliente
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - All Sprints */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-neutral-400 tracking-wider">TODAS AS SPRINTS</h2>
              {sprints.map((sprint) => (
                <SprintCard key={sprint.id} sprint={sprint} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
