"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Check,
  Circle,
  ArrowRightCircle,
  Sparkles,
  User,
  Settings,
  AlertCircle
} from "lucide-react"
import { useReportEditor } from "@/lib/hooks/use-report-editor"
import { formatDate } from "@/lib/report-types"
import { useToast } from "./toast-notification"

interface ReportEditorProps {
  reportId: string
  onBack: () => void
}

export function ReportEditor({ reportId, onBack }: ReportEditorProps) {
  const { report, isLoading, upsertReport } = useReportEditor(reportId)
  const { showToast } = useToast()

  const [previewMode, setPreviewMode] = useState(false)
  const [autoSaveTime, setAutoSaveTime] = useState<string | null>(null)
  const [showDirtyModal, setShowDirtyModal] = useState(false)
  const [originalSnapshot, setOriginalSnapshot] = useState<string>("")

  // Form states
  const [resumo, setResumo] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [progresso, setProgresso] = useState(0)
  const [saude, setSaude] = useState<string>("no_prazo")
  const [entregaPrevista, setEntregaPrevista] = useState("")
  const [contextoStatus, setContextoStatus] = useState("")
  
  // Dynamic Sections State
  const [sections, setSections] = useState<any>(null)

  // Initialization
  useEffect(() => {
    if (report && !originalSnapshot) {
      setResumo(report.resumo_executivo || "")
      setTags(report.tags || [])
      setProgresso(report.progresso || report.conteudo_json?.projectInfo?.progress || 0)
      setSaude(report.saude || "no_prazo")
      setEntregaPrevista(report.entrega_prevista || "")
      setContextoStatus(report.contexto_status || "")
      setSections(report.conteudo_json?.sections || null)
      
      const snapshot = JSON.stringify({
        resumo_executivo: report.resumo_executivo || "",
        tags: report.tags || [],
        progresso: report.progresso || report.conteudo_json?.projectInfo?.progress || 0,
        saude: report.saude || "no_prazo",
        entrega_prevista: report.entrega_prevista || "",
        contexto_status: report.contexto_status || "",
        sections: report.conteudo_json?.sections || null
      })
      setOriginalSnapshot(snapshot)
    }
  }, [report, originalSnapshot])

  // Current Payload
  const getCurrentPayload = () => ({
    resumo_executivo: resumo,
    tags: tags,
    progresso: progresso,
    saude: saude,
    entrega_prevista: entregaPrevista,
    contexto_status: contextoStatus,
    conteudo_json: {
      ...report?.conteudo_json,
      sections: sections
    }
  })

  // Auto-Save effect: every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!report) return
      const current = getCurrentPayload()
      if (JSON.stringify(current) !== originalSnapshot) {
        await upsertReport(current, true)
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setAutoSaveTime(time)
        setOriginalSnapshot(JSON.stringify(current))
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [resumo, tags, progresso, saude, entregaPrevista, contextoStatus, sections, originalSnapshot, report])

  const handleManualSave = async () => {
    const payload = { ...getCurrentPayload(), status: "salvo" }
    const { error } = await upsertReport(payload)
    if (!error) {
      setOriginalSnapshot(JSON.stringify(getCurrentPayload()))
      showToast("success", "Relatório salvo com sucesso")
    }
  }

  const handleBackAttempt = () => {
    if (JSON.stringify(getCurrentPayload()) !== originalSnapshot) {
      setShowDirtyModal(true)
    } else {
      onBack()
    }
  }

  const handleExportPDF = async () => {
    await upsertReport({ ...getCurrentPayload(), status: "exportado" }, true)
    showToast("success", "Status atualizado. Gerando PDF...")
    setPreviewMode(true)
    setTimeout(() => window.print(), 500)
  }

  const updateSectionManual = (sectionKey: string, value: string) => {
    setSections({
      ...sections,
      [sectionKey]: {
        ...sections[sectionKey],
        manual: value
      }
    })
  }

  if (isLoading || !report) return <div className="p-8 text-neutral-500 animate-pulse">Carregando relatório do Supabase...</div>

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <div className={cn("flex flex-col transition-all duration-300", previewMode ? "w-1/3" : "w-full")}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A] bg-[#141414]">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackAttempt} className="text-neutral-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-[#2A2A2A]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-500 font-mono">[{report.projetos?.name}]</span>
                <span className="text-sm text-white font-bold">{report.titulo}</span>
                {autoSaveTime && <span className="text-[10px] text-green-500 ml-2 font-mono flex items-center gap-1"><Check className="w-3 h-3"/> Salvo as {autoSaveTime}</span>}
              </div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                {report.tipo} • {report.periodo_inicio} a {report.periodo_fim}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleManualSave} variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white bg-transparent">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className={cn("border-[#2A2A2A] bg-transparent", previewMode ? "text-orange-500 border-orange-500" : "text-neutral-400 hover:text-white")}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Fechar Preview" : "Preview"}
            </Button>
            <Button onClick={handleExportPDF} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Status Atual Card (Sempre visível) */}
          <Card className="bg-[#141414] border-[#2A2A2A] overflow-hidden">
            <div className="p-4 border-b border-[#2A2A2A] bg-[#1A1A1A] flex items-center justify-between">
              <span className="text-xs font-bold text-orange-500 tracking-wider uppercase">Status e Progresso</span>
              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                {report.conteudo_json?.projectInfo?.stage || "Desenvolvimento"}
              </Badge>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Progresso Geral</span>
                  <span className="font-mono">{progresso}%</span>
                </div>
                <Slider value={[progresso]} onValueChange={([v]) => setProgresso(v)} max={100} step={1} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-neutral-500 uppercase">Saúde do Projeto</Label>
                  <div className="flex gap-1">
                    {[
                      { id: "no_prazo", color: "bg-green-500" },
                      { id: "em_risco", color: "bg-yellow-500" },
                      { id: "atrasado", color: "bg-red-500" },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSaude(opt.id)}
                        className={cn(
                          "w-full h-8 rounded border transition-all flex items-center justify-center",
                          saude === opt.id ? "bg-white/10 border-white/30" : "bg-transparent border-[#2A2A2A]"
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-[1px]", opt.color)} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-neutral-500 uppercase">Entrega Prevista</Label>
                  <Input 
                    type="date" 
                    value={entregaPrevista} 
                    onChange={e => setEntregaPrevista(e.target.value)} 
                    className="h-8 bg-[#1A1A1A] border-[#2A2A2A] text-xs [color-scheme:dark]" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Sections from JSON */}
          <Accordion type="multiple" defaultValue={["resumo", "entregas", "proximosPassos"]} className="space-y-4">
            {sections && Object.entries(sections).map(([key, section]: [string, any]) => {
              if (!section) return null
              return (
                <AccordionItem key={key} value={key} className="border border-[#2A2A2A] rounded-lg bg-[#141414] overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#1A1A1A]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-wide uppercase">{section.titulo}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    {/* Render Content Specific to section */}
                    {key === "resumo" && (
                      <div className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-lg">
                        <p className="text-xs text-neutral-400 italic mb-2">Gerado Automaticamente:</p>
                        <p className="text-sm text-neutral-300 leading-relaxed">{section.automatico}</p>
                      </div>
                    )}

                    {(key === "entregas" || key === "emAndamento" || key === "sprints") && (
                      <div className="space-y-2">
                        {section.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded">
                            <Check className="w-3 h-3 text-green-500 shrink-0" />
                            <span className="text-xs text-neutral-300">{item.titulo || item.nome}</span>
                            {item.data && <span className="ml-auto text-[10px] text-neutral-500">{new Date(item.data).toLocaleDateString()}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {key === "proximosPassos" && (
                      <div className="space-y-2">
                        {section.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded">
                            <ArrowRightCircle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs text-neutral-300">{item.titulo}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-neutral-500">Prazo: {item.prazo ? new Date(item.prazo).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {key === "bloqueios" && (
                      <div className="space-y-2">
                        {section.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded">
                            <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                            <span className="text-xs text-red-400">{item.titulo}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Manual Area below each section */}
                    <div className="pt-2 border-t border-[#2A2A2A]">
                      <Label className="text-[10px] text-neutral-500 uppercase mb-2 block">Complemento Manual / Observações</Label>
                      <Textarea 
                        value={section.manual || ""} 
                        onChange={e => updateSectionManual(key, e.target.value)}
                        placeholder="Adicione detalhes personalizados aqui..."
                        className="min-h-[80px] bg-[#1A1A1A] border-[#2A2A2A] text-sm text-neutral-300 placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </div>

      {/* Preview Panel (PDF Style) */}
      {previewMode && (
        <div className="flex-1 border-l border-[#2A2A2A] bg-[#0A0A0A] overflow-y-auto p-12 flex justify-center custom-scrollbar">
          <div id="report-preview" className="w-full max-w-[800px] bg-white text-slate-900 p-16 shadow-2xl printable-document">
            {/* Header with Client Logo */}
            <div className="border-b-2 border-orange-500 pb-8 mb-10 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Relatório de Projeto</h1>
                <p className="text-orange-500 font-bold tracking-widest text-sm uppercase mt-1">{report.tipo}</p>
                <div className="mt-6 space-y-1">
                  <p className="text-sm font-bold">{report.projetos?.name}</p>
                  <p className="text-xs text-slate-500">Período: {report.periodo_inicio} — {report.periodo_fim}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                {report.logo_cliente_url ? (
                  <div className="h-16 w-32 flex items-center justify-end">
                    <img src={report.logo_cliente_url} alt="Client Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-slate-300" />
                  </div>
                )}
                <p className="text-[10px] text-slate-400 font-mono">GERADO POR FOCUS OS | {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-10">
              {sections && Object.entries(sections).map(([key, section]: [string, any]) => {
                if (!section) return null
                return (
                  <div key={key} className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                       <span className="w-4 h-[2px] bg-orange-500"/>
                       {section.titulo}
                    </h2>
                    
                    <div className="pl-6 space-y-4">
                       {section.automatico && <p className="text-sm text-slate-700 leading-relaxed font-medium">{section.automatico}</p>}
                       
                       {section.items && section.items.length > 0 && (
                         <div className="grid grid-cols-1 gap-2">
                           {section.items.map((item: any, i: number) => (
                             <div key={i} className="flex items-center gap-3 text-sm text-slate-600 border-b border-slate-100 pb-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                               <span>{item.titulo || item.nome}</span>
                               {item.status && <span className="ml-auto text-[10px] uppercase font-bold text-slate-400">{item.status}</span>}
                             </div>
                           ))}
                         </div>
                       )}

                       {section.manual && (
                         <div className="p-4 bg-slate-50 border-l-4 border-slate-200 rounded-r">
                           <p className="text-sm text-slate-600 leading-relaxed font-serif italic whitespace-pre-wrap">{section.manual}</p>
                         </div>
                       )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
              <p>Focus Tecnologia – Gestão de Projetos</p>
              <p>Confidencial</p>
              <p>Página 1 / 1</p>
            </div>
          </div>
        </div>
      )}

      {/* Dirty Check Modal */}
      <Dialog open={showDirtyModal} onOpenChange={setShowDirtyModal}>
        <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle>Alterações não salvas</DialogTitle>
            <DialogDescription className="text-neutral-400 mt-2">
              Você tem alterações não salvas. Deseja salvar antes de sair ou descartar os dados atuais?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={() => onBack()} className="text-neutral-400 hover:text-white">
              Descartar
            </Button>
            <Button onClick={handleManualSave} className="bg-orange-500 hover:bg-orange-600 text-white">
              Salvar e Voltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #report-preview, #report-preview * { visibility: visible; }
          #report-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  )
}
