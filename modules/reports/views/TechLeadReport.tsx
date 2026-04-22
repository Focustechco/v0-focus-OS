import React from 'react'
import { DadosRelatorioTechLead } from '../types/report.types'
import { KPIGrid, KPICard } from '../components/KPIGrid'
import { Microscope, CheckSquare, Clock, UserX, AlertCircle, CheckCircle2, ChevronRight, ChevronDown } from 'lucide-react'

interface TechLeadReportProps {
  dados: DadosRelatorioTechLead
}

export default function TechLeadReport({ dados }: TechLeadReportProps) {
  const [openMembers, setOpenMembers] = React.useState<Record<string, boolean>>({})

  const toggleMember = (id: string) => {
    setOpenMembers(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. Banner */}
      <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#a855f7]/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Microscope className="w-6 h-6 text-[#a855f7]" />
        </div>
        <div>
          <div className="text-[#a855f7] text-xs font-mono font-bold tracking-wider mb-1 uppercase">
            Painel Exclusivo Tech Lead
          </div>
          <h2 className="text-xl font-display font-bold text-white">Análise e Aprovações</h2>
          <p className="text-sm text-neutral-400 mt-1">Visão técnica aprofundada de gargalos, aprovações de PRs e saúde individual da equipe.</p>
        </div>
      </div>

      {/* 2. KPIs */}
      <KPIGrid>
        <KPICard 
          title="Fila de Aprovações" 
          value={dados.kpis.itensAguardandoAprovacao} 
          icon={<CheckSquare className="w-5 h-5 text-[#a855f7]" />}
          subtitle={`${dados.kpis.aprovacoesUrgentes} urgentes, ${dados.kpis.aprovacoesNormais} normais`}
        />
        <KPICard 
          title="Concluídas" 
          value={dados.kpis.aprovacoesConcluidas} 
          icon={<CheckCircle2 className="w-5 h-5 text-[#22c55e]" />}
          subtitle="Aprovações realizadas"
        />
        <KPICard 
          title="Tasks no Prazo (%)" 
          value={`${dados.kpis.percentTasksNoPrazo}%`} 
          icon={<Clock className="w-5 h-5 text-[#3b82f6]" />}
          subtitle={<div className="flex gap-1 mt-2 items-center"><div className="flex-1 bg-[#1f1f1f] h-1.5 rounded-full overflow-hidden"><div className="bg-[#3b82f6] h-full" style={{width: `${dados.kpis.percentTasksNoPrazo}%`}} /></div></div>}
        />
        <KPICard 
          title="Membros em Risco" 
          value={dados.kpis.membrosEmRisco} 
          icon={<UserX className={`w-5 h-5 ${dados.kpis.membrosEmRisco > 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'}`} />}
          subtitle={dados.kpis.membrosEmRisco > 0 ? "Análise de carga sugerida" : "Equipe equilibrada"}
        />
      </KPIGrid>

      {/* 3. Approval Queue */}
      <div className="mb-8">
        <h3 className="text-sm font-display font-medium text-white mb-4">Aguardando Avaliação do Tech Lead</h3>
        <div className="space-y-3">
          {dados.filasAprovacao.map((item) => (
            <div key={item.id} className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-1 h-full ${item.urgencia === 'urgente' ? 'bg-[#ef4444]' : 'bg-[#a855f7]'}`} />
               <div className="pl-3">
                 <div className="flex items-center gap-2 mb-1">
                   <h4 className="font-medium text-white text-sm">{item.titulo}</h4>
                   {item.urgencia === 'urgente' && <span className="bg-[#ef4444]/20 text-[#ef4444] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Urgente</span>}
                 </div>
                 <p className="text-xs text-neutral-400 mb-2">{item.descricao}</p>
                 <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
                   <span>Por: {item.submissaoPor}</span>
                   <span>·</span>
                   <span>{item.storyPoints} pts</span>
                 </div>
               </div>
               <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                 <button className="flex-1 md:flex-none border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-md px-4 py-2 text-xs font-medium transition-colors">
                   Rejeitar / Revisar
                 </button>
                 <button className="flex-1 md:flex-none bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-md px-4 py-2 text-xs font-medium transition-colors border border-[#a855f7]">
                   Aprovar (Merge)
                 </button>
               </div>
            </div>
          ))}
          {dados.filasAprovacao.length === 0 && (
             <div className="text-sm text-neutral-500 italic p-6 text-center bg-[#141414] border border-[#1f1f1f] rounded-xl flex flex-col items-center gap-2">
               <CheckCircle2 className="w-8 h-8 text-[#22c55e]/50 mb-2" />
               <p>Fila zerada. Todas as requisições técnicas de {dados.projeto.nome} foram resolvidas.</p>
             </div>
          )}
        </div>
      </div>

    </div>
  )
}
