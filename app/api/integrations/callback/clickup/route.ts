import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// GET /api/integrations/callback/clickup?code=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(new URL("/configuracoes?error=no_code", req.url))
    }

    const clientId = process.env.NEXT_PUBLIC_CLICKUP_CLIENT_ID || process.env.CLICKUP_CLIENT_ID
    const clientSecret = process.env.CLICKUP_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/configuracoes?error=missing_clickup_credentials", req.url))
    }

    // Exchange code for token
    const tokenResponse = await fetch(`https://api.clickup.com/api/v2/oauth/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`, {
      method: "POST"
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("[ClickUp OAuth] Exchange failed:", tokenData)
      return NextResponse.redirect(new URL(`/configuracoes?error=${encodeURIComponent(tokenData.err || "Token_Exchange_Failed")}`, req.url))
    }

    const accessToken = tokenData.access_token

    // Save to .clickup-config.json
    const configPath = path.join(process.cwd(), '.clickup-config.json')
    let currentConfig = {}
    if (fs.existsSync(configPath)) {
      try {
        currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      } catch (e) {}
    }

    currentConfig = {
      ...currentConfig,
      token: accessToken,
      enabled: true
    }

    fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2))

    return NextResponse.redirect(new URL("/configuracoes?connected=clickup", req.url))
  } catch (error: any) {
    console.error("[ClickUp Callback Error]", error.message)
    return NextResponse.redirect(new URL(`/configuracoes?error=${encodeURIComponent(error.message)}`, req.url))
  }
}
