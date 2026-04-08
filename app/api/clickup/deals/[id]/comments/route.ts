import { NextResponse } from "next/server"
import { clickupFetch } from "@/lib/clickup-server"
import { requireUser } from "@/lib/api-auth"
import type { ClickUpComment } from "@/lib/clickup-api"

/**
 * GET /api/clickup/deals/[id]/comments
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  try {
    const data = await clickupFetch<{ comments: ClickUpComment[] }>(
      `/task/${id}/comment`
    )
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clickup/deals/[id]/comments
 * Body: { text: string, notifyAll?: boolean }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { text, notifyAll } = await request.json()

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text é obrigatório" }, { status: 400 })
  }

  try {
    const comment = await clickupFetch<ClickUpComment>(`/task/${id}/comment`, {
      method: "POST",
      body: JSON.stringify({ comment_text: text, notify_all: notifyAll ?? false }),
    })
    return NextResponse.json({ comment })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
