"use client"

import { useEquipe, type TeamMember } from "@/lib/hooks/use-equipe"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MemberSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  filter?: (m: TeamMember) => boolean
  exclude?: string[]
  className?: string
  triggerClassName?: string
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function MemberSelect({
  value,
  onValueChange,
  placeholder = "Selecione um membro...",
  filter,
  exclude = [],
  triggerClassName,
}: MemberSelectProps) {
  const { equipe } = useEquipe()

  let members = equipe.filter((m) => m.status === "ativo")
  if (filter) members = members.filter(filter)
  if (exclude.length > 0) members = members.filter((m) => !exclude.includes(m.id))

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName ?? "bg-[#1A1A1A] border-border"}>
        <SelectValue placeholder={placeholder}>
          {value && (() => {
            const m = equipe.find((m) => m.id === value)
            if (!m) return placeholder
            return (
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={m.foto_url} />
                  <AvatarFallback
                    className="text-[9px] font-bold"
                    style={{ backgroundColor: m.cor_avatar ?? "#FF6B00" }}
                  >
                    {initials(m.nome)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{m.nome}</span>
              </div>
            )
          })()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-[#1A1A1A] border-border">
        {members.map((m) => (
          <SelectItem key={m.id} value={m.id} className="focus:bg-[#2A2A2A] cursor-pointer">
            <div className="flex items-center gap-2 py-0.5">
              <Avatar className="w-6 h-6">
                <AvatarImage src={m.foto_url} />
                <AvatarFallback
                  className="text-[9px] font-bold"
                  style={{ backgroundColor: m.cor_avatar ?? "#FF6B00" }}
                >
                  {initials(m.nome)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium text-foreground">{m.nome}</p>
                <p className="text-[10px] text-neutral-500">{m.cargo ?? m.setor}</p>
              </div>
            </div>
          </SelectItem>
        ))}
        {members.length === 0 && (
          <div className="py-4 px-2 text-center text-xs text-neutral-500">
            Nenhum membro disponível
          </div>
        )}
      </SelectContent>
    </Select>
  )
}
