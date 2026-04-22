import React, { useState } from 'react'
import { DadosRelatorioCliente } from '../types/report.types'
import { KPIGrid, KPICard } from '../components/KPIGrid'
import { Activity, CheckCircle, Clock, AlertTriangle, RefreshCw, Edit2, Save } from 'lucide-react'

interface ClientReportProps {
  dados: DadosRelatorioCliente
}

export default function ClientReport({ dados }: ClientReportProps) {
  const [summary, setSummary] = useState("O projeto segue em bom ritmo. Entregas principais deste período focaram na infraestrutura inicial.")
  const [isEditing, setIsEditing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleRegenerate = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setSummary("Resumo atualizado: O projeto está no prazo. Finalizamos as entregas críticas e a próxima etapa está pronta para iniciar. Nenhum bloqueio no momento.")
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. Banner */}
      <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-[#3b82f6] text-xs font-mono font-bold tracking-wider mb-1 uppercase">
            Relatório Executivo Cliente
          </div>
          <h2 className="text-xl font-display font-bold text-white">{dados.projeto.nome}</h2>
        </div>
        <div className="flex flex-col sm:items-end text-sm text-neutral-400 space-y-1">
          <div><span className="text-neutral-500">Sprint:</span> {dados.sprintAtual?.nome || 'N/A'}</div>
          <div><span className="text-neutral-500">Gerado em:</span> {dados.geradoEm.toLocaleDateString('pt-BR')}</div>
          <div className="mt-1">
            <span className={`px-2 py-1 bg-[#141414] border border-[#1f1f1f] rounded text-xs font-medium ${dados.projeto.saude === 'no_prazo' ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>
              {dados.projeto.saude === 'no_prazo' ? 'NO PRAZO' : 'EM RISCO'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KPIs */}
      <KPIGrid>
        <KPICard 
          title="Progresso Geral" 
          value={`${dados.kpis.progressoGeral}%`} 
          icon={<Activity className="w-5 h-5 text-[#3b82f6]" />}
          subtitle={<div className="w-full bg-[#1f1f1f] h-1.5 mt-2 rounded-full overflow-hidden"><div className="bg-[#3b82f6] h-full" style={{width: `${dados.kpis.progressoGeral}%`}} /></div>}
        />
        <KPICard 
          title="Entregas" 
          value={`${dados.kpis.entregasConcluidas}/${dados.kpis.totalEntregas}`} 
          icon={<CheckCircle className="w-5 h-5 text-[#22c55e]" />}
          subtitle={<div className="w-full bg-[#1f1f1f] h-1.5 mt-2 rounded-full overflow-hidden"><div className="bg-[#22c55e] h-full" style={{width: `${(dados.kpis.entregasConcluidas / dados.kpis.totalEntregas) * 100}%`}} /></div>}
        />
        <KPICard 
          title="Sprint Atual" 
          value={dados.sprintAtual?.nome || '—'} 
          icon={<Clock className="w-5 h-5 text-[#f59e0b]" />}
          subtitle={`${dados.kpis.diasRestantesSprintAtual} dias restantes`}
        />
        <KPICard 
          title="Saúde / Riscos" 
          value={`${dados.kpis.riscosAtivos.alto + dados.kpis.riscosAtivos.medio} alertas`} 
          icon={<AlertTriangle className={`w-5 h-5 ${dados.kpis.riscosAtivos.alto > 0 ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`} />}
          subtitle={`${dados.kpis.riscosAtivos.alto} alto, ${dados.kpis.riscosAtivos.medio} médio`}
        />
      </KPIGrid>

      {/* 3. Executive Summary */}
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6 mb-8 group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-display font-medium text-white flex items-center gap-2">
            Resumo Executivo
            <span className="text-[10px] bg-[#1f1f1f] text-neutral-400 px-2 py-0.5 rounded uppercase tracking-wider font-mono">IA</span>
          </h3>
          <div className="flex gap-2">
            <button onClick={handleRegenerate} disabled={isGenerating} className="text-neutral-500 hover:text-[#3b82f6] transition-colors p-1" title="Regerar com IA">
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setIsEditing(!isEditing)} className="text-neutral-500 hover:text-white transition-colors p-1" title="Editar">
              {isEditing ? <Save className="w-4 h-4 text-[#22c55e]" /> : <Edit2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <textarea 
            className="w-full bg-[#1a1a1a] border border-[#333] text-white p-4 rounded-lg resize-none focus:outline-none focus:border-[#3b82f6]"
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        ) : (
          <p className="text-neutral-300 leading-relaxed text-sm">
            {summary}
          </p>
        )}
        <p className="text-[10px] text-neutral-600 mt-4 uppercase tracking-wider">Por favor, revise este resumo antes de enviar ao cliente.</p>
      </div>

      {/* 4. Milestone Timeline */}
      <div className="mb-8">
        <h3 className="text-sm font-display font-medium text-white mb-6">Próximos Marcos</h3>
        <div className="flex gap-4">
          {dados.proximosMarcos.map((marco, i) => (
             <div key={i} className="flex-1 bg-[#141414] border border-[#1f1f1f] rounded-xl p-5 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${marco.status === 'proximo' ? 'bg-[#f97316]' : 'bg-[#3b82f6]'}`} />
                <div className="text-xs font-mono text-neutral-500 mb-2">{marco.data.toLocaleDateString('pt-BR')}</div>
                <div className="font-medium text-white text-sm mb-1">{marco.titulo}</div>
                <div className="text-xs text-neutral-400">{marco.sprint}</div>
             </div>
          ))}
          {dados.proximosMarcos.length === 0 && (
             <div className="text-sm text-neutral-500 italic p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl w-full text-center">Nenhum marco pendente identificado.</div>
          )}
        </div>
      </div>

      {/* 5. Deliverables List */}
      <div>
        <h3 className="text-sm font-display font-medium text-white mb-4">Entregas do Período</h3>
        <div className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a1a] border-b border-[#1f1f1f] text-xs font-mono text-neutral-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-normal">Entrega</th>
                <th className="px-6 py-4 font-normal">Previsto Para</th>
                <th className="px-6 py-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {dados.entregas.map((e, idx) => (
                <tr key={e.id || idx} className="hover:bg-[#1a1a1a]/50 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{e.titulo}</td>
                  <td className="px-6 py-4 text-neutral-400">{e.dataPrevista?.toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      e.status === 'entregue' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 
                      e.status === 'em_revisao' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 
                      'bg-[#f59e0b]/10 text-[#f59e0b]'
                    }`}>
                      {e.status === 'entregue' ? 'Concluída' : e.status === 'em_revisao' ? 'Revisão' : 'Em andamento'}
                    </span>
                  </td>
                </tr>
              ))}
              {dados.entregas.length === 0 && (
                <tr>
                   <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">Nenhuma entrega visível para o cliente identificada neste período.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
