import { NextRequest, NextResponse } from "next/server"
import { getTask } from "@/lib/clickup-server"
import { syncClickUpTasksToLeads } from "@/lib/clickup-sync"
export const dynamic = 'force-dynamic'

/**
 * Endpoint para receber Webhooks do ClickUp.
 * Configure no ClickUp Dashboard apontando para {sua_url}/api/clickup/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("ClickUp Webhook Received:", body)

    // O ClickUp envia o taskId no campo task_id ou no corpo dependendo do evento
    const taskId = body.task_id || body.id
    
    if (taskId) {
      // Busca os detalhes da task fresquinhos da API
      const task = await getTask(taskId)
      
      if (task) {
        // Sincroniza com o Supabase
        await syncClickUpTasksToLeads([task])
        return NextResponse.json({ success: true, message: `Task ${taskId} synced.` })
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed (no action)." })
  } catch (error: any) {
    console.error("ClickUp Webhook Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
