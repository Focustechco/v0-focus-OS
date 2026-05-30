"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInter } from "@/lib/hooks/use-inter"
import { Send, Loader2, DollarSign, ArrowRight, UserCheck, CheckCircle2 } from "lucide-react"

interface ModalPixPagarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalPixPagar({ open, onOpenChange }: ModalPixPagarProps) {
  const { enviarPix, validarChavePix, saldo } = useInter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form fields
  const [chave, setChave] = useState("")
  const [valor, setValor] = useState("")
  const [descricao, setDescricao] = useState("")

  // Validation results
  const [destinatario, setDestinatario] = useState<{ nome: string; cpfCnpj: string } | null>(null)
  
  // Payment confirmation response
  const [comprovante, setComprovante] = useState<any>(null)

  const handleValidarChave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chave) return

    setLoading(true)
    try {
      const data = await validarChavePix(chave)
      setDestinatario({
        nome: data.titular?.nome || "Destinatário Não Identificado",
        cpfCnpj: data.titular?.cpfCnpj || chave
      })
      setStep(2)
    } catch (err) {
      console.error(err)
      alert("Erro ao validar chave Pix. Verifique os dados.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmarPagamento = async () => {
    if (!valor || Number(valor) <= 0 || !destinatario) return

    setLoading(true)
    try {
      const data = await enviarPix(Number(valor), chave, descricao)
      setComprovante(data)
      setStep(3)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Erro ao realizar pagamento Pix")
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setChave("")
    setValor("")
    setDescricao("")
    setDestinatario(null)
    setComprovante(null)
  }

  const saldoEstimado = saldo.disponivel - Number(valor || 0)

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) resetModal()
    }}>
      <DialogContent className="sm:max-w-md bg-card border-border font-mono text-foreground">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Send className="w-4 h-4 text-orange-500" />
            PAGAR COM PIX (TRANSFERIR)
          </DialogTitle>
        </DialogHeader>

        {/* Indicador de passos */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-neutral-800'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-neutral-800'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-orange-500' : 'bg-neutral-800'}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleValidarChave} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Insira a Chave Pix do Recebedor</Label>
              <Input
                required
                placeholder="E-mail, CPF, CNPJ, Celular ou Aleatória"
                value={chave}
                onChange={(e) => setChave(e.target.value)}
                className="bg-background border-border text-xs text-foreground h-9"
              />
              <p className="text-[8px] text-neutral-600 uppercase">
                A chave será validada junto ao Banco Inter antes do pagamento.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 border-border text-neutral-400 hover:text-foreground h-9 text-[10px] uppercase font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black h-9 text-[10px] uppercase font-bold"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Continuar"}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && destinatario && (
          <div className="space-y-4">
            <div className="bg-background p-3 rounded-lg border border-border space-y-2">
              <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-orange-500" /> Confirmar Recebedor
              </p>
              <div className="text-xs space-y-1">
                <p className="font-bold text-foreground">{destinatario.nome}</p>
                <p className="text-neutral-500 text-[10px]">{destinatario.cpfCnpj}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Valor do Pix (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-500" />
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="bg-background border-border text-xs text-foreground pl-8 h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Mensagem de Identificação (Opcional)</Label>
              <Input
                placeholder="Ex: Ref. prestação serviços"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="bg-background border-border text-xs text-foreground h-9"
              />
            </div>

            <div className="text-[9px] text-neutral-500 space-y-1 font-mono uppercase bg-neutral-900/50 p-2.5 rounded border border-border">
              <div className="flex justify-between">
                <span>Saldo Disponível:</span>
                <span className="text-foreground">R$ {saldo.disponivel.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border/50 pt-1 mt-1">
                <span>Saldo Estimado após envio:</span>
                <span className={saldoEstimado < 0 ? "text-red-500 animate-pulse" : "text-green-500"}>
                  R$ {saldoEstimado.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 border-border text-neutral-400 hover:text-foreground h-9 text-[10px] uppercase font-bold"
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmarPagamento}
                disabled={loading || saldoEstimado < 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black h-9 text-[10px] uppercase font-bold"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirmar e Enviar"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && comprovante && (
          <div className="space-y-5 text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Pagamento Pix Realizado!</p>
              <p className="text-[10px] text-neutral-500 font-mono">ID: {comprovante.idPagamento}</p>
            </div>

            <div className="bg-background p-3 rounded-lg border border-border space-y-2 text-left text-[10px] uppercase">
              <div className="flex justify-between">
                <span className="text-neutral-500">Destinatário:</span>
                <span className="font-bold text-foreground text-right max-w-[200px] truncate">
                  {destinatario?.nome}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Chave Pix:</span>
                <span className="text-foreground">{chave}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                <span className="text-neutral-500">Valor enviado:</span>
                <span className="font-bold text-green-500">R$ {Number(valor).toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black h-9 text-[10px] uppercase font-bold"
            >
              Fechar Painel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
