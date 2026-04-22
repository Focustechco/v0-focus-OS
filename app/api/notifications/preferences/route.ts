import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

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
      .eq("userId", userId)
      .maybeSingle()

    if (error) throw error

    if (!prefs) {
      // Criar padrão se não existir
      const { data: newPrefs, error: createError } = await supabase
        .from("notification_preferences")
        .insert({
          userId: userId,
          appEnabled: true,
          emailEnabled: true,
          pushEnabled: false,
          webhookEnabled: false,
          eventPrefs: {}
        })
        .select()
        .single()
      
      if (createError) throw createError
      prefs = newPrefs
    }

    return NextResponse.json(prefs)
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
    
    const { data: prefs, error } = await supabase
      .from("notification_preferences")
      .upsert({
        userId: userId,
        ...data,
        updatedAt: new Date().toISOString()
      }, { onConflict: 'userId' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(prefs)
  } catch (error: any) {
    console.error("Erro ao salvar preferências:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
