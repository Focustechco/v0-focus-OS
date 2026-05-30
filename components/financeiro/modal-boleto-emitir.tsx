"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInter } from "@/lib/hooks/use-inter"
import { FilePlus2, Loader2, DollarSign, Download, CheckCircle } from "lucide-react"

interface ModalBoletoEmitirProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalBoletoEmitir({ open, onOpenChange }: ModalBoletoEmitirProps) {
  const { emitirBoleto } = useInter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form states
  const [valor, setValor] = useState("")
  const [vencimento, setVencimento] = useState("")
  const [nome, setNome] = useState("")
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [cep, setCep] = useState("")
  const [endereco, setEndereco] = useState("")

  // Result state
  const [boletoGerado, setBoletoGerado] = useState<any>(null)

  const handleEmitir = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valor || !vencimento || !nome || !cpfCnpj) return

    setLoading(true)
    try {
      const pagador = { nome, cpfCnpj, cep, endereco }
      const res = await emitirBoleto(Number(valor), vencimento, pagador)
      setBoletoGerado(res)
      setStep(2)
    } catch (err) {
      console.error(err)
      alert("Erro ao emitir boleto")
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setValor("")
    setVencimento("")
    setNome("")
    setCpfCnpj("")
    setCep("")
    setEndereco("")
    setBoletoGerado(null)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) resetModal()
    }}>
      <DialogContent className="sm:max-w-lg bg-card border-border font-mono text-foreground">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <FilePlus2 className="w-4 h-4 text-orange-500" />
            GERAR BOLETO DE COBRANÇA
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleEmitir} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Valor do Boleto (R$)</Label>
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
                <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Data de Vencimento</Label>
                <Input
                  type="date"
                  required
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  className="bg-background border-border text-xs text-foreground h-9"
                />
              </div>
            </div>

            <div className="border-t border-border/50 my-2 pt-2">
              <p className="text-[9px] text-orange-500 uppercase tracking-wider font-bold mb-3">Dados do Sacado/Pagador</p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Nome Completo / Razão Social</Label>
                    <Input
                      required
                      placeholder="Nome do cliente"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="bg-background border-border text-xs text-foreground h-9"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">CPF ou CNPJ</Label>
                    <Input
                      required
                      placeholder="Somente números"
                      value={cpfCnpj}
                      onChange={(e) => setCpfCnpj(e.target.value)}
                      className="bg-background border-border text-xs text-foreground h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-1">
                    <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">CEP</Label>
                    <Input
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      className="bg-background border-border text-xs text-foreground h-9"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Endereço Completo</Label>
                    <Input
                      placeholder="Rua, número, complemento"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="bg-background border-border text-xs text-foreground h-9"
                    />
                  </div>
                </div>
              </div>
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
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Emitir Boleto"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Boleto Emitido com Sucesso!</p>
              <p className="text-[10px] text-neutral-500 font-mono">Nosso Número: {boletoGerado?.nossoNumero}</p>
            </div>

            <div className="bg-background p-4 rounded-lg border border-border text-left space-y-3">
              <div className="space-y-1">
                <Label className="text-[9px] text-neutral-500 uppercase tracking-widest">Linha Digitável</Label>
                <div className="bg-card p-2 rounded border border-border/80 text-[10px] font-mono text-foreground break-all select-all">
                  {boletoGerado?.linhaDigitavel}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-mono pt-1">
                <div>
                  <span className="text-neutral-500">Valor:</span>
                  <p className="text-foreground font-bold">R$ {Number(valor).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Vencimento:</span>
                  <p className="text-foreground font-bold">{vencimento}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (boletoGerado?.pdfUrl) {
                    window.open(boletoGerado.pdfUrl, '_blank')
                  }
                }}
                variant="outline"
                className="flex-1 border-border text-neutral-400 hover:text-foreground h-9 text-[10px] uppercase font-bold"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Baixar PDF
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black h-9 text-[10px] uppercase font-bold"
              >
                Concluir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
