"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAsaas } from "@/lib/hooks/use-asaas"
import { Loader2, FileCheck, Upload, CheckCircle2 } from "lucide-react"

export function ModalAnexarNF({ 
  open, 
  onOpenChange, 
  cobrancaId 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  cobrancaId: string 
}) {
  const { anexarNF } = useAsaas()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numero, setNumero] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileBase64, setFileBase64] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFileBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileBase64) {
      setError("Selecione um arquivo PDF")
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      await anexarNF(cobrancaId, fileBase64, numero)
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setNumero("")
        setFileBase64(null)
        setFileName("")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Erro ao anexar NF")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSuccess(false); setError(null) } }}>
      <DialogContent className="bg-card border-border text-foreground font-mono sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Anexar Nota Fiscal
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <p className="text-sm text-green-500 font-bold">NF anexada com sucesso!</p>
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
              <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">Número da NF *</Label>
              <Input 
                required
                placeholder="000.123.456" 
                className="bg-secondary border-border text-xs h-9 focus:border-orange-500"
                value={numero}
                onChange={e => setNumero(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-wider">Arquivo PDF *</Label>
              <Input 
                type="file"
                accept="application/pdf"
                className="hidden"
                id="nf-upload"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="nf-upload"
                className="flex items-center justify-center gap-2 w-full h-14 bg-secondary border border-dashed border-border rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors"
              >
                <Upload className="w-4 h-4 text-neutral-500" />
                <span className="text-[10px] text-neutral-400">
                  {fileName || "Selecionar arquivo PDF"}
                </span>
              </label>
            </div>
            {error && (
              <div className="text-[10px] text-red-500 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <Button 
              disabled={loading || !fileBase64}
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold h-10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Anexar Nota Fiscal"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
