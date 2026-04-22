import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const folderId = searchParams.get("folderId") || ""
    
    // Lista os arquivos e subpastas no folder especifico
    const { data, error } = await supabaseAdmin.storage
      .from("documentos")
      .list(folderId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) throw error

    // Formatar para o frontend igual ao modelo anterior
    const files = data.map(item => {
      // Supabase list treats empty names as folder roots sometimes, or we check id
      const isFolder = !item.id && !item.metadata
      const fullPath = folderId ? `${folderId}/${item.name}` : item.name
      
      return {
        id: fullPath, // ID will be the full path
        name: item.name,
        mimeType: isFolder ? 'application/vnd.google-apps.folder' : (item.metadata?.mimetype || 'application/octet-stream'),
        size: item.metadata?.size?.toString(),
        modifiedTime: item.created_at || new Date().toISOString(),
      }
    }).filter(item => item.name !== '.emptyFolderPlaceholder') // Ignite placeholder

    return NextResponse.json({ files })
  } catch (error: any) {
    console.error("[Storage Files]", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
