import { useMemo } from 'react'
import { useProjects } from '@/lib/hooks/use-projetos'
import { useSprints } from '@/lib/hooks/use-sprints'
import { useTasks } from '@/lib/hooks/use-tarefas'
import { useEquipe } from '@/lib/hooks/use-equipe'
import { useApprovals } from '@/lib/hooks/use-aprovacoes'
import type { FiltrosRelatorio, DadosRelatorioCliente, DadosRelatorioEquipe, DadosRelatorioTechLead, ItemAprovacao } from '../types/report.types'

export function useReportData(filtros: FiltrosRelatorio) {
  const { projects, isLoading: loadP } = useProjects()
  const projeto = useMemo(() => projects.find((p: any) => p.id === filtros.projetoId) || null, [projects, filtros.projetoId])

  const { sprints, isLoading: loadS } = useSprints(filtros.projetoId || undefined)
  const { tasks, isLoading: loadT } = useTasks(undefined, filtros.projetoId || undefined)
  const { equipe, isLoading: loadE } = useEquipe()
  const { aprovacoes, isLoading: loadA } = useApprovals()

  const isLoading = loadP || loadS || loadT || loadE || loadA

  // Adicionar data de simulacao de projeto se necessario, mas como estamos no banco real, usamos os dados
  const sprintsFiltradas = useMemo(() => {
    if (!projeto) return []
    if (filtros.sprintId === 'all') return sprints || []
    return (sprints || []).filter((s: any) => s.id === filtros.sprintId)
  }, [projeto, sprints, filtros.sprintId])

  const sprintAtual = useMemo(() => sprints.find((s: any) => s.status === 'ativa') ?? sprints[0] ?? null, [sprints])

  const dadosCliente = useMemo((): DadosRelatorioCliente | null => {
    if (!projeto || filtros.tipo !== 'cliente') return null


    // Entregas mockadas a partir das tarefas para o cliente ver
    // Vamos considerar tasks da sprint atual como entregas
    const todasEntregas = sprintsFiltradas.flatMap((s: any) => {
      const tarefasDaSprint = tasks.filter((t: any) => t.sprint_id === s.id)
      return tarefasDaSprint.map((t: any) => ({
        id: t.id,
        titulo: t.titulo,
        status: t.status === 'concluida' ? 'entregue' : t.status === 'in_progress' ? 'em_revisao' : 'pendente',
        dataPrevista: t.prazo ? new Date(t.prazo) : new Date(s.data_fim),
        dataConclusao: t.status === 'concluida' ? new Date() : undefined,
        sprintId: s.id,
        visivelCliente: true
      }))
    })

    const entregasCliente = todasEntregas.filter((e: any) => e.visivelCliente)
    const entregasConcluidas = entregasCliente.filter((e: any) => e.status === 'entregue').length

    return {
      projeto: {
        id: projeto.id, 
        nome: projeto.nome, 
        cliente: projeto.clientes?.nome || 'Cliente não informado',
        progressoGeral: projeto.progresso || 0, 
        saude: projeto.progresso >= 50 ? 'no_prazo' : 'em_risco' // logica mockada para saude
      },
      sprintAtual,
      kpis: {
        progressoGeral: projeto.progresso || 0,
        entregasConcluidas,
        totalEntregas: entregasCliente.length || 1, // evitar div 0 visual
        diasRestantesSprintAtual: sprintAtual?.data_fim
          ? Math.max(0, Math.ceil((new Date(sprintAtual.data_fim).getTime() - Date.now()) / 86400000))
          : 0,
        riscosAtivos: { alto: 0, medio: 0 } // Mock since DB doesn't have riscos array easily
      },
      resumoExecutivo: '',
      entregas: entregasCliente,
      proximosMarcos: [
        { titulo: "Fechamento da Sprint", data: sprintAtual?.data_fim ? new Date(sprintAtual.data_fim) : new Date(), sprint: sprintAtual?.nome || "", status: "proximo" }
      ],
      geradoEm: new Date()
    }
  }, [projeto, sprints, sprintsFiltradas, tasks, filtros.tipo])

  const dadosEquipe = useMemo((): DadosRelatorioEquipe | null => {
    if (!projeto || filtros.tipo !== 'equipe') return null

    const todasTarefasFiltradas = tasks.filter((t: any) => {
      if (filtros.sprintId === 'all') return true;
      return t.sprint_id === filtros.sprintId;
    })

    const tarefasConcluidas = todasTarefasFiltradas.filter((t: any) => t.status === 'concluida').length
    const tarefasEmProgresso = todasTarefasFiltradas.filter((t: any) => t.status === 'em_andamento').length
    const tarefasBloqueadas = todasTarefasFiltradas.filter((t: any) => t.status === 'bloqueada').length

    return {
      projeto,
      sprintsFiltradas,
      tasks: todasTarefasFiltradas,
      kpis: {
        storyPointsEntregues: tarefasConcluidas * 5,
        tarefasConcluidas,
        tarefasEmProgresso,
        tarefasBloqueadas,
        burndownRestante: (todasTarefasFiltradas.length - tarefasConcluidas) * 5,
        percentualPeriodoConsumido: sprintAtual?.data_fim ? 50 : 0,
      },
      velocidadePorSprint: sprints.map((s: any) => ({ sprint: s.nome, pontos: tasks.filter((t: any) => t.sprint_id === s.id && t.status === 'concluida').length * 5 })),
      riscos: [],
      geradoEm: new Date()
    }
  }, [projeto, sprints, sprintsFiltradas, tasks, filtros.tipo, sprintAtual])

  const dadosTechLead = useMemo((): DadosRelatorioTechLead | null => {
    if (!projeto || filtros.tipo !== 'techlead') return null

    const itensInReview = aprovacoes.filter((a: any) => a.projeto_id === projeto.id && a.status === 'pendente')
    const filasAprovacao: ItemAprovacao[] = itensInReview.map((a: any) => ({
      id: a.id,
      titulo: a.titulo,
      descricao: a.descricao || "Aprovação pendente",
      submissaoPor: equipe.find((e: any) => e.id === a.assigned_to)?.nome || "Membro da equipe",
      submissaoEm: new Date(a.created_at),
      urgencia: a.priority === 'high' ? 'urgente' : 'normal',
      status: a.status as 'pendente',
      storyPoints: Math.floor(Math.random() * 8) + 1,
      sprintId: a.tarefa_id || 'unassigned' // hack
    }))

    const membrosDoProjeto = equipe // we would filter by project assignments here if we had them explicit

    return {
      projeto,
      todosOsProjetos: projects.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        progresso: p.progresso || 0,
        saude: (p.progresso || 0) >= 50 ? 'no_prazo' : 'em_risco',
        sprintAtual: 'Verificar',
        totalSprints: 0,
        prazoFinal: p.prazo ? new Date(p.prazo) : null
      })),
      kpis: {
        itensAguardandoAprovacao: itensInReview.length,
        aprovacoesUrgentes: filasAprovacao.filter(a => a.urgencia === 'urgente').length,
        aprovacoesNormais: filasAprovacao.filter(a => a.urgencia === 'normal').length,
        aprovacoesConcluidas: aprovacoes.filter((a: any) => a.projeto_id === projeto.id && a.status === 'aprovado').length,
        percentTasksNoPrazo: 85, // mock 
        membrosEmRisco: 0,
      },
      filasAprovacao,
      desempenhoMembros: membrosDoProjeto,
      tarefasPorMembro: membrosDoProjeto.map((m: any) => ({
        membro: m,
        tarefas: tasks.filter((t: any) => t.responsavel_id === m.id && t.projeto_id === projeto.id)
      })).filter(item => item.tarefas.length > 0),
      geradoEm: new Date()
    }
  }, [projeto, projects, sprints, sprintsFiltradas, tasks, equipe, aprovacoes, filtros.tipo])

  return { dadosCliente, dadosEquipe, dadosTechLead, projeto, sprintsFiltradas, isLoading }
}
