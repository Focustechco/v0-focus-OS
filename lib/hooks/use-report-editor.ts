import { useState } from "react"
import { supabase } from "@/lib/supabase"

export function useReportEditor(reportId?: string) {
  const [isSaving, setIsSaving] = useState(false)

  const saveReport = async (reportData: any) => {
    setIsSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error("No session found while saving report")
      setIsSaving(false)
      return { error: "No session" }
    }

    const payload = {
      titulo: reportData.titulo,
      projeto_id: reportData.projeto_id,
      conteudo: reportData.conteudo,
      updated_at: new Date().toISOString()
    }

    let result
    if (reportId) {
      result = await supabase
        .from("relatorios")
        .update(payload)
        .eq("id", reportId)
        .select()
        .single()
    } else {
      result = await supabase
        .from("relatorios")
        .insert([payload])
        .select()
        .single()
    }

    setIsSaving(false)
    return result
  }

  return {
    saveReport,
    isSaving
  }
}
