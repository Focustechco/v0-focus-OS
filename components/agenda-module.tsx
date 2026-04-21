"use client"

import { useState, useMemo } from "react"
import { useEventos, type Evento } from "@/lib/hooks/use-eventos"
import { useEquipe } from "@/lib/hooks/use-equipe"
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock,
  Trash2, Loader2, X, CheckCircle2, ExternalLink
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

// ─── HELPERS ────────────────────────────────────────────────────────────────
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
const TIPOS = [
  { value: "reuniao",   label: "Reunião" },
  { value: "tarefa",    label: "Tarefa" },
  { value: "lembrete",  label: "Lembrete" },
  { value: "outro",     label: "Outro" },
]
const DURACOES = [
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "1h30",   value: 90 },
  { label: "2 horas",value: 120 },
  { label: "3 horas",value: 180 },
]
const CORES_TIPO: Record<string, string> = {
  reuniao: "#3b82f6", tarefa: "#f59e0b", lembrete: "#8b5cf6", outro: "#6b7280"
}

function getDiasDoMes(ano: number, mes: number) {
  const primeiroDia = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0)
  const dias: (Date | null)[] = []
  for (let i = 0; i < primeiroDia.getDay(); i++) dias.push(null)
  for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(ano, mes, d))
  return dias
}

function fmtData(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}

function isHoje(d: Date) {
  const t = new Date()
  return d.getDate()===t.getDate() && d.getMonth()===t.getMonth() && d.getFullYear()===t.getFullYear()
}

function getInitials(nome: string) {
  return nome.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()
}

// Gera link Google Calendar no frontend (fallback caso a API não retorne)
function gerarGoogleCalLink(ev: { titulo: string, data: string, hora_inicio: string, hora_fim?: string, descricao?: string }) {
  const dataLimpa = ev.data.replace(/-/g, "")
  const inicio = `${dataLimpa}T${(ev.hora_inicio || "10:00").replace(":", "")}00`
  const fim = `${dataLimpa}T${(ev.hora_fim || "11:00").replace(":", "")}00`
  return `https://calendar.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(ev.titulo)}&dates=${inicio}/${fim}&ctz=America/Fortaleza&details=${encodeURIComponent(ev.descricao || "")}`
}

// ─── MODAL NOVO EVENTO ─────────────────────────────────────────────────────
function NovoEventoModal({
  onClose, onSave, dataSelecionada
}: {
  onClose: () => void
  onSave: (data: any) => Promise<any>
  dataSelecionada: string
}) {
  const { equipe } = useEquipe()
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ sucesso: boolean; googleUrl?: string } | null>(null)
  const [form, setForm] = useState({
    titulo: "",
    data: dataSelecionada,
    hora_inicio: "10:00",
    duracao_minutos: 60,
    tipo: "reuniao",
    descricao: "",
    membros_ids: [] as string[],
    criar_no_google: true,
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleMembro = (id: string) => {
    setForm(f => ({
      ...f,
      membros_ids: f.membros_ids.includes(id)
        ? f.membros_ids.filter(m => m !== id)
        : [...f.membros_ids, id]
    }))
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) return
    setLoading(true)
    try {
      const membrosComEmail = equipe
        .filter(m => form.membros_ids.includes(m.id))
        .map(m => m.email)
        .filter(Boolean)

      const result = await onSave({
        ...form,
        cor: CORES_TIPO[form.tipo] || "#FF6B00",
        attendees_emails: membrosComEmail,
      })

      const googleUrl = result?.evento?.google_cal_url || null

      setResultado({ sucesso: true, googleUrl })

      // Abre o Google Calendar automaticamente se toggle ativo
      if (form.criar_no_google && googleUrl) {
        window.open(googleUrl, "_blank")
      }

      // Fecha em 2s
      setTimeout(onClose, 2000)
    } catch (e: any) {
      console.error("Erro ao criar evento:", e)
      setResultado({ sucesso: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">Novo Evento</span>
            <Badge variant="outline" className="text-[9px] font-mono px-2 border-blue-500/30 text-blue-400 gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              Google Calendar
            </Badge>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 max-h-[60vh]">
          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Título do evento</label>
            <input
              value={form.titulo}
              onChange={e => set("titulo", e.target.value)}
              placeholder="Ex: Reunião de alinhamento"
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
              autoFocus
            />
          </div>

          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={e => set("data", e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Horário início</label>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={e => set("hora_inicio", e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Duração + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Duração</label>
              <select
                value={form.duracao_minutos}
                onChange={e => set("duracao_minutos", Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {DURACOES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tipo</label>
              <select
                value={form.tipo}
                onChange={e => set("tipo", e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={e => set("descricao", e.target.value)}
              placeholder="Pauta, links, observações..."
              rows={2}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
            />
          </div>

          {/* Membros */}
          {equipe.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Membros convidados <span className="normal-case text-muted-foreground/60">(serão notificados pelo Google Calendar)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {equipe.map(m => {
                  const selected = form.membros_ids.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMembro(m.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        selected
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                        {getInitials(m.nome || "?")}
                      </div>
                      {m.nome?.split(" ")[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Toggle Google Calendar */}
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-foreground">Criar automaticamente no Google Calendar e convidar membros</span>
            </div>
            <Switch
              checked={form.criar_no_google}
              onCheckedChange={v => set("criar_no_google", v)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          {resultado?.sucesso ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 py-1.5 text-green-500 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Evento criado com sucesso!
              </div>
              {resultado.googleUrl && (
                <a
                  href={resultado.googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 border border-blue-500/30 rounded-lg text-xs text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir no Google Calendar
                </a>
              )}
            </div>
          ) : resultado?.sucesso === false ? (
            <div className="flex items-center justify-center gap-2 py-2 text-red-400 text-sm">
              Erro ao criar evento. Tente novamente.
            </div>
          ) : (
            <Button
              onClick={handleSave}
              disabled={loading || !form.titulo.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Criar evento</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CARD DO EVENTO ─────────────────────────────────────────────────────────
function EventoCard({ evento, onDelete }: { evento: Evento; onDelete: (id: string) => void }) {
  const cor = CORES_TIPO[evento.tipo] || evento.cor || "#FF6B00"
  const [deleting, setDeleting] = useState(false)
  const googleUrl = gerarGoogleCalLink(evento)

  return (
    <div className="flex items-start gap-3 py-3 group transition-colors">
      {/* Barra de cor */}
      <div className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: cor }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{evento.titulo}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {evento.hora_inicio}{evento.hora_fim ? ` – ${evento.hora_fim}` : ""}
              </span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 capitalize border-border text-muted-foreground">
                {TIPOS.find(t => t.value === evento.tipo)?.label || evento.tipo}
              </Badge>
            </div>
            {evento.descricao && (
              <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-[250px]">{evento.descricao}</p>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-500/10 text-blue-400 transition-colors"
              title="Abrir no Google Calendar"
            >
              <Calendar className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={async () => { setDeleting(true); await onDelete(evento.id); setDeleting(false) }}
              disabled={deleting}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Excluir evento"
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function AgendaModule() {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() })
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(hoje)
  const [showModal, setShowModal] = useState(false)

  const dataInicio = `${mesAtual.ano}-${String(mesAtual.mes + 1).padStart(2, "0")}-01`
  const dataFim = `${mesAtual.ano}-${String(mesAtual.mes + 1).padStart(2, "0")}-${new Date(mesAtual.ano, mesAtual.mes + 1, 0).getDate()}`

  const { eventos, isLoading, criarEvento, deletarEvento } = useEventos(dataInicio, dataFim)

  const dias = getDiasDoMes(mesAtual.ano, mesAtual.mes)

  const irParaMes = (delta: number) => {
    setMesAtual(prev => {
      const d = new Date(prev.ano, prev.mes + delta, 1)
      return { ano: d.getFullYear(), mes: d.getMonth() }
    })
  }

  const eventosDoDia = useMemo(() =>
    eventos.filter(e => e.data === fmtData(diaSelecionado))
      .sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || "")),
    [eventos, diaSelecionado]
  )

  const diasComEventos = useMemo(() =>
    new Set(eventos.map(e => e.data)),
    [eventos]
  )

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Agenda</span>
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        </div>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Novo evento
        </Button>
      </div>

      {/* Calendário */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => irParaMes(-1)}
            className="text-xs font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-primary/30 transition-colors"
          >
            ‹ Anterior
          </button>
          <span className="text-sm font-bold text-foreground capitalize">
            {MESES[mesAtual.mes]} {mesAtual.ano}
          </span>
          <button
            onClick={() => irParaMes(1)}
            className="text-xs font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-primary/30 transition-colors"
          >
            Próximo ›
          </button>
        </div>

        {/* Cabeçalho dias */}
        <div className="grid grid-cols-7 mb-1">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-[10px] font-mono text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {dias.map((dia, i) => {
            if (!dia) return <div key={`empty-${i}`} />
            const dStr = fmtData(dia)
            const selecionado = fmtData(diaSelecionado) === dStr
            const temEvento = diasComEventos.has(dStr)
            const ehHoje = isHoje(dia)

            return (
              <button
                key={dStr}
                onClick={() => setDiaSelecionado(dia)}
                className={`relative flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selecionado
                    ? "bg-primary text-primary-foreground"
                    : ehHoje
                    ? "bg-primary/20 text-primary font-bold"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {dia.getDate()}
                {temEvento && !selecionado && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Eventos do dia */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="border-t border-border pt-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
            Eventos — {diaSelecionado.getDate()} {MESES[diaSelecionado.getMonth()].slice(0, 3)}
          </p>

          {eventosDoDia.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Nenhum evento neste dia.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {eventosDoDia.map(ev => (
                <EventoCard key={ev.id} evento={ev} onDelete={deletarEvento} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick add */}
      <div className="px-4 pb-4 flex-shrink-0">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-xl text-xs text-muted-foreground hover:border-primary/40 hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar evento
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <NovoEventoModal
          onClose={() => setShowModal(false)}
          onSave={criarEvento}
          dataSelecionada={fmtData(diaSelecionado)}
        />
      )}
    </div>
  )
}
