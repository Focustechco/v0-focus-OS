"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useDashboard } from "@/lib/hooks/use-dashboard"
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Activity,
  Zap,
  ListTodo,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Clock,
  Briefcase
} from "lucide-react"

export function CommandCenter() {
  const { data, isLoading, isError, errorMessage } = useDashboard()
  const [sessionUser, setSessionUser] = useState<any>(null)
  const [greeting, setGreeting] = useState("Bom dia")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: perfil } = await supabase
          .from("perfil")
          .select("nome_completo, avatar_url")
          .eq("usuario_id", user.id)
          .maybeSingle()
        
        const name = perfil?.nome_completo || user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuário"
        const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
        
        setSessionUser({ 
          name, 
          initials: initials || "??",
          avatar_url: perfil?.avatar_url || null
        })
      }
    }
    loadUser()

    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Bom dia")
    else if (hour < 18) setGreeting("Boa tarde")
    else setGreeting("Boa noite")

    const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    setCurrentDate(new Intl.DateTimeFormat('pt-BR', opts).format(new Date()))
  }, [])

  if (isError) {
    return (
      <div className="rounded-[10px] border border-red-500/30 bg-red-500/10 p-[18px]">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-500">Erro ao carregar o dashboard</p>
            <p className="text-xs text-neutral-400 mt-1">{errorMessage || "Verifique a conexão com o servidor."}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-[10px] font-mono uppercase text-neutral-500 hover:text-foreground border border-border rounded px-3 py-1 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis || {}
  const projetos = data?.projetos || []
  const tarefasUrg = data?.tarefas_urgentes || []
  const tarefasStats = data?.tarefas_stats || {}
  const equipe = data?.equipe || []
  const equipeStats = data?.equipe_stats || {}
  const leads = data?.leads || []
  const leadsStats = data?.leads_stats || {}
  const aprovacoes = data?.aprovacoes || []
  const intelligence = data?.intelligence || ""

  return (
    <div className="space-y-6 pb-12 font-sans text-foreground">
      
      {/* 1. Header (Fixo no topo visual do dashboard) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border p-[18px] rounded-[10px] sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-primary font-mono font-bold text-lg select-none overflow-hidden">
            {sessionUser?.avatar_url ? (
               <img src={sessionUser.avatar_url} alt={sessionUser.name} className="w-full h-full object-cover" />
            ) : (
               sessionUser ? sessionUser.initials : "..."
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {greeting}, {sessionUser ? sessionUser.name : "Carregando..."}
            </h1>
            <p className="text-xs text-neutral-500 capitalize">{currentDate} · Focus Tecnologia</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-card border border-border text-neutral-400 font-mono text-[10px] py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 inline-block"></span>
            Sistema online
          </Badge>
          
          <Badge className={`border font-mono text-[10px] py-1 cursor-pointer transition-colors ${kpis.aprovacoes_pendentes > 0 ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20" : "bg-card border-border text-neutral-500"}`}>
            {kpis.aprovacoes_pendentes || 0} Aprovações Pendentes
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-card border border-border rounded-[10px]" />)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-card border border-border rounded-[10px]" />
              <div className="h-64 bg-card border border-border rounded-[10px]" />
           </div>
        </div>
      ) : (
        <>
          {/* 2. Bloco KPIs — linha superior (4 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard 
              title="Projetos Ativos" 
              value={kpis.projetos} 
              icon={FolderKanban} 
              subtext="Em andamento no portfólio" 
            />
            <KpiCard 
              title="Tarefas em Aberto" 
              value={kpis.tarefas_abertas} 
              icon={ListTodo} 
              subtext={<span className={kpis.tarefas_atrasadas > 0 ? "text-[#ef4444]" : ""}>{kpis.tarefas_atrasadas} em atraso</span>} 
            />
            <KpiCard 
              title="Sprints Ativas" 
              value={kpis.sprints_ativas} 
              icon={Zap} 
              subtext={`Próx. conclusão: ${kpis.proxima_sprint_fim}`} 
            />
            <KpiCard 
              title="Aprovações" 
              value={kpis.aprovacoes_pendentes} 
              icon={CheckCircle2} 
              valueColor={kpis.aprovacoes_pendentes > 0 ? "text-primary" : "text-foreground"}
              subtext="Aguardando liberação" 
            />
          </div>

          {/* 3. Grid Principal — linha do meio (2 colunas) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Projetos em andamento */}
            <Card className="bg-card border-border rounded-[10px]">
              <div className="p-[18px] border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-primary" /> Projetos em andamento
                </h2>
                <Link href="/projetos" className="text-[11px] font-mono text-neutral-500 hover:text-primary transition-colors">
                  Ver todos →
                </Link>
              </div>
              <div className="p-[18px] space-y-4">
                {projetos.length === 0 && <p className="text-xs text-neutral-600 text-center py-4">Nenhum projeto em andamento.</p>}
                {projetos.map((p: any) => (
                  <div key={p.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-200 group-hover:text-primary transition-colors">{p.name}</span>
                      <Badge variant="outline" className={`text-[9px] uppercase font-mono tracking-wider ${getStageBadgeColor(p.stage)}`}>
                        {p.stage || "GERAL"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress} className="h-[5px] bg-secondary flex-1 rounded-full [&>div]:rounded-full [&>div]:bg-primary" />
                      <span className="text-[9px] font-mono text-neutral-500 w-6 text-right">{p.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tarefas urgentes / atrasadas */}
               <Card className="bg-card border-border rounded-[10px] flex flex-col flex-1">
                 <div className="p-[18px] border-b border-border">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#ef4444]" /> Tarefas críticas
                </h2>
              </div>
              <div className="p-[18px] flex-1 space-y-3 overflow-y-auto min-h-[150px]">
                {tarefasUrg.length === 0 && <p className="text-xs text-neutral-600 text-center py-4">Sua pauta está limpa!</p>}
                {tarefasUrg.map((t: any) => (
                  <div key={t.id} className="p-3 bg-background border border-border rounded-[8px] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground mb-1 line-clamp-1">{t.titulo}</p>
                      <p className="text-[9px] text-neutral-500 font-mono uppercase truncate w-48">
                        {t.projeto} {t.sprint && `• ${t.sprint}`}
                      </p>
                    </div>
                    {t.isDelayed ? (
                      <Badge className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 text-[9px] uppercase font-mono">Atrasada</Badge>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border border-[#e05c00]/20 text-[9px] uppercase font-mono">Alta</Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-[18px] border-t border-border bg-card rounded-b-[10px]">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1 border-r border-border">
                    <p className="text-[9px] text-neutral-500 font-mono mb-1">EM PROGRESSO</p>
                    <p className="text-base font-bold text-foreground">{tarefasStats.in_progress}</p>
                  </div>
                  <div className="text-center flex-1 border-r border-border">
                    <p className="text-[9px] text-neutral-500 font-mono mb-1">REVISÃO</p>
                    <p className="text-base font-bold text-primary">{tarefasStats.review}</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[9px] text-neutral-500 font-mono mb-1">% MÊS</p>
                    <p className="text-base font-bold text-[#22c55e]">{tarefasStats.completed_month_percent}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 4. Grid Secundário — linha inferior (3 colunas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Equipe */}
            <Card className="bg-card border-border rounded-[10px] flex flex-col">
              <div className="p-[18px] border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Equipe · Ocupação
                </h2>
              </div>
              <div className="p-[18px] flex-1 space-y-3">
                 {equipe.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded bg-[#222] text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                         {m.iniciais}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                             <span className="text-[11px] text-foreground truncate pr-2">{m.nome}</span>
                             <span className="text-[9px] font-mono text-neutral-500">{m.ocupacao_percent}%</span>
                          </div>
                          <Progress 
                            value={m.ocupacao_percent} 
                            className={`h-[5px] bg-[#222] rounded-full [&>div]:rounded-full ${m.ocupacao_percent > 80 ? '[&>div]:bg-[#ef4444]' : m.ocupacao_percent >= 60 ? '[&>div]:bg-primary' : '[&>div]:bg-[#22c55e]'}`} 
                          />
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-3 border-t border-border flex justify-between bg-secondary rounded-b-[10px] text-[10px] font-mono">
                 <span className="text-neutral-500">Membros ativos: <strong className="text-foreground font-sans">{equipeStats.total}</strong></span>
                 <span className="text-neutral-500">Capacidade média: <strong className="text-foreground font-sans">{equipeStats.avg_capacity}%</strong></span>
              </div>
            </Card>

            {/* Comercial */}
               <Card className="bg-card border-border rounded-[10px] flex flex-col flex-1">
                 <div className="p-[18px] border-b border-border">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Comercial · Pipeline
                </h2>
              </div>
              <div className="p-[18px] flex-1 space-y-3">
                 {leads.length === 0 && <p className="text-xs text-neutral-600 text-center">Nenhum lead em negociação.</p>}
                 {leads.map((l: any) => (
                   <div key={l.id} className="p-3 rounded-[8px] bg-secondary border border-border flex items-center justify-between">
                      <span className="text-xs text-neutral-200 font-medium truncate pr-2">{l.nome}</span>
                      <Badge className="bg-card text-[#22c55e] border border-[#22c55e]/20 text-[9px] uppercase font-mono shrink-0">
                        {l.status}
                      </Badge>
                   </div>
                 ))}
              </div>
              <div className="p-3 border-t border-border bg-secondary rounded-b-[10px] flex justify-around text-[9px] font-mono text-center">
                 <div>
                    <p className="text-neutral-500 mb-0.5">ATIVOS</p>
                    <p className="text-foreground font-sans font-bold text-sm">{leadsStats.ativos}</p>
                 </div>
                 <div>
                    <p className="text-neutral-500 mb-0.5">NEGOCIAÇÃO</p>
                    <p className="text-primary font-sans font-bold text-sm">{leadsStats.negociacao}</p>
                 </div>
                 <div>
                    <p className="text-neutral-500 mb-0.5">NOVOS MÊS</p>
                    <p className="text-[#22c55e] font-sans font-bold text-sm">{leadsStats.novos_mes}</p>
                 </div>
              </div>
            </Card>

            {/* Aprovações + Intelligence */}
            <div className="flex flex-col gap-4">
               {/* Aprovações */}
               <Card className="bg-card border-border rounded-[10px] flex flex-col flex-1">
                 <div className="p-[18px] border-b border-border">
                    <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Fila de Aprovações
                    </h2>
                 </div>
                 <div className="p-[18px] space-y-3">
                    {aprovacoes.length === 0 && <p className="text-xs text-neutral-600 text-center">Tudo liberado!</p>}
                    {aprovacoes.map((a: any) => (
                      <div key={a.id} className="flex gap-3 items-start relative px-3 py-2 -mx-3 hover:bg-secondary transition-colors rounded">
                         <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-primary" />
                         <div>
                            <p className="text-xs text-foreground font-medium mb-0.5">{a.titulo}</p>
                            <p className="text-[9px] font-mono text-neutral-500 uppercase">{a.projeto || "Geral"}</p>
                         </div>
                      </div>
                    ))}
                 </div>
                 {kpis.aprovacoes_pendentes > 3 && (
                   <div className="mt-auto px-[18px] pb-[18px]">
                     <Link href="/projetos?tab=aprovacoes" className="block w-full py-2 text-center text-[10px] font-mono text-neutral-500 border border-border rounded hover:border-[#e05c00]/30 hover:text-primary transition-colors">
                        +{kpis.aprovacoes_pendentes - 3} Ocultas
                     </Link>
                   </div>
                 )}
               </Card>

               {/* Intelligence Box */}
               <Card className="bg-gradient-to-br from-card to-background border-border rounded-[10px] relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#e05c00] to-transparent opacity-50" />
                 <div className="p-[18px]">
                    <div className="flex items-center gap-2 mb-2">
                       <BrainCircuit className="w-4 h-4 text-primary" />
                       <h3 className="text-[10px] font-mono tracking-widest text-foreground uppercase">Intelligence</h3>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed italic">"{intelligence}"</p>
                 </div>
               </Card>
            </div>

          </div>
        </>
      )}

    </div>
  )
}

function KpiCard({ title, value, icon: Icon, subtext, valueColor = "text-foreground" }: any) {
  return (
    <Card className="bg-card border-border rounded-[10px] flex flex-col p-[18px]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-mono text-neutral-500 uppercase">{title}</h3>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className={`text-4xl font-bold font-display ${valueColor}`}>{value}</p>
      {subtext && <p className="text-[10px] text-neutral-500 mt-2 font-mono">{subtext}</p>}
    </Card>
  )
}

function getStageBadgeColor(stage: string) {
  const s = (stage || "").toLowerCase()
  if (s.includes('mvp')) return 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
  if (s.includes('diagn')) return 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
  if (s.includes('prop')) return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
  return 'bg-secondary text-neutral-400 border border-border'
}
