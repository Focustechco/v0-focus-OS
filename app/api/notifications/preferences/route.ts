import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
import { createAdminClient } from "@/lib/supabase/server"

const eventsList = [
  "Nova Task",
  "Task Concluida",
  "Sprint Iniciada",
  "Sprint Encerrada",
  "Novo Deal",
  "Deal Aprovado",
  "Contrato Pendente",
  "Novo Membro",
  "Sistema Offline",
  "Backup Concluido",
]
const channels = ["app", "email", "push", "webhook"]

function normalizeKey(str: string) {
  return str.toLowerCase().replace(/ /g, "_")
}

function mapDbToFrontend(dbPrefs: any) {
  const eventPrefs: any = {}
  eventsList.forEach(event => {
    const eventKey = normalizeKey(event)
    eventPrefs[eventKey] = {}
    channels.forEach(ch => {
      eventPrefs[eventKey][ch] = dbPrefs[`event_${eventKey}_${ch}`] ?? false
    })
  })

  return {
    appEnabled: dbPrefs.channel_app ?? true,
    emailEnabled: dbPrefs.channel_email ?? true,
    pushEnabled: dbPrefs.channel_push ?? false,
    webhookEnabled: dbPrefs.channel_webhook ?? false,
    webhookUrl: dbPrefs.webhook_url ?? "",
    eventPrefs
  }
}

function mapFrontendToDb(data: any) {
  const dbUpdates: any = {}
  if (data.appEnabled !== undefined) dbUpdates.channel_app = data.appEnabled
  if (data.emailEnabled !== undefined) dbUpdates.channel_email = data.emailEnabled
  if (data.pushEnabled !== undefined) dbUpdates.channel_push = data.pushEnabled
  if (data.webhookEnabled !== undefined) dbUpdates.channel_webhook = data.webhookEnabled
  if (data.webhookUrl !== undefined) dbUpdates.webhook_url = data.webhookUrl

  if (data.eventPrefs) {
    eventsList.forEach(event => {
      const eventKey = normalizeKey(event)
      if (data.eventPrefs[eventKey]) {
        channels.forEach(ch => {
          if (data.eventPrefs[eventKey][ch] !== undefined) {
            dbUpdates[`event_${eventKey}_${ch}`] = data.eventPrefs[eventKey][ch]
          }
        })
      }
    })
  }
  return dbUpdates
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    let { data: prefs, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found, we can handle it
      throw error
    }

    if (!prefs) {
      // Create default
      const { data: newPrefs, error: createError } = await supabase
        .from("notification_preferences")
        .insert({ user_id: userId })
        .select()
        .single()
      
      if (createError) throw createError
      prefs = newPrefs
    }

    return NextResponse.json(mapDbToFrontend(prefs))
  } catch (error: any) {
    console.error("Erro ao buscar preferências:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, ...data } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const dbUpdates = mapFrontendToDb(data)
    
    const { data: prefs, error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: userId,
        ...dbUpdates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(mapDbToFrontend(prefs))
  } catch (error: any) {
    console.error("Erro ao salvar preferências:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
