import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type TipoPermissao = "admin" | "colaborador" | "estagiario" | null

export function usePermissoes() {
  const [tipo, setTipo] = useState<TipoPermissao>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        setTipo("colaborador") // default fallback
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from("equipe")
        .select("tipo")
        .eq("email", session.user.email)
        .maybeSingle()

      setTipo((data?.tipo as TipoPermissao) ?? "colaborador")
      setIsLoading(false)
    }

    fetch()
  }, [])

  return {
    tipo,
    isLoading,
    isAdmin: tipo === "admin",
    isColaborador: tipo === "colaborador",
    isEstagiario: tipo === "estagiario",
    canSeeFinancials: tipo === "admin",
    canDelete: tipo === "admin",
    canManageTeam: tipo === "admin",
    canSeeIntelligence: tipo !== "estagiario",
    canSeeComercial: tipo !== "estagiario",
  }
}
