import { NextResponse } from "next/server"
import { clickupFetch } from "@/lib/clickup-server"
import { requireUser } from "@/lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const teamId = searchParams.get('teamId')

  if (!teamId) {
    return NextResponse.json({ error: "teamId é obrigatório" }, { status: 400 })
  }

  try {
    const data = await clickupFetch<{ spaces: any[] }>(`/team/${teamId}/space`)
    return NextResponse.json({ spaces: data.spaces })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
