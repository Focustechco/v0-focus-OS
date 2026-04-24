import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-admin"

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
    let tokens
    try {
      const res = await oauth2Client.getToken(code)
      tokens = res.tokens
    } catch (err: any) {
      // Log detailed error from Google to help debugging (no secrets)
      console.error("[Drive Callback] token exchange failed:", err?.response?.data || err?.message || err)
      throw err
    }

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

      try {
        // Tentar obter email do usuário via Google userinfo e salvar refresh_token no banco
        const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" })
        const userinfo = await oauth2.userinfo.get()
        const email = userinfo.data.email

        if (email) {
          // Buscar profile pelo email
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", email)
            .limit(1)
            .maybeSingle()

          const userId = profile?.id
          if (userId) {
            await supabaseAdmin
              .from("drive_tokens")
              .upsert({ user_id: userId, refresh_token: tokens.refresh_token })
          }
        }
      } catch (err: any) {
        console.error("[Drive Callback] failed to persist refresh token", err?.message || err)
      }
    }

    return NextResponse.redirect(new URL("/documentos?connected=true", req.url))
  } catch (error: any) {
    console.error("[Drive Callback]", error.message)
    return NextResponse.redirect(new URL(`/documentos?error=${encodeURIComponent(error.message)}`, req.url))
  }
}
