"use client"

import { useState, useEffect } from "react"
import { ProfileIdentityCard } from "@/components/perfil/profile-identity-card"
import { ProfileForms } from "@/components/perfil/profile-forms"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function PerfilIdentidadeSection() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch(`/api/perfil?usuario_id=${user.id}&email=${user.email || ""}&nome_completo=${user.user_metadata?.full_name || ""}`)
      
      if (!res.ok) {
        throw new Error(await res.text())
      }

      const data = await res.json()
      setProfile(data)
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error)
      toast.error("Erro ao carregar dados do perfil")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-6 animate-in fade-in duration-500">
      {/* Coluna Esquerda: Identidade Visual */}
      <div className="space-y-6">
        <ProfileIdentityCard profile={profile} onUpdate={loadProfile} />
      </div>

      {/* Coluna Direita: Formulários */}
      <div className="space-y-6">
        <ProfileForms profile={profile} onUpdate={loadProfile} />
      </div>
    </div>
  )
}
