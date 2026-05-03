"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useEventos, type Evento } from "@/lib/hooks/use-eventos"
import { useEquipe } from "@/lib/hooks/use-equipe"
import { useClientes } from "@/lib/hooks/use-clientes"
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Clock,
  Users, User, Briefcase, Info, X, Filter,
  CheckCircle2, Loader2, ChevronDown, MoreHorizontal
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── CONSTANTES DE DESIGN ───────────────────────────────────────────────────

const TIPO_CONFIG = {
  reuniao:  { label: "Reunião",  bg: "bg-[#1a2a3a]", text: "text-[#85B7EB]", dot: "bg-[#85B7EB]" },
  deploy:   { label: "Deploy",   bg: "bg-[#1a2e1a]", text: "text-[#97C459]", dot: "bg-[#97C459]" },
  sprint:   { label: "Sprint",   bg: "bg-[#2e2010]", text: "text-[#EF9F27]", dot: "bg-[#EF9F27]" },
  outro:    { label: "Outro",    bg: "bg-[#1e1e1e]", text: "text-muted-foreground", dot: "bg-muted-foreground" },
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getDiasDoMesCompleto(ano: number, mes: number) {
  const primeiroDiaDoMes = new Date(ano, mes, 1)
  const ultimoDiaDoMes = new Date(ano, mes + 1, 0)
  
  const dias = []
  
  // Dias do mês anterior para completar a primeira semana
  const primeiroDiaSemana = primeiroDiaDoMes.getDay()
  for (let i = primeiroDiaSemana; i > 0; i--) {
    dias.push(new Date(ano, mes, 1 - i))
  }
  
  // Dias do mês atual
  for (let d = 1; d <= ultimoDiaDoMes.getDate(); d++) {
    dias.push(new Date(ano, mes, d))
  }
  
  // Dias do próximo mês para completar 42 células (6 semanas)
  const diasRestantes = 42 - dias.length
  for (let i = 1; i <= diasRestantes; i++) {
    dias.push(new Date(ano, mes + 1, i))
  }
  
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

// ─── COMPONENTES AUXILIARES ────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    ativo: "bg-green-500/10 text-green-500 border-green-500/20",
    inativo: "bg-red-500/10 text-red-500 border-red-500/20",
    ferias: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  }
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-medium uppercase tracking-tighter ${colors[status] || colors.ativo}`}>
      {status || "Ativo"}
    </span>
  )
}

import { PageWrapper } from "@/components/page-wrapper"

// ─── MAIN MODULE ────────────────────────────────────────────────────────────

export function AgendaModule() {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() })
  
  const [tiposAtivos, setTiposAtivos] = useState<string[]>(["reuniao", "deploy", "sprint"])
  const [membroFiltro, setMembroFiltro] = useState("Todos")
  const [clienteFiltro, setClienteFiltro] = useState("Todos")

  // Estados da Integração Google Calendar
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleGoogleSync = () => {
    if (isGoogleConnected) {
      setIsGoogleConnected(false)
      toast.info("Conta do Google Calendar desconectada.")
    } else {
      setIsSyncing(true)
      setTimeout(() => {
        setIsSyncing(false)
        setIsGoogleConnected(true)
        toast.success("Google Calendar conectado com sucesso!")
      }, 1500)
    }
  }

  // Estados Novo Evento
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newEventData, setNewEventData] = useState({
    titulo: "",
    descricao: "",
    data: fmtData(hoje),
    hora_inicio: "09:00",
    duracao_minutos: 60,
    tipo: "reuniao",
    membro_id: "Todos",
    cliente_id: "Todos"
  })

  const { equipe } = useEquipe()
  const { clientes } = useClientes()
  
  const dataInicio = fmtData(new Date(mesAtual.ano, mesAtual.mes, -7))
  const dataFim = fmtData(new Date(mesAtual.ano, mesAtual.mes + 1, 14))

  const { eventos, isLoading, criarEvento } = useEventos(dataInicio, dataFim)

  const handleCreateEvento = async () => {
    if (!newEventData.titulo) return toast.error("O título é obrigatório!")
    
    try {
      setIsSubmitting(true)
      
      const selectedCliente = clientes.find(c => c.id === newEventData.cliente_id)
      const descricaoFinal = selectedCliente 
        ? `Cliente: ${selectedCliente.nome}\n${newEventData.descricao}`
        : newEventData.descricao

      const res = await criarEvento({
        titulo: newEventData.titulo,
        descricao: descricaoFinal,
        data: newEventData.data,
        hora_inicio: newEventData.hora_inicio,
        duracao_minutos: Number(newEventData.duracao_minutos),
        tipo: newEventData.tipo,
        membros_ids: newEventData.membro_id !== "Todos" ? [newEventData.membro_id] : [],
        criar_no_google: isGoogleConnected
      })

      toast.success("Evento criado com sucesso!")
      
      // Se estiver conectado ao Google, abrir o link gerado para confirmar/salvar no calendário
      if (res.evento?.google_cal_url) {
        window.open(res.evento.google_cal_url, '_blank')
      }

      setIsModalOpen(false)
      setNewEventData({
        titulo: "",
        descricao: "",
        data: fmtData(hoje),
        hora_inicio: "09:00",
        duracao_minutos: 60,
        tipo: "reuniao",
        membro_id: "Todos",
        cliente_id: "Todos"
      })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const dias = useMemo(() => getDiasDoMesCompleto(mesAtual.ano, mesAtual.mes), [mesAtual])

  // Filtragem Local
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(ev => {
      const matchTipo = tiposAtivos.includes(ev.tipo)
      const matchMembro = membroFiltro === "Todos" || ev.criado_por === membroFiltro
      const matchCliente = clienteFiltro === "Todos" || ev.descricao?.includes(clienteFiltro)
      return matchTipo && matchMembro && matchCliente
    })
  }, [eventos, tiposAtivos, membroFiltro, clienteFiltro])

  const irParaMes = (delta: number) => {
    setMesAtual(prev => {
      const d = new Date(prev.ano, prev.mes + delta, 1)
      return { ano: d.getFullYear(), mes: d.getMonth() }
    })
  }

  const toggleTipo = (tipo: string) => {
    setTiposAtivos(prev => prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo])
  }

  const proximosEventos = useMemo(() => {
    const nowStr = fmtData(hoje)
    return eventosFiltrados
      .filter(ev => ev.data >= nowStr)
      .sort((a, b) => `${a.data}${a.hora_inicio}`.localeCompare(`${b.data}${b.hora_inicio}`))
      .slice(0, 5)
  }, [eventosFiltrados])

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-foreground font-sans overflow-hidden">
        
        {/* ─── BARRA DE FILTROS SUPERIOR ─── */}
        <div className="flex flex-col gap-4 p-4 lg:p-6 border-b border-[#222]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Cliente</span>
                <select 
                  value={clienteFiltro}
                  onChange={e => setClienteFiltro(e.target.value)}
                  className="bg-[#161616] border border-[#222] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#e87c2a]/50 transition-colors text-white"
                >
                  <option value="Todos">Todos os Clientes</option>
                  {clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Equipe</span>
                <select 
                  value={membroFiltro}
                  onChange={e => setMembroFiltro(e.target.value)}
                  className="bg-[#161616] border border-[#222] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#e87c2a]/50 transition-colors text-white"
                >
                  <option value="Todos">Toda a Equipe</option>
                  {equipe.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#e87c2a] hover:bg-[#e87c2a]/90 text-white font-bold text-xs px-4 h-9 rounded-xl shadow-lg shadow-[#e87c2a]/10"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Evento
            </Button>
          </div>

          {/* Chips de Tipo */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mb-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-2 flex-shrink-0">Filtros:</span>
            {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
              const active = tiposAtivos.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleTipo(key)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all flex-shrink-0
                    ${active ? `${cfg.bg} ${cfg.text} border-transparent shadow-sm` : "bg-[#161616] border-[#222] text-muted-foreground opacity-50 hover:opacity-100"}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-medium">{cfg.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── CONTEÚDO PRINCIPAL (Grid + Sidebar Direita) ─── */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* CALENDÁRIO */}
          <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col p-4 lg:p-6 bg-[#0f0f0f]">
            
            {/* Navegação do Mês */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1">
                <button onClick={() => irParaMes(-1)} className="p-2 hover:bg-[#161616] rounded-lg transition-colors text-neutral-400 hover:text-white"><ChevronLeft className="w-5 h-5"/></button>
                <h2 className="text-lg font-bold min-w-[140px] text-center capitalize text-white">{MESES[mesAtual.mes]} {mesAtual.ano}</h2>
                <button onClick={() => irParaMes(1)} className="p-2 hover:bg-[#161616] rounded-lg transition-colors text-neutral-400 hover:text-white"><ChevronRight className="w-5 h-5"/></button>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMesAtual({ ano: hoje.getFullYear(), mes: hoje.getMonth() })}
                  className="px-3 py-1.5 text-xs bg-[#161616] border border-[#222] rounded-lg hover:border-[#e87c2a] text-neutral-300 transition-all"
                >
                  Hoje
                </button>
              </div>
            </div>

            {/* Grid de Dias */}
            <div className="flex-1 flex flex-col border border-[#222] rounded-2xl overflow-hidden bg-[#161616]">
              {/* Header Dias da Semana */}
              <div className="grid grid-cols-7 bg-[#1a1a1a] border-b border-[#222]">
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="py-3 text-center text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{d}</div>
                ))}
              </div>

              {/* Grid 7x6 */}
              <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {dias.map((dia, idx) => {
                  const ehMêsAtual = dia.getMonth() === mesAtual.mes
                  const ehHoje = isHoje(dia)
                  const dStr = fmtData(dia)
                  const evs = eventosFiltrados.filter(e => e.data === dStr)
                  
                  return (
                    <div 
                      key={idx} 
                      className={`
                        relative p-1 lg:p-2 border-r border-b border-[#222] min-h-[80px] lg:min-h-0
                        ${!ehMêsAtual ? "bg-[#0d0d0d] opacity-20" : "bg-transparent"}
                        ${ehHoje ? "bg-[#e87c2a]/5" : ""}
                        transition-colors hover:bg-[#1f1f1f]/30
                      `}
                    >
                      <span className={`
                        text-xs font-mono mb-2 inline-block px-1.5 py-0.5 rounded
                        ${ehHoje ? "text-[#e87c2a] font-bold" : "text-neutral-500"}
                      `}>
                        {dia.getDate()}
                      </span>

                      {/* Eventos na Célula */}
                      <div className="space-y-1 overflow-y-auto max-h-[80px] lg:max-h-[100px] no-scrollbar">
                        {evs.map(ev => {
                          const cfg = (TIPO_CONFIG as any)[ev.tipo] || TIPO_CONFIG.outro
                          return (
                            <div 
                              key={ev.id}
                              className={`
                                ${cfg.bg} ${cfg.text}
                                text-[9px] lg:text-[10px] px-2 py-1 rounded-md border border-white/5 truncate cursor-pointer hover:brightness-125 transition-all
                              `}
                            >
                              <span className="hidden lg:inline mr-1 font-mono opacity-80">{ev.hora_inicio}</span>
                              {ev.titulo}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* SIDEBAR DIREITA (Agenda do Dia/Equipe) */}
          <aside className="hidden xl:flex flex-col w-[320px] border-l border-[#222] bg-[#0d0d0d] p-6 space-y-8 overflow-y-auto">
            
            {/* Seção Equipe */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5"/> Equipe Ativa
                </h3>
              </div>
              <div className="space-y-2">
                {equipe.slice(0, 6).map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setMembroFiltro(m.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all group ${membroFiltro === m.id ? "bg-[#161616] border-[#e87c2a]/50" : "bg-transparent border-transparent hover:bg-[#161616]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border border-[#222]">
                        <AvatarImage src={m.foto_url} />
                        <AvatarFallback className="bg-[#222] text-[10px] font-bold text-neutral-500">
                          {getInitials(m.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-neutral-300 group-hover:text-white">{m.nome.split(" ")[0]}</span>
                    </div>
                    <StatusBadge status={m.status || "ativo"} />
                  </button>
                ))}
              </div>
            </section>

            {/* Seção Próximos Eventos */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5"/> Timeline
              </h3>
              <div className="space-y-4">
                {proximosEventos.length === 0 ? (
                  <p className="text-[11px] text-neutral-600 text-center py-4 italic">Sem eventos próximos</p>
                ) : (
                  proximosEventos.map(ev => {
                    const cfg = (TIPO_CONFIG as any)[ev.tipo] || TIPO_CONFIG.outro
                    const d = new Date(ev.data + "T00:00:00")
                    return (
                      <div key={ev.id} className="relative pl-4 group cursor-pointer">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${cfg.dot}`} />
                        <p className="text-xs font-bold text-neutral-200 group-hover:text-[#e87c2a] transition-colors">{ev.titulo}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 font-mono">
                          <span>{d.getDate()}/{MESES[d.getMonth()].slice(0,3)}</span>
                          <span className="opacity-30">•</span>
                          <span>{ev.hora_inicio}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            {/* Google Calendar Widget */}
            <div className="mt-auto p-5 rounded-2xl bg-[#161616] border border-[#222] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4285F4]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm">
                    {/* Ícone simplificado Google Calendar */}
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M16 2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V2h-2zm2 18H6V9h14v11z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white">Google Calendar</h4>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5 tracking-wider">Sincronização 2-way</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#0f0f0f] border border-[#222] rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {isGoogleConnected ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-600"></span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                      {isSyncing ? "Conectando..." : isGoogleConnected ? "Conectado" : "Desconectado"}
                    </span>
                  </div>
                  
                  {isGoogleConnected && (
                    <span className="text-[9px] text-[#4285F4] font-bold uppercase cursor-pointer hover:underline">
                      Sincronizar
                    </span>
                  )}
                </div>

                <Button 
                  onClick={handleGoogleSync}
                  disabled={isSyncing}
                  className={`w-full h-9 text-[11px] uppercase tracking-wider font-bold transition-all ${
                    isGoogleConnected 
                      ? "bg-transparent border border-[#333] hover:bg-[#222] text-white" 
                      : "bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-lg shadow-[#4285F4]/20"
                  }`}
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isGoogleConnected ? "Desconectar" : "Conectar Conta"}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* ─── MODAL NOVO EVENTO ─── */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-[#161616] border-[#222] text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Criar Novo Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 uppercase tracking-widest">Título do Evento</Label>
                <Input 
                  value={newEventData.titulo}
                  onChange={e => setNewEventData({...newEventData, titulo: e.target.value})}
                  className="bg-[#0f0f0f] border-[#222] text-sm" 
                  placeholder="Ex: Reunião de Kickoff"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 uppercase tracking-widest">Data</Label>
                  <Input 
                    type="date"
                    value={newEventData.data}
                    onChange={e => setNewEventData({...newEventData, data: e.target.value})}
                    className="bg-[#0f0f0f] border-[#222] text-sm [color-scheme:dark]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 uppercase tracking-widest">Início</Label>
                  <Input 
                    type="time"
                    value={newEventData.hora_inicio}
                    onChange={e => setNewEventData({...newEventData, hora_inicio: e.target.value})}
                    className="bg-[#0f0f0f] border-[#222] text-sm [color-scheme:dark]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 uppercase tracking-widest">Tipo</Label>
                  <Select value={newEventData.tipo} onValueChange={v => setNewEventData({...newEventData, tipo: v})}>
                    <SelectTrigger className="bg-[#0f0f0f] border-[#222] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161616] border-[#222] text-white">
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="deploy">Deploy</SelectItem>
                      <SelectItem value="sprint">Sprint</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 uppercase tracking-widest">Duração (min)</Label>
                  <Input 
                    type="number"
                    value={newEventData.duracao_minutos}
                    onChange={e => setNewEventData({...newEventData, duracao_minutos: Number(e.target.value)})}
                    className="bg-[#0f0f0f] border-[#222] text-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 uppercase tracking-widest">Membro da Equipe</Label>
                  <Select value={newEventData.membro_id} onValueChange={v => setNewEventData({...newEventData, membro_id: v})}>
                    <SelectTrigger className="bg-[#0f0f0f] border-[#222] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161616] border-[#222] text-white">
                      <SelectItem value="Todos">Sem membro específico</SelectItem>
                      {equipe.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 uppercase tracking-widest">Cliente</Label>
                  <Select value={newEventData.cliente_id} onValueChange={v => setNewEventData({...newEventData, cliente_id: v})}>
                    <SelectTrigger className="bg-[#0f0f0f] border-[#222] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#161616] border-[#222] text-white">
                      <SelectItem value="Todos">Nenhum cliente</SelectItem>
                      {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 uppercase tracking-widest">Descrição</Label>
                <Textarea 
                  value={newEventData.descricao}
                  onChange={e => setNewEventData({...newEventData, descricao: e.target.value})}
                  className="bg-[#0f0f0f] border-[#222] text-sm h-20" 
                  placeholder="Detalhes da reunião..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">Cancelar</Button>
              <Button 
                onClick={handleCreateEvento} 
                disabled={isSubmitting}
                className="bg-[#e87c2a] hover:bg-[#e87c2a]/90 text-white font-bold"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Criar Evento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
  )
}
