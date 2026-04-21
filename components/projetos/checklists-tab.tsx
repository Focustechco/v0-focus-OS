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

import { useProjectChecklists } from "@/lib/hooks/use-project-checklists"

// Removidos dados mockados

function ChecklistCard({ project, onToggle, stageColor }: { project: any, onToggle: (id: string, done: boolean) => void, stageColor: string }) {
  const totalItems = project.items.length
  const completedItems = project.items.filter((item: any) => item.done).length
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <Card className="bg-card border-border hover:border-orange-500/30 transition-colors">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-orange-500 font-mono">{project.code}</span>
              <Badge className={`${stageColor} text-foreground text-[9px] uppercase`}>
                {project.stage || "N/A"}
              </Badge>
            </div>
            <CardTitle className="text-sm font-medium text-foreground truncate">{project.name}</CardTitle>
            <p className="text-[10px] text-neutral-500">Cliente: {project.client}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-foreground font-mono">{progress}%</div>
            <div className="text-[10px] text-neutral-500">{completedItems}/{totalItems}</div>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 bg-[#2A2A2A] mt-3" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {project.items.map((item: any) => (
            <div 
              key={item.id} 
              className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/10 transition-colors group cursor-pointer"
              onClick={() => onToggle(item.id, !item.done)}
            >
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5 group-hover:text-orange-500" />
              )}
              <div className="flex flex-col">
                <span className={`text-xs ${item.done ? "text-neutral-500 line-through" : "text-foreground"}`}>
                  {item.text}
                </span>
                <span className="text-[9px] text-neutral-600 italic">Tarefa: {item.taskTitle}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 mt-4 border-t border-border">
          <Button size="sm" variant="outline" className="h-7 text-xs border-border text-neutral-400">
            Histórico de Tarefas
          </Button>
          {progress === 100 && (
            <Badge className="bg-green-500/20 text-green-500 border border-green-500/30 text-[9px]">
              FASE CONCLUÍDA
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChecklistsTab() {
  const { projectChecklists, toggleChecklistItem, isLoading } = useProjectChecklists()
  const [selectedProject, setSelectedProject] = useState("all")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-orange-500">
        Carregando checklists da equipe...
      </div>
    )
  }

  const filteredProjects = selectedProject === "all" 
    ? projectChecklists 
    : projectChecklists.filter((p: any) => p.id === selectedProject)

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "diagnostico": return "bg-blue-500"
      case "mvp": return "bg-purple-500"
      case "proposta": return "bg-yellow-500"
      case "desenvolvimento": return "bg-orange-500"
      case "deploy": return "bg-green-500"
      default: return "bg-neutral-500"
    }
  }

  return (
    <div className="flex-1 w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Checklists Operacionais</h1>
          <p className="text-sm text-neutral-500">O que a equipe está fazendo agora (tasks reais)</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64 bg-card border-border text-foreground">
              <FolderKanban className="w-4 h-4 mr-2 text-orange-500" />
              <SelectValue placeholder="Filtrar por projeto" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todos os projetos</SelectItem>
              {projectChecklists.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Checklists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.length > 0 ? filteredProjects.map((project: any) => (
          <ChecklistCard 
            key={project.id} 
            project={project} 
            onToggle={(id, done) => toggleChecklistItem(id, done)}
            stageColor={getStageColor(project.stage)}
          />
        )) : (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-border rounded-xl">
             <CheckSquare className="w-12 h-12 text-orange-500/20 mx-auto mb-4" />
             <p className="text-neutral-500 text-sm">Nenhum checklist operacional encontrado.<br/>Adicione itens de checklist às tarefas dos projetos.</p>
          </div>
        )}
      </div>
    </div>
  )
}
