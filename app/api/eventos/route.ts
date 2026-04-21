import { NextRequest, NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

function calcularHoraFim(horaInicio: string, duracaoMinutos: number): string {
  const [h, m] = horaInicio.split(":").map(Number)
  const totalMin = h * 60 + m + duracaoMinutos
  const nh = Math.floor(totalMin / 60) % 24
  const nm = totalMin % 60
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`
}

// ─── GET /api/eventos ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dataInicio = searchParams.get("data_inicio")
    const dataFim = searchParams.get("data_fim")

    // Query SIMPLES sem joins complexos
    let query = supabase
      .from("eventos")
      .select("*")
      .order("data", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (dataInicio) query = query.gte("data", dataInicio)
    if (dataFim) query = query.lte("data", dataFim)

    const { data, error } = await query

    if (error) {
      console.error("[API Eventos GET]", error.message)
      return NextResponse.json({ eventos: [] })
    }

    return NextResponse.json({ eventos: data || [] })
  } catch (error: any) {
    console.error("[API Eventos GET] catch:", error.message)
    return NextResponse.json({ eventos: [] })
  }
}

// ─── POST /api/eventos ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.titulo || !body.data || !body.hora_inicio) {
      return NextResponse.json(
        { error: "titulo, data e hora_inicio são obrigatórios" },
        { status: 400 }
      )
    }

    const duracaoMin = parseInt(body.duracao_minutos || "60")
    const hora_fim = calcularHoraFim(body.hora_inicio, duracaoMin)

    // Salva no banco
    const { data: evento, error: dbError } = await supabase
      .from("eventos")
      .insert({
        titulo: body.titulo,
        descricao: body.descricao || null,
        data: body.data,
        hora_inicio: body.hora_inicio,
        hora_fim,
        duracao_minutos: duracaoMin,
        tipo: body.tipo || "reuniao",
        cor: body.cor || "#FF6B00",
        criado_por: body.criado_por || null,
        sincronizado_google: false,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[API Eventos POST] DB Error:", JSON.stringify(dbError))
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Gera link para Google Calendar (abordagem sem OAuth — funciona IMEDIATO)
    const googleCalUrl = gerarLinkGoogleCalendar({
      titulo: body.titulo,
      descricao: body.descricao || "",
      data: body.data,
      hora_inicio: body.hora_inicio,
      hora_fim,
      emails: body.attendees_emails || [],
    })

    return NextResponse.json({
      evento: { ...evento, google_cal_url: googleCalUrl },
    }, { status: 201 })
  } catch (error: any) {
    console.error("[API Eventos POST] catch:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Gera URL do Google Calendar com todos os campos pré-preenchidos
// O usuário é redirecionado para o Google Calendar com o evento pronto para salvar
// Se tiver emails, o Google manda convites automaticamente
function gerarLinkGoogleCalendar(params: {
  titulo: string
  descricao: string
  data: string       // "2026-04-21"
  hora_inicio: string // "10:00"
  hora_fim: string    // "11:00"
  emails: string[]
}): string {
  // Formata datas no padrão Google: YYYYMMDDTHHMMSS
  const dataLimpa = params.data.replace(/-/g, "")
  const inicioLimpo = params.hora_inicio.replace(":", "") + "00"
  const fimLimpo = params.hora_fim.replace(":", "") + "00"

  const inicio = `${dataLimpa}T${inicioLimpo}`
  const fim = `${dataLimpa}T${fimLimpo}`

  const url = new URL("https://calendar.google.com/calendar/event")
  url.searchParams.set("action", "TEMPLATE")
  url.searchParams.set("text", params.titulo)
  url.searchParams.set("dates", `${inicio}/${fim}`)
  url.searchParams.set("ctz", "America/Fortaleza")

  if (params.descricao) {
    url.searchParams.set("details", params.descricao)
  }

  if (params.emails.length > 0) {
    url.searchParams.set("add", params.emails.join(","))
  }

  return url.toString()
}
