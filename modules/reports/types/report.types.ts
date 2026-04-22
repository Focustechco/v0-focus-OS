export type TipoRelatorio = 'cliente' | 'equipe' | 'techlead'

export interface FiltrosRelatorio {
  projetoId: string
  sprintId: 'all' | string
  periodo: { mes: number; ano: number }
  tipo: TipoRelatorio
}

export interface ItemAprovacao {
  id: string
  titulo: string
  descricao: string
  submissaoPor: string
  submissaoEm: Date
  urgencia: 'urgente' | 'normal'
  status: 'pendente' | 'aprovado' | 'rejeitado'
  storyPoints: number
  sprintId: string
}

export interface DadosRelatorioCliente {
  projeto: {
    id: string
    nome: string
    cliente: string
    progressoGeral: number
    saude: 'no_prazo' | 'em_risco' | 'atrasado'
  }
  sprintAtual: any | null
  kpis: {
    progressoGeral: number
    entregasConcluidas: number
    totalEntregas: number
    diasRestantesSprintAtual: number
    riscosAtivos: { alto: number; medio: number }
  }
  resumoExecutivo: string
  entregas: any[]
  proximosMarcos: Array<{
    titulo: string
    data: Date
    sprint: string
    status: 'proximo' | 'planejado' | 'futuro' | 'concluido'
  }>
  geradoEm: Date
}

export interface DadosRelatorioEquipe {
  projeto: any
  sprintsFiltradas: any[]
  tasks: any[]
  kpis: {
    storyPointsEntregues: number
    tarefasConcluidas: number
    tarefasEmProgresso: number
    tarefasBloqueadas: number
    burndownRestante: number
    percentualPeriodoConsumido: number
  }
  velocidadePorSprint: Array<{ sprint: string; pontos: number }>
  riscos: any[]
  geradoEm: Date
}

export interface DadosRelatorioTechLead {
  projeto: any
  todosOsProjetos: Array<{
    id: string
    nome: string
    progresso: number
    saude: 'no_prazo' | 'em_risco' | 'atrasado'
    sprintAtual: string
    totalSprints: number
    prazoFinal: Date | null
  }>
  kpis: {
    itensAguardandoAprovacao: number
    aprovacoesUrgentes: number
    aprovacoesNormais: number
    aprovacoesConcluidas: number
    percentTasksNoPrazo: number
    membrosEmRisco: number
  }
  filasAprovacao: ItemAprovacao[]
  desempenhoMembros: any[]
  tarefasPorMembro: Array<{
    membro: any
    tarefas: any[]
  }>
  geradoEm: Date
}
