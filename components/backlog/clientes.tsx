"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  Eye,
  Pencil,
  Archive,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  FolderKanban,
  Clock,
} from "lucide-react"

const clients = [
  {
    id: 1,
    name: "TechCorp Ltda",
    cnpj: "12.345.678/0001-90",
    segment: "Tecnologia",
    status: "ATIVO",
    activeProjects: 3,
    mrr: "R$ 15.000",
    contact: "contato@techcorp.com.br",
    address: "Av. Paulista, 1000, Sao Paulo - SP",
    notes: "Cliente desde 2022. Relacionamento estrategico.",
    team: "Carlos Silva",
    contracts: ["CTR-001", "CTR-004"],
  },
  {
    id: 2,
    name: "Startup XYZ",
    cnpj: "98.765.432/0001-10",
    segment: "SaaS",
    status: "ATIVO",
    activeProjects: 2,
    mrr: "R$ 8.500",
    contact: "hello@startupxyz.io",
    address: "Rua Augusta, 500, Sao Paulo - SP",
    notes: "Startup em crescimento. Potencial de upsell.",
    team: "Ana Santos",
    contracts: ["CTR-002"],
  },
  {
    id: 3,
    name: "Beta Solutions",
    cnpj: "11.222.333/0001-44",
    segment: "Consultoria",
    status: "PROSPECT",
    activeProjects: 0,
    mrr: "R$ 0",
    contact: "comercial@beta.com",
    address: "Rua do Comercio, 200, Rio de Janeiro - RJ",
    notes: "Negociacao em andamento. Proposta enviada.",
    team: "Pedro Lima",
    contracts: [],
  },
  {
    id: 4,
    name: "Alpha Inc",
    cnpj: "55.666.777/0001-88",
    segment: "E-commerce",
    status: "ATIVO",
    activeProjects: 1,
    mrr: "R$ 22.000",
    contact: "team@alphainc.com",
    address: "Av. Brasil, 1500, Belo Horizonte - MG",
    notes: "Maior cliente em MRR. Atencao prioritaria.",
    team: "Mariana Costa",
    contracts: ["CTR-003"],
  },
  {
    id: 5,
    name: "Delta Corp",
    cnpj: "33.444.555/0001-22",
    segment: "Financeiro",
    status: "INATIVO",
    activeProjects: 0,
    mrr: "R$ 0",
    contact: "info@deltacorp.com.br",
    address: "Rua das Financas, 800, Curitiba - PR",
    notes: "Contrato encerrado em 2025. Possivel retorno.",
    team: "Lucas Ferreira",
    contracts: ["CTR-005"],
  },
]

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-500/20 text-green-500 border-green-500/30",
  INATIVO: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  PROSPECT: "bg-orange-500/20 text-orange-500 border-orange-500/30",
}

const historyItems = [
  { date: "25/03/2026", action: "Reuniao de alinhamento", user: "Carlos S." },
  { date: "20/03/2026", action: "Proposta enviada", user: "Ana M." },
  { date: "15/03/2026", action: "Primeiro contato", user: "Pedro L." },
]

export function Clientes() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [segmentFilter, setSegmentFilter] = useState("all")
  const [expandedClient, setExpandedClient] = useState<number | null>(null)
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.cnpj.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesSegment = segmentFilter === "all" || client.segment === segmentFilter
    return matchesSearch && matchesStatus && matchesSegment
  })

  const segments = [...new Set(clients.map((c) => c.segment))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-display font-bold text-white tracking-wide">CLIENTES</h2>
          <Badge className="bg-orange-500/20 text-orange-500 font-mono text-xs">
            {clients.length} cadastrados
          </Badge>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-[#2a2a2a] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white font-display">Adicionar Cliente</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-400 font-mono text-xs uppercase">Nome</Label>
                  <Input className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-400 font-mono text-xs uppercase">CNPJ</Label>
                  <Input className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono" placeholder="00.000.000/0000-00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-400 font-mono text-xs uppercase">Segmento</Label>
                  <Select>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                      {segments.map((seg) => (
                        <SelectItem key={seg} value={seg.toLowerCase()}>{seg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-400 font-mono text-xs uppercase">Status</Label>
                  <Select>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 font-mono text-xs uppercase">Email de Contato</Label>
                <Input className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono" type="email" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 font-mono text-xs uppercase">Observacoes</Label>
                <Textarea className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono min-h-[80px]" />
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase">
                Salvar Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
                <SelectItem value="PROSPECT">Prospect</SelectItem>
              </SelectContent>
            </Select>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-[160px] bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                <SelectValue placeholder="Segmento" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="all">Todos</SelectItem>
                {segments.map((seg) => (
                  <SelectItem key={seg} value={seg}>{seg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-0">
          {filteredClients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400 font-mono">Nenhum cliente encontrado</p>
              <p className="text-neutral-600 text-sm font-mono mt-1">Tente ajustar os filtros ou adicione um novo cliente</p>
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cliente
              </Button>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a2a]">
                    <th className="w-8"></th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Cliente</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">CNPJ</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Segmento</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Status</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Projetos</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">MRR</th>
                    <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Contato</th>
                    <th className="text-right p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <>
                      <tr
                        key={client.id}
                        className="border-b border-[#2a2a2a] hover:bg-[#1f1f1f] hover:border-l-2 hover:border-l-orange-500 transition-all cursor-pointer"
                        onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                      >
                        <td className="pl-4">
                          {expandedClient === client.id ? (
                            <ChevronDown className="w-4 h-4 text-orange-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-neutral-500" />
                          )}
                        </td>
                        <td className="p-4 text-white font-medium text-sm">{client.name}</td>
                        <td className="p-4 text-neutral-400 font-mono text-sm">{client.cnpj}</td>
                        <td className="p-4 text-neutral-300 text-sm">{client.segment}</td>
                        <td className="p-4">
                          <Badge className={`${statusColors[client.status]} text-[10px] font-mono border`}>
                            {client.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-neutral-300 font-mono text-sm">{client.activeProjects}</td>
                        <td className="p-4 text-orange-500 font-mono text-sm">{client.mrr}</td>
                        <td className="p-4 text-neutral-400 text-sm truncate max-w-[200px]">{client.contact}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
                              onClick={() => {
                                setSelectedClient(client)
                                setDetailOpen(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-400 hover:text-orange-500 hover:bg-orange-500/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/10"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedClient === client.id && (
                        <tr className="bg-[#1a1a1a]">
                          <td colSpan={9} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="text-neutral-500 text-xs font-mono uppercase">Endereco</p>
                                  <p className="text-white text-sm">{client.address}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <FileText className="w-4 h-4 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="text-neutral-500 text-xs font-mono uppercase">Observacoes</p>
                                  <p className="text-white text-sm">{client.notes}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Users className="w-4 h-4 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="text-neutral-500 text-xs font-mono uppercase">Responsavel</p>
                                  <p className="text-white text-sm">{client.team}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Client Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="bg-[#141414] border-[#2a2a2a] w-[600px] p-0">
          {selectedClient && (
            <>
              <SheetHeader className="p-6 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-orange-500/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <SheetTitle className="text-white font-display text-xl">{selectedClient.name}</SheetTitle>
                    <p className="text-neutral-500 font-mono text-sm">{selectedClient.cnpj}</p>
                  </div>
                </div>
              </SheetHeader>
              <Tabs defaultValue="info" className="flex-1">
                <TabsList className="bg-transparent border-b border-[#2a2a2a] rounded-none w-full justify-start gap-0 h-auto p-0">
                  {["Info Geral", "Contratos", "Projetos", "Historico"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab.toLowerCase().replace(" ", "-")}
                      className="px-6 py-3 rounded-none bg-transparent text-neutral-500 font-mono text-xs data-[state=active]:text-orange-500 data-[state=active]:bg-transparent"
                    >
                      {tab.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <TabsContent value="info-geral" className="p-6 space-y-6 mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-neutral-500 text-xs font-mono">EMAIL</p>
                          <p className="text-white text-sm">{selectedClient.contact}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-neutral-500 text-xs font-mono">ENDERECO</p>
                          <p className="text-white text-sm">{selectedClient.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                        <Users className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-neutral-500 text-xs font-mono">RESPONSAVEL</p>
                          <p className="text-white text-sm">{selectedClient.team}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                        <p className="text-neutral-500 text-xs font-mono mb-2">OBSERVACOES</p>
                        <p className="text-white text-sm">{selectedClient.notes}</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="contratos" className="p-6 mt-0">
                    {selectedClient.contracts.length > 0 ? (
                      <div className="space-y-3">
                        {selectedClient.contracts.map((contract) => (
                          <div key={contract} className="p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-orange-500" />
                              <span className="text-white font-mono text-sm">{contract}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-400">
                              Ver
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500 font-mono text-sm text-center py-8">Nenhum contrato vinculado</p>
                    )}
                  </TabsContent>
                  <TabsContent value="projetos" className="p-6 mt-0">
                    {selectedClient.activeProjects > 0 ? (
                      <div className="space-y-3">
                        {Array.from({ length: selectedClient.activeProjects }).map((_, i) => (
                          <div key={i} className="p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FolderKanban className="w-4 h-4 text-orange-500" />
                              <span className="text-white text-sm">Projeto {i + 1}</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500 text-[10px]">EM ANDAMENTO</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-500 font-mono text-sm text-center py-8">Nenhum projeto ativo</p>
                    )}
                  </TabsContent>
                  <TabsContent value="historico" className="p-6 mt-0">
                    <div className="space-y-3">
                      {historyItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                          <Clock className="w-4 h-4 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-white text-sm">{item.action}</p>
                            <p className="text-neutral-500 text-xs font-mono">{item.date} por {item.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
