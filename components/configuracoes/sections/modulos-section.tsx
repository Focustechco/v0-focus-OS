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
  CalendarClock,
  Grid,
  BarChart3,
  Box,
  Cog,
} from "lucide-react"
import { useModules } from "@/contexts/modules-context"

interface ModulosSectionProps {
  onChange: () => void
}

const modules = [
  // Core
  { id: "command-center", name: "Dashboard", description: "Visão geral e métricas do sistema", icon: LayoutDashboard, category: "CORE", essential: true },
  { id: "configuracoes", name: "Configurações", description: "Personalização e ajustes globais", icon: Cog, category: "CORE", essential: true },
  { id: "sistemas", name: "Sistemas", description: "Gerenciamento de acessos e ferramentas", icon: Settings, category: "CORE", essential: false },
  
  // Produção
  { id: "projetos", name: "Projetos", description: "Gestão completa de projetos e etapas", icon: FolderKanban, category: "PRODUÇÃO", essential: false },
  { id: "tarefas", name: "Tasks", description: "Controle de tarefas e checklists", icon: CheckSquare, category: "PRODUÇÃO", essential: false },
  { id: "agenda", name: "Agenda", description: "Calendário de prazos e compromissos", icon: CalendarClock, category: "PRODUÇÃO", essential: false },

  // Negócios
  { id: "comercial", name: "Comercial", description: "Pipeline de vendas e CRM ClickUp", icon: Briefcase, category: "NEGÓCIOS", essential: false },
  { id: "clientes", name: "Clientes", description: "Base unificada de parceiros e clientes", icon: Users, category: "NEGÓCIOS", essential: false },
  
  // Equipe & Dados
  { id: "equipe", name: "Hub", description: "Central de equipe e acessos internos", icon: Grid, category: "EQUIPE", essential: false },
  { id: "intelligence", name: "Intelligence", description: "BI e análise de dados avançada", icon: BarChart3, category: "DADOS", essential: false },
  { id: "relatorios", name: "Relatórios", description: "Exportação de PDFs e métricas", icon: FileText, category: "DADOS", essential: false },
]

const categories = ["CORE", "PRODUÇÃO", "NEGÓCIOS", "EQUIPE", "DADOS"]

export function ModulosSection({ onChange }: ModulosSectionProps) {
  const { moduleStates, setModuleState, isModuleEnabled } = useModules()
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; moduleId: string | null }>({ open: false, moduleId: null })
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [animatingModule, setAnimatingModule] = useState<string | null>(null)

  const activeCount = modules.filter(m => isModuleEnabled(m.id)).length
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
      setModuleState(moduleId, true)
      onChange()
      setTimeout(() => setAnimatingModule(null), 1000)
    }
  }

  const confirmDeactivate = () => {
    if (confirmModal.moduleId) {
      setModuleState(confirmModal.moduleId, false)
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
          Ative ou desative modulos para personalizar sua experiencia no Focus OS. Os modulos desativados serao removidos do menu lateral.
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="bg-card border-[#2a2a2a]">
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
              .map((module) => {
                const enabled = isModuleEnabled(module.id)
                return (
                  <Card
                    key={module.id}
                    className={`relative bg-card border-[#2a2a2a] transition-all duration-300 ${
                      animatingModule === module.id ? "ring-2 ring-orange-500 shadow-lg shadow-orange-500/20" : ""
                    } ${enabled ? "border-[#2a2a2a]" : "opacity-60"}`}
                  >
                    <CardContent className="p-4 relative">
                      {!module.essential && (
                        <div className="absolute top-3 right-3 z-10">
                          <Switch
                            checked={enabled}
                            onCheckedChange={() => handleToggle(module.id, enabled)}
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded flex items-center justify-center ${
                            enabled ? "bg-orange-500/10" : "bg-neutral-800"
                          }`}
                        >
                          <module.icon
                            className={`w-5 h-5 ${enabled ? "text-orange-500" : "text-neutral-600"}`}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {module.essential && (
                            <Badge className="bg-neutral-800 text-neutral-500 text-[9px] font-mono flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              ESSENCIAL
                            </Badge>
                          )}
                        </div>
                      </div>

                      <h4 className="text-foreground font-display font-semibold mb-1">{module.name}</h4>
                      <p className="text-neutral-500 text-xs mb-2">{module.description}</p>

                      <div className="flex items-center justify-between">
                        <Badge
                          className={`text-[9px] font-mono ${
                            enabled
                              ? "bg-green-500/20 text-green-500"
                              : "bg-neutral-800 text-neutral-500"
                          }`}
                        >
                          {enabled ? (
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
                )
              })}
          </div>
        </div>
      ))}

      {/* Deactivation Confirmation Modal */}
      <Dialog open={confirmModal.open} onOpenChange={(open) => setConfirmModal({ open, moduleId: null })}>
        <DialogContent className="bg-card border-[#2a2a2a] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">Desativar {moduleToDeactivate?.name}?</DialogTitle>
            <DialogDescription className="text-neutral-500 font-mono text-sm">
              O modulo sera removido do menu lateral. Os dados serao preservados e o modulo pode ser reativado a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="ghost"
              onClick={() => setConfirmModal({ open: false, moduleId: null })}
              className="text-neutral-400 hover:text-foreground font-mono"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDeactivate}
              className="bg-red-600 hover:bg-red-700 text-foreground font-mono"
            >
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
