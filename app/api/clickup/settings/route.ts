import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  try {
    const { teamId, spaceId, listId, enabled } = await request.json()
    
    const configPath = path.join(process.cwd(), '.clickup-config.json')
    let currentConfig: any = {}
    
    if (fs.existsSync(configPath)) {
      try {
        currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      } catch (e) {
        console.warn("Criando novo arquivo de configuração de CRM.")
      }
    }

    const newConfig = {
      ...currentConfig,
      teamId: teamId !== undefined ? teamId : currentConfig.teamId,
      spaceId: spaceId !== undefined ? spaceId : currentConfig.spaceId,
      listId: listId !== undefined ? listId : currentConfig.listId,
      enabled: enabled !== undefined ? enabled : currentConfig.enabled ?? true,
      updated_at: new Date().toISOString()
    }

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8')

    return NextResponse.json({ success: true, config: newConfig })
  } catch (error: any) {
    console.error("Erro fatal na API de settings do ClickUp:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
