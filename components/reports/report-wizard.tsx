"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  FileText,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Zap,
  Sparkles,
  Check,
  Upload,
} from "lucide-react"
import {
  MOCK_PROJECTS,
  REPORT_PERIODS,
  REPORT_TYPES,
  REPORT_SECTIONS,
  TEAM_MEMBERS,
  type SectionConfig,
} from "@/lib/report-types"

interface ReportWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (config: WizardConfig) => void
  preselectedProjectId?: string
}

interface WizardConfig {
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

export function ReportWizard({ open, onOpenChange, onComplete, preselectedProjectId }: ReportWizardProps) {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)

  // Step 1 state
  const [selectedProject, setSelectedProject] = useState(preselectedProjectId || "")
  const [selectedPeriod, setSelectedPeriod] = useState("15d")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [reportType, setReportType] = useState("progress")

  // Step 2 state
  const [sections, setSections] = useState<SectionConfig[]>(REPORT_SECTIONS.map(s => ({ ...s })))
  const [recipientName, setRecipientName] = useState("")
  const [recipientRole, setRecipientRole] = useState("")
  const [preparedBy, setPreparedBy] = useState(TEAM_MEMBERS[0].id)
  const [includeFocusLogo, setIncludeFocusLogo] = useState(true)
  const [includeClientLogo, setIncludeClientLogo] = useState(false)

  const project = MOCK_PROJECTS.find(p => p.id === selectedProject)

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const getPeriodDates = () => {
    const end = new Date()
    let start = new Date()

    if (selectedPeriod === "custom" && customStart && customEnd) {
      return {
        start: new Date(customStart),
        end: new Date(customEnd),
      }
    }

    const period = REPORT_PERIODS.find(p => p.id === selectedPeriod)
    if (period) {
      start.setDate(start.getDate() - period.days)
    }

    return { start, end }
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    // Simular geracao do relatorio
    await new Promise(resolve => setTimeout(resolve, 2000))

    const dates = getPeriodDates()
    const teamMember = TEAM_MEMBERS.find(m => m.id === preparedBy)

    onComplete({
      projectId: selectedProject,
      projectName: project?.name || "",
      clientName: project?.client || "",
      period: selectedPeriod,
      periodStart: dates.start,
      periodEnd: dates.end,
      reportType,
      sections,
      recipientName,
      recipientRole,
      preparedBy: teamMember?.name || "Gabriel",
      includeFocusLogo,
      includeClientLogo,
    })

    setIsGenerating(false)
    onOpenChange(false)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Selecionar Projeto */}
      <div className="space-y-3">
        <Label className="text-xs text-neutral-400 tracking-wider">PROJETO *</Label>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
            <SelectValue placeholder="Selecionar projeto..." />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
            {MOCK_PROJECTS.map(p => (
              <SelectItem key={p.id} value={p.id} className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                {p.id} - {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Preview do projeto */}
        {project && (
          <div className="p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-500 font-mono">{project.id}</span>
              <span className="text-sm text-white font-medium">{project.name}</span>
            </div>
            <div className="text-xs text-neutral-400 space-y-1">
              <p>Etapa atual: {project.stage} (Etapa {project.stageNumber})</p>
              <p>Sprints: {project.sprintsCompleted} concluidas - {project.sprintsInProgress} em andamento</p>
              <p>Responsavel: {project.responsible} + Dev {project.dev}</p>
            </div>
          </div>
        )}
      </div>

      {/* Periodo */}
      <div className="space-y-3">
        <Label className="text-xs text-neutral-400 tracking-wider">PERIODO DO RELATORIO *</Label>
        <div className="grid grid-cols-4 gap-2">
          {REPORT_PERIODS.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={cn(
                "p-3 border rounded-lg text-center transition-colors",
                selectedPeriod === period.id
                  ? "bg-orange-500/20 border-orange-500 text-orange-500"
                  : "bg-[#1A1A1A] border-[#2A2A2A] text-neutral-400 hover:border-neutral-500"
              )}
            >
              <span className="text-xs font-medium">{period.name}</span>
            </button>
          ))}
        </div>

        {/* Periodo customizado */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>Ou periodo customizado:</span>
          <div className="flex items-center gap-2">
            <span>De</span>
            <Input
              type="date"
              value={customStart}
              onChange={e => { setCustomStart(e.target.value); setSelectedPeriod("custom") }}
              className="w-36 h-8 bg-[#1A1A1A] border-[#2A2A2A] text-white text-xs"
            />
            <span>ate</span>
            <Input
              type="date"
              value={customEnd}
              onChange={e => { setCustomEnd(e.target.value); setSelectedPeriod("custom") }}
              className="w-36 h-8 bg-[#1A1A1A] border-[#2A2A2A] text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Tipo de Relatorio */}
      <div className="space-y-3">
        <Label className="text-xs text-neutral-400 tracking-wider">TIPO DE RELATORIO *</Label>
        <div className="space-y-2">
          {REPORT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 border rounded-lg transition-colors text-left",
                reportType === type.id
                  ? "bg-orange-500/20 border-orange-500"
                  : "bg-[#1A1A1A] border-[#2A2A2A] hover:border-neutral-500"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-sm border-2 flex items-center justify-center",
                reportType === type.id ? "border-orange-500" : "border-neutral-500"
              )}>
                {reportType === type.id && <div className="w-2 h-2 rounded-[1px] bg-orange-500" />}
              </div>
              <div>
                <p className={cn("text-sm", reportType === type.id ? "text-orange-500" : "text-neutral-300")}>
                  {type.name}
                </p>
                <p className="text-xs text-neutral-500">{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Secoes a incluir */}
      <div className="space-y-3">
        <Label className="text-xs text-neutral-400 tracking-wider">SECOES A INCLUIR</Label>
        <div className="space-y-2">
          {sections.map(section => (
            <div
              key={section.id}
              className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg"
            >
              <span className={cn("text-sm", section.enabled ? "text-white" : "text-neutral-500")}>
                {section.name}
              </span>
              <Switch
                checked={section.enabled}
                onCheckedChange={() => toggleSection(section.id)}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#2A2A2A] pt-6">
        <Label className="text-xs text-neutral-400 tracking-wider mb-4 block">PERSONALIZACAO</Label>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">Nome do destinatario</Label>
            <Input
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="Joao Silva"
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">Cargo/Empresa</Label>
            <Input
              value={recipientRole}
              onChange={e => setRecipientRole(e.target.value)}
              placeholder="CEO, TechFlow Ltda"
              className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label className="text-xs text-neutral-500">Preparado por</Label>
          <Select value={preparedBy} onValueChange={setPreparedBy}>
            <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
              {TEAM_MEMBERS.map(member => (
                <SelectItem key={member.id} value={member.id} className="text-neutral-300 focus:bg-[#2A2A2A] focus:text-white">
                  {member.name} - {member.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
            <span className="text-sm text-neutral-300">Incluir logo da Focus</span>
            <Switch
              checked={includeFocusLogo}
              onCheckedChange={setIncludeFocusLogo}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-300">Incluir logo do cliente</span>
              {includeClientLogo && (
                <Button size="sm" variant="outline" className="h-7 text-xs border-[#2A2A2A] text-neutral-400">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload logo...
                </Button>
              )}
            </div>
            <Switch
              checked={includeClientLogo}
              onCheckedChange={setIncludeClientLogo}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => {
    const dates = getPeriodDates()
    const teamMember = TEAM_MEMBERS.find(m => m.id === preparedBy)
    const enabledSections = sections.filter(s => s.enabled)

    return (
      <div className="space-y-6">
        <div className="p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg space-y-4">
          <h3 className="text-xs text-neutral-400 tracking-wider">RESUMO DA CONFIGURACAO</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Projeto:</span>
              <span className="text-white">{project?.id} - {project?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Periodo:</span>
              <span className="text-white">
                {selectedPeriod === "custom" ? "Customizado" : REPORT_PERIODS.find(p => p.id === selectedPeriod)?.name} ({dates.start.toLocaleDateString('pt-BR')} - {dates.end.toLocaleDateString('pt-BR')})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Tipo:</span>
              <span className="text-white">{REPORT_TYPES.find(t => t.id === reportType)?.name}</span>
            </div>
            {recipientName && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Para:</span>
                <span className="text-white">{recipientName}{recipientRole && ` - ${recipientRole}`}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500">Preparado por:</span>
              <span className="text-white">{teamMember?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Secoes:</span>
              <span className="text-white">{enabledSections.length} de {sections.length} ativas</span>
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 mx-auto border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <p className="text-sm text-white">Compilando dados do projeto...</p>
              <p className="text-xs text-neutral-500">Montando relatorio...</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-display text-white tracking-wider">
                NOVO RELATORIO DE PROJETO
              </DialogTitle>
              <p className="text-xs text-neutral-500">Passo {step} de 3</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-neutral-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s <= step ? "bg-orange-500" : "bg-[#2A2A2A]"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t border-[#2A2A2A]">
          <div>
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isGenerating}
                className="border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                VOLTAR
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              className="border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent"
            >
              CANCELAR
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && !selectedProject}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                PROXIMO
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    GERANDO...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    GERAR RELATORIO
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
