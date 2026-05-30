"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInter } from "@/lib/hooks/use-inter"
import { Forward, Loader2, DollarSign, CheckCircle } from "lucide-react"

interface ModalTedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalTed({ open, onOpenChange }: ModalTedProps) {
  const { transferirTED, saldo } = useInter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form states
  const [valor, setValor] = useState("")
  const [nome, setNome] = useState("")
  const [cpfCnpj, setCpfCnpj] = useState("")
  const [banco, setBanco] = useState("")
  const [agencia, setAgencia] = useState("")
  const [conta, setConta] = useState("")
  const [tipoConta, setTipoConta] = useState("CONTA_CORRENTE")

  // Result state
  const [resultado, setResultado] = useState<any>(null)

  const handleTransferir = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valor || !nome || !cpfCnpj || !banco || !agencia || !conta) return

    setLoading(true)
    try {
      const favorecido = { nome, cpfCnpj, banco, agencia, conta, tipoConta }
      const res = await transferirTED(Number(valor), favorecido)
      setResultado(res)
      setStep(2)
    } catch (err: any) {
      console.error(err)
      alert(err.message || "Erro ao efetuar transferência")
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setValor("")
    setNome("")
    setCpfCnpj("")
    setBanco("")
    setAgencia("")
    setConta("")
    setTipoConta("CONTA_CORRENTE")
    setResultado(null)
  }

  const saldoEstimado = saldo.disponivel - Number(valor || 0)

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) resetModal()
    }}>
      <DialogContent className="sm:max-w-lg bg-card border-border font-mono text-foreground">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Forward className="w-4 h-4 text-orange-500" />
            TRANSFERÊNCIA TED / TEF
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleTransferir} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Valor da Transferência (R$)</Label>
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
                <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Tipo de Conta</Label>
                <Select value={tipoConta} onValueChange={setTipoConta}>
                  <SelectTrigger className="bg-background border-border text-xs text-foreground h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="CONTA_CORRENTE" className="text-xs">Conta Corrente</SelectItem>
                    <SelectItem value="CONTA_POUPANCA" className="text-xs">Conta Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-border/50 my-2 pt-2 space-y-3">
              <p className="text-[9px] text-orange-500 uppercase tracking-wider font-bold mb-1">Dados do Favorecido</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Nome Completo</Label>
                  <Input
                    required
                    placeholder="Nome de quem recebe"
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
                <div className="space-y-2">
                  <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Código Banco</Label>
                  <Input
                    required
                    placeholder="Ex: 001, 341, 077"
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    className="bg-background border-border text-xs text-foreground h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Agência</Label>
                  <Input
                    required
                    placeholder="Agência"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                    className="bg-background border-border text-xs text-foreground h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Nº Conta (+dígito)</Label>
                  <Input
                    required
                    placeholder="Conta"
                    value={conta}
                    onChange={(e) => setConta(e.target.value)}
                    className="bg-background border-border text-xs text-foreground h-9"
                  />
                </div>
              </div>
            </div>

            <div className="text-[9px] text-neutral-500 space-y-1 font-mono uppercase bg-neutral-900/50 p-2.5 rounded border border-border">
              <div className="flex justify-between">
                <span>Saldo Disponível:</span>
                <span className="text-foreground">R$ {saldo.disponivel.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border/50 pt-1 mt-1">
                <span>Saldo Estimado pós transferência:</span>
                <span className={saldoEstimado < 0 ? "text-red-500 animate-pulse" : "text-green-500"}>
                  R$ {saldoEstimado.toFixed(2)}
                </span>
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
                disabled={loading || saldoEstimado < 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-black h-9 text-[10px] uppercase font-bold"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Transferir (TED)"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 text-center pt-2">
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">Transferência Agendada / Efetuada!</p>
              <p className="text-[10px] text-neutral-500 font-mono">Código da Transação: {resultado?.codigoTransacao}</p>
            </div>

            <div className="bg-background p-3 rounded-lg border border-border space-y-2 text-left text-[10px] uppercase">
              <div className="flex justify-between">
                <span className="text-neutral-500">Favorecido:</span>
                <span className="font-bold text-foreground">{nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Instituição:</span>
                <span className="text-foreground">Cód Banco: {banco}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-1 mt-1">
                <span className="text-neutral-500">Valor Débito:</span>
                <span className="font-bold text-red-500">R$ {Number(valor).toFixed(2)}</span>
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
