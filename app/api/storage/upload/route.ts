import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const folderId = formData.get("folderId") as string || ""

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fullPath = folderId ? `${folderId}/${file.name}` : file.name

    const { data, error } = await supabaseAdmin.storage
      .from("documentos")
      .upload(fullPath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) throw error

    return NextResponse.json({ file: { id: fullPath, name: file.name } }, { status: 201 })
  } catch (error: any) {
    console.error("[Storage Upload]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
