import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

// Helper para criar o cliente Supabase de forma segura
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  )
}

// GET /api/auth/google/callback — Google redireciona aqui após login
export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const userId = searchParams.get("state") // user_id que mandamos no state

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?google=error&reason=no_code`)
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    )

    // Troca o code por tokens
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token) {
      throw new Error("Google não retornou access_token")
    }

    // Salva no banco
    const { error } = await supabase
      .from("google_tokens")
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      }, {
        onConflict: "user_id"
      })

    if (error) {
      console.error("[Google OAuth] Erro ao salvar token:", error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?google=error&reason=db_error`)
    }

    // Sucesso — redireciona de volta para as configurações
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?google=success`)
  } catch (err: any) {
    console.error("[Google OAuth] Erro no callback:", err.message)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/configuracoes?google=error&reason=${encodeURIComponent(err.message)}`)
  }
}
