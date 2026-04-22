"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useState } from "react"
import { useAsaas } from "@/lib/hooks/use-asaas"
import { Loader2 } from "lucide-react"

export function ModalGerarCobranca({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { criarCobranca } = useAsaas()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer: "",
    billingType: "BOLETO",
    value: "",
    dueDate: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await criarCobranca({
        ...formData,
        value: parseFloat(formData.value)
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao gerar cobrança:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f0f0f] border-[#1a1a1a] text-foreground font-mono max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-orange-500 uppercase tracking-widest">
            GENERATE_NEW_INVOICE.EXE
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-neutral-500 uppercase">ID_CLIENTE</Label>
            <Input 
              required
              placeholder="cus_000005123456" 
              className="bg-[#050505] border-[#1a1a1a] text-xs h-9 focus:border-orange-500"
              value={formData.customer}
              onChange={e => setFormData({...formData, customer: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-neutral-500 uppercase">VALOR_BRL</Label>
              <Input 
                required
                type="number"
                step="0.01"
                placeholder="0.00" 
                className="bg-[#050505] border-[#1a1a1a] text-xs h-9 focus:border-orange-500"
                value={formData.value}
                onChange={e => setFormData({...formData, value: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-neutral-500 uppercase">VENCIMENTO</Label>
              <Input 
                required
                type="date"
                className="bg-[#050505] border-[#1a1a1a] text-xs h-9 focus:border-orange-500 [color-scheme:dark]"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-neutral-500 uppercase">METODO_PAGAMENTO</Label>
            <Select 
              value={formData.billingType} 
              onValueChange={v => setFormData({...formData, billingType: v})}
            >
              <SelectTrigger className="bg-[#050505] border-[#1a1a1a] text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f0f] border-[#1a1a1a]">
                <SelectItem value="BOLETO" className="text-xs">BOLETO_BANCARIO</SelectItem>
                <SelectItem value="CREDIT_CARD" className="text-xs">CARTAO_CREDITO</SelectItem>
                <SelectItem value="PIX" className="text-xs">PIX_INSTANTANEO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-neutral-500 uppercase">DESCRICAO</Label>
            <Input 
              placeholder="Serviços de desenvolvimento..." 
              className="bg-[#050505] border-[#1a1a1a] text-xs h-9 focus:border-orange-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <Button 
            disabled={loading}
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold h-10 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "EXECUTE_CREATE()"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
