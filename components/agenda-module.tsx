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

// ─── CONSTANTES DE DESIGN ───────────────────────────────────────────────────

const TIPO_CONFIG = {
  reuniao:  { label: "Reunião",  bg: "bg-[#1a2a3a]", text: "text-[#85B7EB]", dot: "bg-[#85B7EB]" },
  captacao: { label: "Captação", bg: "bg-[#2e1a10]", text: "text-[#F0997B]", dot: "bg-[#F0997B]" },
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

// ─── MAIN MODULE ────────────────────────────────────────────────────────────

export function AgendaModule() {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() })
  const [showModal, setShowModal] = useState(false)
  
  // Filtros
  const [tiposAtivos, setTiposAtivos] = useState<string[]>(["reuniao", "captacao", "deploy", "sprint"])
  const [membroFiltro, setMembroFiltro] = useState("Todos")
  const [clienteFiltro, setClienteFiltro] = useState("Todos")

  const { equipe } = useEquipe()
  const { clientes } = useClientes()
  
  const dataInicio = fmtData(new Date(mesAtual.ano, mesAtual.mes, -7))
  const dataFim = fmtData(new Date(mesAtual.ano, mesAtual.mes + 1, 14))
  const { eventos, isLoading } = useEventos(dataInicio, dataFim)

  const dias = useMemo(() => getDiasDoMesCompleto(mesAtual.ano, mesAtual.mes), [mesAtual])

  // Filtragem Local
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(ev => {
      const matchTipo = tiposAtivos.includes(ev.tipo)
      const matchMembro = membroFiltro === "Todos" || ev.criado_por === membroFiltro // Simplificação: assume criado_por como referência ou poderia ser uma relação
      const matchCliente = clienteFiltro === "Todos" || ev.descricao?.includes(clienteFiltro) // Busca no texto se não houver ID explícito
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
    <div className="flex flex-col h-full bg-[#111] text-foreground font-sans overflow-hidden">
      
      {/* ─── HEADER & FILTROS ─── */}
      <header className="flex flex-col gap-4 p-4 lg:p-6 border-b border-[#1e1e1e]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Agenda</h1>
            <p className="text-xs text-muted-foreground mt-1">Gerencie reuniões, captações e datas importantes</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-4">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Cliente</span>
              <select 
                value={clienteFiltro}
                onChange={e => setClienteFiltro(e.target.value)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#e87c2a]/50 transition-colors"
              >
                <option value="Todos">Todos</option>
                {clientes.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
            
            <Button className="bg-[#e87c2a] hover:bg-[#e87c2a]/90 text-white font-bold text-xs px-4 h-9 rounded-xl shadow-lg shadow-[#e87c2a]/10">
              <Plus className="w-4 h-4 mr-2" /> Novo Evento
            </Button>
          </div>
        </div>

        {/* Chips de Tipo (Scrollable no mobile) */}
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mb-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-2 flex-shrink-0">Filtros:</span>
            {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
              const active = tiposAtivos.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleTipo(key)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all flex-shrink-0
                    ${active ? `${cfg.bg} ${cfg.text} border-transparent` : "bg-transparent border-[#2a2a2a] text-muted-foreground opacity-50 hover:opacity-80"}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-medium">{cfg.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* CALENDÁRIO */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col p-4 lg:p-6">
          
          {/* Navegação do Mês */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              <button onClick={() => irParaMes(-1)} className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors text-muted-foreground"><ChevronLeft className="w-5 h-5"/></button>
              <h2 className="text-lg font-bold min-w-[140px] text-center capitalize">{MESES[mesAtual.mes]} {mesAtual.ano}</h2>
              <button onClick={() => irParaMes(1)} className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors text-muted-foreground"><ChevronRight className="w-5 h-5"/></button>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg hover:border-muted-foreground transition-all">Hoje</button>
            </div>
          </div>

          {/* Grid de Dias */}
          <div className="flex-1 flex flex-col border border-[#1e1e1e] rounded-2xl overflow-hidden bg-[#161616]">
            {/* Header Dias da Semana */}
            <div className="grid grid-cols-7 bg-[#1a1a1a] border-b border-[#1e1e1e]">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{d}</div>
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
                      relative p-1 lg:p-2 border-r border-b border-[#1e1e1e] min-h-[80px] lg:min-h-0
                      ${!ehMêsAtual ? "bg-[#111] opacity-30" : "bg-transparent"}
                      ${ehHoje ? "bg-[#e87c2a]/5" : ""}
                    `}
                  >
                    <span className={`
                      text-xs font-mono mb-2 inline-block px-1.5 py-0.5 rounded
                      ${ehHoje ? "text-[#e87c2a] font-bold" : "text-muted-foreground"}
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
                              text-[9px] lg:text-[10px] px-2 py-1 rounded-md border border-white/5 truncate cursor-pointer hover:brightness-110 transition-all
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

        {/* SIDEBAR DIREITA (Desktop) */}
        <aside className="hidden lg:flex flex-col w-[320px] border-l border-[#1e1e1e] bg-[#111] p-6 space-y-8 overflow-y-auto">
          
          {/* Seção Equipe */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="w-3.5 h-3.5"/> Equipe
              </h3>
            </div>
            <div className="space-y-3">
              {equipe.slice(0, 6).map(m => (
                <button 
                  key={m.id}
                  onClick={() => setMembroFiltro(m.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all group ${membroFiltro === m.id ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-transparent border-transparent hover:bg-[#161616]"}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-[#2a2a2a]">
                      <AvatarImage src={m.foto_url} />
                      <AvatarFallback className="bg-[#222] text-[10px] font-bold text-muted-foreground">
                        {getInitials(m.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{m.nome.split(" ")[0]} {m.nome.split(" ").slice(-1)}</span>
                  </div>
                  <StatusBadge status={m.status || "ativo"} />
                </button>
              ))}
              <Button variant="ghost" className="w-full text-[10px] text-muted-foreground h-8 hover:bg-[#161616]">Ver todos os membros</Button>
            </div>
          </section>

          {/* Seção Próximos Eventos */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
              <Clock className="w-3.5 h-3.5"/> Próximos Eventos
            </h3>
            <div className="space-y-4">
              {proximosEventos.length === 0 ? (
                <p className="text-[11px] text-muted-foreground text-center py-4 italic">Sem eventos agendados</p>
              ) : (
                proximosEventos.map(ev => {
                  const cfg = (TIPO_CONFIG as any)[ev.tipo] || TIPO_CONFIG.outro
                  const d = new Date(ev.data + "T00:00:00")
                  return (
                    <div key={ev.id} className="relative pl-4 group cursor-pointer">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${cfg.dot}`} />
                      <p className="text-xs font-bold text-foreground group-hover:text-[#e87c2a] transition-colors">{ev.titulo}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                        <span>{d.getDate()}/{MESES[d.getMonth()].slice(0,3)}</span>
                        <span>•</span>
                        <span>{ev.hora_inicio}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* Seção Google Calendar Integration */}
          <section className="mt-auto">
            <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#4285F4]/5 rounded-full -mr-8 -mt-8 transition-all group-hover:scale-150 duration-500" />
              <h4 className="text-[11px] font-bold text-foreground mb-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#4285F4]"/> Google Calendar
              </h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Sincronização ativa. Todos os eventos são espelhados automaticamente.</p>
            </div>
          </section>

        </aside>

      </div>

      {/* Estilo Customizado para Scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
