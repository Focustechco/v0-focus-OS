"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  FileText,
  X,
  Users,
  Settings,
  Upload,
  Check,
  Loader2,
  Sparkles,
  Search,
  ChevronDown,
  FolderKanban,
} from "lucide-react"
import { generateReportContent, loadProjectData } from "@/lib/services/report-generator"
import { supabase } from "@/lib/supabase"
import { useProjects } from "@/lib/hooks/use-projetos"

interface GenerateReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (reportId: string) => void
}

const PERIOD_OPTIONS = [
  { id: "hoje", label: "Hoje", days: 0 },
  { id: "ult_7", label: "Últimos 7 dias", days: 7 },
  { id: "ult_15", label: "Últimos 15 dias", days: 15 },
  { id: "ult_30", label: "Últimos 30 dias", days: 30 },
  { id: "ult_60", label: "Últimos 60 dias", days: 60 },
  { id: "ult_90", label: "Últimos 90 dias", days: 90 },
  { id: "prox_7", label: "Próximos 7 dias", days: -7 },
  { id: "custom", label: "Personalizado", days: null },
]

const STATUS_COLORS: Record<string, string> = {
  diagnostico: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  planejamento: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  desenvolvimento: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  revisao: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  entrega: "bg-green-500/20 text-green-400 border-green-500/30",
  concluido: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
}

export function GenerateReportModal({ open, onOpenChange, onSuccess }: GenerateReportModalProps) {
  const { projects } = useProjects()
  const [isGenerating, setIsGenerating] = useState(false)

  // Form state
  const [titulo, setTitulo] = useState("")
  const [tipo, setTipo] = useState<"cliente" | "interno">("cliente")
  const [projetoId, setProjetoId] = useState("")
  const [periodoId, setPeriodoId] = useState("ult_7")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [clientLogo, setClientLogo] = useState<string | null>(null)

  // Project search autocomplete
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Live project preview (loaded after selection)
  const [projectPreview, setProjectPreview] = useState<{
    tarefas: number
    sprints: number
    techLead: string
    cliente: string
    loading: boolean
  } | null>(null)

  const activeProjects = (projects ?? []).filter((p: any) => p.status !== "concluido")
  const filteredProjects = activeProjects.filter((p: any) =>
    [p.nome, p.codigo, p.status].some((v: string) =>
      v?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const selectedProject = activeProjects.find((p: any) => p.id === projetoId)

  /* ─── Close dropdown on outside click ─────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  /* ─── Dates from period ────────────────────────────────────── */
  useEffect(() => {
    if (periodoId === "custom") return
    const option = PERIOD_OPTIONS.find((o) => o.id === periodoId)
    if (!option) return
    const end = new Date()
    const start = new Date()
    if (option.days !== null && option.days > 0) {
      start.setDate(end.getDate() - option.days)
    } else if (option.days !== null && option.days < 0) {
      end.setDate(start.getDate() + Math.abs(option.days))
    }
    setDataInicio(start.toISOString().split("T")[0])
    setDataFim(end.toISOString().split("T")[0])
  }, [periodoId])

  /* ─── Load project preview data ────────────────────────────── */
  const loadPreview = useCallback(async (id: string) => {
    setProjectPreview((prev) => (prev ? { ...prev, loading: true } : { tarefas: 0, sprints: 0, techLead: "...", cliente: "...", loading: true }))
    try {
      const { projeto, sprints, tarefas } = await loadProjectData(id)
      setProjectPreview({
        tarefas: tarefas.length,
        sprints: sprints.length,
        techLead: (projeto?.tech_lead as any)?.nome ?? "—",
        cliente: (projeto?.clientes as any)?.empresa ?? (projeto?.clientes as any)?.nome ?? "—",
        loading: false,
      })
    } catch {
      setProjectPreview(null)
    }
  }, [])

  const selectProject = (p: any) => {
    setProjetoId(p.id)
    setSearchTerm(`${p.codigo ? `[${p.codigo}] ` : ""}${p.nome}`)
    setShowDropdown(false)
    // Auto-fill título
    if (!titulo) {
      const dateLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      setTitulo(`Relatório ${p.nome} — ${dateLabel}`)
    }
    loadPreview(p.id)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setClientLogo(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleGenerate = async () => {
    if (!titulo || !projetoId || !dataInicio || !dataFim) return
    setIsGenerating(true)
    try {
      const content = await generateReportContent({
        projectId: projetoId,
        startDate: dataInicio,
        endDate: dataFim,
        reportType: tipo,
      })

      const insertPayload: any = {
        titulo,
        projeto_id: projetoId,
        tipo: tipo === "cliente" ? "Para o Cliente" : "Interno — Equipe",
        periodo_inicio: dataInicio,
        periodo_fim: dataFim,
        status: "rascunho",
        logo_cliente_url: clientLogo,
        conteudo_json: content,
      }

      // Try to include computed fields (may not exist if migration not run)
      const progresso = (content as any).meta?.progresso ?? 0
      const saude = (content as any).meta?.saude ?? "amarelo"
      const statusAtual = selectedProject?.status ?? "desenvolvimento"

      let { data, error } = await supabase
        .from("relatorios")
        .insert([{ ...insertPayload, etapa_atual: statusAtual, progresso, saude }])
        .select()
        .single()

      // Fallback: se colunas extras não existem, insere sem elas
      if (error?.code === "PGRST204") {
        const fallback = await supabase
          .from("relatorios")
          .insert([insertPayload])
          .select()
          .single()
        data = fallback.data
        error = fallback.error
      }

      if (error) throw error

      onSuccess(data.id)
      onOpenChange(false)

      // Reset
      setTitulo("")
      setProjetoId("")
      setSearchTerm("")
      setProjectPreview(null)
      setPeriodoId("ult_7")
      setTipo("cliente")
      setClientLogo(null)
    } catch (err) {
      console.error("Erro ao gerar relatório:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const canGenerate = titulo && projetoId && dataInicio && dataFim && !isGenerating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white max-w-[700px] p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between bg-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-display font-bold tracking-wider">
                GERAR NOVO RELATÓRIO
              </DialogTitle>
              <p className="text-xs text-neutral-500">Configure os parâmetros para geração inteligente</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-neutral-500 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Título */}
          <div className="space-y-2">
            <Label className="text-xs text-neutral-400 tracking-wider">TÍTULO DO RELATÓRIO *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Relatório Mensal de Progresso — Julho"
              className="bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500 text-white"
            />
          </div>

          {/* Tipo */}
          <div className="space-y-3">
            <Label className="text-xs text-neutral-400 tracking-wider">TIPO DE RELATÓRIO *</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "cliente", icon: Users, label: "Para o Cliente", desc: "Visão executiva focada em entregas, marcos e próximos passos." },
                { id: "interno", icon: Settings, label: "Interno — Equipe", desc: "Relatório técnico com metas, velocidade, tasks e bloqueios." },
              ].map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setTipo(id as any)}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                    tipo === id ? "bg-orange-500/10 border-orange-500" : "bg-[#1A1A1A] border-[#2A2A2A] hover:border-neutral-500"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", tipo === id ? "bg-orange-500 text-white" : "bg-[#2A2A2A] text-neutral-500 group-hover:text-white")}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={cn("text-sm font-bold mb-1", tipo === id ? "text-orange-500" : "text-white")}>{label}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Projeto — Autocomplete */}
          <div className="space-y-2">
            <Label className="text-xs text-neutral-400 tracking-wider">PROJETO VINCULADO *</Label>
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
                <input
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); if (!e.target.value) { setProjetoId(""); setProjectPreview(null) } }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Buscar projeto por nome ou código..."
                  className="w-full pl-9 pr-10 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none" />
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                  {filteredProjects.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-600">
                      Nenhum projeto ativo encontrado
                    </div>
                  ) : (
                    filteredProjects.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => selectProject(p)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
                          <FolderKanban className="w-3.5 h-3.5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {p.codigo && (
                              <span className="text-[10px] font-mono font-bold text-orange-500">{p.codigo}</span>
                            )}
                            <span className="text-sm text-white truncate">{p.nome}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-mono uppercase flex-shrink-0",
                            STATUS_COLORS[p.status] ?? "border-neutral-600 text-neutral-400"
                          )}
                        >
                          {p.status}
                        </Badge>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Project preview summary */}
            {projetoId && projectPreview && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all",
                projectPreview.loading
                  ? "border-[#2A2A2A] bg-[#0A0A0A] text-neutral-600"
                  : "border-orange-500/20 bg-orange-500/5 text-neutral-400"
              )}>
                {projectPreview.loading ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Carregando dados do projeto...</>
                ) : (
                  <>
                    <span className="text-orange-500 font-mono font-bold">{projectPreview.tarefas}</span>
                    <span>tarefas ·</span>
                    <span className="text-orange-500 font-mono font-bold">{projectPreview.sprints}</span>
                    <span>sprints · Tech Lead:</span>
                    <span className="text-white font-medium">{projectPreview.techLead}</span>
                    <span>· Cliente:</span>
                    <span className="text-white font-medium">{projectPreview.cliente}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Período */}
          <div className="space-y-3">
            <Label className="text-xs text-neutral-400 tracking-wider">PERÍODO DOS DADOS *</Label>
            <div className="grid grid-cols-4 gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPeriodoId(option.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium border transition-all truncate",
                    periodoId === option.id
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-[#1A1A1A] border-[#2A2A2A] text-neutral-500 hover:border-neutral-500"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {periodoId === "custom" && (
              <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 uppercase">Data Início</span>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-xs h-9 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 uppercase">Data Fim</span>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-xs h-9 [color-scheme:dark]"
                  />
                </div>
              </div>
            )}

            {/* Date range display */}
            {dataInicio && dataFim && periodoId !== "custom" && (
              <p className="text-[11px] text-neutral-600">
                {new Date(dataInicio).toLocaleDateString("pt-BR")} → {new Date(dataFim).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>

          {/* Logo do cliente */}
          {tipo === "cliente" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <Label className="text-xs text-neutral-400 tracking-wider">LOGO DO CLIENTE (OPCIONAL)</Label>
              {!clientLogo ? (
                <div className="relative border-2 border-dashed border-[#2A2A2A] rounded-xl p-6 hover:border-orange-500/50 transition-colors bg-[#1A1A1A]/50 group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-neutral-500">PNG, JPG ou SVG</p>
                  </div>
                </div>
              ) : (
                <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-10 rounded bg-white p-1.5 flex items-center justify-center overflow-hidden">
                      <img src={clientLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <button onClick={() => setClientLogo(null)} className="text-xs text-orange-500 hover:underline">
                      Remover
                    </button>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#1A1A1A] border-t border-[#2A2A2A]">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold h-12 text-sm tracking-wide"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                GERANDO CONTEÚDO INTELIGENTE...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                CRIAR RELATÓRIO E EDITAR
              </>
            )}
          </Button>
          {!projetoId && (
            <p className="text-center text-[11px] text-neutral-600 mt-2">Selecione um projeto para continuar</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
