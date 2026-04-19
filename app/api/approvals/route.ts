import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("aprovacoes")
      .select(`
        *,
        projeto:projetos!aprovacoes_projeto_id_fkey(id, nome),
        tarefa:tarefas(id, titulo)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("DEBUG: Error in GET /api/approvals:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
