import { createAdminClient } from "@/lib/supabase/server"

export type NotificationEvent = 
  | "nova_task" 
  | "task_concluida" 
  | "sprint_iniciada" 
  | "sprint_encerrada" 
  | "novo_deal" 
  | "deal_aprovado" 
  | "contrato_pendente" 
  | "novo_membro" 
  | "sistema_offline"

/**
 * Envia uma notificação para um usuário.
 * Persiste na tabela 'notificacoes' do Supabase.
 * 
 * Colunas reais da tabela:
 *   id, titulo, mensagem, tipo, ref_id, ref_type, lida, user_id, created_at
 */
export async function sendNotification({
  userId,
  event,
  title,
  body,
  relatedEntityType,
  relatedEntityId
}: {
  userId: string
  event: NotificationEvent
  title: string
  body: string
  relatedEntityType?: string
  relatedEntityId?: string
}) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("notificacoes").insert({
      user_id: userId,
      tipo: event,
      titulo: title,
      mensagem: body,
      ref_type: relatedEntityType || null,
      ref_id: relatedEntityId || null,
      lida: false
    })

    if (error) {
      console.error("[NOTIFICAÇÃO] Erro ao inserir:", error.message)
    } else {
      console.log(`[NOTIFICAÇÃO] Enviada para ${userId}: ${title}`)
    }
  } catch (error) {
    console.error("[NOTIFICAÇÃO] Erro ao enviar:", error)
  }
}
