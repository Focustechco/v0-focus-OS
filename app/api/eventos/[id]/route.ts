import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  )
}

async function deletarDoGoogle(googleEventId: string, userId: string) {
  const supabase = getSupabase()
  try {
    const { data: tokenData } = await supabase
      .from("google_tokens")
      .select("access_token, refresh_token")
      .eq("user_id", userId)
      .maybeSingle()

    if (!tokenData?.access_token) return

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
    await calendar.events.delete({ calendarId: "primary", eventId: googleEventId })
  } catch (e) {
    console.error("[Google Calendar] Erro ao deletar evento:", e)
  }
}

// DELETE /api/eventos/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabase()
  try {
    const { id } = params
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("user_id")

    // Busca evento para pegar google_event_id
    const { data: evento } = await supabase
      .from("eventos")
      .select("google_event_id")
      .eq("id", id)
      .maybeSingle()

    // Deleta membros primeiro (FK)
    await supabase.from("evento_membros").delete().eq("evento_id", id)

    // Deleta evento
    const { error } = await supabase.from("eventos").delete().eq("id", id)
    if (error) throw error

    // Deleta do Google Calendar se existir
    if (evento?.google_event_id && userId) {
      await deletarDoGoogle(evento.google_event_id, userId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/eventos/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabase()
  try {
    const { id } = params
    const body = await req.json()

    const { error, data } = await supabase
      .from("eventos")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ evento: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
