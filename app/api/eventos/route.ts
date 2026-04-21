import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Service role para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// Helper: calcula hora de fim
function calcularHoraFim(horaInicio: string, duracaoMinutos: number): string {
  const [h, m] = horaInicio.split(":").map(Number)
  const totalMin = h * 60 + m + duracaoMinutos
  const nh = Math.floor(totalMin / 60) % 24
  const nm = totalMin % 60
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`
}

// Helper: cria evento no Google Calendar
async function criarNoGoogleCalendar(eventData: any, userId: string): Promise<string | null> {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) return null // Google não configurado

    const { data: tokenData } = await supabase
      .from("google_tokens")
      .select("access_token, refresh_token")
      .eq("user_id", userId)
      .maybeSingle()

    if (!tokenData?.access_token) return null

    const { google } = await import("googleapis")
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })
    const duracaoMin = parseInt(eventData.duracao_minutos || "60")

    const googleEvent: any = {
      summary: eventData.titulo,
      description: eventData.descricao || "",
      start: {
        dateTime: `${eventData.data}T${eventData.hora_inicio}:00`,
        timeZone: "America/Fortaleza",
      },
      end: {
        dateTime: `${eventData.data}T${calcularHoraFim(eventData.hora_inicio, duracaoMin)}:00`,
        timeZone: "America/Fortaleza",
      },
    }

    if (eventData.attendees_emails?.length > 0) {
      googleEvent.attendees = eventData.attendees_emails.map((email: string) => ({ email }))
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: googleEvent,
      sendNotifications: true,
    })

    return response.data.id || null
  } catch (error: any) {
    console.error("[Google Calendar] Erro:", error.message)
    return null
  }
}

// ─── GET /api/eventos ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dataInicio = searchParams.get("data_inicio")
    const dataFim = searchParams.get("data_fim")

    let query = supabase
      .from("eventos")
      .select(`
        *,
        evento_membros (
          usuario_id,
          perfil:usuario_id ( nome_completo, avatar_url )
        )
      `)
      .order("data", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (dataInicio) query = query.gte("data", dataInicio)
    if (dataFim) query = query.lte("data", dataFim)

    const { data, error } = await query

    if (error) {
      console.error("[API Eventos GET] Erro:", error.message)
      // Se a tabela não existe, retorna vazio (não quebra o frontend)
      if (error.message.includes("eventos")) {
        return NextResponse.json({ eventos: [] })
      }
      throw error
    }

    return NextResponse.json({ eventos: data || [] })
  } catch (error: any) {
    console.error("[API Eventos GET] Erro:", error.message)
    return NextResponse.json({ eventos: [] })
  }
}

// ─── POST /api/eventos ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      titulo, descricao, data, hora_inicio, duracao_minutos,
      tipo, cor, membros_ids, attendees_emails, criar_no_google,
      criado_por
    } = body

    if (!titulo || !data || !hora_inicio) {
      return NextResponse.json(
        { error: "titulo, data e hora_inicio são obrigatórios" },
        { status: 400 }
      )
    }

    const duracaoMin = parseInt(duracao_minutos || "60")
    const hora_fim = calcularHoraFim(hora_inicio, duracaoMin)

    // 1. Salva no banco de dados
    const { data: evento, error: dbError } = await supabase
      .from("eventos")
      .insert({
        titulo,
        descricao: descricao || null,
        data,
        hora_inicio,
        hora_fim,
        duracao_minutos: duracaoMin,
        tipo: tipo || "reuniao",
        cor: cor || "#FF6B00",
        criado_por: criado_por || null,
        sincronizado_google: false,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[API Eventos POST] Erro BD:", dbError.message)
      throw dbError
    }

    // 2. Salva membros convidados
    if (membros_ids?.length > 0) {
      const membrosInsert = membros_ids.map((uid: string) => ({
        evento_id: evento.id,
        usuario_id: uid,
      }))
      await supabase.from("evento_membros").insert(membrosInsert)
    }

    // 3. Sincroniza com Google Calendar (opcional)
    let googleEventId: string | null = null
    if (criar_no_google && criado_por) {
      googleEventId = await criarNoGoogleCalendar(
        { titulo, descricao, data, hora_inicio, duracao_minutos: duracaoMin, attendees_emails },
        criado_por
      )
      if (googleEventId) {
        await supabase
          .from("eventos")
          .update({ google_event_id: googleEventId, sincronizado_google: true })
          .eq("id", evento.id)
      }
    }

    return NextResponse.json({
      evento: { ...evento, google_event_id: googleEventId },
      sincronizado_google: !!googleEventId,
    }, { status: 201 })
  } catch (error: any) {
    console.error("[API Eventos POST] Erro:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
