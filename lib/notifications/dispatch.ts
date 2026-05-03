import { createAdminClient } from "@/lib/supabase/server"

interface NotificationPayload {
  userId: string;
  eventType: string; // Ex: "nova_task", "task_concluida", "sprint_iniciada", "sprint_encerrada", etc.
  data: any; // payload details (title, message, url, etc)
}

/**
 * Função central de envio de notificações baseada nas preferências do usuário.
 * Canais suportados: App (interno), Email, Push (mobile/web), Webhook
 */
export async function dispatchNotification({ userId, eventType, data }: NotificationPayload) {
  const supabase = createAdminClient()
  
  // 1. Obter preferências do usuário
  const { data: prefs, error: prefsError } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (prefsError || !prefs) {
    console.warn(`Preferências não encontradas para o usuário ${userId}`)
    return
  }

  // Normalizar eventType para mapear para as colunas do DB
  const eventKey = eventType.toLowerCase().replace(/ /g, "_")
  
  // 2. Canal: APP (Sino interno)
  if (prefs.channel_app && prefs[`event_${eventKey}_app`]) {
    await supabase.from("notificacoes").insert({
      user_id: userId,
      tipo: eventType,
      titulo: data.title || "Notificação",
      mensagem: data.message || "",
      lida: false,
      ref_type: data.ref_type || null,
      ref_id: data.ref_id || null
    })
  }

  // 3. Canal: EMAIL
  if (prefs.channel_email && prefs[`event_${eventKey}_email`]) {
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (user?.email) {
       // TODO: Integrar Resend / SendGrid
       console.log(`[Email Mock] Enviando e-mail para ${user.email} - Evento: ${eventType}`)
    }
  }

  // 4. Canal: PUSH
  if (prefs.channel_push && prefs[`event_${eventKey}_push`]) {
    const { data: tokens } = await supabase.from("push_tokens").select("token").eq("user_id", userId)
    tokens?.forEach(t => {
       // TODO: Integrar FCM / Web Push
       console.log(`[Push Mock] Enviando push para token ${t.token} - Evento: ${eventType}`)
    })
  }

  // 5. Canal: WEBHOOK
  if (prefs.channel_webhook && prefs[`event_${eventKey}_webhook`] && prefs.webhook_url) {
    try {
      await fetch(prefs.webhook_url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Focus-OS-Event': eventType
        },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          data
        })
      })
    } catch(err) {
      console.error(`Erro ao disparar webhook para ${prefs.webhook_url}`, err)
    }
  }
}
