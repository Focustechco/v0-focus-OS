import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string, fileName: string }> }
) {
  try {
    const { id: projectId, fileName } = await params
    
    if (!projectId || !fileName) {
      return NextResponse.json({ error: "Project ID and File Name are required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const path = `${projectId}/${fileName}`
    
    const { error } = await supabase.storage
      .from('project-documents')
      .remove([path])

    if (error) {
      console.error("[DELETE /api/projetos/[id]/documentos/[fileName]] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/projetos/[id]/documentos/[fileName]] Internal Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
