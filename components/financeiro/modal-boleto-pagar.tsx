"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInter } from "@/lib/hooks/use-inter"
import { FileText, Loader2, DollarSign, CheckCircle, Search } from "lucide-react"

interface ModalBoletoPagarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalBoletoPagar({ open, onOpenChange }: ModalBoletoPagarProps) {
  const { pagarBoleto, validarCodigoBarras, saldo } = useInter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Input code
  const [codigoBarras, setCodigoBarras] = useState("")

  // Validation results
  const [dadosBoleto, setDadosBoleto] = useState<{
    beneficiario: string
    valor: number
    dataVencimento: string
    codigoBarras: string
  } | null>(null)

  // Payment result
  const [comprovante, setComprovante] = useState<any>(null)

  const handleValidarBoleto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigoBarras) return

    setLoading(true)
    try {
      const data = await validarCodigoBarras(codigoBarras)
      setDadosBoleto({
        beneficiario: data.beneficiario || "Beneficiário do Boleto",
        valor: data.valor || 0,
        dataVencimento: data.dataVencimento || "",
        codigoBarras: data.codigoBarras || codigoBarras
      })
      setStep(2)
    } catch (err) {
      console.error(err)
      alert("Boleto inválido ou não encontrado. Verifique a linha digitável.")
    } finally {
      setLoading(false)
    }
  }

  const handleEfetuarPagamento = async () => {
    if (!dadosBoleto) return

    setLoading(true)
    try {
      const res = await pagarBoleto(dadosBoleto.codigoBarras, dadosBoleto.valor)
      setComprovante(res)
      setStep(3)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Erro ao efetuar pagamento do boleto")
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setCodigoBarras("")
    setDadosBoleto(null)
    setComprovante(null)
  }

  const saldoEstimado = saldo.disponivel - (dadosBoleto?.valor || 0)

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) resetModal()
    }}>
      <DialogContent className="sm:max-w-md bg-card border-border font-mono text-foreground">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            PAGAR BOLETO BANCÁRIO
          </DialogTitle>
        </DialogHeader>

        {/* Indicador de passos */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-neutral-800'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-neutral-800'}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-orange-500' : 'bg-neutral-800'}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleValidarBoleto} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Código de Barras ou Linha Digitável</Label>
              <Input
                required
                placeholder="Insira os números da linha digitável"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                className="bg-background border-border text-xs text-foreground h-9"
              />
              <p className="text-[8px] text-neutral-600 uppercase">
                O código de barras será consultado na CIP/Bancos para verificação do beneficiário e valor real.
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
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                  <>
                    <Search className="w-3.5 h-3.5 mr-1" /> Validar Código
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && dadosBoleto && (
          <div className="space-y-4">
            <div className="bg-background p-3 rounded-lg border border-border space-y-2">
              <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">Dados do Boleto</p>
              
              <div className="text-xs space-y-1.5 font-mono">
                <div>
                  <span className="text-[9px] text-neutral-500">BENEFICIÁRIO:</span>
                  <p className="font-bold text-foreground">{dadosBoleto.beneficiario}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[9px] text-neutral-500">VALOR:</span>
                    <p className="font-bold text-red-500">R$ {dadosBoleto.valor.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500">VENCIMENTO:</span>
                    <p className="font-bold text-foreground">{dadosBoleto.dataVencimento}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-neutral-500 space-y-1 font-mono uppercase bg-neutral-900/50 p-2.5 rounded border border-border">
              <div className="flex justify-between">
                <span>Saldo Disponível:</span>
                <span className="text-foreground">R$ {saldo.disponivel.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border/50 pt-1 mt-1">
                <span>Saldo Estimado pós pagamento:</span>
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
                onClick={handleEfetuarPagamento}
                disabled={loading || saldoEstimado < 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black h-9 text-[10px] uppercase font-bold"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirmar Pagamento"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && comprovante && (
          <div className="space-y-5 text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Boleto Pago com Sucesso!</p>
              <p className="text-[10px] text-neutral-500 font-mono">Autenticação: {comprovante.autenticacao}</p>
            </div>

            <div className="bg-background p-3 rounded-lg border border-border space-y-2 text-left text-[10px] uppercase">
              <div className="flex justify-between">
                <span className="text-neutral-500">Beneficiário:</span>
                <span className="font-bold text-foreground text-right max-w-[200px] truncate">
                  {dadosBoleto?.beneficiario}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                <span className="text-neutral-500">Valor Débito:</span>
                <span className="font-bold text-red-500">R$ {dadosBoleto?.valor.toFixed(2)}</span>
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
