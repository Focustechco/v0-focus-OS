import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

// GET /api/drive/status → Verifica se o usuário está conectado ao Drive
export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("drive_access_token")?.value

  return NextResponse.json({
    connected: !!accessToken
  })
}

// DELETE /api/drive/status → Desconectar do Drive
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("drive_access_token")
  cookieStore.delete("drive_refresh_token")
  return NextResponse.json({ disconnected: true })
}
