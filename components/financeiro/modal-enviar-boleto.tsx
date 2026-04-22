"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAsaas } from "@/lib/hooks/use-asaas"
import { Loader2, Send } from "lucide-react"

export function ModalEnviarBoleto({ 
  open, 
  onOpenChange, 
  cobrancaId 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  cobrancaId: string 
}) {
  const { enviarBoletoEmail } = useAsaas()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await enviarBoletoEmail(cobrancaId, email, "Segue o boleto para pagamento.")
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao enviar boleto:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f0f0f] border-[#1a1a1a] text-foreground font-mono max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <Send className="w-4 h-4" />
            DISPATCH_EMAIL.SH
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-neutral-500 uppercase">COBRANCA_ID</Label>
            <Input 
              disabled
              value={cobrancaId}
              className="bg-[#050505] border-[#1a1a1a] text-xs h-9 opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-neutral-500 uppercase">DESTINATARIO_EMAIL</Label>
            <Input 
              required
              type="email"
              placeholder="cliente@email.com" 
              className="bg-[#050505] border-[#1a1a1a] text-xs h-9 focus:border-orange-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <Button 
            disabled={loading}
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold h-10 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "RUN_DISPATCH()"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
