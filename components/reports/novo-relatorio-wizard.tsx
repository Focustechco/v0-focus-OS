"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  FileText, X, ChevronDown, ChevronLeft, ChevronRight,
  Zap, Loader2, Check
} from "lucide-react"
import { useProjetos } from "@/lib/hooks/use-projetos"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { generateReportContent, loadProjectData } from "@/lib/services/report-generator"
import { supabase } from "@/lib/supabase"

/* ─── Types ─────────────────────────────────────────────────── */
type TipoRelatorio = "progresso" | "sprint" | "completo"
type PeriodoId = "hoje" | "7dias" | "15dias" | "mes" | "custom"

const PERIODOS: { id: PeriodoId; label: string; days: number | null }[] = [
  { id: "hoje", label: "HOJE", days: 0 },
  { id: "7dias", label: "7 DIAS", days: 7 },
  { id: "15dias", label: "15 DIAS", days: 15 },
  { id: "mes", label: "MÊS", days: 30 },
  { id: "custom", label: "Custom", days: null },
]

const TIPOS: { id: TipoRelatorio; label: string; sub: string }[] = [
  { id: "progresso", label: "Relatório de Progresso", sub: "Para cliente" },
  { id: "sprint", label: "Relatório de Sprint", sub: "Técnico interno" },
  { id: "completo", label: "Relatório Completo", sub: "Todos os dados" },
]

const SECOES_DEFAULT = [
  { id: "resumo", label: "Resumo Executivo", default: true },
  { id: "status", label: "Status Atual", default: true },
  { id: "atividades", label: "Atividades do Período", default: true },
  { id: "sprints", label: "Sprints & Entregas", default: true },
  { id: "tasks_detalhadas", label: "Tasks Detalhadas", default: false },
  { id: "proximos_passos", label: "Próximos Passos", default: true },
  { id: "metricas", label: "Métricas Técnicas", default: false },
  { id: "observacoes", label: "Observações da Equipe", default: true },
]

function calcDates(periodoId: PeriodoId): { inicio: string; fim: string } {
  const today = new Date()
  const fim = today.toISOString().split("T")[0]
  const option = PERIODOS.find((p) => p.id === periodoId)
  if (!option || option.days === null) return { inicio: "", fim: "" }
  const start = new Date()
  start.setDate(today.getDate() - option.days)
  return { inicio: start.toISOString().split("T")[0], fim }
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: (reportId: string) => void
  defaultProjetoId?: string
}

export function NovoRelatorioWizard({ open, onOpenChange, onSuccess, defaultProjetoId }: Props) {
  const { projects } = useProjetos()
  const { equipe } = useEquipe()

  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)

  /* ── Step 1 ── */
  const [projetoId, setProjetoId] = useState("")
  const [projetoSearch, setProjetoSearch] = useState("")
  const [showProjetoDropdown, setShowProjetoDropdown] = useState(false)
  const [periodoId, setPeriodoId] = useState<PeriodoId>("15dias")
  const [customInicio, setCustomInicio] = useState("")
  const [customFim, setCustomFim] = useState("")
  const [tipo, setTipo] = useState<TipoRelatorio>("progresso")
  const searchRef = useRef<HTMLDivElement>(null)

  /* ── Step 2 ── */
  const [secoes, setSecoes] = useState<Record<string, boolean>>(
    Object.fromEntries(SECOES_DEFAULT.map((s) => [s.id, s.default]))
  )
  const [destinatario, setDestinatario] = useState("")
  const [cargoEmpresa, setCargoEmpresa] = useState("")
  const [preparadoPor, setPreparadoPor] = useState("")
  const [incluirLogoFocus, setIncluirLogoFocus] = useState(true)
  const [incluirLogoCliente, setIncluirLogoCliente] = useState(false)
  const [logoClienteFile, setLogoClienteFile] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Computed
  const projetosAtivos = (projects ?? []).filter((p: any) => p.status !== "concluido")
  const projetosFiltrados = projetosAtivos.filter((p: any) =>
    [p.nome, p.codigo].some((v: string) => v?.toLowerCase().includes(projetoSearch.toLowerCase()))
  )
  const projetoSelecionado = projetosAtivos.find((p: any) => p.id === projetoId)

  function getDatas() {
    return { inicio: new Date().toISOString(), fim: new Date().toISOString() }
  }
  const { inicio: dataInicio, fim: dataFim } = getDatas()

  function periodLabel() {
    return "Global (Todo o projeto)"
  }

  const secoesAtivas = Object.values(secoes).filter(Boolean).length
  const preparadoPorMembro = equipe.find((m) => m.id === preparadoPor)

  // Outside click for dropdown
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowProjetoDropdown(false)
      }
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1); setProjetoId(""); setProjetoSearch(""); setPeriodoId("15dias")
      setCustomInicio(""); setCustomFim(""); setTipo("progresso")
      setSecoes(Object.fromEntries(SECOES_DEFAULT.map((s) => [s.id, s.default])))
      setDestinatario(""); setCargoEmpresa(""); setPreparadoPor("")
      setIncluirLogoFocus(true); setIncluirLogoCliente(false); setLogoClienteFile(null)
    } else {
      if (defaultProjetoId) {
        setProjetoId(defaultProjetoId)
      }
    }
  }, [open, defaultProjetoId])

  async function handleGenerate() {
    if (!projetoId || !dataInicio || !dataFim) return
    setIsGenerating(true)
    try {
      const reportType = tipo === "progresso" ? "cliente" : "interno"

      // Tenta gerar conteúdo — usa fallback mínimo se falhar
      let content: any = {
        version: "2.0", reportType,
        generatedAt: new Date().toISOString(),
        meta: { progresso: 0, saude: "amarelo" },
        sections: {},
      }
      try {
        content = await generateReportContent({ projectId: projetoId, startDate: dataInicio, endDate: dataFim, reportType })
      } catch (genErr: any) {
        console.warn("[Relatório] Fallback de conteúdo:", genErr?.message ?? genErr)
      }

      const tipoLabel = tipo === "progresso" ? "Para o Cliente" : tipo === "sprint" ? "Interno — Equipe" : "Completo"
      const nomeProjeto = projetoSelecionado?.nome ?? "Projeto"

      // Armazena TUDO dentro do campo `conteudo` (única coluna JSON garantida)
      const conteudo = {
        ...content,
        meta_relatorio: {
          tipo: tipoLabel,
          periodo_inicio: dataInicio,
          periodo_fim: dataFim,
          status: "rascunho",
          etapa_atual: projetoSelecionado?.status ?? "desenvolvimento",
        },
        configuracao: {
          secoes,
          destinatario,
          cargoEmpresa,
          preparadoPor: preparadoPorMembro?.nome ?? preparadoPor,
          incluirLogoFocus,
          incluirLogoCliente,
          logoClienteFile,
        },
      }

      // INSERT apenas com colunas que com certeza existem na tabela
      const { data, error } = await supabase
        .from("relatorios")
        .insert([{
          projeto_id: projetoId,
          titulo: `${tipoLabel} — ${nomeProjeto}`,
          conteudo,
        }])
        .select("id")
        .single()

      if (error) {
        console.error("[Relatório] Erro INSERT:", error.message, error.details)
        throw new Error(error.message)
      }

      onSuccess(data.id)
      onOpenChange(false)
    } catch (err: any) {
      console.error("Erro ao gerar relatório:", err?.message ?? err)
    } finally {
      setIsGenerating(false)
    }
  }

  const canProceed1 = !!projetoId
  const canProceed2 = secoesAtivas >= 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white p-0 max-w-[560px] overflow-hidden gap-0">
        {/* Radix accessibility requirement — visually hidden */}
        <DialogTitle className="sr-only">Novo Relatório de Projeto</DialogTitle>
        <DialogDescription className="sr-only">Wizard de criação de relatório em 3 passos</DialogDescription>

        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-mono text-sm font-bold tracking-[0.15em] uppercase text-white">
              Novo Relatório de Projeto
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">Passo {step} de 3</p>
          </div>
          <button onClick={() => onOpenChange(false)} className="text-neutral-600 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Progress Bar ── */}
        <div className="flex gap-1 px-6 pb-5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn("h-1 flex-1 rounded-full transition-all duration-500", s <= step ? "bg-orange-500" : "bg-[#2A2A2A]")} />
          ))}
        </div>

        {/* ── Body ── */}
        <div className="px-6 pb-2 max-h-[65vh] overflow-y-auto space-y-6">
          {step === 1 && <Step1
            projetoSearch={projetoSearch} setProjetoSearch={setProjetoSearch}
            projetoId={projetoId} setProjetoId={setProjetoId}
            projetosFiltrados={projetosFiltrados}
            showDropdown={showProjetoDropdown} setShowDropdown={setShowProjetoDropdown}
            searchRef={searchRef}
            periodoId={periodoId} setPeriodoId={setPeriodoId}
            customInicio={customInicio} setCustomInicio={setCustomInicio}
            customFim={customFim} setCustomFim={setCustomFim}
            tipo={tipo} setTipo={setTipo}
            defaultProjetoId={defaultProjetoId}
          />}
          {step === 2 && <Step2
            secoes={secoes} setSecoes={setSecoes}
            destinatario={destinatario} setDestinatario={setDestinatario}
            cargoEmpresa={cargoEmpresa} setCargoEmpresa={setCargoEmpresa}
            preparadoPor={preparadoPor} setPreparadoPor={setPreparadoPor}
            equipe={equipe}
            incluirLogoFocus={incluirLogoFocus} setIncluirLogoFocus={setIncluirLogoFocus}
            incluirLogoCliente={incluirLogoCliente} setIncluirLogoCliente={setIncluirLogoCliente}
            logoClienteFile={logoClienteFile} setLogoClienteFile={setLogoClienteFile}
            logoInputRef={logoInputRef}
          />}
          {step === 3 && <Step3
            projeto={projetoSelecionado}
            periodLabel={periodLabel()}
            tipo={TIPOS.find((t) => t.id === tipo)!}
            preparadoPorNome={preparadoPorMembro?.nome ?? "—"}
            secoesAtivas={secoesAtivas}
            totalSecoes={SECOES_DEFAULT.length}
          />}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between p-6 border-t border-[#2A2A2A] mt-2">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-neutral-400 hover:text-white gap-1">
                <ChevronLeft className="w-4 h-4" /> VOLTAR
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-neutral-500 hover:text-white text-xs">
              CANCELAR
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceed1 : !canProceed2}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold gap-1 min-w-[110px]"
              >
                PRÓXIMO <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 min-w-[160px]"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> GERANDO...</>
                ) : (
                  <><Zap className="w-4 h-4" /> GERAR RELATÓRIO</>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ══════════════════════════════════════════════════════════
   STEP 1 — Configuração básica
══════════════════════════════════════════════════════════ */
function Step1({ projetoSearch, setProjetoSearch, projetoId, setProjetoId, projetosFiltrados,
  showDropdown, setShowDropdown, searchRef,
  periodoId, setPeriodoId, customInicio, setCustomInicio, customFim, setCustomFim,
  tipo, setTipo, defaultProjetoId }: any) {

  const selectedProject = projetosFiltrados.find ? undefined : undefined // just for types
  return (
    <div className="space-y-6">
      {/* Projeto */}
      <div className="space-y-2">
        <Label className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">PROJETO *</Label>
        <div ref={searchRef} className="relative">
          <button
            onClick={() => { if (!defaultProjetoId) setShowDropdown(!showDropdown) }}
            disabled={!!defaultProjetoId}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all",
              projetoId ? "border-orange-500 bg-orange-500/5" : "border-[#2A2A2A] bg-[#0A0A0A] hover:border-neutral-600",
              defaultProjetoId ? "cursor-not-allowed opacity-70" : ""
            )}
          >
            <span className={projetoId ? "text-white" : "text-neutral-600"}>
              {projetoId
                ? projetosFiltrados.find((p: any) => p.id === projetoId)?.nome ?? "Projeto selecionado"
                : "Selecionar projeto..."}
            </span>
            {!defaultProjetoId && <ChevronDown className="w-4 h-4 text-neutral-500" />}
          </button>
          {showDropdown && !defaultProjetoId && (
            <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-[#2A2A2A]">
                <input
                  autoFocus
                  value={projetoSearch}
                  onChange={(e) => setProjetoSearch(e.target.value)}
                  placeholder="Buscar projeto..."
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-1.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-orange-500"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {projetosFiltrados.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-600">Nenhum projeto encontrado</div>
                ) : projetosFiltrados.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => { setProjetoId(p.id); setProjetoSearch(""); setShowDropdown(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2A2A2A] transition-colors text-left"
                  >
                    {p.codigo && <span className="text-xs font-mono font-bold text-orange-500">{p.codigo}</span>}
                    <span className="text-sm text-white">{p.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Tipo */}
      <div className="space-y-3">
        <Label className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">TIPO DE RELATÓRIO *</Label>
        <div className="space-y-2">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-lg border transition-all text-left",
                tipo === t.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-[#2A2A2A] bg-[#0A0A0A] hover:border-neutral-600"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                tipo === t.id ? "border-orange-500" : "border-neutral-600"
              )}>
                {tipo === t.id && <div className="w-2 h-2 rounded-full bg-orange-500" />}
              </div>
              <div>
                <p className={cn("text-sm font-bold", tipo === t.id ? "text-orange-500" : "text-white")}>{t.label}</p>
                <p className="text-xs text-neutral-500">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   STEP 2 — Seções e personalização
══════════════════════════════════════════════════════════ */
function Step2({ secoes, setSecoes, destinatario, setDestinatario, cargoEmpresa, setCargoEmpresa,
  preparadoPor, setPreparadoPor, equipe, incluirLogoFocus, setIncluirLogoFocus,
  incluirLogoCliente, setIncluirLogoCliente, logoClienteFile, setLogoClienteFile, logoInputRef }: any) {

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setLogoClienteFile(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* Seções */}
      <div className="space-y-2">
        <Label className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">SEÇÕES A INCLUIR</Label>
        <div className="grid grid-cols-2 gap-2">
          {SECOES_DEFAULT.map((s) => (
            <button
              key={s.id}
              onClick={() => setSecoes({ ...secoes, [s.id]: !secoes[s.id] })}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-all",
                secoes[s.id] 
                  ? "border-orange-500/50 bg-orange-500/10" 
                  : "border-[#2A2A2A] bg-[#0A0A0A] hover:border-neutral-600"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors",
                secoes[s.id] ? "bg-orange-500 border-orange-500" : "border-neutral-600 bg-[#141414]"
              )}>
                 {secoes[s.id] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className={cn("text-[10px] font-mono font-medium uppercase tracking-[0.1em] truncate", secoes[s.id] ? "text-orange-500" : "text-neutral-500")}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Personalização */}
      <div className="space-y-4">
        <Label className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-400">PERSONALIZAÇÃO</Label>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] text-neutral-500">Nome do destinatário</p>
            <Input value={destinatario} onChange={(e) => setDestinatario(e.target.value)}
              placeholder="João Silva"
              className="bg-[#0A0A0A] border-[#2A2A2A] text-sm focus:border-orange-500" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-neutral-500">Cargo/Empresa</p>
            <Input value={cargoEmpresa} onChange={(e) => setCargoEmpresa(e.target.value)}
              placeholder="CEO, TechFlow Ltda"
              className="bg-[#0A0A0A] border-[#2A2A2A] text-sm focus:border-orange-500" />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] text-neutral-500">Preparado por</p>
          <select
            value={preparadoPor}
            onChange={(e) => setPreparadoPor(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-md px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
          >
            <option value="">Selecionar membro...</option>
            {equipe.map((m: any) => (
              <option key={m.id} value={m.id}>{m.nome}{m.cargo ? ` – ${m.cargo}` : ""}</option>
            ))}
          </select>
        </div>


      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   STEP 3 — Resumo
══════════════════════════════════════════════════════════ */
function Step3({ projeto, periodLabel, tipo, preparadoPorNome, secoesAtivas, totalSecoes }: any) {
  const rows = [
    { label: "Projeto:", value: projeto ? `${projeto.codigo ? projeto.codigo + " – " : ""}${projeto.nome}` : "—" },
    { label: "Tipo:", value: tipo?.label ?? "—" },
    { label: "Preparado por:", value: preparadoPorNome || "—" },
    { label: "Seções:", value: `${secoesAtivas} de ${totalSecoes} ativas` },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#2A2A2A]">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500">RESUMO DA CONFIGURAÇÃO</p>
        </div>
        <div className="divide-y divide-[#1A1A1A]">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm text-neutral-500">{label}</span>
              <span className="text-sm text-white font-medium text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
