"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Mail, RefreshCw, ChevronRight } from "lucide-react"

interface UsuariosSectionProps {
  onChange: () => void
}

const users = [
  { id: 1, name: "Carlos Silva", email: "carlos@focus.com.br", role: "Admin", modules: 16, lastAccess: "Agora", status: true, initials: "CS" },
  { id: 2, name: "Ana Santos", email: "ana@focus.com.br", role: "Tech Lead", modules: 12, lastAccess: "1h atras", status: true, initials: "AS" },
  { id: 3, name: "Pedro Lima", email: "pedro@focus.com.br", role: "Dev", modules: 8, lastAccess: "2h atras", status: true, initials: "PL" },
  { id: 4, name: "Mariana Costa", email: "mariana@focus.com.br", role: "Designer", modules: 6, lastAccess: "1 dia atras", status: true, initials: "MC" },
  { id: 5, name: "Lucas Ferreira", email: "lucas@focus.com.br", role: "Comercial", modules: 5, lastAccess: "3 dias atras", status: false, initials: "LF" },
]

const roles = [
  { name: "Admin", permissions: { ver: true, criar: true, editar: true, deletar: true, aprovar: true } },
  { name: "Tech Lead", permissions: { ver: true, criar: true, editar: true, deletar: false, aprovar: true } },
  { name: "Dev", permissions: { ver: true, criar: true, editar: true, deletar: false, aprovar: false } },
  { name: "Designer", permissions: { ver: true, criar: true, editar: false, deletar: false, aprovar: false } },
  { name: "Comercial", permissions: { ver: true, criar: true, editar: false, deletar: false, aprovar: false } },
  { name: "Estagiario", permissions: { ver: true, criar: false, editar: false, deletar: false, aprovar: false } },
]

const invites = [
  { email: "novo@focus.com.br", role: "Dev", sentDate: "25/03/2026", expiry: "01/04/2026", status: "PENDENTE" },
  { email: "designer@focus.com.br", role: "Designer", sentDate: "20/03/2026", expiry: "27/03/2026", status: "EXPIRADO" },
]

const modules = ["Projetos", "Sprint Board", "Pipeline", "Relatorios", "Backlog", "Contratos", "Notificacoes", "Activity Log"]

const roleColors: Record<string, string> = {
  Admin: "bg-orange-500/20 text-orange-500",
  "Tech Lead": "bg-blue-500/20 text-blue-400",
  Dev: "bg-green-500/20 text-green-400",
  Designer: "bg-purple-500/20 text-purple-400",
  Comercial: "bg-yellow-500/20 text-yellow-400",
  Estagiario: "bg-neutral-500/20 text-neutral-400",
}

export function UsuariosSection({ onChange }: UsuariosSectionProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Usuarios & Permissoes
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Gerencie usuarios, funcoes e convites
        </p>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="bg-transparent border-b border-[#2a2a2a] rounded-none w-full justify-start gap-0 h-auto p-0 mb-6">
          {["USUARIOS", "FUNCOES", "CONVITES"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase()}
              className="px-6 py-3 rounded-none bg-transparent text-neutral-500 font-mono text-xs tracking-widest data-[state=active]:text-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* USUARIOS Tab */}
        <TabsContent value="usuarios" className="mt-0">
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardContent className="p-0">
              <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
                <span className="text-neutral-400 text-sm font-mono">{users.length} usuarios</span>
                <Button
                  onClick={() => setInviteModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Convidar Usuario
                </Button>
              </div>
              <ScrollArea className="w-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a2a]">
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Nome</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Email</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Funcao</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Modulos</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Ultimo Acesso</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Status</th>
                      <th className="text-right p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-[#2a2a2a] hover:bg-[#1f1f1f] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xs font-mono">
                                {user.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-400 font-mono text-sm">{user.email}</td>
                        <td className="p-4">
                          <Badge className={`${roleColors[user.role]} text-[10px] font-mono`}>{user.role}</Badge>
                        </td>
                        <td className="p-4 text-neutral-400 font-mono text-sm">{user.modules} modulos</td>
                        <td className="p-4 text-neutral-400 font-mono text-sm">{user.lastAccess}</td>
                        <td className="p-4">
                          <Switch
                            checked={user.status}
                            onCheckedChange={onChange}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-orange-500">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FUNCOES Tab */}
        <TabsContent value="funcoes" className="mt-0 space-y-4">
          {roles.map((role) => (
            <Card key={role.name} className="bg-[#141414] border-[#2a2a2a]">
              <CardContent className="p-0">
                <button
                  onClick={() => setExpandedRole(expandedRole === role.name ? null : role.name)}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`${roleColors[role.name]} text-xs font-mono`}>{role.name}</Badge>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform ${expandedRole === role.name ? "rotate-90" : ""}`} />
                </button>
                {expandedRole === role.name && (
                  <div className="p-4 border-t border-[#2a2a2a] animate-in slide-in-from-top-2">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2 text-neutral-500 font-mono text-xs">MODULO</th>
                          <th className="text-center p-2 text-neutral-500 font-mono text-xs">VER</th>
                          <th className="text-center p-2 text-neutral-500 font-mono text-xs">CRIAR</th>
                          <th className="text-center p-2 text-neutral-500 font-mono text-xs">EDITAR</th>
                          <th className="text-center p-2 text-neutral-500 font-mono text-xs">DELETAR</th>
                          <th className="text-center p-2 text-neutral-500 font-mono text-xs">APROVAR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modules.slice(0, 4).map((mod) => (
                          <tr key={mod} className="border-t border-[#2a2a2a]">
                            <td className="p-2 text-white text-sm">{mod}</td>
                            {Object.keys(role.permissions).map((perm) => (
                              <td key={perm} className="text-center p-2">
                                <Checkbox
                                  checked={role.permissions[perm as keyof typeof role.permissions]}
                                  onCheckedChange={onChange}
                                  className="border-[#2a2a2a] data-[state=checked]:bg-orange-500"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" className="w-full bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono">
            <Plus className="w-4 h-4 mr-2" />
            Criar Funcao
          </Button>
        </TabsContent>

        {/* CONVITES Tab */}
        <TabsContent value="convites" className="mt-0">
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a2a]">
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Email</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Funcao</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Enviado</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Expira</th>
                      <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Status</th>
                      <th className="text-right p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite, i) => (
                      <tr key={i} className="border-b border-[#2a2a2a] hover:bg-[#1f1f1f]">
                        <td className="p-4 text-white font-mono text-sm">{invite.email}</td>
                        <td className="p-4">
                          <Badge className={`${roleColors[invite.role]} text-[10px] font-mono`}>{invite.role}</Badge>
                        </td>
                        <td className="p-4 text-neutral-400 font-mono text-sm">{invite.sentDate}</td>
                        <td className="p-4 text-neutral-400 font-mono text-sm">{invite.expiry}</td>
                        <td className="p-4">
                          <Badge className={`text-[10px] font-mono ${invite.status === "PENDENTE" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"}`}>
                            {invite.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-orange-500" title="Reenviar">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500" title="Cancelar">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="bg-[#141414] border-[#2a2a2a] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display">Convidar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Email</Label>
              <Input
                type="email"
                placeholder="email@empresa.com"
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Funcao</Label>
              <Select>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  {roles.map((role) => (
                    <SelectItem key={role.name} value={role.name.toLowerCase()}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Modulos</Label>
              <div className="grid grid-cols-2 gap-2">
                {modules.map((mod) => (
                  <div key={mod} className="flex items-center gap-2">
                    <Checkbox id={mod} className="border-[#2a2a2a] data-[state=checked]:bg-orange-500" />
                    <Label htmlFor={mod} className="text-neutral-400 text-sm font-mono cursor-pointer">{mod}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setInviteModalOpen(false)} className="text-neutral-400 font-mono">
              Cancelar
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-mono">
              <Mail className="w-4 h-4 mr-2" />
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
