"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Code,
  Rocket,
  HeadphonesIcon,
  Shield,
} from "lucide-react"

const flowStages = [
  {
    id: 1,
    name: "DIAGNOSTICO INICIAL",
    subtitle: "Focus Hub + validacao tecnica",
    icon: Briefcase,
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    actors: [
      {
        role: "COMERCIAL",
        badge: "bg-green-500",
        tasks: [
          { text: "Reuniao com cliente", done: true },
          { text: "Preenchimento no Focus Hub", done: true },
          { text: "Coleta de identidade visual", done: false },
        ],
        notes: null,
      },
      {
        role: "MODULO ESCOPO E PRECIFICACAO",
        badge: "bg-blue-500",
        tasks: [
          { text: "Gera escopo validado", done: true },
          { text: "Sugere precificacao (mercado + historico)", done: true },
          { text: "Define complexidade e prazo", done: false },
        ],
        notes: "Substituir presenca tecnica na reuniao",
      },
      {
        role: "DEVSECOPS",
        badge: "bg-purple-500",
        tasks: [
          { text: "Valida escopo", done: false },
          { text: "Define infra necessaria", done: false },
          { text: "Custo de infra na proposta", done: false },
        ],
        notes: "Diagnostico apenas, sem build",
      },
      {
        role: "GABRIEL",
        badge: "bg-orange-500",
        tasks: [
          { text: "Valida escopo e precificacao gerados", done: false },
          { text: "Aprova avanco para proxima etapa", done: false },
        ],
        notes: null,
      },
    ],
  },
  {
    id: 2,
    name: "MVP - PROTOTIPO FUNCIONAL",
    subtitle: "Desenvolvimento rapido de prova de conceito",
    icon: Code,
    color: "bg-purple-500",
    borderColor: "border-purple-500",
    actors: [
      {
        role: "DEV DO PROJETO",
        badge: "bg-blue-500",
        tasks: [
          { text: "Desenvolve MVP conforme escopo", done: false },
          { text: "Documenta features implementadas", done: false },
        ],
        notes: null,
      },
      {
        role: "GABRIEL",
        badge: "bg-orange-500",
        tasks: [
          { text: "Revisa MVP", done: false },
          { text: "Valida alinhamento com expectativas", done: false },
        ],
        notes: null,
      },
    ],
  },
  {
    id: 3,
    name: "PROPOSTA E FECHAMENTO",
    subtitle: "Apresentacao comercial e assinatura",
    icon: Briefcase,
    color: "bg-yellow-500",
    borderColor: "border-yellow-500",
    actors: [
      {
        role: "COMERCIAL",
        badge: "bg-green-500",
        tasks: [
          { text: "Apresenta MVP ao cliente", done: false },
          { text: "Coleta feedback e ajustes", done: false },
          { text: "Envia proposta formal", done: false },
          { text: "Negocia e fecha contrato", done: false },
        ],
        notes: null,
      },
      {
        role: "GABRIEL",
        badge: "bg-orange-500",
        tasks: [
          { text: "Acompanha negociacao", done: false },
          { text: "Valida termos tecnicos", done: false },
        ],
        notes: null,
      },
    ],
  },
  {
    id: 4,
    name: "SPRINTS DE DESENVOLVIMENTO",
    subtitle: "Ciclos de desenvolvimento iterativo",
    icon: Rocket,
    color: "bg-orange-500",
    borderColor: "border-orange-500",
    actors: [
      {
        role: "DEV DO PROJETO",
        badge: "bg-blue-500",
        tasks: [
          { text: "Executa tasks da sprint", done: false },
          { text: "Participa de dailies", done: false },
          { text: "Documenta progresso", done: false },
        ],
        notes: null,
      },
      {
        role: "GABRIEL",
        badge: "bg-orange-500",
        tasks: [
          { text: "Reuniao Interna Semanal", done: false },
          { text: "Reuniao com Cliente Quinzenal", done: false },
          { text: "Revisao de PRs", done: false },
        ],
        notes: "Acompanhamento de todos os projetos em curso",
      },
      {
        role: "DEVSECOPS",
        badge: "bg-purple-500",
        tasks: [
          { text: "Configura ambientes", done: false },
          { text: "CI/CD e deploys", done: false },
        ],
        notes: "Quando relevante",
      },
    ],
  },
  {
    id: 5,
    name: "DEPLOY E ENTREGA FINAL",
    subtitle: "Lancamento em producao",
    icon: Shield,
    color: "bg-green-500",
    borderColor: "border-green-500",
    actors: [
      {
        role: "DEVSECOPS",
        badge: "bg-purple-500",
        tasks: [
          { text: "Configura ambiente de producao", done: false },
          { text: "Executa deploy final", done: false },
          { text: "Configura monitoramento", done: false },
        ],
        notes: null,
      },
      {
        role: "GABRIEL",
        badge: "bg-orange-500",
        tasks: [
          { text: "Valida deploy", done: false },
          { text: "Apresenta ao cliente", done: false },
          { text: "Coleta assinatura de aceite", done: false },
        ],
        notes: null,
      },
    ],
  },
  {
    id: 6,
    name: "SUPORTE RECORRENTE (MRR)",
    subtitle: "Manutencao e evolucao continua",
    icon: HeadphonesIcon,
    color: "bg-neutral-500",
    borderColor: "border-neutral-500",
    actors: [
      {
        role: "DEV DO PROJETO",
        badge: "bg-blue-500",
        tasks: [
          { text: "Atende chamados de suporte", done: false },
          { text: "Implementa melhorias", done: false },
        ],
        notes: null,
      },
      {
        role: "COMERCIAL",
        badge: "bg-green-500",
        tasks: [
          { text: "Gerencia relacionamento", done: false },
          { text: "Upsell de novas features", done: false },
        ],
        notes: null,
      },
    ],
  },
]

function StageCard({ stage, isExpanded, onToggle }: { stage: typeof flowStages[0]; isExpanded: boolean; onToggle: () => void }) {
  const Icon = stage.icon
  const completedTasks = stage.actors.reduce((acc, actor) => acc + actor.tasks.filter(t => t.done).length, 0)
  const totalTasks = stage.actors.reduce((acc, actor) => acc + actor.tasks.length, 0)
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={`bg-[#141414] border-[#2A2A2A] border-l-4 ${stage.borderColor} hover:border-orange-500/30 transition-colors`}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className={`p-1.5 sm:p-2 rounded-lg ${stage.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-left min-w-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-white tracking-wider flex items-center gap-2 flex-wrap">
                    <span className="truncate">ETAPA {stage.id}: {stage.name}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                    )}
                  </CardTitle>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-0.5 truncate">{stage.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-neutral-400 font-mono">{progress}%</div>
                  <div className="text-[10px] text-neutral-500">{completedTasks}/{totalTasks} tarefas</div>
                </div>
                <div className="w-12 sm:w-20 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 border-t border-[#2A2A2A] p-3 sm:p-6">
            <div className="grid gap-3 sm:gap-4 mt-3 sm:mt-4">
              {stage.actors.map((actor, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <Badge className={`text-[9px] sm:text-[10px] ${actor.badge} text-white w-fit`}>
                      {actor.role}
                    </Badge>
                    {actor.notes && (
                      <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-yellow-500">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{actor.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {actor.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex items-center gap-2">
                        {task.done ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${task.done ? "text-neutral-500 line-through" : "text-neutral-300"}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                  Aprovar e Avancar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export function FluxoDeEtapas() {
  const [expandedStages, setExpandedStages] = useState<number[]>([1])

  const toggleStage = (stageId: number) => {
    setExpandedStages((prev) =>
      prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-white">Fluxo de Etapas</h1>
          <p className="text-xs sm:text-sm text-neutral-500">Pipeline das 6 etapas do processo Focus</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-[#2A2A2A] bg-[#141414] text-neutral-400 hover:text-white text-xs"
            onClick={() => setExpandedStages(flowStages.map(s => s.id))}
          >
            <span className="hidden sm:inline">Expandir</span> Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#2A2A2A] bg-[#141414] text-neutral-400 hover:text-white text-xs"
            onClick={() => setExpandedStages([])}
          >
            <span className="hidden sm:inline">Recolher</span> Todos
          </Button>
        </div>
      </div>

      {/* Flow diagram - scrollable on mobile */}
      <div className="flex items-center gap-1 sm:gap-2 mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {flowStages.map((stage, idx) => (
          <div key={stage.id} className="flex items-center flex-shrink-0">
            <div
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${stage.color} cursor-pointer transition-transform hover:scale-105`}
              onClick={() => toggleStage(stage.id)}
            >
              <stage.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              <span className="text-[8px] sm:text-[10px] text-white font-medium whitespace-nowrap">
                {stage.id}. {stage.name.split(" ")[0]}
              </span>
            </div>
            {idx < flowStages.length - 1 && (
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-600 mx-0.5 sm:mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Stages */}
      <div className="space-y-3 sm:space-y-4">
        {flowStages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            isExpanded={expandedStages.includes(stage.id)}
            onToggle={() => toggleStage(stage.id)}
          />
        ))}
      </div>
    </div>
  )
}
