import { NextResponse } from "next/server"
import { getClickUpConfig } from "@/lib/clickup-server"
import { requireUser } from "@/lib/api-auth"

/**
 * GET /api/clickup/config
 * Retorna se o ClickUp está configurado (sem expor o token).
 */
export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const cfg = getClickUpConfig()
  return NextResponse.json({
    configured: cfg.configured,
    teamId: cfg.teamId,
    spaceId: cfg.spaceId,
    listId: cfg.listId,
  })
}
