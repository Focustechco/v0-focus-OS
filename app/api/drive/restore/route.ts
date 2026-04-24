import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { google } from "googleapis"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = 'force-dynamic'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/drive/callback`
  )
}

// POST /api/drive/restore with JSON { userId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userId = body?.userId
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    // Buscar refresh_token no DB
    const { data, error } = await supabaseAdmin
      .from('drive_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!data || !data.refresh_token) return NextResponse.json({ error: 'No refresh token' }, { status: 404 })

    const oauth2Client = getOAuth2Client()
    // Trocar refresh token por access token
    const res = await oauth2Client.refreshToken(data.refresh_token)
    const credentials = res.credentials

    if (!credentials?.access_token) {
      return NextResponse.json({ error: 'Could not refresh access token' }, { status: 500 })
    }

    const cookieStore = await cookies()
    cookieStore.set('drive_access_token', credentials.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: credentials.expires_in ? Number(credentials.expires_in) : 3600,
      path: '/',
    })

    // Keep refresh token cookie as well
    if (data.refresh_token) {
      cookieStore.set('drive_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }

    return NextResponse.json({ connected: true })
  } catch (error: any) {
    console.error('[Drive Restore]', error?.message || error)
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}
