import { NextResponse } from "next/server"
import { getTeams } from "@/lib/clickup-api"
import { getClickUpConfig } from "@/lib/clickup-server"
import { requireUser } from "@/lib/api-auth"
export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  try {
    const { token } = await getClickUpConfig()
    if (!token) return NextResponse.json({ error: "Token não configurado" }, { status: 400 })

    const data = await getTeams(token)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
