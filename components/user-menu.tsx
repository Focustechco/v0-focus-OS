"use client"

import { useEffect, useState } from "react"
import { LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/login/actions"

interface ProfileInfo {
  email: string
  fullName: string
  role: string
}

export function UserMenu() {
  const [profile, setProfile] = useState<ProfileInfo | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("email, full_name, role")
        .eq("id", user.id)
        .maybeSingle()

      setProfile({
        email: data?.email || user.email || "",
        fullName: data?.full_name || user.user_metadata?.full_name || "Usuário",
        role: data?.role || "member",
      })
    }

    load()
  }, [])

  const initials =
    profile?.fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full border border-[#2A2A2A] bg-[#141414] text-xs font-mono font-bold text-orange-500 hover:bg-[#1A1A1A] hover:text-orange-400"
        >
          {initials}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-[#2A2A2A] bg-[#0F0F0F] text-neutral-300"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">
              {profile?.fullName || "Carregando..."}
            </p>
            <p className="text-xs leading-none text-neutral-500">
              {profile?.email}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase text-orange-500">
              {profile?.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#2A2A2A]" />
        <DropdownMenuItem
          asChild
          className="cursor-pointer text-neutral-300 focus:bg-[#1A1A1A] focus:text-white"
        >
          <a href="/configuracoes">
            <UserIcon className="mr-2 h-4 w-4" />
            Configurações
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#2A2A2A]" />
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
