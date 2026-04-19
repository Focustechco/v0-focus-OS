import { supabase } from "./supabase"
import { ClickUpTask } from "./clickup-api"

/**
 * Mapeia o status do ClickUp para o status interno do Focus OS.
 * Ajuste conforme os nomes de status configurados no seu Workspace do ClickUp.
 */
function mapClickUpStatus(clickupStatus: string): string {
  const status = clickupStatus.toLowerCase()
  
  if (status.includes("ganho") || status.includes("closed") || status === "fechado") return "fechado_ganho"
  if (status.includes("perdido") || status.includes("lost")) return "fechado_perdido"
  if (status.includes("proposta") || status.includes("proposal")) return "proposta_enviada"
  if (status.includes("negocia") || status.includes("negotiation")) return "negociacao"
  if (status.includes("reuniao") || status.includes("meeting")) return "reuniao_agendada"
  if (status.includes("qualificado") || status.includes("qualified")) return "qualificado"
  
  return "prospect"
}

/**
 * Sincroniza uma lista de tasks do ClickUp com a tabela de leads do Supabase.
 */
export async function syncClickUpTasksToLeads(tasks: ClickUpTask[]) {
  const leadsToUpsert = tasks.map((task) => {
    // Tenta encontrar o valor em um custom field (se houver um campo 'Valor' ou 'Budget')
    const valorField = task.custom_fields?.find(f => f.name.toLowerCase().includes("valor") || f.name.toLowerCase().includes("budget"))
    const valor = typeof valorField?.value === 'string' || typeof valorField?.value === 'number' 
      ? Number(valorField.value) 
      : 0

    return {
      clickup_id: task.id,
      nome: task.name,
      valor: valor,
      status: mapClickUpStatus(task.status.status),
      fechado_em: task.date_closed ? new Date(Number(task.date_closed)).toISOString() : null,
      created_at: task.date_created ? new Date(Number(task.date_created)).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })

  const { data, error } = await supabase
    .from("leads")
    .upsert(leadsToUpsert, { onConflict: "clickup_id" })
    .select()

  if (error) {
    console.error("Error syncing ClickUp tasks to Leads:", error)
  }

  return { data, error }
}
