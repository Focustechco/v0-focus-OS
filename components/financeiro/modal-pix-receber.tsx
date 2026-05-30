"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInter } from "@/lib/hooks/use-inter"
import { QrCode, Copy, Check, Loader2, DollarSign } from "lucide-react"

interface ModalPixReceberProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalPixReceber({ open, onOpenChange }: ModalPixReceberProps) {
  const { chavesPix, cobrarPix } = useInter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Form fields
  const [chaveSelecionada, setChaveSelecionada] = useState("")
  const [valor, setValor] = useState("")
  const [descricao, setDescricao] = useState("")

  // Result fields
  const [qrcodeBase64, setQrcodeBase64] = useState("")
  const [pixCopiaECola, setPixCopiaECola] = useState("")
  const [txid, setTxid] = useState("")

  useEffect(() => {
    if (chavesPix.length > 0 && !chaveSelecionada) {
      setChaveSelecionada(chavesPix[0])
    }
  }, [chavesPix, chaveSelecionada])

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chaveSelecionada || !valor || Number(valor) <= 0) return

    setLoading(true)
    try {
      const data = await cobrarPix(Number(valor), chaveSelecionada, descricao)
      setQrcodeBase64(data.qrcodeBase64)
      setPixCopiaECola(data.pixCopiaECola)
      setTxid(data.txid)
      setStep(2)
    } catch (err) {
      console.error(err)
      alert("Erro ao gerar QR Code de cobrança")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCopiaECola)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetModal = () => {
    setStep(1)
    setValor("")
    setDescricao("")
    setQrcodeBase64("")
    setPixCopiaECola("")
    setTxid("")
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) resetModal()
    }}>
      <DialogContent className="sm:max-w-md bg-card border-border font-mono text-foreground">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <QrCode className="w-4 h-4 text-orange-500" />
            RECEBER VIA PIX (GERAR QR CODE)
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleGerar} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Selecione a Chave Pix</Label>
              <Select value={chaveSelecionada} onValueChange={setChaveSelecionada}>
                <SelectTrigger className="bg-background border-border text-xs text-foreground h-9">
                  <SelectValue placeholder="Selecione uma chave" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {chavesPix.map((key) => (
                    <SelectItem key={key} value={key} className="text-xs focus:bg-orange-500/10">
                      {key}
                    </SelectItem>
                  ))}
                  {chavesPix.length === 0 && (
                    <SelectItem value="default" disabled className="text-xs">
                      focus@techco.com.br (Simulado)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Valor (R$)</Label>
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
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Descrição (Opcional)</Label>
              <Input
                placeholder="Ex: Cobrança Projeto X"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="bg-background border-border text-xs text-foreground h-9"
              />
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
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Gerar QR Code"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 text-center pt-2">
            <div className="mx-auto w-44 h-44 bg-white p-2 rounded-lg flex items-center justify-center border border-border">
              {qrcodeBase64 ? (
                <img src={qrcodeBase64} alt="PIX QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-neutral-200 animate-pulse rounded" />
              )}
            </div>

            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              VALOR: <span className="text-green-500">R$ {Number(valor).toFixed(2)}</span>
            </div>

            <div className="space-y-2 text-left">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">PIX Copia e Cola</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={pixCopiaECola}
                  className="bg-background border-border text-[9px] text-neutral-400 font-mono h-9 flex-1"
                />
                <Button
                  onClick={handleCopy}
                  className="bg-orange-500 hover:bg-orange-600 text-black h-9 px-3 flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={resetModal}
                variant="outline"
                className="flex-1 border-border text-neutral-400 hover:text-foreground h-9 text-[10px] uppercase font-bold"
              >
                Cobrar Novo Valor
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
