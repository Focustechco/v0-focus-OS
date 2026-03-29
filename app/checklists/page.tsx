"use client"

import { useState } from "react"
import { FocusSidebar } from "@/components/focus-sidebar"
import { FocusHeader } from "@/components/focus-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  ArrowRight,
  FolderKanban,
  User,
} from "lucide-react"

const projectChecklists = [
  {
    id: "PRJ-042",
    name: "Sistema de Gestao Empresarial",
    client: "Empresa XYZ",
    currentStage: 1,
    stages: [
      {
        id: 1,
        name: "DIAGNOSTICO INICIAL",
        actors: [
          {
            role: "COMERCIAL",
            badge: "bg-green-500",
            items: [
              { text: "Reuniao inicial realizada", done: true },
              { text: "Focus Hub preenchido", done: true },
              { text: "Identidade visual coletada", done: false },
            ],
          },
          {
            role: "MODULO ESCOPO",
            badge: "bg-blue-500",
            items: [
              { text: "Escopo gerado e validado", done: true },
              { text: "Precificacao sugerida", done: true },
              { text: "Complexidade definida", done: false },
              { text: "Prazo estimado", done: false },
            ],
          },
          {
            role: "DEVSECOPS",
            badge: "bg-purple-500",
            items: [
              { text: "Infra necessaria validada", done: false },
              { text: "Custo de infra na proposta", done: false },
            ],
          },
          {
            role: "GABRIEL (APROVACAO)",
            badge: "bg-orange-500",
            items: [
              { text: "Escopo aprovado", done: false },
              { text: "Precificacao aprovada", done: false },
            ],
          },
        ],
      },
      {
        id: 2,
        name: "MVP - PROTOTIPO",
        actors: [
          {
            role: "DEV DO PROJETO",
            badge: "bg-blue-500",
            items: [
              { text: "MVP desenvolvido conforme escopo", done: false },
              { text: "Features documentadas", done: false },
            ],
          },
          {
            role: "GABRIEL",
            badge: "bg-orange-500",
            items: [
              { text: "MVP revisado", done: false },
              { text: "Alinhamento validado", done: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "PRJ-041",
    name: "App Mobile E-commerce",
    client: "Loja ABC",
    currentStage: 4,
    stages: [
      {
        id: 1,
        name: "DIAGNOSTICO INICIAL",
        actors: [
          {
            role: "COMERCIAL",
            badge: "bg-green-500",
            items: [
              { text: "Reuniao inicial realizada", done: true },
              { text: "Focus Hub preenchido", done: true },
              { text: "Identidade visual coletada", done: true },
            ],
          },
          {
            role: "GABRIEL (APROVACAO)",
            badge: "bg-orange-500",
            items: [
              { text: "Escopo aprovado", done: true },
              { text: "Precificacao aprovada", done: true },
            ],
          },
        ],
      },
      {
        id: 4,
        name: "SPRINTS DE DESENVOLVIMENTO",
        actors: [
          {
            role: "DEV DO PROJETO",
            badge: "bg-blue-500",
            items: [
              { text: "Sprint #1 concluida", done: true },
              { text: "Sprint #2 concluida", done: true },
              { text: "Sprint #3 em andamento", done: false },
            ],
          },
          {
            role: "GABRIEL",
            badge: "bg-orange-500",
            items: [
              { text: "Reunioes semanais realizadas", done: true },
              { text: "PRs revisados", done: false },
            ],
          },
        ],
      },
    ],
  },
]

function ChecklistCard({ project }: { project: typeof projectChecklists[0] }) {
  const currentStageData = project.stages.find(s => s.id === project.currentStage)
  
  if (!currentStageData) return null

  const totalItems = currentStageData.actors.reduce((acc, actor) => acc + actor.items.length, 0)
  const completedItems = currentStageData.actors.reduce(
    (acc, actor) => acc + actor.items.filter(item => item.done).length, 0
  )
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <Card className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-colors">
      <CardHeader className="pb-3 border-b border-[#2A2A2A]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-orange-500 font-mono">{project.id}</span>
              <Badge className="bg-blue-500 text-white text-[9px]">
                ETAPA {project.currentStage}
              </Badge>
            </div>
            <CardTitle className="text-sm font-medium text-white">{project.name}</CardTitle>
            <p className="text-[10px] text-neutral-500">Cliente: {project.client}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white font-mono">{progress}%</div>
            <div className="text-[10px] text-neutral-500">{completedItems}/{totalItems}</div>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 bg-[#2A2A2A] mt-3" />
      </CardHeader>
      <CardContent className="pt-4">
        <h4 className="text-xs text-neutral-400 tracking-wider mb-3">
          {currentStageData.name}
        </h4>
        
        <div className="space-y-4">
          {currentStageData.actors.map((actor, idx) => (
            <div key={idx} className="p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
              <Badge className={`${actor.badge} text-white text-[9px] mb-2`}>
                {actor.role}
              </Badge>
              <div className="space-y-2">
                {actor.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${item.done ? "text-neutral-500 line-through" : "text-neutral-300"}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#2A2A2A]">
          <Button size="sm" variant="outline" className="h-7 text-xs border-[#2A2A2A] text-neutral-400">
            Ver Historico
          </Button>
          {progress === 100 && (
            <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600">
              Avancar Etapa
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ChecklistsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedProject, setSelectedProject] = useState("all")

  const filteredProjects = selectedProject === "all" 
    ? projectChecklists 
    : projectChecklists.filter(p => p.id === selectedProject)

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <FocusSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <FocusHeader title="CHECKLISTS" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Checklists</h1>
              <p className="text-sm text-neutral-500">Checklists por fase do projeto</p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64 bg-[#141414] border-[#2A2A2A] text-white">
                  <FolderKanban className="w-4 h-4 mr-2 text-orange-500" />
                  <SelectValue placeholder="Filtrar por projeto" />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  {projectChecklists.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.id} - {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stage Overview */}
          <div className="grid grid-cols-6 gap-2 mb-6">
            {[
              { id: 1, name: "Diagnostico", color: "bg-blue-500" },
              { id: 2, name: "MVP", color: "bg-purple-500" },
              { id: 3, name: "Proposta", color: "bg-yellow-500" },
              { id: 4, name: "Sprints", color: "bg-orange-500" },
              { id: 5, name: "Deploy", color: "bg-green-500" },
              { id: 6, name: "Suporte", color: "bg-neutral-500" },
            ].map((stage) => (
              <div key={stage.id} className="p-3 bg-[#141414] border border-[#2A2A2A] rounded-lg text-center">
                <div className={`w-3 h-3 rounded-full ${stage.color} mx-auto mb-2`} />
                <div className="text-[10px] text-neutral-400">{stage.name}</div>
                <div className="text-sm font-mono text-white mt-1">
                  {projectChecklists.filter(p => p.currentStage === stage.id).length}
                </div>
              </div>
            ))}
          </div>

          {/* Checklists Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <ChecklistCard key={project.id} project={project} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
