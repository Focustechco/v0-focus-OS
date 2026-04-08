import { NextResponse } from "next/server"
import { clickupFetch } from "@/lib/clickup-server"
import { requireUser } from "@/lib/api-auth"
import type { ClickUpTask } from "@/lib/clickup-api"

/**
 * PUT /api/clickup/deals/[id]
 * Atualiza status/dados de uma task ClickUp.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await request.json()

  try {
    const task = await clickupFetch<ClickUpTask>(`/task/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
    return NextResponse.json({ task })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
