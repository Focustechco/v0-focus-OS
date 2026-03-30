"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  LayoutDashboard,
  Settings,
  Users,
  FolderKanban,
  ClipboardList,
  Zap,
  Clock,
  FileText,
  Briefcase,
  FileSignature,
  Scale,
  MessageSquare,
  Bell,
  Activity,
  FileSpreadsheet,
  Github,
  MessageCircle,
  Webhook,
  Lock,
  ChevronRight,
  Check,
} from "lucide-react"

interface ModulosSectionProps {
  onChange: () => void
}

const modules = [
  // Core
  { id: "command-center", name: "Command Center", description: "Dashboard principal do sistema", icon: LayoutDashboard, category: "CORE", essential: true, enabled: true },
  { id: "configuracoes", name: "Configuracoes", description: "Painel de configuracoes do sistema", icon: Settings, category: "CORE", essential: true, enabled: true },
  { id: "usuarios", name: "Usuarios & Permissoes", description: "Gerenciamento de usuarios e acessos", icon: Users, category: "CORE", essential: true, enabled: true },
  // Projetos & Producao
  { id: "projetos", name: "Projetos", description: "Gerenciamento de projetos e sprints", icon: FolderKanban, category: "PROJETOS", essential: false, enabled: true, subFeatures: ["Kanban", "Gantt", "Timeline"] },
  { id: "backlog", name: "Backlog ADM", description: "Administracao centralizada", icon: ClipboardList, category: "PROJETOS", essential: false, enabled: true },
  { id: "sprint-board", name: "Sprint Board", description: "Quadro kanban de sprints", icon: Zap, category: "PROJETOS", essential: false, enabled: true },
  { id: "time-tracker", name: "Time Tracker", description: "Rastreamento de horas", icon: Clock, category: "PROJETOS", essential: false, enabled: false },
  { id: "relatorios", name: "Relatorios", description: "Analytics e exportacoes", icon: FileText, category: "PROJETOS", essential: false, enabled: true },
  // Comercial
  { id: "pipeline", name: "Pipeline Comercial", description: "Gestao de deals e CRM", icon: Briefcase, category: "COMERCIAL", essential: false, enabled: true },
  { id: "propostas", name: "Propostas", description: "Criacao e envio de propostas", icon: FileSignature, category: "COMERCIAL", essential: false, enabled: false },
  { id: "contratos", name: "Contratos", description: "Gestao juridica de contratos", icon: Scale, category: "COMERCIAL", essential: false, enabled: true },
  // Comunicacao
  { id: "canal-interno", name: "Canal Interno", description: "Comunicacao segura da equipe", icon: MessageSquare, category: "COMUNICACAO", essential: false, enabled: false },
  { id: "notificacoes", name: "Notificacoes", description: "Central de alertas", icon: Bell, category: "COMUNICACAO", essential: false, enabled: true },
  { id: "activity-log", name: "Activity Log", description: "Log de atividades", icon: Activity, category: "COMUNICACAO", essential: false, enabled: true },
  // Integracoes
  { id: "google", name: "Google Workspace", description: "Sheets, Drive, Calendar", icon: FileSpreadsheet, category: "INTEGRACOES", essential: false, enabled: true },
  { id: "github", name: "GitHub", description: "Repositorios e pull requests", icon: Github, category: "INTEGRACOES", essential: false, enabled: true },
  { id: "slack", name: "Slack", description: "Notificacoes externas", icon: MessageCircle, category: "INTEGRACOES", essential: false, enabled: false },
  { id: "webhooks", name: "Webhooks", description: "Integracoes customizadas", icon: Webhook, category: "INTEGRACOES", essential: false, enabled: false },
]

const categories = ["CORE", "PROJETOS", "COMERCIAL", "COMUNICACAO", "INTEGRACOES"]

export function ModulosSection({ onChange }: ModulosSectionProps) {
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>(
    Object.fromEntries(modules.map((m) => [m.id, m.enabled]))
  )
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; moduleId: string | null }>({ open: false, moduleId: null })
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [animatingModule, setAnimatingModule] = useState<string | null>(null)

  const activeCount = Object.values(moduleStates).filter(Boolean).length
  const totalCount = modules.length

  const handleToggle = (moduleId: string, currentState: boolean) => {
    const module = modules.find((m) => m.id === moduleId)
    if (module?.essential) return

    if (currentState) {
      // Desativar - mostrar modal de confirmacao
      setConfirmModal({ open: true, moduleId })
    } else {
      // Ativar - animar e ativar
      setAnimatingModule(moduleId)
      setModuleStates((prev) => ({ ...prev, [moduleId]: true }))
      onChange()
      setTimeout(() => setAnimatingModule(null), 1000)
    }
  }

  const confirmDeactivate = () => {
    if (confirmModal.moduleId) {
      setModuleStates((prev) => ({ ...prev, [confirmModal.moduleId!]: false }))
      onChange()
    }
    setConfirmModal({ open: false, moduleId: null })
  }

  const moduleToDeactivate = modules.find((m) => m.id === confirmModal.moduleId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Modulos Ativos
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Ative ou desative modulos para personalizar sua experiencia no Focus OS
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-sm font-mono">{activeCount} de {totalCount} modulos ativos</span>
            <span className="text-orange-500 font-mono text-sm">{Math.round((activeCount / totalCount) * 100)}%</span>
          </div>
          <Progress value={(activeCount / totalCount) * 100} className="h-2 bg-[#1a1a1a]" />
        </CardContent>
      </Card>

      {/* Modules Grid by Category */}
      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-neutral-600 text-xs font-mono tracking-widest uppercase mb-3">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules
              .filter((m) => m.category === category)
              .map((module) => (
                <Card
                  key={module.id}
                  className={`bg-[#141414] border-[#2a2a2a] transition-all duration-300 ${
                    animatingModule === module.id ? "ring-2 ring-orange-500 shadow-lg shadow-orange-500/20" : ""
                  } ${moduleStates[module.id] ? "border-[#2a2a2a]" : "opacity-60"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center ${
                          moduleStates[module.id] ? "bg-orange-500/10" : "bg-neutral-800"
                        }`}
                      >
                        <module.icon
                          className={`w-5 h-5 ${moduleStates[module.id] ? "text-orange-500" : "text-neutral-600"}`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {module.essential ? (
                          <Badge className="bg-neutral-800 text-neutral-500 text-[9px] font-mono flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            ESSENCIAL
                          </Badge>
                        ) : (
                          <Switch
                            checked={moduleStates[module.id]}
                            onCheckedChange={() => handleToggle(module.id, moduleStates[module.id])}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        )}
                      </div>
                    </div>

                    <h4 className="text-white font-display font-semibold mb-1">{module.name}</h4>
                    <p className="text-neutral-500 text-xs mb-2">{module.description}</p>

                    <div className="flex items-center justify-between">
                      <Badge
                        className={`text-[9px] font-mono ${
                          moduleStates[module.id]
                            ? "bg-green-500/20 text-green-500"
                            : "bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {moduleStates[module.id] ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            ATIVO
                          </>
                        ) : (
                          "INATIVO"
                        )}
                      </Badge>

                      {module.subFeatures && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                          className="text-neutral-500 hover:text-orange-500 text-xs font-mono p-0 h-auto"
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              expandedModule === module.id ? "rotate-90" : ""
                            }`}
                          />
                          VER OPCOES
                        </Button>
                      )}
                    </div>

                    {/* Sub-features */}
                    {module.subFeatures && expandedModule === module.id && (
                      <div className="mt-4 pt-4 border-t border-[#2a2a2a] space-y-2">
                        {module.subFeatures.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <Checkbox
                              id={`${module.id}-${feature}`}
                              defaultChecked
                              className="border-[#2a2a2a] data-[state=checked]:bg-orange-500"
                            />
                            <Label
                              htmlFor={`${module.id}-${feature}`}
                              className="text-neutral-400 text-sm font-mono cursor-pointer"
                            >
                              {feature}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Deactivation Confirmation Modal */}
      <Dialog open={confirmModal.open} onOpenChange={(open) => setConfirmModal({ open, moduleId: null })}>
        <DialogContent className="bg-[#141414] border-[#2a2a2a] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display">Desativar {moduleToDeactivate?.name}?</DialogTitle>
            <DialogDescription className="text-neutral-500 font-mono text-sm">
              Os dados serao preservados. O modulo pode ser reativado a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="ghost"
              onClick={() => setConfirmModal({ open: false, moduleId: null })}
              className="text-neutral-400 hover:text-white font-mono"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDeactivate}
              className="bg-red-600 hover:bg-red-700 text-white font-mono"
            >
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
