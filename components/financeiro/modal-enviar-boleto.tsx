"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAsaas } from "@/lib/hooks/use-asaas"
import { Loader2, Send, CheckCircle2 } from "lucide-react"

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
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await enviarBoletoEmail(cobrancaId, email)
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setEmail("")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Erro ao enviar boleto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSuccess(false); setError(null) } }}>
      <DialogContent className="bg-card border-border text-foreground font-mono sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar por E-mail
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <p className="text-sm text-green-500 font-bold">Enviado com sucesso!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">ID da Cobrança</Label>
              <Input 
                disabled
                value={cobrancaId}
                className="bg-secondary border-border text-xs h-9 opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">E-mail do Destinatário *</Label>
              <Input 
                required
                type="email"
                placeholder="cliente@email.com" 
                className="bg-secondary border-border text-xs h-9 focus:border-orange-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-[10px] text-red-500 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <Button 
              disabled={loading}
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold h-10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Cobrança"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
