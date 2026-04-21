import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Busca aprovações sem joins (evita conflito de FKs duplicadas)
    const { data: aprovacoes, error } = await supabase
      .from("aprovacoes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    // Buscar projetos e tarefas manualmente para enriquecer os dados
    const enriched = await Promise.all(
      (aprovacoes || []).map(async (aprov: any) => {
        // Projeto
        let projeto = null
        if (aprov.projeto_id) {
          const { data } = await supabase
            .from("projetos")
            .select("id, nome")
            .eq("id", aprov.projeto_id)
            .maybeSingle()
          projeto = data
        }

        // Tarefa com checklist
        let tarefa = null
        if (aprov.tarefa_id) {
          const { data } = await supabase
            .from("tarefas")
            .select(`
              id, titulo, descricao, prioridade, status, progress, prazo,
              checklist_items(id, title, is_done, assigned_to, prazo)
            `)
            .eq("id", aprov.tarefa_id)
            .maybeSingle()
          tarefa = data
        }

        return { ...aprov, projetos: projeto, tarefa }
      })
    )

    return NextResponse.json(enriched)
  } catch (error: any) {
    console.error("DEBUG: Error in GET /api/approvals:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
