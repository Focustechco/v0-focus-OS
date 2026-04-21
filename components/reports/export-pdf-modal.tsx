"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ExportPdfModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: {
    projectName: string
    projectId: string
    client: string
    createdAt: string
    createdBy: string
  }
  clientLogo: string | null
  onExport: () => void
}

const accentColors = [
  { value: "#ff6b00", label: "Laranja" },
  { value: "#22c55e", label: "Verde" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#eab308", label: "Amarelo" },
]

const contentSections = [
  { id: "cover", label: "Capa com dados do projeto", default: true },
  { id: "summary", label: "Resumo executivo", default: true },
  { id: "team", label: "Equipe e responsabilidades", default: true },
  { id: "sprints", label: "Sprints / Etapas detalhadas", default: true },
  { id: "risks", label: "Riscos identificados", default: true },
  { id: "nextSteps", label: "Proximos passos", default: true },
  { id: "history", label: "Historico de alteracoes", default: false },
  { id: "attachments", label: "Anexos e referencias", default: false },
]

export function ExportPdfModal({ open, onOpenChange, report, clientLogo, onExport }: ExportPdfModalProps) {
  const [step, setStep] = useState(1)
  const [useFocusTheme, setUseFocusTheme] = useState(true)
  const [includeFocusLogo, setIncludeFocusLogo] = useState(true)
  const [includeClientLogo, setIncludeClientLogo] = useState(!!clientLogo)
  const [accentColor, setAccentColor] = useState("#ff6b00")
  const [selectedSections, setSelectedSections] = useState<string[]>(
    contentSections.filter(s => s.default).map(s => s.id)
  )
  const [pageSize, setPageSize] = useState("a4")
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")
  const [quality, setQuality] = useState<"standard" | "high">("standard")
  const [isExporting, setIsExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState("")

  useEffect(() => {
    if (!open) {
      setStep(1)
      setIsExporting(false)
    }
  }, [open])

  useEffect(() => {
    if (isExporting) {
      const messages = [
        "Aplicando tema Focus OS...",
        "Renderizando secoes...",
        "Gerando PDF...",
        "Quase pronto...",
      ]
      let index = 0
      setExportMessage(messages[0])
      const interval = setInterval(() => {
        index = (index + 1) % messages.length
        setExportMessage(messages[index])
      }, 800)
      
      const timeout = setTimeout(() => {
        clearInterval(interval)
        setIsExporting(false)
        onExport()
        onOpenChange(false)
      }, 3500)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [isExporting, onExport, onOpenChange])

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  if (!open) return null

  const handleExport = () => {
    setIsExporting(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isExporting && onOpenChange(false)}
      />
      <div className="relative bg-card border border-[#2a2a2a] rounded-xl w-full max-w-[520px] mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a] flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {step === 1 ? "Exportar Relatorio — Tema Focus OS" : "Preview do PDF"}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-[#ff6b00]" : "bg-[#2a2a2a]"}`} />
              <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-[#ff6b00]" : "bg-[#2a2a2a]"}`} />
              <span className="text-xs text-neutral-500 ml-2">Passo {step} de 2</span>
            </div>
          </div>
          {!isExporting && (
            <button
              onClick={() => onOpenChange(false)}
              className="text-neutral-500 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isExporting ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#2a2a2a] border-t-[#ff6b00] rounded-full animate-spin mb-6" />
              <p className="text-sm text-neutral-400">{exportMessage}</p>
            </div>
          ) : step === 1 ? (
            <div className="p-5 space-y-6">
              {/* Identidade Visual */}
              <div>
                <h3 className="text-xs font-mono text-neutral-500 tracking-wider mb-3">
                  IDENTIDADE VISUAL
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">Usar tema Focus OS</span>
                    <Switch
                      checked={useFocusTheme}
                      onCheckedChange={setUseFocusTheme}
                    />
                  </div>
                  
                  {/* Mini Preview */}
                  <div 
                    className={`rounded-lg overflow-hidden border border-[#2a2a2a] ${
                      useFocusTheme ? "bg-[#0e0e0e]" : "bg-white"
                    }`}
                  >
                    <div 
                      className={`h-8 flex items-center px-3 ${
                        useFocusTheme ? "bg-[#0e0e0e]" : "bg-white border-b border-gray-200"
                      }`}
                    >
                      <span 
                        className={`text-[10px] font-mono ${
                          useFocusTheme ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        FOCUS<span style={{ color: accentColor }}>OS</span>
                      </span>
                    </div>
                    <div 
                      className="h-2" 
                      style={{ backgroundColor: accentColor }} 
                    />
                    <div className={`p-3 ${useFocusTheme ? "bg-background" : "bg-gray-50"}`}>
                      <div 
                        className={`text-[8px] ${
                          useFocusTheme ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        {report.projectName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">Incluir logo da Focus OS</span>
                    <Switch
                      checked={includeFocusLogo}
                      onCheckedChange={setIncludeFocusLogo}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-sm text-foreground">Incluir logo do cliente</span>
                      {!clientLogo && (
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Nenhuma logo do cliente adicionada
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={includeClientLogo}
                      onCheckedChange={setIncludeClientLogo}
                      disabled={!clientLogo}
                    />
                  </div>

                  <div className="py-2">
                    <span className="text-sm text-foreground block mb-2">Cor de destaque</span>
                    <div className="flex gap-2">
                      {accentColors.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setAccentColor(color.value)}
                          className={`
                            w-8 h-8 rounded-full transition-all duration-150
                            ${accentColor === color.value 
                              ? "ring-2 ring-white ring-offset-2 ring-offset-[#141414]" 
                              : "hover:scale-110"
                            }
                          `}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteudo */}
              <div>
                <h3 className="text-xs font-mono text-neutral-500 tracking-wider mb-3">
                  CONTEUDO
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {contentSections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => toggleSection(section.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all duration-150
                        ${selectedSections.includes(section.id)
                          ? "bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/30"
                          : "bg-[#1a1a1a] text-neutral-400 border border-[#2a2a2a] hover:border-[#ff6b00]/30"
                        }
                      `}
                    >
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                        ${selectedSections.includes(section.id)
                          ? "bg-[#ff6b00] border-[#ff6b00]"
                          : "border-[#444]"
                        }
                      `}>
                        {selectedSections.includes(section.id) && (
                          <svg className="w-3 h-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formato */}
              <div>
                <h3 className="text-xs font-mono text-neutral-500 tracking-wider mb-3">
                  FORMATO
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1.5">Tamanho da pagina</label>
                    <Select value={pageSize} onValueChange={setPageSize}>
                      <SelectTrigger className="w-32 bg-[#1a1a1a] border-[#2a2a2a] text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                        <SelectItem value="a4" className="text-foreground focus:bg-[#2a2a2a] focus:text-foreground">A4</SelectItem>
                        <SelectItem value="letter" className="text-foreground focus:bg-[#2a2a2a] focus:text-foreground">Letter</SelectItem>
                        <SelectItem value="a3" className="text-foreground focus:bg-[#2a2a2a] focus:text-foreground">A3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1.5">Orientacao</label>
                    <div className="flex gap-2">
                      {(["portrait", "landscape"] as const).map(o => (
                        <button
                          key={o}
                          onClick={() => setOrientation(o)}
                          className={`
                            px-4 py-2 rounded-lg text-xs font-medium transition-all duration-150
                            ${orientation === o
                              ? "bg-[#ff6b00] text-foreground"
                              : "bg-[#1a1a1a] text-neutral-400 border border-[#2a2a2a] hover:border-[#ff6b00]/50"
                            }
                          `}
                        >
                          {o === "portrait" ? "Retrato" : "Paisagem"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1.5">Qualidade</label>
                    <div className="flex gap-2">
                      {(["standard", "high"] as const).map(q => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`
                            px-4 py-2 rounded-lg text-xs font-medium transition-all duration-150
                            ${quality === q
                              ? "bg-[#ff6b00] text-foreground"
                              : "bg-[#1a1a1a] text-neutral-400 border border-[#2a2a2a] hover:border-[#ff6b00]/50"
                            }
                          `}
                        >
                          {q === "standard" ? "Padrao" : "Alta qualidade"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5">
              {/* PDF Preview */}
              <div 
                className={`
                  rounded-lg overflow-hidden border border-[#2a2a2a] mx-auto
                  ${orientation === "portrait" ? "max-w-[300px]" : "max-w-full"}
                `}
                style={{ 
                  aspectRatio: orientation === "portrait" ? "210/297" : "297/210",
                  maxHeight: "360px",
                }}
              >
                <div className="h-full overflow-auto">
                  {/* PDF Header */}
                  <div 
                    className={`flex items-center justify-between px-4 py-2 ${
                      useFocusTheme ? "bg-[#0e0e0e]" : "bg-white border-b border-gray-200"
                    }`}
                  >
                    {includeFocusLogo && (
                      <span 
                        className={`text-xs font-mono ${
                          useFocusTheme ? "text-foreground" : "text-gray-900"
                        }`}
                      >
                        FOCUS<span style={{ color: accentColor }}>OS</span>
                        <span className="text-neutral-500 ml-1">/ RELATORIOS</span>
                      </span>
                    )}
                    {includeClientLogo && clientLogo && (
                      <div className="w-12 h-8 bg-white rounded overflow-hidden">
                        <img src={clientLogo} alt="Client logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  
                  {/* Orange line */}
                  <div className="h-0.5" style={{ backgroundColor: accentColor }} />

                  {/* Cover Section */}
                  {selectedSections.includes("cover") && (
                    <div className={`p-6 ${useFocusTheme ? "bg-background" : "bg-gray-50"}`}>
                      <h1 className={`text-lg font-bold ${useFocusTheme ? "text-foreground" : "text-gray-900"}`}>
                        {report.projectName}
                      </h1>
                      <p className="text-sm font-mono mt-1" style={{ color: accentColor }}>
                        {report.projectId}
                      </p>
                      <p className={`text-xs mt-2 ${useFocusTheme ? "text-neutral-400" : "text-gray-600"}`}>
                        Cliente: {report.client}
                      </p>
                      <p className={`text-xs ${useFocusTheme ? "text-neutral-400" : "text-gray-600"}`}>
                        Data: {report.createdAt}
                      </p>
                    </div>
                  )}

                  {/* Body */}
                  <div className={`p-4 ${useFocusTheme ? "bg-[#f9f9f9]" : "bg-white"}`}>
                    {selectedSections.includes("summary") && (
                      <div className="mb-4">
                        <div 
                          className={`px-3 py-1.5 rounded-t text-[10px] font-medium ${
                            useFocusTheme ? "bg-[#1a1a1a] text-foreground" : "bg-gray-100 text-gray-900"
                          }`}
                          style={{ borderLeft: `3px solid ${accentColor}` }}
                        >
                          RESUMO EXECUTIVO
                        </div>
                        <div className="bg-white p-3 rounded-b border border-gray-200 text-[8px] text-gray-600">
                          Conteudo do resumo executivo...
                        </div>
                      </div>
                    )}

                    {selectedSections.includes("sprints") && (
                      <div className="mb-4">
                        <div 
                          className="bg-white p-3 rounded border border-gray-200"
                          style={{ borderTop: `3px solid ${accentColor}` }}
                        >
                          <span className="text-[10px] font-mono" style={{ color: accentColor }}>
                            SPRINT 1
                          </span>
                          <p className="text-[8px] text-gray-600 mt-1">
                            Lista de tarefas do sprint...
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedSections.includes("risks") && (
                      <div className="mb-4">
                        <div 
                          className="bg-white p-3 rounded border border-gray-200"
                          style={{ borderLeft: "3px solid #ef4444" }}
                        >
                          <span className="text-[10px] font-medium text-gray-900">
                            Riscos Identificados
                          </span>
                          <p className="text-[8px] text-gray-600 mt-1">
                            Lista de riscos do projeto...
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedSections.includes("nextSteps") && (
                      <div className="mb-4">
                        <div 
                          className="bg-white p-3 rounded border border-gray-200"
                          style={{ borderLeft: "3px solid #22c55e" }}
                        >
                          <span className="text-[10px] font-medium text-gray-900">
                            Proximos Passos
                          </span>
                          <p className="text-[8px] text-gray-600 mt-1">
                            Lista de proximos passos...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={`flex items-center justify-between px-4 py-2 text-[8px] ${
                    useFocusTheme ? "bg-[#0e0e0e] text-[#666]" : "bg-gray-100 text-gray-500"
                  }`}>
                    <span className="font-mono">Focus OS © 2026</span>
                    <span className="font-mono">Pagina 1</span>
                  </div>
                </div>
              </div>

              {/* Settings Summary */}
              <p className="text-xs font-mono text-neutral-500 text-center mt-4">
                {pageSize.toUpperCase()} · {orientation === "portrait" ? "Retrato" : "Paisagem"} · 
                {useFocusTheme ? " Tema escuro" : " Tema claro"} · {selectedSections.length} secoes
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isExporting && (
          <div className="flex items-center justify-between p-5 border-t border-[#2a2a2a] flex-shrink-0">
            {step === 1 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-neutral-400 hover:text-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  className="bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-foreground"
                >
                  Proximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-neutral-400 hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Button
                  onClick={handleExport}
                  className="bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-foreground flex-1 ml-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
