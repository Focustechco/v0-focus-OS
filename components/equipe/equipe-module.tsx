"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Building2, Loader2, AlertCircle } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  department: string | null
  avatar_url: string | null
  status: string
  created_at: string
}

interface Team {
  id: string
  name: string
  description: string | null
  color: string
}

interface Membership {
  team_id: string
  user_id: string
  role_in_team: string
}

interface TeamResponse {
  profiles: Profile[]
  teams: Team[]
  memberships: Membership[]
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ${res.status}`)
  return res.json() as Promise<TeamResponse>
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-red-500/10 text-red-400 border-red-500/30" },
  lead: { label: "Lead", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
  member: { label: "Membro", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  intern: { label: "Estagiário", color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  viewer: { label: "Viewer", color: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30" },
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function EquipeModule() {
  const { data, error, isLoading } = useSWR<TeamResponse>("/api/team", fetcher)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-neutral-500">Carregando equipe...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-400">Erro ao carregar equipe</p>
            <p className="text-xs text-neutral-400">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    )
  }

  const profiles = data?.profiles ?? []
  const teams = data?.teams ?? []
  const memberships = data?.memberships ?? []

  const activeCount = profiles.filter((p) => p.status === "active").length

  const membersByTeam = teams.map((team) => ({
    team,
    members: memberships
      .filter((m) => m.team_id === team.id)
      .map((m) => profiles.find((p) => p.id === m.user_id))
      .filter((p): p is Profile => Boolean(p)),
  }))

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-[#2A2A2A] bg-[#141414]">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-mono text-xs uppercase text-neutral-500">Membros</p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {profiles.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-500/60" />
          </CardContent>
        </Card>
        <Card className="border-[#2A2A2A] bg-[#141414]">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-mono text-xs uppercase text-neutral-500">Ativos</p>
              <p className="mt-1 font-display text-2xl font-bold text-green-400">
                {activeCount}
              </p>
            </div>
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
          </CardContent>
        </Card>
        <Card className="border-[#2A2A2A] bg-[#141414]">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-mono text-xs uppercase text-neutral-500">Equipes</p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {teams.length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-orange-500/60" />
          </CardContent>
        </Card>
      </div>

      {/* Teams */}
      {membersByTeam.length > 0 && (
        <Card className="border-[#2A2A2A] bg-[#141414]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-sm font-medium tracking-wider text-neutral-300">
              EQUIPES
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-[#2A2A2A] p-0">
            {membersByTeam.map(({ team, members }) => (
              <div key={team.id} className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: team.color }}
                  />
                  <h3 className="text-sm font-bold text-white">{team.name}</h3>
                  <Badge variant="outline" className="ml-auto border-[#2A2A2A] text-[10px] text-neutral-500">
                    {members.length} {members.length === 1 ? "membro" : "membros"}
                  </Badge>
                </div>
                {team.description && (
                  <p className="mb-3 text-xs text-neutral-500">{team.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {members.length === 0 ? (
                    <p className="text-xs italic text-neutral-600">Sem membros</p>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 rounded-md border border-[#2A2A2A] bg-[#0A0A0A] px-2 py-1.5"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/10 font-mono text-[10px] font-bold text-orange-500">
                          {initials(member.full_name)}
                        </div>
                        <span className="text-xs text-neutral-300">{member.full_name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All members */}
      <Card className="border-[#2A2A2A] bg-[#141414]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-sm font-medium tracking-wider text-neutral-300">
            TODOS OS MEMBROS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {profiles.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-neutral-500">
                Nenhum membro cadastrado ainda.
              </p>
              <p className="mt-2 text-xs text-neutral-600">
                Novos usuários aparecem aqui após se cadastrarem via{" "}
                <code className="rounded bg-[#0A0A0A] px-1 font-mono">/login</code>.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#2A2A2A]">
              {profiles.map((member) => {
                const roleInfo = ROLE_LABELS[member.role] ?? ROLE_LABELS.member
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-[#1A1A1A]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 font-mono text-xs font-bold text-orange-500">
                      {initials(member.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {member.full_name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${roleInfo.color}`}
                      >
                        {roleInfo.label}
                      </Badge>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          member.status === "active"
                            ? "bg-green-500"
                            : "bg-neutral-600"
                        }`}
                        title={member.status}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
