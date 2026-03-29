// Tipos do sistema de Relatorios de Projeto - Focus OS

export interface ProjectReport {
  id: string
  projectId: string
  projectName: string
  clientName: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'exported'
  exportedAs?: 'pdf' | 'google_docs'

  config: ReportConfig
  content: ReportContent
}

export interface ReportConfig {
  period: 'today' | '7d' | '15d' | 'month' | 'custom'
  periodStart: Date
  periodEnd: Date
  reportType: 'progress' | 'sprint' | 'complete'
  clientName: string
  clientRole: string
  clientCompany: string
  preparedBy: string
  includeFocusLogo: boolean
  includeClientLogo: boolean
  clientLogoUrl?: string
  sections: SectionConfig[]
}

export interface SectionConfig {
  id: string
  name: string
  enabled: boolean
}

export interface ReportContent {
  executiveSummary: string
  tags: string[]
  currentStatus: ProjectStatus
  activities: Activity[]
  sprints: SprintReport[]
  nextSteps: NextStep[]
  teamNotes: string
  includeTeamNotes: boolean
}

export interface ProjectStatus {
  stage: string
  stageColor: string
  progress: number
  health: 'on_track' | 'at_risk' | 'delayed'
  deliveryDate: Date
  observation: string
}

export interface Activity {
  id: string
  date: Date
  description: string
  included: boolean
  addedManually: boolean
}

export interface SprintReport {
  sprintId: string
  sprintName: string
  sprintNumber: number
  periodStart: Date
  periodEnd: Date
  status: 'completed' | 'in_progress' | 'planned'
  tasks: SprintTask[]
  velocity: { completed: number; total: number }
  observation: string
}

export interface SprintTask {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'moved'
  included: boolean
}

export interface NextStep {
  id: string
  description: string
  responsible: string
  deadline: string
  order: number
}

// Secoes disponiveis para o relatorio
export const REPORT_SECTIONS: SectionConfig[] = [
  { id: 'executive_summary', name: 'Resumo Executivo', enabled: true },
  { id: 'current_status', name: 'Status Atual', enabled: true },
  { id: 'activities', name: 'Atividades do Periodo', enabled: true },
  { id: 'sprints', name: 'Sprints & Entregas', enabled: true },
  { id: 'tasks_detailed', name: 'Tasks Detalhadas', enabled: false },
  { id: 'next_steps', name: 'Proximos Passos', enabled: true },
  { id: 'metrics', name: 'Metricas Tecnicas', enabled: false },
  { id: 'team_notes', name: 'Observacoes da Equipe', enabled: true },
]

// Tipos de relatorio
export const REPORT_TYPES = [
  { id: 'progress', name: 'Relatorio de Progresso', description: 'Para cliente' },
  { id: 'sprint', name: 'Relatorio de Sprint', description: 'Tecnico interno' },
  { id: 'complete', name: 'Relatorio Completo', description: 'Todos os dados' },
] as const

// Periodos pre-definidos
export const REPORT_PERIODS = [
  { id: 'today', name: 'HOJE', days: 0 },
  { id: '7d', name: '7 DIAS', days: 7 },
  { id: '15d', name: '15 DIAS', days: 15 },
  { id: 'month', name: 'MES', days: 30 },
] as const

// Membros da equipe (mock)
export const TEAM_MEMBERS = [
  { id: '1', name: 'Gabriel', role: 'CTO' },
  { id: '2', name: 'Joao', role: 'Dev Senior' },
  { id: '3', name: 'Maria', role: 'Dev Pleno' },
  { id: '4', name: 'Pedro', role: 'DevOps' },
  { id: '5', name: 'Ana', role: 'Designer' },
]

// Projetos mock para o wizard
export const MOCK_PROJECTS = [
  {
    id: 'PRJ-042',
    name: 'Sistema de Gestao Empresarial',
    client: 'Empresa XYZ',
    stage: 'Sprint de Desenvolvimento',
    stageNumber: 4,
    sprintsCompleted: 3,
    sprintsInProgress: 1,
    responsible: 'Gabriel',
    dev: 'Joao',
    progress: 80,
  },
  {
    id: 'PRJ-041',
    name: 'App Mobile E-commerce',
    client: 'Loja ABC',
    stage: 'Sprint de Desenvolvimento',
    stageNumber: 3,
    sprintsCompleted: 2,
    sprintsInProgress: 1,
    responsible: 'Gabriel',
    dev: 'Maria',
    progress: 45,
  },
  {
    id: 'PRJ-040',
    name: 'Automacao de Vendas',
    client: 'Vendas Corp',
    stage: 'MVP',
    stageNumber: 2,
    sprintsCompleted: 1,
    sprintsInProgress: 1,
    responsible: 'Gabriel',
    dev: 'Pedro',
    progress: 60,
  },
  {
    id: 'PRJ-039',
    name: 'Dashboard Analytics',
    client: 'Data Inc',
    stage: 'Diagnostico',
    stageNumber: 1,
    sprintsCompleted: 0,
    sprintsInProgress: 0,
    responsible: 'Gabriel',
    dev: '-',
    progress: 20,
  },
]

// Gerar atividades mock baseado no periodo
export function generateMockActivities(periodDays: number): Activity[] {
  const activities: Activity[] = [
    { id: '1', date: new Date(), description: 'Deploy em ambiente de staging concluido', included: true, addedManually: false },
    { id: '2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), description: 'Integracao com API de pagamentos finalizada', included: true, addedManually: false },
    { id: '3', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), description: 'Tela de onboarding implementada e revisada', included: true, addedManually: false },
    { id: '4', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), description: 'Reuniao interna de alinhamento de sprint', included: false, addedManually: false },
    { id: '5', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), description: 'Correcao de bugs criticos no checkout', included: true, addedManually: false },
    { id: '6', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), description: 'Nova feature de notificacoes push', included: true, addedManually: false },
    { id: '7', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), description: 'Otimizacao de performance do banco de dados', included: true, addedManually: false },
    { id: '8', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), description: 'Review de codigo e melhorias de seguranca', included: true, addedManually: false },
  ]

  return activities.filter(a => {
    const daysDiff = Math.floor((Date.now() - a.date.getTime()) / (24 * 60 * 60 * 1000))
    return daysDiff <= periodDays
  })
}

// Gerar sprints mock
export function generateMockSprints(): SprintReport[] {
  return [
    {
      sprintId: 'SPR-006',
      sprintName: 'Sprint #6',
      sprintNumber: 6,
      periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'completed',
      tasks: [
        { id: 't1', name: 'Tela de login e cadastro', status: 'completed', included: true },
        { id: 't2', name: 'Integracao com Firebase Auth', status: 'completed', included: true },
        { id: 't3', name: 'Tela de dashboard do usuario', status: 'completed', included: true },
        { id: 't4', name: 'Push notifications', status: 'moved', included: true },
      ],
      velocity: { completed: 18, total: 21 },
      observation: '',
    },
    {
      sprintId: 'SPR-007',
      sprintName: 'Sprint #7',
      sprintNumber: 7,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'in_progress',
      tasks: [
        { id: 't5', name: 'Push notifications', status: 'in_progress', included: true },
        { id: 't6', name: 'Tela de perfil e configuracoes', status: 'in_progress', included: true },
        { id: 't7', name: 'Testes de performance', status: 'in_progress', included: true },
      ],
      velocity: { completed: 11, total: 20 },
      observation: '',
    },
  ]
}

// Gerar proximos passos mock
export function generateMockNextSteps(): NextStep[] {
  return [
    { id: 'ns1', description: 'Finalizar push notifications', responsible: 'Dev Joao', deadline: '08/07', order: 1 },
    { id: 'ns2', description: 'Testes de performance e ajustes', responsible: 'DevSecOps', deadline: '10/07', order: 2 },
    { id: 'ns3', description: 'Deploy em producao', responsible: 'Gabriel + DevSecOps', deadline: '15/07', order: 3 },
    { id: 'ns4', description: 'Treinamento do cliente', responsible: 'Gabriel', deadline: '16/07', order: 4 },
  ]
}

// Formatar data
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
