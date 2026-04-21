"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChevronLeft, ChevronUp, ChevronDown, Save, Eye, Download, X, Plus,
  CheckCircle2, Circle, GripVertical, AlertTriangle, BarChart2, Users,
  Flag, MessageSquare, ListTodo, Zap, Clock, Building2, Check, RefreshCcw
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { ReportPreview } from "./report-preview"

/* ─── Types ────────────────────────────────────────────── */
interface EditorSection {
  id: string
  icon: any
  label: string
  open: boolean
}

const SECTION_META: Record<string, { icon: any; label: string; color: string }> = {
  resumo:         { icon: FileIcon, label: "RESUMO EXECUTIVO", color: "text-orange-500" },
  status:         { icon: BarChart2, label: "STATUS ATUAL", color: "text-orange-500" },
  atividades:     { icon: CheckCircle2, label: "ATIVIDADES DO PERÍODO", color: "text-orange-500" },
  sprints:        { icon: Zap, label: "SPRINTS & ENTREGAS", color: "text-orange-500" },
  tasks_detalhadas: { icon: ListTodo, label: "TASKS DETALHADAS", color: "text-orange-500" },
  proximos_passos: { icon: Flag, label: "PRÓXIMOS PASSOS", color: "text-orange-500" },
  metricas:       { icon: BarChart2, label: "MÉTRICAS TÉCNICAS", color: "text-orange-500" },
  observacoes:    { icon: MessageSquare, label: "OBSERVAÇÕES DA EQUIPE", color: "text-orange-500" },
}

function FileIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
}

const SAUDE_OPTIONS = [
  { id: "verde", label: "No prazo", color: "text-green-400 border-green-500/30 bg-green-500/10" },
  { id: "amarelo", label: "Em risco", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  { id: "vermelho", label: "Atrasado", color: "text-red-400 border-red-500/30 bg-red-500/10" },
]

const STATUS_OPTIONS = ["diagnostico", "planejamento", "desenvolvimento", "revisao", "entrega", "concluido"]

/* ─── Main Component ──────────────────────────────────── */
interface Props {
  reportId: string
  onBack: () => void
}

export function ReportEditorV2({ reportId, onBack }: Props) {
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [resumoTexto, setResumoTexto] = useState("")
  const [resumoTags, setResumoTags] = useState<string[]>([])
  const [novaTag, setNovaTag] = useState("")
  const [addingTag, setAddingTag] = useState(false)
  const [statusEtapa, setStatusEtapa] = useState("")
  const [statusProgresso, setStatusProgresso] = useState(0)
  const [statusSaude, setStatusSaude] = useState("verde")
  const [statusEntrega, setStatusEntrega] = useState("")
  const [statusContexto, setStatusContexto] = useState("")
  const [sprintGrupos, setSprintGrupos] = useState<any[]>([])
  const [novaAtividade, setNovaAtividade] = useState("")
  const [addingTarefaGroupIdx, setAddingTarefaGroupIdx] = useState<number | null>(null)
  const [proximosPassos, setProximosPassos] = useState<any[]>([])
  const [novoProximo, setNovoProximo] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)

  const [incluirLogoFocus, setIncluirLogoFocus] = useState(false)
  const [incluirLogoCliente, setIncluirLogoCliente] = useState(false)
  const [logoClienteFile, setLogoClienteFile] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml|webp)$/)) {
      alert("Apenas imagens são aceitas.")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setLogoClienteFile(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  /* ── Load report ─────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("relatorios")
        .select("*, projetos(nome, codigo, status, prazo)")
        .eq("id", reportId)
        .single()
      if (!data) return
      setReport(data)

      // A coluna real da tabela é 'conteudo' (não conteudo_json)
      const fullContent = data.conteudo ?? data.conteudo_json ?? {}
      const cfg = fullContent?.configuracao ?? {}
      const content = fullContent ?? {}
      const secoes = cfg.secoes ?? {}
      const enabledSections = Object.entries(secoes).filter(([, v]) => v).map(([k]) => k)

      // Initialize open state for enabled sections
      setOpenSections(Object.fromEntries(enabledSections.map((k) => [k, true])))

      setIncluirLogoFocus(cfg.incluirLogoFocus ?? true)
      setIncluirLogoCliente(cfg.incluirLogoCliente ?? false)
      setLogoClienteFile(cfg.logoClienteFile ?? null)

      // Load fields
      const meta = content.meta ?? {}
      const proj = data.projetos

      setStatusEtapa(data.etapa_atual ?? proj?.status ?? "desenvolvimento")
      setStatusProgresso(meta.progresso ?? data.progresso ?? 0)
      setStatusSaude(meta.saude === "verde" ? "verde" : meta.saude === "vermelho" ? "vermelho" : "amarelo")
      setStatusEntrega(proj?.prazo?.split("T")[0] ?? "")

      setResumoTexto(
        `O projeto ${proj?.nome ?? "—"} está em andamento, atualmente na etapa de ${data.etapa_atual ?? "desenvolvimento"}. ` +
        `Este relatório apresenta o status atual consolidado de todas as sprints e entregas da equipe, ` +
        `incluindo atividades concluídas, tarefas em andamento e próximos passos planejados.`
      )

      // Load sections data
      const sCliente = content.sections
      if (content.editor?.sprintGrupos) {
        setSprintGrupos(content.editor.sprintGrupos)
      } else if (sCliente?.oQuefoiFeito?.grupos) {
        setSprintGrupos(
          sCliente.oQuefoiFeito.grupos.map((g: any) => ({
            sprint: g.sprint,
            tarefas: g.tarefas?.map((t: any) => ({ ...t, id: Math.random().toString() })) || []
          }))
        )
      }
      if (sCliente?.proximosPassos?.tarefas) {
        setProximosPassos(sCliente.proximosPassos.tarefas.slice(0, 6))
      }

      setIsLoading(false)
    }
    load()
  }, [reportId])

  /* ── Auto-save every 45s ─────────────────────────────── */
  useEffect(() => {
    if (!report) return
    autoSaveRef.current = setInterval(async () => {
      await doSave("rascunho", true)
    }, 45_000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [report, resumoTexto, statusEtapa, statusProgresso, statusSaude, sprintGrupos, observacoes, incluirLogoFocus, incluirLogoCliente, logoClienteFile])

  const buildSavePayload = useCallback(() => {
    const prevConfig = (report?.conteudo ?? report?.conteudo_json ?? {})?.configuracao || {}
    return {
      conteudo: {
        ...(report?.conteudo ?? report?.conteudo_json ?? {}),
        configuracao: {
           ...prevConfig,
           incluirLogoFocus,
           incluirLogoCliente,
           logoClienteFile,
        },
        editor: {
        resumo: resumoTexto,
        tags: resumoTags,
        etapa: statusEtapa,
        progresso: statusProgresso,
        saude: statusSaude,
        entregaPrevista: statusEntrega,
        contextoStatus: statusContexto,
        sprintGrupos,
        proximosPassos,
        observacoes,
      },
    },
    }
  }, [report, resumoTexto, resumoTags, statusEtapa, statusProgresso, statusSaude, statusEntrega, statusContexto, sprintGrupos, proximosPassos, observacoes, incluirLogoFocus, incluirLogoCliente, logoClienteFile])

  async function doSave(status = "salvo", silent = false) {
    if (!report || isSaving) return
    if (!silent) setIsSaving(true)
    const payload = buildSavePayload()
    await supabase.from("relatorios").update({ ...payload, status }).eq("id", reportId)
    setLastSaved(new Date())
    if (!silent) setIsSaving(false)
  }

  async function handleExport() {
    await doSave("exportado")
    setShowPreview(true)
  }

  async function handleSyncProjectData() {
    if (!report?.projeto_id) return
    setIsSyncing(true)
    try {
      // 1. Fetch Sprints
      const { data: sprints, error: sErr } = await supabase
        .from("sprints")
        .select("*")
        .eq("projeto_id", report.projeto_id)
        .order("created_at", { ascending: true })

      if (sErr) throw sErr

      // 2. Fetch Tasks for these Sprints
      const sprintIds = sprints.map(s => s.id)
      const { data: tasks, error: tErr } = await supabase
        .from("tarefas")
        .select("*")
        .in("sprint_id", sprintIds)
        .eq("status", "concluida") // Only done tasks

      if (tErr) throw tErr

      // 3. Group them
      const groups = sprints.map(s => ({
        sprint: s.nome,
        tarefas: (tasks || [])
          .filter(t => t.sprint_id === s.id)
          .map(t => ({
            id: t.id,
            titulo: t.titulo,
            data: t.prazo || t.created_at,
            status: t.status
          }))
      })).filter(g => g.tarefas.length > 0)

      setSprintGrupos(groups)
      
      // Update summary based on progress
      const totalTasks = tasks?.length || 0
      if (totalTasks > 0) {
        setResumoTexto(prev => 
          prev + `\n\nNeste período, concluímos ${totalTasks} tarefas críticas através de ${groups.length} sprints.`
        )
      }

    } catch (err) {
      console.error("Erro ao sincronizar:", err)
      alert("Erro ao puxar dados do projeto.")
    } finally {
      setIsSyncing(false)
    }
  }

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const proj = report?.projetos
  const enabledSections = Object.entries((report?.conteudo ?? report?.conteudo_json ?? {})?.configuracao?.secoes ?? {})
    .filter(([, v]) => v)
    .map(([k]) => k)

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Fixed Header ─────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-[#1A1A1A] flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="text-neutral-400 hover:text-foreground gap-2 -ml-2">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="h-4 w-px bg-[#2A2A2A]" />
          <div>
            <h1 className="text-sm font-bold text-foreground">{report?.titulo}</h1>
            {lastSaved && (
              <p className="text-[10px] text-neutral-600 flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                Salvo automaticamente às {lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => doSave()}
            disabled={isSaving}
            variant="outline"
            className="border-border text-foreground hover:text-foreground hover:border-neutral-500 gap-2 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
          <Button onClick={() => setShowPreview(true)} className="bg-orange-500 hover:bg-orange-600 text-foreground gap-2 text-xs">
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>
          <Button onClick={handleExport} className="bg-orange-500 hover:bg-orange-600 text-foreground gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full pb-20">
        
        {/* DASHBOARD DE RESUMO DO PROJETO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
          <div className="bg-[#1A1A1A] border border-border p-3 rounded-xl">
            <p className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase mb-1">Status Projeto</p>
            <div className="flex items-center gap-2">
              <Badge className={cn(
                "text-[10px] font-bold",
                statusSaude === "verde" ? "bg-green-500/20 text-green-500" :
                statusSaude === "amarelo" ? "bg-yellow-500/20 text-yellow-500" :
                "bg-red-500/20 text-red-500"
              )}>
                {statusSaude === "verde" ? "SAUDÁVEL" : statusSaude === "amarelo" ? "EM RISCO" : "ATRASADO"}
              </Badge>
              <span className="text-xs font-bold text-foreground truncate">{statusEtapa.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="bg-[#1A1A1A] border border-border p-3 rounded-xl">
            <p className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase mb-1">Sprints Ativas</p>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-foreground">
                {sprintGrupos.length > 0 ? sprintGrupos[0].sprint : "Nenhuma detectada"}
              </span>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-border p-3 rounded-xl">
            <p className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase mb-1">Tarefas Realizadas</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-bold text-foreground">
                {sprintGrupos.reduce((acc, g) => acc + g.tarefas.length, 0)} entregas no período
              </span>
            </div>
          </div>
        </div>

        {/* RESUMO EXECUTIVO */}
        {enabledSections.includes("resumo") && (
          <Section id="resumo" open={openSections["resumo"]} toggle={toggleSection}>
            <div className="p-4 bg-background rounded-lg border border-orange-500/10 mb-3">
              <textarea
                value={resumoTexto}
                onChange={(e) => setResumoTexto(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-sm text-foreground leading-relaxed resize-none outline-none"
              />
            </div>
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {resumoTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1A] border border-border rounded text-xs text-foreground">
                  {tag}
                  <button onClick={() => setResumoTags((t) => t.filter((x) => x !== tag))}>
                    <X className="w-3 h-3 text-neutral-600 hover:text-red-400" />
                  </button>
                </span>
              ))}
              {addingTag ? (
                <input
                  autoFocus
                  value={novaTag}
                  onChange={(e) => setNovaTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && novaTag.trim()) {
                      setResumoTags((t) => [...t, novaTag.trim()])
                      setNovaTag("")
                      setAddingTag(false)
                    }
                    if (e.key === "Escape") { setAddingTag(false); setNovaTag("") }
                  }}
                  placeholder="Nova tag..."
                  className="px-2.5 py-1 bg-[#1A1A1A] border border-orange-500 rounded text-xs text-foreground outline-none w-24"
                />
              ) : (
                <button
                  onClick={() => setAddingTag(true)}
                  className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-border rounded text-xs text-neutral-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Nova tag...
                </button>
              )}
            </div>
          </Section>
        )}

        {/* STATUS ATUAL */}
        {enabledSections.includes("status") && (
          <Section id="status" open={openSections["status"]} toggle={toggleSection}>
            <div className="space-y-4">
              {/* Etapa */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Etapa:</span>
                <select
                  value={statusEtapa}
                  onChange={(e) => setStatusEtapa(e.target.value)}
                  className="bg-orange-500 text-foreground text-xs font-bold px-3 py-1.5 rounded border-none outline-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              {/* Progresso */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Progresso:</span>
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range" min={0} max={100}
                    value={statusProgresso}
                    onChange={(e) => setStatusProgresso(Number(e.target.value))}
                    className="flex-1 accent-orange-500"
                  />
                  <span className="text-sm font-mono text-foreground w-10 text-right">{statusProgresso}%</span>
                </div>
              </div>
              {/* Saúde */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Saúde:</span>
                <div className="flex items-center gap-2">
                  {SAUDE_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setStatusSaude(o.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all",
                        statusSaude === o.id ? o.color : "border-border text-neutral-600 bg-transparent hover:border-neutral-500"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-sm",
                        o.id === "verde" ? "bg-green-400" : o.id === "amarelo" ? "bg-yellow-400" : "bg-red-400"
                      )} />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Entrega prevista */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Entrega prevista:</span>
                <input
                  type="date"
                  value={statusEntrega}
                  onChange={(e) => setStatusEntrega(e.target.value)}
                  className="bg-background border border-border rounded px-3 py-1.5 text-sm text-foreground [color-scheme:dark] outline-none focus:border-orange-500"
                />
              </div>
              {/* Contexto */}
              <textarea
                value={statusContexto}
                onChange={(e) => setStatusContexto(e.target.value)}
                rows={3}
                placeholder="Adicione contexto sobre o status atual para o cliente..."
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-neutral-700 outline-none focus:border-orange-500/50 resize-none"
              />
            </div>
          </Section>
        )}

        {/* ATIVIDADES & SPRINTS DO PERÍODO */}
        {(enabledSections.includes("atividades") || enabledSections.includes("sprints")) && (
          <Section 
            id="atividades" 
            open={openSections["atividades"] || openSections["sprints"]} 
            toggle={toggleSection}
            extraHeader={
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); handleSyncProjectData(); }}
                disabled={isSyncing}
                className="h-7 text-[10px] text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 gap-1.5 ml-auto mr-4"
              >
                <RefreshCcw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
                {isSyncing ? "Sincronizando..." : "Sincronizar com Projetos"}
              </Button>
            }
          >
             <div className="space-y-6">
               {sprintGrupos.map((g, gi) => (
                 <div key={gi}>
                   <h4 className="text-sm font-bold text-orange-500 mb-2">{g.sprint}</h4>
                   <div className="space-y-1">
                     {g.tarefas.map((t: any, ti: number) => (
                       <div key={t.id ?? ti} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-accent/10 group">
                         <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                         {t.data && (
                           <span className="text-[11px] font-mono text-neutral-600 w-12 flex-shrink-0">
                             {new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                           </span>
                         )}
                         <span className="flex-1 text-sm text-foreground flex items-center gap-2">
                           {t.titulo}
                           {t.status && (
                             <span className={cn(
                               "text-[9px] px-1.5 py-0.5 rounded uppercase font-bold",
                               t.status === "concluida" ? "bg-green-500/20 text-green-500" :
                               t.status === "em_andamento" ? "bg-blue-500/20 text-blue-500" :
                               t.status === "bloqueada" ? "bg-red-500/20 text-red-500" :
                               "bg-neutral-500/20 text-neutral-500"
                             )}>
                               {t.status.replace("_", " ")}
                             </span>
                           )}
                         </span>
                         <button onClick={() => {
                           const newGroups = [...sprintGrupos]
                           newGroups[gi].tarefas = newGroups[gi].tarefas.filter((_: any, j: number) => j !== ti)
                           setSprintGrupos(newGroups)
                         }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                           <X className="w-3.5 h-3.5 text-neutral-600 hover:text-red-400" />
                         </button>
                       </div>
                     ))}
                     {addingTarefaGroupIdx === gi ? (
                        <input
                          autoFocus
                          value={novaAtividade}
                          onChange={(e) => setNovaAtividade(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && novaAtividade.trim()) {
                              const newGroups = [...sprintGrupos]
                              newGroups[gi].tarefas.push({ titulo: novaAtividade.trim(), id: Math.random().toString(), data: new Date().toISOString() })
                              setSprintGrupos(newGroups)
                              setNovaAtividade("")
                              setAddingTarefaGroupIdx(null)
                            }
                            if (e.key === "Escape") { setAddingTarefaGroupIdx(null); setNovaAtividade("") }
                          }}
                          placeholder="Descrição da atividade..."
                          className="w-full bg-[#1A1A1A] border border-orange-500 rounded px-3 py-2 text-sm text-foreground outline-none mt-1"
                        />
                     ) : (
                        <button
                          onClick={() => setAddingTarefaGroupIdx(gi)}
                          className="flex items-center gap-2 mt-2 text-xs text-neutral-600 hover:text-orange-500 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar atividade
                        </button>
                     )}
                   </div>
                 </div>
               ))}
               
               {sprintGrupos.length === 0 && (
                 <p className="text-xs text-neutral-500">Nenhuma entrega mapeada para o período.</p>
               )}
             </div>
          </Section>
        )}

        {/* PRÓXIMOS PASSOS */}
        {enabledSections.includes("proximos_passos") && (
          <Section id="proximos_passos" open={openSections["proximos_passos"]} toggle={toggleSection}>
            <div className="space-y-2">
              {proximosPassos.map((t, i) => (
                <div key={i} className="flex items-start gap-3 py-2 group">
                  <span className="text-sm font-mono text-orange-500 w-5 flex-shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="flex-1 text-sm text-foreground">{t.titulo}</span>
                  {t.responsavel && <span className="text-xs text-orange-400">– {t.responsavel}</span>}
                  {t.prazo && (
                    <span className="text-xs text-neutral-600 flex-shrink-0">
                      até {new Date(t.prazo).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  <button onClick={() => setProximosPassos((p) => p.filter((_, j) => j !== i))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <X className="w-3.5 h-3.5 text-neutral-600 hover:text-red-400" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const txt = window.prompt("Próximo passo:")
                  if (txt) setProximosPassos((p) => [...p, { titulo: txt }])
                }}
                className="flex items-center gap-2 mt-2 text-xs text-neutral-600 hover:text-orange-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar próximo passo
              </button>
            </div>
          </Section>
        )}

        {/* OBSERVAÇÕES DA EQUIPE */}
        {enabledSections.includes("observacoes") && (
          <Section id="observacoes" open={openSections["observacoes"]} toggle={toggleSection}>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={5}
              placeholder="Observações internas da equipe (não aparece no relatório para cliente)..."
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-neutral-700 outline-none focus:border-orange-500/50 resize-none"
            />
          </Section>
        )}

        {/* CONFIGURAÇÃO EXTRA - LOGOS */}
        <div className="mt-8 border border-[#1A1A1A] rounded-xl p-5 bg-background space-y-4">
          <h3 className="text-xs font-mono font-bold tracking-[0.15em] text-neutral-400 mb-2">MARCA & LOGOS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setIncluirLogoFocus(!incluirLogoFocus)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-all",
                incluirLogoFocus 
                  ? "border-orange-500/50 bg-orange-500/10" 
                  : "border-border bg-background hover:border-neutral-600"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors",
                incluirLogoFocus ? "bg-orange-500 border-orange-500" : "border-neutral-600 bg-card"
              )}>
                 {incluirLogoFocus && <Check className="w-3 h-3 text-foreground" strokeWidth={3} />}
              </div>
              <span className={cn("text-[11px] font-mono font-medium uppercase tracking-wider", incluirLogoFocus ? "text-orange-500" : "text-neutral-500")}>
                Logo da Focus OS
              </span>
            </button>

            <button
              onClick={() => setIncluirLogoCliente(!incluirLogoCliente)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-all",
                incluirLogoCliente
                  ? "border-orange-500/50 bg-orange-500/10" 
                  : "border-border bg-background hover:border-neutral-600"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors",
                incluirLogoCliente ? "bg-orange-500 border-orange-500" : "border-neutral-600 bg-card"
              )}>
                 {incluirLogoCliente && <Check className="w-3 h-3 text-foreground" strokeWidth={3} />}
              </div>
              <span className={cn("text-[11px] font-mono font-medium uppercase tracking-wider", incluirLogoCliente ? "text-orange-500" : "text-neutral-500")}>
                Logo do Cliente
              </span>
            </button>
          </div>
          {incluirLogoCliente && (
            <div className="space-y-2 mt-2">
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              {logoClienteFile ? (
                <div className="flex items-center gap-3 p-3 bg-background border border-orange-500/30 rounded-lg">
                  <img src={logoClienteFile} className="h-10 object-contain bg-white rounded p-1" alt="Logo Cliente" />
                  <button onClick={() => setLogoClienteFile(null)} className="text-xs text-orange-500 hover:underline">
                    Remover
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-4 rounded-lg border-2 border-dashed border-border text-xs text-neutral-500 hover:border-orange-500/50 hover:text-orange-500 transition-all flex flex-col items-center justify-center gap-2 bg-background"
                >
                  <Building2 className="w-5 h-5 text-neutral-600" />
                  Clique para enviar a logo do cliente
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Preview Modal ─────────────────────────────────── */}
      {showPreview && (
        <ReportPreview
          report={report}
          editorData={{
            resumoTexto,
            resumoTags,
            statusEtapa,
            statusProgresso,
            statusSaude,
            statusEntrega,
            sprintGrupos,
            proximosPassos,
            observacoes,
            incluirLogoFocus,
            incluirLogoCliente,
            logoClienteFile
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}

/* ─── Collapsible Section Wrapper ───────────────────── */
function Section({ id, open, toggle, extraHeader, children }: any) {
  const meta = SECTION_META[id] ?? { icon: FileIcon, label: id.toUpperCase(), color: "text-orange-500" }
  const Icon = meta.icon

  return (
    <div className="rounded-xl border border-[#1A1A1A] bg-background overflow-hidden">
      <div className="flex items-center w-full bg-background hover:bg-accent/5 transition-colors">
        <button
          onClick={() => toggle(id)}
          className="flex-1 flex items-center gap-3 px-5 py-4 text-left"
        >
          <Icon className={cn("w-4 h-4 flex-shrink-0", meta.color)} />
          <span className={cn("text-xs font-mono font-bold tracking-[0.15em]", meta.color)}>
            {meta.label}
          </span>
        </button>
        {extraHeader}
        <button onClick={() => toggle(id)} className="px-5 py-4">
          {open ? <ChevronUp className="w-4 h-4 text-neutral-600" /> : <ChevronDown className="w-4 h-4 text-neutral-600" />}
        </button>
      </div>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  )
}
