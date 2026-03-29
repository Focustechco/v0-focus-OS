"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Save,
  Eye,
  Download,
  FileText,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  GripVertical,
  Calendar,
  Check,
  Circle,
  ArrowRightCircle,
  Lock,
  Unlock,
  FileDown,
  Link2,
} from "lucide-react"
import {
  type Activity,
  type SprintReport,
  type NextStep,
  type SectionConfig,
  formatDate,
  formatDateShort,
  generateMockActivities,
  generateMockSprints,
  generateMockNextSteps,
} from "@/lib/report-types"

interface ReportEditorProps {
  config: {
    projectId: string
    projectName: string
    clientName: string
    period: string
    periodStart: Date
    periodEnd: Date
    reportType: string
    sections: SectionConfig[]
    recipientName: string
    recipientRole: string
    preparedBy: string
    includeFocusLogo: boolean
    includeClientLogo: boolean
  }
  onBack: () => void
}

export function ReportEditor({ config, onBack }: ReportEditorProps) {
  const [previewMode, setPreviewMode] = useState(false)
  const [previewPage, setPreviewPage] = useState(1)

  // Content state
  const [executiveSummary, setExecutiveSummary] = useState(
    `O projeto ${config.projectName} esta em andamento, atualmente na etapa de desenvolvimento ativo. Este relatorio apresenta o progresso realizado durante o periodo de ${formatDate(config.periodStart)} a ${formatDate(config.periodEnd)}, incluindo entregas concluidas, atividades em andamento e proximos passos planejados.`
  )
  const [tags, setTags] = useState<string[]>(["desenvolvimento", "mobile", "react-native"])
  const [newTag, setNewTag] = useState("")

  const [currentStatus, setCurrentStatus] = useState({
    stage: "Sprint de Desenvolvimento",
    stageColor: "bg-orange-500",
    progress: 75,
    health: "on_track" as const,
    deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    observation: "",
  })

  const [activities, setActivities] = useState<Activity[]>(() => {
    const days = config.period === "7d" ? 7 : config.period === "15d" ? 15 : config.period === "month" ? 30 : 1
    return generateMockActivities(days)
  })

  const [sprints, setSprints] = useState<SprintReport[]>(generateMockSprints())
  const [nextSteps, setNextSteps] = useState<NextStep[]>(generateMockNextSteps())

  const [teamNotes, setTeamNotes] = useState("")
  const [includeTeamNotes, setIncludeTeamNotes] = useState(true)

  const isSectionEnabled = (id: string) => config.sections.find(s => s.id === id)?.enabled ?? false

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const toggleActivity = (id: string) => {
    setActivities(activities.map(a => a.id === id ? { ...a, included: !a.included } : a))
  }

  const addActivity = () => {
    const newActivity: Activity = {
      id: `new-${Date.now()}`,
      date: new Date(),
      description: "Nova atividade...",
      included: true,
      addedManually: true,
    }
    setActivities([newActivity, ...activities])
  }

  const removeActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id))
  }

  const addNextStep = () => {
    const newStep: NextStep = {
      id: `ns-${Date.now()}`,
      description: "",
      responsible: "",
      deadline: "",
      order: nextSteps.length + 1,
    }
    setNextSteps([...nextSteps, newStep])
  }

  const updateNextStep = (id: string, field: keyof NextStep, value: string | number) => {
    setNextSteps(nextSteps.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const removeNextStep = (id: string) => {
    setNextSteps(nextSteps.filter(s => s.id !== id))
  }

  const handleExportPDF = () => {
    // Usar window.print() com CSS de impressao
    window.print()
  }

  const handleExportGoogleDocs = () => {
    // Placeholder para integracao com Google Docs API
    alert("Integracao com Google Docs em desenvolvimento")
  }

  const handleCopyLink = () => {
    // Placeholder para copiar link de preview
    navigator.clipboard.writeText(window.location.href + `?reportId=draft-${Date.now()}`)
    alert("Link copiado!")
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      {/* Editor Panel */}
      <div className={cn(
        "flex flex-col transition-all duration-300",
        previewMode ? "w-1/2" : "w-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-[#141414]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-[#2A2A2A]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-500 font-mono">{config.projectId}</span>
                <span className="text-sm text-white">{config.projectName}</span>
              </div>
              <p className="text-xs text-neutral-500">
                Relatorio de Progresso - {formatDateShort(config.periodStart)} a {formatDateShort(config.periodEnd)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent">
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className={cn(
                "border-[#2A2A2A] bg-transparent",
                previewMode ? "text-orange-500 border-orange-500" : "text-neutral-400 hover:text-white"
              )}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <DropdownMenuItem onClick={handleExportPDF} className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white cursor-pointer">
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportGoogleDocs} className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white cursor-pointer">
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar para Google Doc
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink} className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white cursor-pointer">
                  <Link2 className="w-4 h-4 mr-2" />
                  Copiar link de preview
                </DropdownMenuItem>
                <DropdownMenuItem className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white cursor-pointer">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar rascunho
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Accordion type="multiple" defaultValue={["executive_summary", "current_status", "activities"]} className="space-y-4">
            {/* Resumo Executivo */}
            {isSectionEnabled("executive_summary") && (
              <AccordionItem value="executive_summary" className="border border-[#2A2A2A] rounded-lg bg-[#141414]">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#1A1A1A] rounded-t-lg">
                  <span className="text-sm font-medium text-orange-500 tracking-wider">RESUMO EXECUTIVO</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Textarea
                    value={executiveSummary}
                    onChange={e => setExecutiveSummary(e.target.value)}
                    placeholder="Descreva o projeto e o contexto deste relatorio..."
                    className="min-h-[120px] bg-[#1A1A1A] border-[#2A2A2A] text-neutral-300 resize-none"
                  />
                  <div className="mt-4">
                    <p className="text-xs text-neutral-500 mb-2">Tags do projeto:</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge key={tag} className="bg-[#2A2A2A] text-neutral-300 hover:bg-[#3A3A3A] cursor-pointer group">
                          {tag}
                          <X
                            className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                      <div className="flex items-center gap-1">
                        <Input
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          onKeyPress={e => e.key === "Enter" && addTag()}
                          placeholder="Nova tag..."
                          className="h-6 w-24 text-xs bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                        <Button size="sm" variant="ghost" onClick={addTag} className="h-6 w-6 p-0 text-neutral-500 hover:text-white">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Status Atual */}
            {isSectionEnabled("current_status") && (
              <AccordionItem value="current_status" className="border border-[#2A2A2A] rounded-lg bg-[#141414]">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#1A1A1A] rounded-t-lg">
                  <span className="text-sm font-medium text-orange-500 tracking-wider">STATUS ATUAL</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-500 w-24">Etapa:</span>
                    <Badge className={cn("text-white", currentStatus.stageColor)}>
                      {currentStatus.stage}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Progresso:</span>
                      <span className="text-sm text-white font-mono">{currentStatus.progress}%</span>
                    </div>
                    <Slider
                      value={[currentStatus.progress]}
                      onValueChange={([value]) => setCurrentStatus({ ...currentStatus, progress: value })}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-500 w-24">Saude:</span>
                    <div className="flex gap-2">
                      {[
                        { id: "on_track", label: "No prazo", color: "bg-green-500" },
                        { id: "at_risk", label: "Em risco", color: "bg-yellow-500" },
                        { id: "delayed", label: "Atrasado", color: "bg-red-500" },
                      ].map(status => (
                        <button
                          key={status.id}
                          onClick={() => setCurrentStatus({ ...currentStatus, health: status.id as any })}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs",
                            currentStatus.health === status.id
                              ? "border-white/50 bg-white/10"
                              : "border-[#2A2A2A] hover:border-neutral-500"
                          )}
                        >
                          <div className={cn("w-2 h-2 rounded-full", status.color)} />
                          <span className="text-neutral-300">{status.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-500 w-24">Entrega prevista:</span>
                    <Input
                      type="date"
                      value={currentStatus.deliveryDate.toISOString().split("T")[0]}
                      onChange={e => setCurrentStatus({ ...currentStatus, deliveryDate: new Date(e.target.value) })}
                      className="w-40 h-8 bg-[#1A1A1A] border-[#2A2A2A] text-white text-xs"
                    />
                  </div>

                  <Textarea
                    value={currentStatus.observation}
                    onChange={e => setCurrentStatus({ ...currentStatus, observation: e.target.value })}
                    placeholder="Adicione contexto sobre o status atual para o cliente..."
                    className="min-h-[80px] bg-[#1A1A1A] border-[#2A2A2A] text-neutral-300 resize-none"
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Atividades do Periodo */}
            {isSectionEnabled("activities") && (
              <AccordionItem value="activities" className="border border-[#2A2A2A] rounded-lg bg-[#141414]">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#1A1A1A] rounded-t-lg">
                  <span className="text-sm font-medium text-orange-500 tracking-wider">ATIVIDADES DO PERIODO</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {activities.map(activity => (
                      <div
                        key={activity.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                          activity.included
                            ? "bg-[#1A1A1A] border-[#2A2A2A]"
                            : "bg-[#0A0A0A] border-[#1A1A1A] opacity-50"
                        )}
                      >
                        <button onClick={() => toggleActivity(activity.id)}>
                          {activity.included ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                        <span className="text-xs text-neutral-500 font-mono w-20">
                          {formatDateShort(activity.date)}
                        </span>
                        {activity.addedManually ? (
                          <Input
                            value={activity.description}
                            onChange={e => {
                              setActivities(activities.map(a =>
                                a.id === activity.id ? { ...a, description: e.target.value } : a
                              ))
                            }}
                            className="flex-1 h-7 bg-transparent border-[#2A2A2A] text-neutral-300 text-sm"
                          />
                        ) : (
                          <span className="flex-1 text-sm text-neutral-300">{activity.description}</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeActivity(activity.id)}
                          className="h-6 w-6 p-0 text-neutral-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addActivity}
                      className="w-full border-dashed border-[#2A2A2A] text-neutral-500 hover:text-white hover:border-orange-500 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar atividade
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Sprints & Entregas */}
            {isSectionEnabled("sprints") && (
              <AccordionItem value="sprints" className="border border-[#2A2A2A] rounded-lg bg-[#141414]">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#1A1A1A] rounded-t-lg">
                  <span className="text-sm font-medium text-orange-500 tracking-wider">SPRINTS & ENTREGAS</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {sprints.map(sprint => (
                    <Card key={sprint.sprintId} className="bg-[#1A1A1A] border-[#2A2A2A] border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{sprint.sprintName}</span>
                            <span className="text-xs text-neutral-500">
                              {formatDateShort(sprint.periodStart)} - {formatDateShort(sprint.periodEnd)}
                            </span>
                          </div>
                          <Badge className={cn(
                            "text-xs",
                            sprint.status === "completed" ? "bg-green-500/20 text-green-500" :
                            sprint.status === "in_progress" ? "bg-orange-500/20 text-orange-500" :
                            "bg-neutral-500/20 text-neutral-400"
                          )}>
                            {sprint.status === "completed" ? "CONCLUIDA" :
                             sprint.status === "in_progress" ? "EM ANDAMENTO" : "PLANEJADA"}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-3">
                          {sprint.tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-2 text-sm">
                              {task.status === "completed" ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : task.status === "moved" ? (
                                <ArrowRightCircle className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-orange-500" />
                              )}
                              <span className={cn(
                                task.status === "completed" ? "text-neutral-300" :
                                task.status === "moved" ? "text-yellow-500/70" : "text-neutral-400"
                              )}>
                                {task.name}
                                {task.status === "moved" && " (movido para proxima sprint)"}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-500">
                            Velocidade: {sprint.velocity.completed}/{sprint.velocity.total} tasks ({Math.round((sprint.velocity.completed / sprint.velocity.total) * 100)}%)
                          </span>
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-neutral-500 hover:text-white">
                            Editar observacao
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Proximos Passos */}
            {isSectionEnabled("next_steps") && (
              <AccordionItem value="next_steps" className="border border-[#2A2A2A] rounded-lg bg-[#141414]">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#1A1A1A] rounded-t-lg">
                  <span className="text-sm font-medium text-orange-500 tracking-wider">PROXIMOS PASSOS</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {nextSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
                        <GripVertical className="w-4 h-4 text-neutral-600 cursor-grab" />
                        <span className="text-sm text-orange-500 font-mono w-6">{index + 1}.</span>
                        <Input
                          value={step.description}
                          onChange={e => updateNextStep(step.id, "description", e.target.value)}
                          placeholder="Descricao..."
                          className="flex-1 h-7 bg-transparent border-[#2A2A2A] text-neutral-300 text-sm"
                        />
                        <Input
                          value={step.responsible}
                          onChange={e => updateNextStep(step.id, "responsible", e.target.value)}
                          placeholder="Responsavel"
                          className="w-32 h-7 bg-transparent border-[#2A2A2A] text-neutral-300 text-sm"
                        />
                        <span className="text-xs text-neutral-500">ate</span>
                        <Input
                          value={step.deadline}
                          onChange={e => updateNextStep(step.id, "deadline", e.target.value)}
                          placeholder="dd/mm"
                          className="w-20 h-7 bg-transparent border-[#2A2A2A] text-neutral-300 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeNextStep(step.id)}
                          className="h-6 w-6 p-0 text-neutral-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addNextStep}
                      className="w-full border-dashed border-[#2A2A2A] text-neutral-500 hover:text-white hover:border-orange-500 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar item
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Observacoes da Equipe */}
            {isSectionEnabled("team_notes") && (
              <AccordionItem value="team_notes" className="border border-[#2A2A2A] rounded-lg bg-[#141414]">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#1A1A1A] rounded-t-lg">
                  <span className="text-sm font-medium text-orange-500 tracking-wider">OBSERVACOES DA EQUIPE</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <Textarea
                    value={teamNotes}
                    onChange={e => setTeamNotes(e.target.value)}
                    placeholder="Adicione notas internas convertidas em comunicacao ao cliente, pontos de atencao, agradecimentos, etc."
                    className="min-h-[100px] bg-[#1A1A1A] border-[#2A2A2A] text-neutral-300 resize-none"
                  />
                  <div className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
                    <div className="flex items-center gap-2">
                      {includeTeamNotes ? (
                        <Unlock className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-neutral-500" />
                      )}
                      <span className="text-sm text-neutral-300">
                        {includeTeamNotes ? "Incluir no relatorio" : "Apenas interno"}
                      </span>
                    </div>
                    <Switch
                      checked={includeTeamNotes}
                      onCheckedChange={setIncludeTeamNotes}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>

      {/* Preview Panel */}
      {previewMode && (
        <div className="w-1/2 border-l border-[#2A2A2A] flex flex-col bg-[#0A0A0A]">
          <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
            <span className="text-sm text-neutral-400">Preview do Documento</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreviewPage(Math.max(1, previewPage - 1))}
                disabled={previewPage === 1}
                className="h-7 text-neutral-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-neutral-500">Pagina {previewPage}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreviewPage(previewPage + 1)}
                className="h-7 text-neutral-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview Content - White theme for client document */}
          <div className="flex-1 overflow-y-auto p-6 flex justify-center">
            <div id="report-preview" className="w-full max-w-[794px] bg-white text-[#1A1A1A] p-12 shadow-2xl font-sans print:shadow-none print:p-0">
              {/* Header */}
              <div className="border-b-[3px] border-orange-500 pb-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  {config.includeFocusLogo && (
                    <img src="/logo.svg" alt="Focus Agency" className="h-10" />
                  )}
                  <div className="text-right text-sm text-neutral-500">
                    <p>Data: {formatDate(new Date())}</p>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-[#1A1A1A] font-display tracking-wide">
                  RELATORIO DE PROGRESSO
                </h1>
                <p className="text-lg text-neutral-600 mt-1">
                  {config.projectName} - {formatDateShort(config.periodStart)} a {formatDateShort(config.periodEnd)}
                </p>
                <div className="mt-4 text-sm text-neutral-500 space-y-1">
                  {config.recipientName && (
                    <p>Para: {config.recipientName}{config.recipientRole && ` - ${config.recipientRole}`}</p>
                  )}
                  <p>Preparado por: {config.preparedBy}</p>
                </div>
              </div>

              {/* Sections */}
              {isSectionEnabled("executive_summary") && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-l-[3px] border-orange-500 pl-3 mb-4 font-display">
                    1. Resumo Executivo
                  </h2>
                  <p className="text-sm leading-relaxed text-neutral-700">{executiveSummary}</p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isSectionEnabled("current_status") && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-l-[3px] border-orange-500 pl-3 mb-4 font-display">
                    2. Status Atual
                  </h2>
                  <div className="border border-neutral-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-500">Etapa:</span>
                      <span className="text-sm font-medium text-orange-500">{currentStatus.stage}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Progresso:</span>
                        <span className="font-mono">{currentStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${currentStatus.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-500">Status:</span>
                      <span className={cn(
                        "text-sm font-medium flex items-center gap-1",
                        currentStatus.health === "on_track" ? "text-green-600" :
                        currentStatus.health === "at_risk" ? "text-yellow-600" : "text-red-600"
                      )}>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          currentStatus.health === "on_track" ? "bg-green-500" :
                          currentStatus.health === "at_risk" ? "bg-yellow-500" : "bg-red-500"
                        )} />
                        {currentStatus.health === "on_track" ? "No prazo" :
                         currentStatus.health === "at_risk" ? "Em risco" : "Atrasado"}
                      </span>
                    </div>
                    {currentStatus.observation && (
                      <p className="text-sm text-neutral-600 pt-2 border-t border-neutral-200">
                        {currentStatus.observation}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isSectionEnabled("activities") && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-l-[3px] border-orange-500 pl-3 mb-4 font-display">
                    3. Atividades do Periodo
                  </h2>
                  <div className="space-y-2">
                    {activities.filter(a => a.included).map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 text-sm">
                        <span className="text-neutral-400 font-mono text-xs mt-0.5">
                          {formatDateShort(activity.date)}
                        </span>
                        <span className="text-neutral-700">{activity.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSectionEnabled("next_steps") && nextSteps.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-l-[3px] border-orange-500 pl-3 mb-4 font-display">
                    4. Proximos Passos
                  </h2>
                  <div className="space-y-2">
                    {nextSteps.filter(s => s.description).map((step, index) => (
                      <div key={step.id} className="flex items-start gap-3 text-sm">
                        <span className="text-orange-500 font-mono">{index + 1}.</span>
                        <span className="text-neutral-700">{step.description}</span>
                        {step.responsible && (
                          <span className="text-neutral-400">- {step.responsible}</span>
                        )}
                        {step.deadline && (
                          <span className="text-neutral-400 font-mono">ate {step.deadline}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSectionEnabled("team_notes") && includeTeamNotes && teamNotes && (
                <div className="mb-8">
                  <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-l-[3px] border-orange-500 pl-3 mb-4 font-display">
                    5. Observacoes
                  </h2>
                  <p className="text-sm leading-relaxed text-neutral-700">{teamNotes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-400">
                <p>Este relatorio foi gerado pelo Focus Project OS</p>
                <p className="mt-1">Focus Agency - Desenvolvimento de Software & Automacoes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-preview, #report-preview * {
            visibility: visible;
          }
          #report-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
