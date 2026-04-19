"use client"

import { useState, useEffect } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { ProfileIdentityCard } from "@/components/perfil/profile-identity-card"
import { ProfileForms } from "@/components/perfil/profile-forms"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function PerfilPage() {
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
      <PageWrapper title="PERFIL" breadcrumb="PERSONALIZACAO">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="PERFIL & IDENTIDADE" breadcrumb="CONFIGURACOES / PERFIL">
      <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
        {/* Coluna Esquerda: Identidade Visual */}
        <div className="space-y-6">
          <ProfileIdentityCard profile={profile} onUpdate={loadProfile} />
        </div>

        {/* Coluna Direita: Formulários */}
        <div className="space-y-6">
          <ProfileForms profile={profile} onUpdate={loadProfile} />
        </div>
      </div>
    </PageWrapper>
  )
}
