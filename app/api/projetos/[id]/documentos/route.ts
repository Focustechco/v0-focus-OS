import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase.storage
      .from('project-documents')
      .list(projectId + "/", {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error("[GET /api/projetos/[id]/documentos] List Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // O list() da Supabase as vezes retorna uma pasta vazia como item
    const filePromises = (data || [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(async file => {
        // Gera uma URL assinada válida por 24 horas para garantir acesso mesmo que o bucket seja privado
        const { data: signedUrlData } = await supabase.storage
          .from('project-documents')
          .createSignedUrl(`${projectId}/${file.name}`, 60 * 60 * 24)
          
        return {
          id: file.id,
          name: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          url: signedUrlData?.signedUrl || null
        }
      })

    const files = await Promise.all(filePromises)

    return NextResponse.json(files)
  } catch (error: any) {
    console.error("[GET /api/projetos/[id]/documentos] Internal Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const formData = await request.formData()
    // Podemos ter múltiplos arquivos na chave 'files' ou 'files[]'
    const files = formData.getAll("file") as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const uploadedFiles = []

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        // Ignorar ficheiros > 20MB
        continue
      }
      
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      const safeName = file.name.replace(/[^\w\.\-]/g, '_')
      const filePath = `${projectId}/${Date.now()}-${safeName}`
      
      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, fileBuffer, {
          contentType: file.type || 'application/pdf',
          upsert: true
        })

      if (uploadError) {
        console.error("Upload failed for", file.name, uploadError)
        continue
      }
      
      const { data: signedUrlData } = await supabase.storage
        .from('project-documents')
        .createSignedUrl(filePath, 60 * 60 * 24)
        
      uploadedFiles.push({
        name: safeName,
        url: signedUrlData?.signedUrl || null
      })
    }

    return NextResponse.json({ success: true, uploadedFiles })
  } catch (error: any) {
    console.error("[POST /api/projetos/[id]/documentos] Internal Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
