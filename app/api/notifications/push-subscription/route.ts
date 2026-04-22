import { NextResponse } from "next/server"
export const dynamic = 'force-dynamic'
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId, subscription } = await request.json()

    if (!userId || !subscription) {
      return NextResponse.json({ error: "userId and subscription are required" }, { status: 400 })
    }

    const { endpoint, keys } = subscription
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Usar upsert do Supabase
    // A tabela push_subscriptions deve ter 'endpoint' como chave única/primária para o upsert funcionar por conflito
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        created_at: new Date().toISOString()
      }, { onConflict: 'endpoint' })
      .select()
      .single()

    if (error) {
      console.error("Erro no Supabase ao salvar push subscription:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Erro ao salvar push subscription:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
