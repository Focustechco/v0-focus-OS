import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: clientes, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true })

    if (error) {
      console.error("[GET /api/clientes] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(clientes || [])
  } catch (error: any) {
    console.error("[GET /api/clientes] Internal Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Normalize logic just like the frontend hook was doing
    const payload = {
      ...body,
      nome: body.nome || body.name,
      empresa: body.empresa || body.company
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("clientes")
      .insert([
        {
          nome: payload.nome,
          empresa: payload.empresa,
          email: payload.email || null,
          telefone: payload.telefone || null
        }
      ])
      .select()
      .single()

    if (error) {
      console.error("[POST /api/clientes] Supabase Error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/clientes] Internal Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
