"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Scale,
  Eye,
  Check,
  Send,
  Search,
  Plus,
  Upload,
  Calendar,
  Filter,
} from "lucide-react"

const contracts = [
  { id: "CTR-001", name: "Contrato de Servicos - TechCorp", client: "TechCorp Ltda", value: "R$ 45.000", status: "ATIVO", date: "15/01/2026" },
  { id: "CTR-002", name: "NDA - Startup XYZ", client: "Startup XYZ", value: "R$ 0", status: "EM REVISAO", date: "20/02/2026" },
  { id: "CTR-003", name: "Licenciamento Software", client: "Beta Solutions", value: "R$ 120.000", status: "PENDENTE APROVACAO", date: "01/03/2026" },
  { id: "CTR-004", name: "Parceria Estrategica", client: "Alpha Inc", value: "R$ 250.000", status: "ATIVO", date: "10/03/2026" },
  { id: "CTR-005", name: "Suporte Tecnico Anual", client: "Delta Corp", value: "R$ 36.000", status: "VENCIDO", date: "15/12/2025" },
  { id: "CTR-006", name: "Consultoria DevOps", client: "Gamma SA", value: "R$ 85.000", status: "ATIVO", date: "22/03/2026" },
  { id: "CTR-007", name: "Manutencao Sistemas", client: "Omega Tech", value: "R$ 28.000", status: "EM REVISAO", date: "25/03/2026" },
]

const statusColors: Record<string, string> = {
  "ATIVO": "bg-green-500/20 text-green-500 border-green-500/30",
  "EM REVISAO": "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  "PENDENTE APROVACAO": "bg-orange-500/20 text-orange-500 border-orange-500/30",
  "VENCIDO": "bg-red-500/20 text-red-500 border-red-500/30",
}

export function Juridico() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<typeof contracts[0] | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-wide">GESTAO JURIDICA</h2>
            <p className="text-neutral-500 text-sm font-mono">contratos e documentos legais</p>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-[#141414] border-[#2a2a2a] w-[500px]">
            <SheetHeader>
              <SheetTitle className="text-white font-display">Adicionar Contrato</SheetTitle>
              <SheetDescription className="text-neutral-500 font-mono text-sm">
                Preencha os dados do novo contrato
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-neutral-400 font-mono text-xs uppercase">Nome do Contrato</Label>
                <Input className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 font-mono text-xs uppercase">Cliente</Label>
                <Select>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="techcorp">TechCorp Ltda</SelectItem>
                    <SelectItem value="startup">Startup XYZ</SelectItem>
                    <SelectItem value="beta">Beta Solutions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 font-mono text-xs uppercase">Valor</Label>
                <Input className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500" placeholder="R$ 0,00" />
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 font-mono text-xs uppercase">Tipo</Label>
                <Select>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    <SelectItem value="servicos">Prestacao de Servicos</SelectItem>
                    <SelectItem value="licenciamento">Licenciamento</SelectItem>
                    <SelectItem value="nda">NDA</SelectItem>
                    <SelectItem value="parceria">Parceria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 font-mono text-xs uppercase">Upload PDF</Label>
                <div className="border-2 border-dashed border-orange-500/30 rounded p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-neutral-400 text-sm font-mono">Arraste ou clique para upload</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-neutral-400 font-mono text-xs uppercase">Observacoes</Label>
                <Textarea className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500 min-h-[100px]" />
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase mt-4">
                Salvar Contrato
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filter Bar */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                placeholder="Buscar contratos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="EM REVISAO">Em Revisao</SelectItem>
                <SelectItem value="PENDENTE APROVACAO">Pendente Aprovacao</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono">
              <Calendar className="w-4 h-4 mr-2" />
              Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">ID</th>
                  <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Contrato</th>
                  <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Cliente</th>
                  <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Valor</th>
                  <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Status</th>
                  <th className="text-left p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Data</th>
                  <th className="text-right p-4 text-neutral-500 font-mono text-xs tracking-wider uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="border-b border-[#2a2a2a] hover:bg-[#1f1f1f] hover:border-l-2 hover:border-l-orange-500 transition-all"
                  >
                    <td className="p-4 text-neutral-400 font-mono text-sm">{contract.id}</td>
                    <td className="p-4 text-white font-medium text-sm">{contract.name}</td>
                    <td className="p-4 text-neutral-300 text-sm">{contract.client}</td>
                    <td className="p-4 text-orange-500 font-mono text-sm">{contract.value}</td>
                    <td className="p-4">
                      <Badge className={`${statusColors[contract.status]} text-[10px] font-mono border`}>
                        {contract.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-neutral-400 font-mono text-sm">{contract.date}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                          title="Aprovar"
                          onClick={() => {
                            setSelectedContract(contract)
                            setApproveModalOpen(true)
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                          title="Enviar ao Advogado"
                          onClick={() => {
                            setSelectedContract(contract)
                            setSendModalOpen(true)
                          }}
                        >
                          <Send className="w-4 h-4" />
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

      {/* Send to Lawyer Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="bg-[#141414] border-[#2a2a2a] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display">Enviar ao Advogado</DialogTitle>
            <DialogDescription className="text-neutral-500 font-mono text-sm">
              {selectedContract?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Email do Advogado</Label>
              <Input
                defaultValue="juridico@focusadvocacia.com.br"
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Instrucoes / Notas</Label>
              <Textarea
                placeholder="Adicione instrucoes para o advogado..."
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500 min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setSendModalOpen(false)}
              className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setSendModalOpen(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-mono"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Contract Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="bg-[#141414] border-[#2a2a2a] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-display">Aprovar Contrato</DialogTitle>
            <DialogDescription className="text-neutral-500 font-mono text-sm">
              Confirme a aprovacao do contrato
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
            <p className="text-white font-medium">{selectedContract?.name}</p>
            <p className="text-neutral-500 text-sm font-mono mt-1">Cliente: {selectedContract?.client}</p>
            <p className="text-orange-500 text-sm font-mono">Valor: {selectedContract?.value}</p>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              className="border-[#2a2a2a] data-[state=checked]:bg-orange-500"
            />
            <Label htmlFor="terms" className="text-neutral-400 text-sm font-mono">
              Li e confirmo os termos do contrato
            </Label>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setApproveModalOpen(false)
                setTermsAccepted(false)
              }}
              className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setApproveModalOpen(false)
                setTermsAccepted(false)
              }}
              disabled={!termsAccepted}
              className="bg-green-600 hover:bg-green-700 text-white font-mono disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar Aprovacao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
