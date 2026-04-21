import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
export const dynamic = 'force-dynamic'

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
    const formData = await request.formData()
    
    const nome = formData.get("nome") as string
    const empresa = formData.get("empresa") as string
    const cnpj = formData.get("cnpj") as string
    const email = formData.get("email") as string
    const telefone = formData.get("telefone") as string
    const observacoes = formData.get("observacoes") as string
    
    const logoFile = formData.get("logo") as File | null
    const pdfFile = formData.get("contract") as File | null

    if (!nome || !empresa) {
      return NextResponse.json({ error: "Nome e Empresa são obrigatórios" }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    let logo_url = null
    let contract_url = null
    let contract_name = null

    // 1. Se há logo: upload para Supabase Storage 'client-logos'
    if (logoFile && logoFile.size > 0) {
      try {
        const logoBuffer = Buffer.from(await logoFile.arrayBuffer())
        const logoPath = `logos/${Date.now()}-${logoFile.name.replace(/\s+/g, "_")}`
        const { error: logoErr } = await supabase.storage.from('client-logos').upload(logoPath, logoBuffer, { contentType: logoFile.type })
        if (logoErr) throw logoErr
        
        const { data: logoData } = supabase.storage.from('client-logos').getPublicUrl(logoPath)
        logo_url = logoData.publicUrl
      } catch (err: any) {
        console.error("Erro no upload do logo:", err)
        return NextResponse.json({ error: "Erro ao fazer upload do logo" }, { status: 500 })
      }
    }

    // 2. Se há PDF: upload para 'client-contracts'
    if (pdfFile && pdfFile.size > 0) {
      try {
        const contractBuffer = Buffer.from(await pdfFile.arrayBuffer())
        const contractPath = `contracts/${Date.now()}-${pdfFile.name.replace(/\s+/g, "_")}`
        const { error: pdfErr } = await supabase.storage.from('client-contracts').upload(contractPath, contractBuffer, { contentType: pdfFile.type })
        if (pdfErr) throw pdfErr
        
        const { data: contractData, error: sError } = await supabase.storage.from('client-contracts').createSignedUrl(contractPath, 60 * 60 * 24 * 365)
        if (sError) throw sError

        contract_url = contractData.signedUrl
        contract_name = pdfFile.name
      } catch (err: any) {
        console.error("Erro no upload do contrato:", err)
        return NextResponse.json({ error: "Erro ao fazer upload do contrato PDF" }, { status: 500 })
      }
    }

    // 3. INSERT na tabela clients
    const { data, error } = await supabase
      .from("clientes")
      .insert({
        nome,
        empresa,
        cnpj,
        email,
        telefone,
        observacoes,
        logo_url,
        contract_url,
        contract_name
      })
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
