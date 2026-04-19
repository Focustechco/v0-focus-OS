"use client"

import { useState } from "react"
import { useEquipe, type TeamMember } from "@/lib/hooks/use-equipe"
import { useToast } from "@/components/reports/toast-notification"
import { NovoMembroModal } from "@/components/equipe/novo-membro-modal"
import { MembroDetalhesDrawer } from "@/components/equipe/membro-detalhes-drawer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Users,
  MoreVertical,
  Edit2,
  Eye,
  UserX,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

const TIPO_CONFIG: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
  colaborador: { label: "Colaborador", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  estagiario: { label: "Estagiário", color: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30" },
}

const SETORES_FILTER = ["Todos", "Tech", "Comercial", "Criativo", "Administração", "Financeiro"]
const TIPOS_FILTER = ["Todos", "admin", "colaborador", "estagiario"]

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

export function AbaMinhaEquipe({ userType }: { userType: string }) {
  const { equipe, isLoading, mutate } = useEquipe()
  const { showToast } = useToast()

  const [search, setSearch] = useState("")
  const [filterSetor, setFilterSetor] = useState("Todos")
  const [filterTipo, setFilterTipo] = useState("Todos")
  const [novoMembroOpen, setNovoMembroOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [detalhesOpen, setDetalhesOpen] = useState(false)

  const filtered = equipe.filter((m) => {
    const matchSearch =
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.cargo?.toLowerCase().includes(search.toLowerCase()) ||
      m.setor?.toLowerCase().includes(search.toLowerCase())
    const matchSetor = filterSetor === "Todos" || m.setor?.toLowerCase() === filterSetor.toLowerCase()
    const matchTipo = filterTipo === "Todos" || m.tipo === filterTipo
    return matchSearch && matchSetor && matchTipo
  })

  const activeCount = equipe.filter((m) => m.status === "ativo").length
  const totalCount = equipe.length

  const openDetalhes = (id: string) => {
    setSelectedMemberId(id)
    setDetalhesOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <p className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">Total</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <p className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">Ativos</p>
            <p className="text-2xl font-bold text-green-400 font-mono mt-1">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <p className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">Tech</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {equipe.filter((m) => m.setor === "tech").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <p className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">Comercial</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {equipe.filter((m) => m.setor === "comercial").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, cargo ou setor..."
              className="pl-9 bg-[#141414] border-[#2A2A2A] text-white w-full sm:w-72 focus:border-orange-500/50"
            />
          </div>

          {/* Setor filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {SETORES_FILTER.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSetor(s)}
                className={cn(
                  "px-3 py-1 rounded text-[10px] font-mono uppercase transition-all",
                  filterSetor === s
                    ? "bg-orange-500 text-white"
                    : "bg-[#141414] border border-[#2A2A2A] text-neutral-400 hover:border-orange-500/30"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setNovoMembroOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Membro
        </Button>
      </div>



      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-orange-500">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          <span className="font-mono text-sm animate-pulse">Carregando equipe...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">
            {search || filterSetor !== "Todos" || filterTipo !== "Todos"
              ? "Nenhum membro encontrado com os filtros atuais."
              : "Nenhum membro cadastrado ainda."}
          </p>
          {!search && filterSetor === "Todos" && filterTipo === "Todos" && (
            <Button
              onClick={() => setNovoMembroOpen(true)}
              variant="outline"
              className="mt-4 border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
            >
              Cadastrar Primeiro Membro
            </Button>
          )}
        </div>
      ) : (
        <Card className="bg-[#141414] border-[#2A2A2A] overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {["Membro", "Cargo", "Setor", "Tipo", "Status", "Email", "Telefone", "Admissão", "Ações"].map((h) => (
                    <th key={h} className="text-left p-4 text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const tipoInfo = TIPO_CONFIG[m.tipo] ?? TIPO_CONFIG.colaborador
                  return (
                    <tr
                      key={m.id}
                      onClick={() => openDetalhes(m.id)}
                      className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                    >
                      {/* Avatar + Nome */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 flex-shrink-0">
                            <AvatarImage src={m.foto_url} />
                            <AvatarFallback
                              className="text-xs font-bold"
                              style={{ backgroundColor: m.cor_avatar ?? "#FF6B00" }}
                            >
                              {initials(m.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors whitespace-nowrap">
                            {m.nome}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-neutral-400 whitespace-nowrap">{m.cargo ?? "—"}</td>
                      <td className="p-4 text-xs text-neutral-400 capitalize whitespace-nowrap">{m.setor ?? "—"}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={`text-[10px] ${tipoInfo.color} whitespace-nowrap`}>
                          {tipoInfo.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            m.status === "ativo" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-neutral-600"
                          )} />
                          <span className="text-xs text-neutral-400 capitalize">{m.status}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-neutral-400 truncate max-w-[160px]">{m.email}</td>
                      <td className="p-4 text-xs text-neutral-400 whitespace-nowrap font-mono">{m.telefone ?? "—"}</td>
                      <td className="p-4 text-xs text-neutral-400 whitespace-nowrap font-mono">
                        {m.data_admissao ? new Date(m.data_admissao).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-500 hover:text-orange-500"
                            onClick={(e) => { e.stopPropagation(); openDetalhes(m.id) }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-white">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                              <DropdownMenuItem
                                onClick={() => openDetalhes(m.id)}
                                className="focus:bg-[#2A2A2A] cursor-pointer text-xs"
                              >
                                <Eye className="w-3.5 h-3.5 mr-2" /> Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-[#2A2A2A] cursor-pointer text-xs">
                                <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-[#2A2A2A] cursor-pointer text-xs text-yellow-500">
                                <UserX className="w-3.5 h-3.5 mr-2" />
                                {m.status === "ativo" ? "Desativar" : "Ativar"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-[#2A2A2A] cursor-pointer text-xs text-red-500">
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <NovoMembroModal
        open={novoMembroOpen}
        onOpenChange={setNovoMembroOpen}
        onSuccess={() => {
          mutate()
          showToast("success", "Membro cadastrado na equipe!")
        }}
      />

      <MembroDetalhesDrawer
        memberId={selectedMemberId}
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
      />
    </div>
  )
}
