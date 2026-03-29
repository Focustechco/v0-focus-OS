// CRM Field Mapper
// Mapeia campos customizados do ClickUp para campos padrão do CRM

import type { ClickUpCustomField, ClickUpTask } from './clickup-api'

// Mapeamento de nomes comuns de campos CRM
export const CRM_FIELDS_MAP: Record<string, string[]> = {
  empresa: ['empresa', 'company', 'cliente', 'client', 'razão social', 'razao social', 'nome da empresa'],
  contato: ['contato', 'contact', 'nome', 'responsável', 'responsavel', 'nome do contato'],
  email: ['email', 'e-mail', 'mail'],
  telefone: ['telefone', 'phone', 'whatsapp', 'celular', 'tel', 'fone'],
  valor: ['valor', 'value', 'mrr', 'ticket', 'receita', 'contrato', 'valor do contrato', 'valor estimado'],
  origem: ['origem', 'source', 'canal', 'como chegou', 'indicação', 'indicacao'],
  tipo: ['tipo', 'type', 'serviço', 'servico', 'produto', 'tipo de serviço'],
  proximaAcao: ['próxima ação', 'proxima acao', 'next action', 'follow-up', 'followup', 'próximo passo'],
}

// Estrutura de um Deal mapeado
export interface CRMDeal {
  id: string
  customId: string | null
  name: string
  status: {
    status: string
    color: string
    orderindex: number
  }
  assignees: {
    id: number
    username: string
    color: string
    initials: string
    profilePicture: string | null
  }[]
  dueDate: Date | null
  dateCreated: Date
  dateUpdated: Date
  dateClosed: Date | null
  priority: {
    id: string
    priority: string
    color: string
  } | null
  tags: { name: string; color: string; bgColor: string }[]
  url: string
  description: string | null
  
  // Campos CRM mapeados
  empresa: string | null
  contato: string | null
  email: string | null
  telefone: string | null
  valor: number | null
  origem: string | null
  tipo: string | null
  proximaAcao: string | null
  
  // Custom fields originais
  customFields: ClickUpCustomField[]
}

// Busca valor de um campo customizado pelo mapeamento
export function getCRMFieldValue(
  customFields: ClickUpCustomField[],
  fieldKey: keyof typeof CRM_FIELDS_MAP
): string | number | null {
  const possibleNames = CRM_FIELDS_MAP[fieldKey]
  
  for (const field of customFields) {
    const fieldNameLower = field.name.toLowerCase().trim()
    
    if (possibleNames.some(name => fieldNameLower.includes(name.toLowerCase()))) {
      if (field.value === undefined || field.value === null) return null
      
      // Tratar diferentes tipos de campos
      if (typeof field.value === 'string' || typeof field.value === 'number') {
        return field.value
      }
      
      // Campo de dropdown
      if (field.type === 'drop_down' && typeof field.value === 'number') {
        const options = field.type_config?.options as { id: string; name: string; orderindex: number }[] | undefined
        const selected = options?.find(opt => opt.orderindex === field.value)
        return selected?.name || null
      }
      
      // Campo de moeda/número
      if (field.type === 'currency' || field.type === 'number') {
        return typeof field.value === 'number' ? field.value : parseFloat(String(field.value)) || null
      }
      
      return String(field.value)
    }
  }
  
  return null
}

// Formata valor monetário
export function formatCurrency(value: number | null): string {
  if (value === null || isNaN(value)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Formata valor como MRR
export function formatMRR(value: number | null): string {
  if (value === null || isNaN(value)) return '—'
  return `${formatCurrency(value)}/mês`
}

// Converte Task do ClickUp para Deal do CRM
export function mapTaskToDeal(task: ClickUpTask): CRMDeal {
  return {
    id: task.id,
    customId: task.custom_id,
    name: task.name,
    status: {
      status: task.status.status,
      color: task.status.color,
      orderindex: task.status.orderindex,
    },
    assignees: task.assignees.map(a => ({
      id: a.id,
      username: a.username,
      color: a.color,
      initials: a.initials,
      profilePicture: a.profilePicture,
    })),
    dueDate: task.due_date ? new Date(parseInt(task.due_date)) : null,
    dateCreated: new Date(parseInt(task.date_created)),
    dateUpdated: new Date(parseInt(task.date_updated)),
    dateClosed: task.date_closed ? new Date(parseInt(task.date_closed)) : null,
    priority: task.priority,
    tags: task.tags.map(t => ({
      name: t.name,
      color: t.tag_fg,
      bgColor: t.tag_bg,
    })),
    url: task.url,
    description: task.description,
    
    // Campos CRM
    empresa: getCRMFieldValue(task.custom_fields, 'empresa') as string | null || task.name,
    contato: getCRMFieldValue(task.custom_fields, 'contato') as string | null,
    email: getCRMFieldValue(task.custom_fields, 'email') as string | null,
    telefone: getCRMFieldValue(task.custom_fields, 'telefone') as string | null,
    valor: getCRMFieldValue(task.custom_fields, 'valor') as number | null,
    origem: getCRMFieldValue(task.custom_fields, 'origem') as string | null,
    tipo: getCRMFieldValue(task.custom_fields, 'tipo') as string | null,
    proximaAcao: getCRMFieldValue(task.custom_fields, 'proximaAcao') as string | null,
    
    customFields: task.custom_fields,
  }
}

// Calcula dias desde última atualização
export function daysSinceUpdate(date: Date): number {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// Formata data relativa
export function formatRelativeDate(date: Date): string {
  const days = daysSinceUpdate(date)
  
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 7) return `há ${days} dias`
  if (days < 30) return `há ${Math.floor(days / 7)} semanas`
  if (days < 365) return `há ${Math.floor(days / 30)} meses`
  return `há ${Math.floor(days / 365)} anos`
}

// Formata data no formato brasileiro
export function formatDate(date: Date | null): string {
  if (!date) return '—'
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Determina nível de alerta do deal
export function getDealAlertLevel(deal: CRMDeal): 'danger' | 'warning' | 'deadline' | null {
  const daysSince = daysSinceUpdate(deal.dateUpdated)
  
  // Deal parado > 10 dias
  if (daysSince > 10) return 'danger'
  
  // Deal parado > 5 dias
  if (daysSince > 5) return 'warning'
  
  // Deal com prazo nos próximos 3 dias
  if (deal.dueDate) {
    const daysUntilDue = Math.ceil((deal.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue <= 3 && daysUntilDue >= 0) return 'deadline'
  }
  
  return null
}

// Agrupa deals por status
export function groupDealsByStatus(deals: CRMDeal[]): Map<string, CRMDeal[]> {
  const grouped = new Map<string, CRMDeal[]>()
  
  deals.forEach(deal => {
    const status = deal.status.status
    if (!grouped.has(status)) {
      grouped.set(status, [])
    }
    grouped.get(status)!.push(deal)
  })
  
  return grouped
}

// Calcula métricas do pipeline
export function calculatePipelineMetrics(deals: CRMDeal[]) {
  const totalDeals = deals.length
  const activeDeals = deals.filter(d => d.status.status.toLowerCase() !== 'fechado' && d.status.status.toLowerCase() !== 'perdido')
  const closedDeals = deals.filter(d => d.status.status.toLowerCase() === 'fechado')
  const lostDeals = deals.filter(d => d.status.status.toLowerCase() === 'perdido')
  
  const totalPipeline = activeDeals.reduce((sum, deal) => sum + (deal.valor || 0), 0)
  const closedValue = closedDeals.reduce((sum, deal) => sum + (deal.valor || 0), 0)
  
  const conversionRate = totalDeals > 0 ? (closedDeals.length / totalDeals) * 100 : 0
  
  const priorityDeals = activeDeals.filter(d => d.priority?.priority === 'urgent' || d.priority?.priority === 'high')
  const alertDeals = activeDeals.filter(d => getDealAlertLevel(d) !== null)
  
  return {
    totalDeals,
    activeDeals: activeDeals.length,
    closedDeals: closedDeals.length,
    lostDeals: lostDeals.length,
    totalPipeline,
    closedValue,
    conversionRate,
    priorityDeals: priorityDeals.length,
    alertDeals: alertDeals.length,
  }
}
