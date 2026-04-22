import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export const dynamic = 'force-dynamic'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/drive/callback`
  )
}

// GET /api/drive/auth → Gera a URL de autorização do Google
export async function GET() {
  try {
    const oauth2Client = getOAuth2Client()

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/userinfo.email"
      ]
    })

    return NextResponse.json({ authUrl })
  } catch (error: any) {
    console.error("[Drive Auth]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
