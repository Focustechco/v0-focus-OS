"use client"

import { useEffect, useState } from "react"
import { LogOut, User as UserIcon, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { signOut } from "@/app/login/actions"

export function UserMenu() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Tenta buscar da nova tabela de perfil
      const { data } = await supabase
        .from("perfil")
        .select("nome_completo, cargo, avatar_url")
        .eq("usuario_id", user.id)
        .maybeSingle()

      setProfile(data || {
        nome_completo: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
        email_profissional: user.email,
        cargo: "Membro",
        avatar_url: null,
        status_cor: "verde"
      })
    }

    load()

    // Escuta atualizações do perfil para recarregar dados sem precisar de F5
    const handleUpdate = () => load()
    window.addEventListener('profile-updated', handleUpdate)
    return () => window.removeEventListener('profile-updated', handleUpdate)
  }, [])

  const initials =
    profile?.nome_completo
      ?.split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??"

  const statusColors: Record<string, string> = {
    verde: "bg-green-500",
    amarelo: "bg-yellow-500",
    vermelho: "bg-red-500",
    cinza: "bg-neutral-500",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full border border-[#2A2A2A] bg-[#141414] overflow-visible group"
        >
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.nome_completo} 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            <span className="text-xs font-mono font-bold text-orange-500 group-hover:text-orange-400">
              {initials}
            </span>
          )}
          {/* Status Dot */}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111111] ${statusColors[profile?.status_cor || "verde"]}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-[#2A2A2A] bg-[#0F0F0F] text-neutral-300 p-2"
      >
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex-shrink-0">
               {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.nome_completo} className="h-full w-full rounded-full object-cover" />
               ) : (
                <div className="h-full w-full rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-xs uppercase font-mono">
                  {initials}
                </div>
               )}
               <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0F0F0F] ${statusColors[profile?.status_cor || "verde"]}`} />
            </div>
            <div className="flex flex-col space-y-0.5 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {profile?.nome_completo || "Carregando..."}
              </p>
              <p className="text-[10px] text-neutral-500 truncate font-mono">
                {profile?.email_profissional}
              </p>
              <p className="font-mono text-[9px] uppercase text-orange-500 tracking-wider">
                {profile?.cargo}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2A2A2A] my-1" />
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-neutral-300 focus:bg-[#1A1A1A] focus:text-white rounded-md py-2 px-3"
        >
          <a href="/perfil" className="flex items-center">
            <UserIcon className="mr-3 h-4 w-4 text-orange-500" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-tight">MEU PERFIL</span>
              <span className="text-[9px] text-neutral-500 font-mono tracking-wider">IDENTIDADE & PERSONALIZAÇÃO</span>
            </div>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-neutral-300 focus:bg-[#1A1A1A] focus:text-white rounded-md py-2 px-3"
        >
          <a href="/configuracoes" className="flex items-center">
            <Cog className="mr-3 h-4 w-4" />
            <span className="text-xs font-medium">Configurações do Sistema</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#2A2A2A] my-1" />
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center rounded-sm px-3 py-2 text-xs font-mono tracking-widest uppercase text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sair do Sistema
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
