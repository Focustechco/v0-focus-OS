"use client"

import { useState, useMemo } from "react"
import { useEventos, type Evento } from "@/lib/hooks/use-eventos"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { supabase } from "@/lib/supabase"
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock,
  Users, Trash2, Edit2, Loader2, X, CheckCircle2,
  RefreshCw, AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

// ─── HELPERS ────────────────────────────────────────────────────────────────
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
const TIPOS = [
  { value: "reuniao",   label: "Reunião",   color: "#3b82f6" },
  { value: "tarefa",    label: "Tarefa",    color: "#f59e0b" },
  { value: "lembrete",  label: "Lembrete",  color: "#8b5cf6" },
  { value: "outro",     label: "Outro",     color: "#6b7280" },
]
const DURACOES = [
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "1h30",   value: 90 },
  { label: "2 horas",value: 120 },
  { label: "3 horas",value: 180 },
  { label: "4 horas",value: 240 },
]

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

function isMesmoDia(d: Date, dataStr: string) {
  return fmtData(d) === dataStr
}

function getInitials(nome: string) {
  return nome.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()
}

function getCorTipo(tipo: string) {
  return TIPOS.find(t => t.value === tipo)?.color || "#FF6B00"
}

// ─── AVATAR STACK ─────────────────────────────────────────────────────────
function AvatarStack({ membros }: { membros: any[] }) {
  if (!membros || membros.length === 0) return null
  const show = membros.slice(0, 3)
  const extra = membros.length - 3
  return (
    <div className="flex items-center -space-x-1.5">
      {show.map((m, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[8px] font-bold text-primary bg-card"
          style={{ zIndex: 10 - i }}
          title={m.perfil?.nome_completo || ""}
        >
          {m.perfil?.avatar_url
            ? <img src={m.perfil.avatar_url} className="w-full h-full rounded-full object-cover" />
            : getInitials(m.perfil?.nome_completo || "?")}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-5 h-5 rounded-full border border-border bg-secondary flex items-center justify-center text-[8px] font-bold text-muted-foreground">
          +{extra}
        </div>
      )}
    </div>
  )
}

// ─── MODAL NOVO EVENTO ─────────────────────────────────────────────────────
function NovoEventoModal({
  onClose, onSave, dataSelecionada
}: {
  onClose: () => void
  onSave: (data: any) => Promise<void>
  dataSelecionada: string
}) {
  const { equipe } = useEquipe()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

      await onSave({
        ...form,
        attendees_emails: membrosComEmail,
      })
      setSuccess(true)
      setTimeout(onClose, 1200)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const corTipo = getCorTipo(form.tipo)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">Novo Evento</span>
            <Badge variant="outline" className="text-[9px] font-mono px-2 border-blue-500/30 text-blue-400 gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              Google Calendar
            </Badge>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
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
                {DURACOES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Tipo</label>
              <select
                value={form.tipo}
                onChange={e => set("tipo", e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {TIPOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
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
              rows={3}
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
                        {m.avatar_url
                          ? <img src={m.avatar_url} className="w-full h-full rounded-full object-cover" />
                          : getInitials(m.nome || "")
                        }
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
          {success ? (
            <div className="flex items-center justify-center gap-2 py-2 text-green-500 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Evento criado com sucesso!
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

// ─── CARD DE EVENTO SIMPLES ────────────────────────────────────────────────
function EventoItem({
  evento, onDelete
}: {
  evento: Evento
  onDelete: (id: string) => void
}) {
  const cor = getCorTipo(evento.tipo)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(evento.id)
    setDeleting(false)
  }

  return (
    <div
      className="flex items-center gap-3 py-2 group"
    >
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cor }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{evento.titulo}</p>
        <p className="text-[10px] text-muted-foreground font-mono">
          {evento.hora_inicio} · {evento.sincronizado_google ? "Google Calendar" : "Agenda local"}
        </p>
      </div>
      <AvatarStack membros={evento.evento_membros || []} />
      {evento.sincronizado_google && (
        <div title="Sincronizado com Google Calendar">
          <Calendar className="w-3 h-3 text-blue-400 flex-shrink-0" />
        </div>
      )}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function AgendaModule() {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() })
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(hoje)
  const [showModal, setShowModal] = useState(false)

  // Calcula range do mês para buscar eventos
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

  // Eventos do dia selecionado
  const eventosDoDia = useMemo(() =>
    eventos.filter(e => e.data === fmtData(diaSelecionado))
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    [eventos, diaSelecionado]
  )

  // Dias que têm eventos (para pontinho no calendário)
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
        {/* Navegação do mês */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => irParaMes(-1)}
            className="text-xs font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-border/80 transition-colors"
          >
            ‹ Anterior
          </button>
          <span className="text-sm font-bold text-foreground capitalize">
            {MESES[mesAtual.mes]} {mesAtual.ano}
          </span>
          <button
            onClick={() => irParaMes(1)}
            className="text-xs font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:border-border/80 transition-colors"
          >
            Próximo ›
          </button>
        </div>

        {/* Cabeçalho dias da semana */}
        <div className="grid grid-cols-7 mb-1">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-[10px] font-mono text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {dias.map((dia, i) => {
            if (!dia) return <div key={i} />
            const dStr = fmtData(dia)
            const selecionado = fmtData(diaSelecionado) === dStr
            const temEvento = diasComEventos.has(dStr)
            const ehHoje = isHoje(dia)

            return (
              <button
                key={i}
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
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
            Eventos — {diaSelecionado.getDate()} {MESES[diaSelecionado.getMonth()].slice(0, 3)}
          </p>

          {eventosDoDia.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Nenhum evento neste dia.
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {eventosDoDia.map(ev => (
                <EventoItem key={ev.id} evento={ev} onDelete={deletarEvento} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick add button */}
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
