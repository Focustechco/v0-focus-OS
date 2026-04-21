"use client"

import { useEffect, useState } from "react"
import { LogOut, User as UserIcon, Cog, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure theme is only toggled on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

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
        <div
          role="button"
          tabIndex={0}
          className="relative flex-none min-h-0 min-w-0 shrink-0 cursor-pointer group outline-none"
          style={{ width: '36px', height: '36px' }}
        >
          {/* Circular Wrapper for Image/Initials */}
          <div 
            className="avatar-circle border border-border bg-card transition-colors group-hover:border-primary/50"
            style={{ width: '36px', height: '36px' }}
          >
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.nome_completo} 
              />
            ) : (
              <span className="text-xs font-mono font-bold text-primary group-hover:text-primary/80">
                {initials}
              </span>
            )}
          </div>
          {/* Status Dot - Outside the overflow:hidden wrapper */}
          <span 
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColors[profile?.status_cor || "verde"]}`} 
            style={{ borderRadius: '50%', zIndex: 10 }}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-border bg-popover text-popover-foreground p-2"
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
               <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-popover ${statusColors[profile?.status_cor || "verde"]}`} />
            </div>
            <div className="flex flex-col space-y-0.5 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
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
        <DropdownMenuSeparator className="bg-border my-1" />
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-foreground focus:bg-accent/10 focus:text-accent rounded-md py-2 px-3"
        >
          <a href="/perfil" className="flex items-center">
            <UserIcon className="mr-3 h-4 w-4 text-primary" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold tracking-tight">MEU PERFIL</span>
              <span className="text-[9px] text-neutral-500 font-mono tracking-wider">IDENTIDADE & PERSONALIZAÇÃO</span>
            </div>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-foreground focus:bg-accent/10 focus:text-accent rounded-md py-2 px-3"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && (theme === "dark" ? (
            <>
              <Sun className="mr-3 h-4 w-4 text-orange-500" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold tracking-tight">MODO CLARO</span>
                <span className="text-[9px] text-neutral-500 font-mono tracking-wider">VISUAL CLARO & LIMPO</span>
              </div>
            </>
          ) : (
            <>
              <Moon className="mr-3 h-4 w-4 text-orange-500" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold tracking-tight">MODO ESCURO</span>
                <span className="text-[9px] text-neutral-500 font-mono tracking-wider">VISUAL DARK & FOCO</span>
              </div>
            </>
          ))}
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-foreground focus:bg-accent/10 focus:text-accent rounded-md py-2 px-3"
        >
          <a href="/configuracoes" className="flex items-center">
            <Cog className="mr-3 h-4 w-4" />
            <span className="text-xs font-medium">Configurações do Sistema</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border my-1" />
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
