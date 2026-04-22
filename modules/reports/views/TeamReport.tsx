import React from 'react'
import { DadosRelatorioEquipe } from '../types/report.types'
import { KPIGrid, KPICard } from '../components/KPIGrid'
import { TrendingUp, ListTodo, Flame, ShieldAlert, ChevronDown, ChevronRight } from 'lucide-react'

interface TeamReportProps {
  dados: DadosRelatorioEquipe
  tasks?: any[]
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  concluida:    { label: 'Concluída',    cls: 'bg-[#22c55e]/10 text-[#22c55e]' },
  em_andamento: { label: 'Em andamento', cls: 'bg-[#3b82f6]/10 text-[#3b82f6]' },
  bloqueada:    { label: 'Bloqueada',    cls: 'bg-[#ef4444]/10 text-[#ef4444]' },
  a_fazer:      { label: 'A fazer',      cls: 'bg-[#f59e0b]/10 text-[#f59e0b]' },
}

const PRIORIDADE_DOT: Record<string, string> = {
  alta:  'bg-[#ef4444]',
  media: 'bg-[#f59e0b]',
  baixa: 'bg-[#22c55e]',
}

export default function TeamReport({ dados, tasks = [] }: TeamReportProps) {
  const [openSprints, setOpenSprints] = React.useState<Record<string, boolean>>(
    // Abre todas as sprints por padrão
    () => Object.fromEntries(dados.sprintsFiltradas.map((s: any) => [s.id, true]))
  )

  const toggleSprint = (id: string) => {
    setOpenSprints(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="p-6 pb-20 max-w-7xl mx-auto animate-in fade-in duration-500">

      {/* 1. Banner */}
      <div className="bg-[#f97316]/10 border border-[#f97316]/20 rounded-xl p-6 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#f97316]/20 rounded-full flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-6 h-6 text-[#f97316]" />
        </div>
        <div>
          <div className="text-[#f97316] text-xs font-mono font-bold tracking-wider mb-1 uppercase">
            Relatório Interno da Equipe
          </div>
          <h2 className="text-xl font-display font-bold text-white">{dados.projeto.nome}</h2>
          <p className="text-sm text-neutral-400 mt-1">Uso restrito à equipe técnica. Contém métricas e dados sensíveis do andamento.</p>
        </div>
      </div>

      {/* 2. KPIs Técnico */}
      <KPIGrid>
        <KPICard
          title="Story Points Entregues"
          value={dados.kpis.storyPointsEntregues}
          icon={<TrendingUp className="w-5 h-5 text-[#f97316]" />}
          subtitle={<div className="flex gap-1 mt-2">{dados.velocidadePorSprint.map((s, i) => <div key={i} title={s.sprint} className="flex-1 bg-[#f97316] h-1.5 rounded-full" style={{opacity: 0.3 + (i * 0.2)}} />)}</div>}
        />
        <KPICard
          title="Status Tarefas"
          value={`${dados.kpis.tarefasConcluidas} Done`}
          icon={<ListTodo className="w-5 h-5 text-[#3b82f6]" />}
          subtitle={<div className="text-sm text-neutral-400 mt-1">{dados.kpis.tarefasEmProgresso} em progresso, {dados.kpis.tarefasBloqueadas} bloqueadas</div>}
        />
        <KPICard
          title="Burndown Restante"
          value={`${dados.kpis.burndownRestante} pts`}
          icon={<Flame className="w-5 h-5 text-[#f59e0b]" />}
          subtitle={`${dados.kpis.percentualPeriodoConsumido}% do período consumido`}
        />
        <KPICard
          title="Bloqueios / Riscos"
          value={dados.kpis.tarefasBloqueadas}
          icon={<ShieldAlert className={`w-5 h-5 ${dados.kpis.tarefasBloqueadas > 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'}`} />}
          subtitle={dados.kpis.tarefasBloqueadas === 0 ? "Fluxo limpo, sem impedimentos" : "Atenção necessária"}
        />
      </KPIGrid>

      {/* 3. Sprint Task List */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-sm font-display font-medium text-white">Tarefas por Sprint</h3>
          <span className="text-[10px] bg-[#1f1f1f] text-neutral-400 px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-[#333]">
            Source: projetos.sprints
          </span>
        </div>

        <div className="space-y-4">
          {dados.sprintsFiltradas.map((sprint: any, idx: number) => {
            const sprintTasks = tasks.filter((t: any) => t.sprint_id === sprint.id)
            const concluidas = sprintTasks.filter((t: any) => t.status === 'concluida').length
            const progress = sprintTasks.length > 0 ? Math.round((concluidas / sprintTasks.length) * 100) : 0

            return (
              <div key={sprint.id || idx} className="bg-[#141414] border border-[#1f1f1f] rounded-xl overflow-hidden">
                {/* Header da sprint */}
                <div
                  className="p-4 bg-[#1a1a1a] border-b border-[#1f1f1f] flex justify-between items-center cursor-pointer hover:bg-[#252525] transition-colors"
                  onClick={() => toggleSprint(sprint.id)}
                >
                  <div className="flex items-center gap-3">
                    {openSprints[sprint.id]
                      ? <ChevronDown className="w-4 h-4 text-neutral-500" />
                      : <ChevronRight className="w-4 h-4 text-neutral-500" />
                    }
                    <div className="font-medium text-white">{sprint.nome}</div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                      sprint.status === 'ativa' ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-[#1f1f1f] text-neutral-400'
                    }`}>
                      {sprint.status}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">{sprintTasks.length} tarefa{sprintTasks.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                    <span>
                      {sprint.data_inicio ? new Date(sprint.data_inicio).toLocaleDateString('pt-BR') : '—'}
                      {' - '}
                      {sprint.data_fim ? new Date(sprint.data_fim).toLocaleDateString('pt-BR') : '—'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[#080808] h-1.5 rounded-full overflow-hidden border border-[#333]">
                        <div className="bg-[#f97316] h-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[#f97316]">{progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Tarefas da sprint */}
                {openSprints[sprint.id] && (
                  <div className="divide-y divide-[#1f1f1f]">
                    {sprintTasks.length === 0 ? (
                      <div className="p-6 text-sm text-neutral-500 italic text-center">
                        Nenhuma tarefa vinculada a esta sprint.
                      </div>
                    ) : (
                      sprintTasks.map((task: any) => {
                        const statusCfg = STATUS_LABEL[task.status] || { label: task.status, cls: 'bg-[#1f1f1f] text-neutral-400' }
                        const dotCls = PRIORIDADE_DOT[task.prioridade] || 'bg-neutral-500'
                        return (
                          <div key={task.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#1a1a1a]/60 transition-colors">
                            {/* Prioridade dot */}
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} title={`Prioridade: ${task.prioridade}`} />

                            {/* Título */}
                            <span className={`flex-1 text-sm ${task.status === 'concluida' ? 'line-through text-neutral-500' : 'text-white'}`}>
                              {task.titulo}
                            </span>

                            {/* Prazo */}
                            {task.prazo && (
                              <span className="text-xs font-mono text-neutral-500 hidden sm:block">
                                {new Date(task.prazo).toLocaleDateString('pt-BR')}
                              </span>
                            )}

                            {/* Status badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${statusCfg.cls}`}>
                              {statusCfg.label}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {dados.sprintsFiltradas.length === 0 && (
            <div className="text-sm text-neutral-500 italic p-6 text-center bg-[#141414] border border-[#1f1f1f] rounded-xl">
              Nenhuma sprint encontrada com os filtros atuais no banco de dados.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
