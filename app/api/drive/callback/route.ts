import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/drive/callback`
  )
}

// GET /api/drive/callback?code=... → Troca o code pelo access_token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/documentos?error=no_code", req.url))
    }

    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    // Salvar tokens em cookie HttpOnly seguro
    const cookieStore = await cookies()
    cookieStore.set("drive_access_token", tokens.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hora
      path: "/"
    })

    if (tokens.refresh_token) {
      cookieStore.set("drive_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: "/"
      })
    }

    return NextResponse.redirect(new URL("/documentos?connected=true", req.url))
  } catch (error: any) {
    console.error("[Drive Callback]", error.message)
    return NextResponse.redirect(new URL(`/documentos?error=${encodeURIComponent(error.message)}`, req.url))
  }
}
