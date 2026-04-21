import { NextResponse } from "next/server"
import { clickupFetch, getClickUpConfig, ClickUpNotConfiguredError } from "@/lib/clickup-server"
import { mapTaskToDeal } from "@/lib/crm-field-mapper"
import type { ClickUpTask } from "@/lib/clickup-api"
import { requireUser } from "@/lib/api-auth"
export const dynamic = 'force-dynamic'

/**
 * GET /api/clickup/deals
 * Busca as tasks da lista configurada e mapeia para CRMDeal.
 */
export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  try {
    const cfg = getClickUpConfig()
    if (!cfg.configured || !cfg.listId) {
      return NextResponse.json(
        { error: "ClickUp não configurado (faltando CLICKUP_API_TOKEN ou CLICKUP_LIST_ID)" },
        { status: 503 }
      )
    }

    const params = new URLSearchParams({
      archived: "false",
      include_closed: "true",
      subtasks: "true",
    })
    const data = await clickupFetch<{ tasks: ClickUpTask[] }>(
      `/list/${cfg.listId}/task?${params}`
    )

    const deals = data.tasks.map(mapTaskToDeal)
    return NextResponse.json({ deals, updated_at: new Date().toISOString() })
  } catch (error) {
    if (error instanceof ClickUpNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
