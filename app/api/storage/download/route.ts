import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileId = searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ error: "No fileId provided" }, { status: 400 })
    }

    // Criar um signed URL valido por 1 hora
    const { data, error } = await supabaseAdmin.storage
      .from("documentos")
      .createSignedUrl(fileId, 3600, { download: true })

    if (error) throw error

    return NextResponse.json({ downloadUrl: data.signedUrl })
  } catch (error: any) {
    console.error("[Storage Download]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
