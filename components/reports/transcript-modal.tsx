"use client"

import { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  X,
  ChevronRight,
  ChevronLeft,
  FileText,
  Upload,
  Trash2,
  Check,
  Zap,
  Download,
  Save,
  Send,
  ClipboardList,
  Target,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles
} from "lucide-react"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { supabase } from "@/lib/supabase"
import { useToast } from "./toast-notification"

interface TranscriptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Recipients options
const RECIPIENTS = [
  { id: "tech-leader", label: "Tech Leader" },
  { id: "estagiarios", label: "Estagiarios" },
  { id: "comercial", label: "Comercial" },
  { id: "designer", label: "Designer" },
  { id: "qa", label: "QA / Testes" },
  { id: "cliente", label: "Cliente" },
]

// Report types
const REPORT_TYPES = [
  { id: "progresso", label: "Progresso" },
  { id: "kickoff", label: "Kickoff" },
  { id: "entrega", label: "Entrega" },
  { id: "alinhamento", label: "Alinhamento" },
]

// Delivery formats
const DELIVERY_FORMATS = [
  { id: "sprints", label: "Sprints (Scrum)" },
  { id: "fases", label: "Fases / Etapas" },
  { id: "kanban", label: "Kanban" },
]

// Sprint durations
const SPRINT_DURATIONS = [
  { id: "1-semana", label: "1 semana" },
  { id: "2-semanas", label: "2 semanas" },
  { id: "3-semanas", label: "3 semanas" },
  { id: "1-mes", label: "1 mes" },
]

// Detail levels
const DETAIL_LEVELS = [
  { id: "resumido", label: "Resumido", description: "visao geral executiva" },
  { id: "completo", label: "Completo", description: "detalhado com tarefas" },
  { id: "tecnico", label: "Tecnico", description: "foco em arquitetura e stack" },
]

// Loading messages
const LOADING_MESSAGES = [
  "Lendo transcricao...",
  "Identificando requisitos...",
  "Estruturando sprints...",
  "Gerando relatorio para a equipe...",
]

// Mock generated report
const MOCK_REPORT = {
  resumo: "Reuniao de kickoff realizada com sucesso. O projeto consiste no desenvolvimento de um sistema de gestao empresarial com modulos de vendas, estoque e financeiro. Prazo estimado de 3 meses com entregas quinzenais.",
  objetivos: [
    "Desenvolver sistema completo de gestao empresarial",
    "Integrar modulos de vendas, estoque e financeiro",
    "Implementar dashboard com metricas em tempo real",
    "Criar sistema de relatorios automatizados",
  ],
  equipe: [
    { nome: "Gabriel", papel: "Tech Leader", responsabilidade: "Arquitetura e revisao de codigo" },
    { nome: "Pedro", papel: "Dev Frontend", responsabilidade: "Interface do usuario e componentes" },
    { nome: "Ana", papel: "Dev Backend", responsabilidade: "APIs e integracao de dados" },
  ],
  sprints: [
    {
      numero: 1,
      nome: "Fundacao",
      objetivos: ["Setup do projeto", "Autenticacao", "Dashboard base"],
      tarefas: 12,
      duracao: "2 semanas",
    },
    {
      numero: 2,
      nome: "Modulo Vendas",
      objetivos: ["CRUD de vendas", "Relatorios de vendas", "Integracao com estoque"],
      tarefas: 15,
      duracao: "2 semanas",
    },
    {
      numero: 3,
      nome: "Modulo Estoque",
      objetivos: ["Gestao de produtos", "Controle de entrada/saida", "Alertas de estoque baixo"],
      tarefas: 14,
      duracao: "2 semanas",
    },
  ],
  riscos: [
    "Integracao com sistemas legados pode requerer mais tempo",
    "Dependencia de API externa para pagamentos",
    "Necessidade de validacao com stakeholders a cada sprint",
  ],
  proximosPassos: [
    "Agendar reuniao de refinamento da Sprint 1",
    "Configurar ambiente de desenvolvimento",
    "Criar board no sistema de gestao de tarefas",
    "Enviar cronograma detalhado para o cliente",
  ],
}

export function TranscriptModal({ open, onOpenChange }: TranscriptModalProps) {
  const { projects } = useProjetos()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  // Step 1 state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [transcriptText, setTranscriptText] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  // Step 2 state
  const [projectName, setProjectName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [clientName, setClientName] = useState("")
  const [projectCode, setProjectCode] = useState("")
  const [reportType, setReportType] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [responsible, setResponsible] = useState("")

  // Step 3 state
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [developers, setDevelopers] = useState<string[]>([])
  const [developerInput, setDeveloperInput] = useState("")
  const [deliveryFormat, setDeliveryFormat] = useState("")
  const [sprintDuration, setSprintDuration] = useState("")
  const [sprintCount, setSprintCount] = useState("")
  const [phaseCount, setPhaseCount] = useState("")
  const [detailLevel, setDetailLevel] = useState("")

  // Step 4 state
  const [additionalPrompt, setAdditionalPrompt] = useState("")

  // Cycle loading messages
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isGenerating])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const addDeveloper = () => {
    if (developerInput.trim() && !developers.includes(developerInput.trim())) {
      setDevelopers(prev => [...prev, developerInput.trim()])
      setDeveloperInput("")
    }
  }

  const removeDeveloper = (dev: string) => {
    setDevelopers(prev => prev.filter(d => d !== dev))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addDeveloper()
    }
  }

  const canProceedStep1 = uploadedFile || transcriptText.trim().length > 0
  const canProceedStep2 = projectName && clientName && projectCode && reportType && meetingDate && responsible
  const canProceedStep3 = selectedRecipients.length > 0 && deliveryFormat && detailLevel

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    if (generationComplete) {
      setGenerationComplete(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setLoadingMessageIndex(0)

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 6000))

    setIsGenerating(false)
    setGenerationComplete(true)
  }

  const handleManualSave = async () => {
    if (!projectId) {
      showToast("error", "Selecione um projeto para salvar")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("relatorios")
        .insert([{
          titulo: `Relatório de ${REPORT_TYPES.find(t => t.id === reportType)?.label || 'Transcrição'} - ${projectName}`,
          projeto_id: projectId,
          tipo: "Interno — Equipe",
          periodo_inicio: meetingDate,
          periodo_fim: meetingDate,
          status: "salvo",
          conteudo_json: {
            transcript_report: MOCK_REPORT,
            metadata: {
              responsible,
              recipients: selectedRecipients,
              detailLevel,
              deliveryFormat
            }
          }
        }])

      if (error) throw error
      showToast("success", "Relatório salvo no banco de dados com sucesso!")
      handleClose()
    } catch (err) {
      console.error("Erro ao salvar relatório:", err)
      showToast("error", "Erro ao salvar relatório no banco")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = () => {
    window.print()
  }

  const handleClose = () => {
    // Reset all state
    setStep(1)
    setIsGenerating(false)
    setGenerationComplete(false)
    setUploadedFile(null)
    setTranscriptText("")
    setProjectName("")
    setClientName("")
    setProjectCode("")
    setReportType("")
    setMeetingDate("")
    setResponsible("")
    setSelectedRecipients([])
    setDevelopers([])
    setDeliveryFormat("")
    setSprintDuration("")
    setSprintCount("")
    setPhaseCount("")
    setDetailLevel("")
    setAdditionalPrompt("")
    onOpenChange(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">Ler Transcricao de Reuniao</h2>
        <p className="text-sm text-neutral-500">Faca upload da transcricao em PDF ou cole o texto abaixo</p>
      </div>

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-orange-500 bg-orange-500/10"
            : uploadedFile
            ? "border-green-500 bg-green-500/10"
            : "border-[#ff6b00] hover:bg-[#ff6b00]/5"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {uploadedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-green-500" />
            <div className="text-left">
              <p className="text-sm text-foreground font-medium">{uploadedFile.name}</p>
              <p className="text-xs text-neutral-500">{formatFileSize(uploadedFile.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); removeFile() }}
              className="text-neutral-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <FileText className="w-10 h-10 mx-auto text-[#ff6b00] mb-3" />
            <p className="text-sm text-neutral-400">Arraste o PDF aqui ou clique para selecionar</p>
            <p className="text-xs text-neutral-600 mt-1">Aceita apenas arquivos .pdf</p>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#2A2A2A]" />
        <span className="text-xs text-neutral-500">OU</span>
        <div className="flex-1 h-px bg-[#2A2A2A]" />
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <Label className="text-xs text-neutral-400">Ou cole a transcricao em texto:</Label>
        <Textarea
          value={transcriptText}
          onChange={e => setTranscriptText(e.target.value)}
          placeholder="Cole aqui o conteudo da reuniao..."
          className="min-h-[150px] bg-[#1A1A1A] border-border text-foreground placeholder:text-neutral-600 focus:border-[#ff6b00] resize-none"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">Dados do Projeto</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-neutral-400">Projeto Vinculado *</Label>
          <Select value={projectId} onValueChange={(val) => {
            setProjectId(val)
            const p = projects?.find(proj => proj.id === val)
            if (p) {
              setProjectName(p.name)
              setProjectCode(p.codigo || "")
            }
          }}>
            <SelectTrigger className="bg-[#1A1A1A] border-border text-foreground focus:border-[#ff6b00]">
              <SelectValue placeholder="Selecione um projeto..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-border">
              {projects?.map((p: any) => (
                <SelectItem key={p.id} value={p.id} className="text-foreground focus:bg-[#2A2A2A] focus:text-foreground">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-neutral-400">Cliente *</Label>
          <Input
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Empresa XYZ"
            className="bg-[#1A1A1A] border-border text-foreground focus:border-[#ff6b00]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-neutral-400">Codigo do Projeto *</Label>
          <Input
            value={projectCode}
            onChange={e => setProjectCode(e.target.value)}
            placeholder="Ex: PRJ-043"
            className="bg-[#1A1A1A] border-border text-foreground focus:border-[#ff6b00]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-neutral-400">Tipo de Relatorio *</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="bg-[#1A1A1A] border-border text-foreground focus:border-[#ff6b00]">
              <SelectValue placeholder="Selecionar..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-border">
              {REPORT_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id} className="text-foreground focus:bg-[#2A2A2A] focus:text-foreground">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-neutral-400">Data da Reuniao *</Label>
          <Input
            type="date"
            value={meetingDate}
            onChange={e => setMeetingDate(e.target.value)}
            className="bg-[#1A1A1A] border-border text-foreground focus:border-[#ff6b00]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-neutral-400">Responsavel pelo Relatorio *</Label>
          <Input
            value={responsible}
            onChange={e => setResponsible(e.target.value)}
            placeholder="Nome completo"
            className="bg-[#1A1A1A] border-border text-foreground focus:border-[#ff6b00]"
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-foreground">Equipe & Configuracoes do Relatorio</h2>
      </div>

      {/* Recipients */}
      <div className="space-y-3">
        <Label className="text-xs text-neutral-400 tracking-wider">DESTINATARIOS DO RELATORIO</Label>
        <div className="flex flex-wrap gap-2">
          {RECIPIENTS.map(recipient => (
            <button
              key={recipient.id}
              onClick={() => toggleRecipient(recipient.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                selectedRecipients.includes(recipient.id)
                  ? "bg-[#ff6b00] text-foreground"
                  : "bg-[#1A1A1A] text-neutral-400 border border-border hover:border-[#ff6b00]"
              )}
            >
              {recipient.label}
            </button>
          ))}
        </div>
      </div>

      {/* Developers */}
      <div className="space-y-3">
        <Label className="text-xs text-neutral-400 tracking-wider">QUEM IRA DESENVOLVER</Label>
        <div className="flex gap-2">
          <Input
            value={developerInput}
            onChange={e => setDeveloperInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite o nome e pressione Enter"
            className="bg-[#1A1A1A] border-border text-foreground focus:border-[#ff6b00]"
          />
          <Button
            onClick={addDeveloper}
            variant="outline"
            className="border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00]/10"
          >
            Adicionar
          </Button>
        </div>
        {developers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {developers.map(dev => (
              <Badge
                key={dev}
                className="bg-[#ff6b00]/20 text-[#ff6b00] border-0 flex items-center gap-1"
              >
                {dev}
                <button onClick={() => removeDeveloper(dev)} className="hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Format */}
      <div className="space-y-3">
        <Label className="text-xs text-neutral-400 tracking-wider">FORMATO DE ENTREGA</Label>
        <div className="space-y-2">
          {DELIVERY_FORMATS.map(format => (
            <button
              key={format.id}
              onClick={() => setDeliveryFormat(format.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                deliveryFormat === format.id
                  ? "bg-[#ff6b00]/10 border-[#ff6b00]"
                  : "bg-[#1A1A1A] border-border hover:border-neutral-500"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                deliveryFormat === format.id ? "border-[#ff6b00]" : "border-neutral-500"
              )}>
                {deliveryFormat === format.id && <div className="w-2 h-2 rounded-full bg-[#ff6b00]" />}
              </div>
              <span className={cn("text-sm", deliveryFormat === format.id ? "text-[#ff6b00]" : "text-foreground")}>
                {format.label}
              </span>
            </button>
          ))}
        </div>

        {/* Sprint options */}
        {deliveryFormat === "sprints" && (
          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-border">
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Duracao de cada Sprint</Label>
              <Select value={sprintDuration} onValueChange={setSprintDuration}>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-border">
                  {SPRINT_DURATIONS.map(d => (
                    <SelectItem key={d.id} value={d.id} className="text-foreground focus:bg-[#2A2A2A] focus:text-foreground">
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Numero estimado de Sprints</Label>
              <Input
                type="number"
                value={sprintCount}
                onChange={e => setSprintCount(e.target.value)}
                placeholder="Ex: 6"
                className="bg-card border-border text-foreground"
              />
            </div>
          </div>
        )}

        {/* Phases options */}
        {deliveryFormat === "fases" && (
          <div className="mt-4 p-4 bg-[#1A1A1A] rounded-lg border border-border">
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Numero de Fases</Label>
              <Input
                type="number"
                value={phaseCount}
                onChange={e => setPhaseCount(e.target.value)}
                placeholder="Ex: 4"
                className="bg-card border-border text-foreground w-32"
              />
            </div>
          </div>
        )}
      </div>

      {/* Detail Level */}
      <div className="space-y-3">
        <Label className="text-xs text-neutral-400 tracking-wider">NIVEL DE DETALHE DO RELATORIO</Label>
        <div className="grid grid-cols-3 gap-3">
          {DETAIL_LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => setDetailLevel(level.id)}
              className={cn(
                "p-4 rounded-lg border text-center transition-colors",
                detailLevel === level.id
                  ? "bg-[#ff6b00]/10 border-[#ff6b00]"
                  : "bg-[#1A1A1A] border-border hover:border-neutral-500"
              )}
            >
              <p className={cn("text-sm font-medium", detailLevel === level.id ? "text-[#ff6b00]" : "text-foreground")}>
                {level.label}
              </p>
              <p className="text-xs text-neutral-500 mt-1">{level.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => {
    if (generationComplete) {
      return (
        <div className="space-y-6">
          {/* Success banner */}
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-500 font-medium">Relatorio gerado com sucesso!</span>
          </div>

          {/* Generated report */}
          <div className="max-h-[400px] overflow-y-auto space-y-6 p-4 bg-[#1A1A1A] rounded-lg border border-border">
            {/* Resumo Executivo */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <ClipboardList className="w-4 h-4 text-[#ff6b00]" />
                Resumo Executivo
              </h3>
              <p className="text-sm text-neutral-400">{MOCK_REPORT.resumo}</p>
            </div>

            {/* Objetivos */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Target className="w-4 h-4 text-[#ff6b00]" />
                Objetivos do Projeto
              </h3>
              <ul className="space-y-1">
                {MOCK_REPORT.objetivos.map((obj, i) => (
                  <li key={i} className="text-sm text-neutral-400 flex items-start gap-2">
                    <span className="text-[#ff6b00]">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipe */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Users className="w-4 h-4 text-[#ff6b00]" />
                Equipe & Responsabilidades
              </h3>
              <div className="space-y-2">
                {MOCK_REPORT.equipe.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-card rounded">
                    <div>
                      <span className="text-sm text-foreground">{member.nome}</span>
                      <span className="text-xs text-neutral-500 ml-2">({member.papel})</span>
                    </div>
                    <span className="text-xs text-neutral-400">{member.responsabilidade}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sprints */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Calendar className="w-4 h-4 text-[#ff6b00]" />
                Sprints / Etapas
              </h3>
              <div className="space-y-3">
                {MOCK_REPORT.sprints.map((sprint, i) => (
                  <div key={i} className="p-3 bg-card rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#ff6b00]">Sprint {sprint.numero}: {sprint.nome}</span>
                      <Badge className="bg-[#2A2A2A] text-neutral-400 text-xs">{sprint.duracao}</Badge>
                    </div>
                    <ul className="space-y-1">
                      {sprint.objetivos.map((obj, j) => (
                        <li key={j} className="text-xs text-neutral-400 flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-neutral-500 mt-2">{sprint.tarefas} tarefas estimadas</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Riscos */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Riscos Identificados
              </h3>
              <ul className="space-y-1">
                {MOCK_REPORT.riscos.map((risco, i) => (
                  <li key={i} className="text-sm text-neutral-400 flex items-start gap-2">
                    <span className="text-yellow-500">!</span>
                    {risco}
                  </li>
                ))}
              </ul>
            </div>

            {/* Proximos Passos */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Proximos Passos
              </h3>
              <ul className="space-y-1">
                {MOCK_REPORT.proximosPassos.map((passo, i) => (
                  <li key={i} className="text-sm text-neutral-400 flex items-start gap-2">
                    <span className="text-green-500">{i + 1}.</span>
                    {passo}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="flex-1 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              onClick={handleManualSave}
              disabled={isSaving}
              variant="outline"
              className="flex-1 border-border text-neutral-400 hover:text-foreground hover:border-neutral-500"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Report
            </Button>
            <Button
              className="flex-1 bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-foreground"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar para Equipe
            </Button>
          </div>

          <button
            onClick={handleClose}
            className="w-full text-center text-sm text-neutral-500 hover:text-neutral-400"
          >
            Fechar
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-foreground">Revisar e Gerar Relatorio</h2>
        </div>

        {/* Summary card */}
        <div className="p-4 bg-[#1e1e1e] rounded-lg space-y-3">
          <h3 className="text-xs text-neutral-400 tracking-wider mb-4">RESUMO DA CONFIGURACAO</h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-neutral-500">Projeto:</span>
              <span className="text-foreground ml-2">{projectName}</span>
            </div>
            <div>
              <span className="text-neutral-500">Cliente:</span>
              <span className="text-foreground ml-2">{clientName}</span>
            </div>
            <div>
              <span className="text-neutral-500">Codigo:</span>
              <span className="text-[#ff6b00] ml-2 font-mono">{projectCode}</span>
            </div>
            <div>
              <span className="text-neutral-500">Tipo:</span>
              <span className="text-foreground ml-2">{REPORT_TYPES.find(t => t.id === reportType)?.label}</span>
            </div>
            <div>
              <span className="text-neutral-500">Data:</span>
              <span className="text-foreground ml-2">{meetingDate}</span>
            </div>
            <div>
              <span className="text-neutral-500">Responsavel:</span>
              <span className="text-foreground ml-2">{responsible}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="text-sm mb-2">
              <span className="text-neutral-500">Destinatarios:</span>
              <span className="text-foreground ml-2">
                {selectedRecipients.map(r => RECIPIENTS.find(rec => rec.id === r)?.label).join(", ")}
              </span>
            </div>
            {developers.length > 0 && (
              <div className="text-sm mb-2">
                <span className="text-neutral-500">Desenvolvedores:</span>
                <span className="text-foreground ml-2">{developers.join(", ")}</span>
              </div>
            )}
            <div className="text-sm mb-2">
              <span className="text-neutral-500">Formato:</span>
              <span className="text-foreground ml-2">{DELIVERY_FORMATS.find(f => f.id === deliveryFormat)?.label}</span>
            </div>
            <div className="text-sm">
              <span className="text-neutral-500">Nivel de detalhe:</span>
              <span className="text-foreground ml-2">{DETAIL_LEVELS.find(l => l.id === detailLevel)?.label}</span>
            </div>
          </div>
        </div>

        {/* Additional prompt */}
        <div className="space-y-2">
          <Label className="text-xs text-neutral-400">Prompt adicional (opcional)</Label>
          <Textarea
            value={additionalPrompt}
            onChange={e => setAdditionalPrompt(e.target.value)}
            placeholder="Alguma instrucao extra para o relatorio? Ex: destacar riscos, incluir cronograma..."
            className="min-h-[80px] bg-[#1A1A1A] border-border text-foreground placeholder:text-neutral-600 focus:border-[#ff6b00] resize-none"
          />
        </div>

        {/* Generate button */}
        {isGenerating ? (
          <div className="space-y-4">
            <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className="h-full bg-[#ff6b00] animate-pulse" style={{ width: `${(loadingMessageIndex + 1) * 25}%` }} />
            </div>
            <p className="text-center text-sm text-neutral-400">{LOADING_MESSAGES[loadingMessageIndex]}</p>
          </div>
        ) : (
          <Button
            onClick={handleGenerate}
            className="w-full bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-foreground h-12 text-base font-medium shadow-lg shadow-[#ff6b00]/20 hover:shadow-[#ff6b00]/30 transition-shadow"
          >
            <Zap className="w-5 h-5 mr-2" />
            Gerar Relatorio com IA
          </Button>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff6b00]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#ff6b00]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Ler Transcricao</h2>
              <p className="text-xs text-neutral-500">Passo {step} de 4</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-neutral-500 hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 px-6 py-4">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s <= step ? "bg-[#ff6b00]" : "bg-[#2A2A2A]"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Footer */}
        {!generationComplete && (
          <div className="flex justify-between px-6 py-4 border-t border-border">
            <div>
              {step > 1 && !isGenerating && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-neutral-400 hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              )}
            </div>
            <div>
              {step < 4 && (
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2) ||
                    (step === 3 && !canProceedStep3)
                  }
                  className="bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Hidden Print Preview */}
        <div id="printable-transcript-report" className="hidden print:block fixed inset-0 bg-white text-slate-900 p-16 z-[9999]">
          <div className="flex justify-between items-start border-b-2 border-[#ff6b00] pb-8 mb-10">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Ata de Reunião</h1>
              <p className="text-[#ff6b00] font-bold tracking-widest text-sm uppercase mt-1">Relatório gerado por Inteligência Artificial</p>
              <div className="mt-6 space-y-1">
                <p className="text-sm font-bold">{projectName}</p>
                <p className="text-xs text-slate-500">Data: {meetingDate || new Date().toLocaleDateString()}</p>
                <p className="text-xs text-slate-500">Responsável: {responsible}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <img src="/logo.svg" alt="Focus OS" className="w-16 h-16" />
              <p className="text-[10px] text-slate-400 font-mono">FOCUS OS | GESTÃO DE PROJETOS</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#ff6b00] flex items-center gap-2 mb-3">
                <span className="w-4 h-[2px] bg-[#ff6b00]"/> Resumo Executivo
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed pl-6">{MOCK_REPORT.resumo}</p>
            </section>

            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#ff6b00] flex items-center gap-2 mb-3">
                <span className="w-4 h-[2px] bg-[#ff6b00]"/> Objetivos do Projeto
              </h2>
              <ul className="pl-6 space-y-2">
                {MOCK_REPORT.objetivos.map((obj, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] mt-1.5 shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-[#ff6b00] flex items-center gap-2 mb-3">
                <span className="w-4 h-[2px] bg-[#ff6b00]"/> Próximos Passos
              </h2>
              <ul className="pl-6 space-y-2">
                {MOCK_REPORT.proximosPassos.map((passo, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="font-bold text-[#ff6b00]">{i+1}.</span>
                    {passo}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
            <p>Relatório de Transcrição gerado via Focus AI</p>
            <p>Confidencial - Projeto: {projectCode}</p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden !important; }
            #printable-transcript-report, #printable-transcript-report * { visibility: visible !important; }
            #printable-transcript-report {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background: white !important;
              margin: 0 !important;
              padding: 40px !important;
            }
          }
        `}} />
      </DialogContent>
    </Dialog>
  )
}
