"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAsaas } from "@/lib/hooks/use-asaas"
import { Loader2, FileCheck, Upload } from "lucide-react"

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
  const [numero, setNumero] = useState("")
  const [fileBase64, setFileBase64] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFileBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileBase64) return
    
    setLoading(true)
    try {
      await anexarNF(cobrancaId, fileBase64, numero)
      onOpenChange(false)
      setNumero("")
      setFileBase64(null)
    } catch (error) {
      console.error("Erro ao anexar NF:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f0f0f] border-[#1a1a1a] text-foreground font-mono max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            ATTACH_NF_DATA.EXE
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
            <Label className="text-[10px] text-neutral-500 uppercase">NUMERO_NF</Label>
            <Input 
              required
              placeholder="000.123.456" 
              className="bg-[#050505] border-[#1a1a1a] text-xs h-9 focus:border-orange-500"
              value={numero}
              onChange={e => setNumero(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-neutral-500 uppercase">ARQUIVO_PDF (BASE64_UPLOAD)</Label>
            <div className="relative">
              <Input 
                required
                type="file"
                accept="application/pdf"
                className="hidden"
                id="nf-upload"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="nf-upload"
                className="flex items-center justify-center gap-2 w-full h-12 bg-[#050505] border border-dashed border-[#1a1a1a] rounded-lg cursor-pointer hover:border-orange-500/50 transition-colors"
              >
                <Upload className="w-4 h-4 text-neutral-500" />
                <span className="text-[10px] text-neutral-400">
                  {fileBase64 ? "FILE_LOADED_OK" : "SELECT_FILE_TO_UPLOAD"}
                </span>
              </label>
            </div>
          </div>
          <Button 
            disabled={loading || !fileBase64}
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold h-10 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "EXECUTE_ATTACH()"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
