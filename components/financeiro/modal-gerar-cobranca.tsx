"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useState } from "react"
import { useAsaas } from "@/lib/hooks/use-asaas"
import { Loader2, Search, UserPlus, DollarSign } from "lucide-react"

export function ModalGerarCobranca({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { criarCobranca, atualizarCliente, clientes, isLoadingClientes } = useAsaas()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchCliente, setSearchCliente] = useState("")
  const [formData, setFormData] = useState({
    customer: "",
    customerName: "",
    cpfCnpj: "",
    billingType: "BOLETO",
    value: "",
    dueDate: "",
    description: ""
  })
  const [needsDocument, setNeedsDocument] = useState(false)

  const filteredClientes = clientes.filter((c: any) => 
    !searchCliente || 
    c.name?.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.cpfCnpj?.includes(searchCliente)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.customer) {
      setError("Selecione um cliente")
      return
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError("Informe um valor válido")
      return
    }
    if (!formData.dueDate) {
      setError("Informe a data de vencimento")
      return
    }

    setLoading(true)
    try {
      // Se o cliente não tinha documento e agora tem, atualizar no Asaas primeiro
      if (needsDocument && formData.cpfCnpj) {
        await atualizarCliente(formData.customer, {
          cpfCnpj: formData.cpfCnpj
        })
      }

      await criarCobranca({
        customer: formData.customer,
        billingType: formData.billingType,
        value: parseFloat(formData.value),
        dueDate: formData.dueDate,
        description: formData.description || undefined,
      })
      onOpenChange(false)
      setFormData({ customer: "", customerName: "", cpfCnpj: "", billingType: "BOLETO", value: "", dueDate: "", description: "" })
      setNeedsDocument(false)
    } catch (err: any) {
      setError(err.message || "Erro ao criar cobrança")
    } finally {
      setLoading(false)
    }
  }

  const selectCliente = (cliente: any) => {
    setFormData({ 
      ...formData, 
      customer: cliente.id, 
      customerName: cliente.name,
      cpfCnpj: cliente.cpfCnpj || "" 
    })
    setNeedsDocument(!cliente.cpfCnpj)
    setSearchCliente("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground font-mono sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Nova Cobrança
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Cliente Selection */}
          <div className="space-y-2">
            <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">Cliente Asaas *</Label>
            
            {formData.customer ? (
              <div className="flex items-center justify-between p-3 bg-secondary border border-border rounded-lg">
                <span className="text-xs text-foreground font-medium">{formData.customerName}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-[10px] text-neutral-500"
                  onClick={() => setFormData({ ...formData, customer: "", customerName: "" })}
                >
                  Alterar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                  <Input 
                    placeholder="Buscar por nome ou CPF/CNPJ..." 
                    className="bg-secondary border-border text-xs h-9 pl-9 focus:border-orange-500"
                    value={searchCliente}
                    onChange={e => setSearchCliente(e.target.value)}
                  />
                </div>
                <div className="max-h-32 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                  {isLoadingClientes ? (
                    <div className="p-3 text-center text-neutral-500 text-[10px]">
                      <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Carregando clientes...
                    </div>
                  ) : filteredClientes.length === 0 ? (
                    <div className="p-3 text-center text-neutral-600 text-[10px]">
                      Nenhum cliente encontrado no Asaas
                    </div>
                  ) : (
                    filteredClientes.slice(0, 8).map((c: any) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCliente(c)}
                        className="w-full text-left px-3 py-2 hover:bg-orange-500/5 transition-colors"
                      >
                        <p className="text-xs text-foreground font-medium">{c.name}</p>
                        <p className="text-[9px] text-neutral-500 font-mono">{c.cpfCnpj || c.email || c.id}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Documento (CPF/CNPJ) se necessário */}
          {needsDocument && (
            <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-orange-500">
                <UserPlus className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">Documento Necessário</span>
              </div>
              <p className="text-[9px] text-neutral-400">
                Este cliente não possui CPF/CNPJ cadastrado. Informe abaixo para continuar:
              </p>
              <Input 
                required
                placeholder="CPF ou CNPJ (apenas números)"
                className="bg-secondary border-border text-xs h-8 focus:border-orange-500"
                value={formData.cpfCnpj}
                onChange={e => setFormData({ ...formData, cpfCnpj: e.target.value })}
              />
            </div>
          )}

          {/* Valor + Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">Valor (R$) *</Label>
              <Input 
                required
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00" 
                className="bg-secondary border-border text-xs h-9 focus:border-orange-500"
                value={formData.value}
                onChange={e => setFormData({...formData, value: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">Vencimento *</Label>
              <Input 
                required
                type="date"
                className="bg-secondary border-border text-xs h-9 focus:border-orange-500 [color-scheme:dark]"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          {/* Tipo de pagamento */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">Forma de Pagamento</Label>
            <Select 
              value={formData.billingType} 
              onValueChange={v => setFormData({...formData, billingType: v})}
            >
              <SelectTrigger className="bg-secondary border-border text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="BOLETO" className="text-xs">Boleto Bancário</SelectItem>
                <SelectItem value="CREDIT_CARD" className="text-xs">Cartão de Crédito</SelectItem>
                <SelectItem value="PIX" className="text-xs">Pix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">Descrição (opcional)</Label>
            <Textarea 
              placeholder="Serviços de desenvolvimento web..." 
              className="bg-secondary border-border text-xs min-h-[60px] focus:border-orange-500 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-[10px] text-red-500 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
              <p className="font-bold">Erro ao criar cobrança:</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <Button 
            disabled={loading}
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold h-10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Cobrança"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
