"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useClientes } from "@/lib/hooks/use-clientes"
import { useToast } from "@/components/reports/toast-notification"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, User, Mail, Phone, FileText, Loader2, Upload, File as FileIcon, X, CheckCircle2 } from "lucide-react"

export function NovoClienteModal({ open, onOpenChange, onSuccess }: any) {
  const router = useRouter()
  const { addCliente } = useClientes()
  const { showToast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [nome, setNome] = useState("")
  const [empresa, setEmpresa] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [observacoes, setObservacoes] = useState("")
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  
  const [contractFile, setContractFile] = useState<File | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const contractInputRef = useRef<HTMLInputElement>(null)

  // Mascara CNPJ: 00.000.000/0000-00
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 14) value = value.slice(0, 14)
    
    value = value.replace(/^(\d{2})(\d)/, "$1.$2")
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2")
    value = value.replace(/(\d{4})(\d)/, "$1-$2")
    
    setCnpj(value)
  }

  // Mascara Telefone: (00) 00000-0000
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 11) value = value.slice(0, 11)
    
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2")
    value = value.replace(/(\d)(\d{4})$/, "$1-$2")
    
    setTelefone(value)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "A logo deve ter no máximo 2MB.")
      return
    }
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      showToast("error", "Formato inválido. Use PNG, JPG ou SVG.")
      return
    }

    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "O contrato deve ter no máximo 10MB.")
      return
    }
    if (file.type !== 'application/pdf') {
      showToast("error", "O contrato deve ser um arquivo PDF.")
      return
    }

    setContractFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome || !empresa) {
      showToast("error", "Nome e Empresa são obrigatórios.")
      return
    }

    // Opcional: Validar formato basico do CNPJ se estiver preenchido
    if (cnpj && cnpj.length < 18) {
      showToast("error", "CNPJ incompleto.")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("nome", nome)
      formData.append("empresa", empresa)
      formData.append("cnpj", cnpj)
      formData.append("email", email)
      formData.append("telefone", telefone)
      formData.append("observacoes", observacoes)
      
      if (logoFile) formData.append("logo", logoFile)
      if (contractFile) formData.append("contract", contractFile)

      const { data, error } = await addCliente(formData)
      
      if (error) {
        showToast("error", error.message || "Erro ao cadastrar cliente.")
      } else if (data) {
        onSuccess?.()
        onOpenChange(false)
        resetForm()
        
        showToast("success", "Cliente cadastrado!", {
          label: "Criar projeto para este cliente",
          onClick: () => {
            router.push(`/projetos?new=true&clienteId=${data.id}`)
          }
        })
      }
    } catch (err) {
      showToast("error", "Ocorreu um erro inesperado.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNome("")
    setEmpresa("")
    setCnpj("")
    setEmail("")
    setTelefone("")
    setObservacoes("")
    setLogoFile(null)
    setLogoPreview(null)
    setContractFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            Novo Cliente
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          
          {/* Seção 1 — Upload de logo */}
          <div className="flex items-center gap-4 p-4 border border-border border-dashed rounded-xl bg-[#1A1A1A]/30">
            <div 
              className="w-16 h-16 rounded-xl border border-dashed border-[#444] bg-background flex items-center justify-center cursor-pointer overflow-hidden group relative hover:border-orange-500 transition-colors flex-shrink-0"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-50 group-hover:text-orange-500 group-hover:opacity-100 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-[8px] font-mono uppercase tracking-widest">LOGO</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">Logo do cliente</h4>
              <p className="text-xs text-neutral-500 mb-2">PNG, JPG ou SVG · Máx. 2MB<br/>Aparecerá no card e no perfil do cliente</p>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs border-border" onClick={() => logoInputRef.current?.click()}>
                <Upload className="w-3 h-3 mr-2" />
                Selecionar arquivo
              </Button>
            </div>
            <input type="file" ref={logoInputRef} className="hidden" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoChange} />
          </div>

          {/* Seção 2 — Grid 2 colunas: Nome | Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3 text-orange-500" />
                Nome do Contato <span className="text-orange-500">*</span>
              </Label>
              <Input 
                placeholder="Ex: Carlos Silva"
                className="bg-[#1A1A1A] border-border focus:border-orange-500"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3 h-3 text-orange-500" />
                Empresa <span className="text-orange-500">*</span>
              </Label>
              <Input 
                placeholder="Ex: TechCorp LTDA"
                className="bg-[#1A1A1A] border-border focus:border-orange-500"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Seção 3 — Grid 2 colunas: CNPJ | Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3 text-orange-500" />
                CNPJ <span className="text-orange-500">*</span>
              </Label>
              <Input 
                placeholder="00.000.000/0000-00"
                className="bg-[#1A1A1A] border-border focus:border-orange-500"
                value={cnpj}
                onChange={handleCnpjChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3 h-3 text-neutral-500" />
                Telefone
              </Label>
              <Input 
                placeholder="(00) 00000-0000"
                className="bg-[#1A1A1A] border-border focus:border-orange-500"
                value={telefone}
                onChange={handleTelefoneChange}
              />
            </div>
          </div>

          {/* Seção 4 — E-mail */}
          <div className="space-y-2">
            <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3 h-3 text-neutral-500" />
              E-mail
            </Label>
            <Input 
              type="email"
              placeholder="contato@empresa.com"
              className="bg-[#1A1A1A] border-border focus:border-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Seção 5 — Observações */}
          <div className="space-y-2">
            <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3 text-neutral-500" />
              Observações
            </Label>
            <Textarea 
              placeholder="Detalhes adicionais sobre o cliente..."
              className="bg-[#1A1A1A] border-border focus:border-orange-500 min-h-[80px] resize-none"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Seção 6 — Upload de contrato PDF */}
          <div className="space-y-3 pt-4 border-t border-border">
            <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
              <FileIcon className="w-3 h-3 text-orange-500" />
              Contrato (PDF)
            </Label>
            
            <input type="file" ref={contractInputRef} className="hidden" accept="application/pdf" onChange={handleContractChange} />
            
            {contractFile ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-3 overflow-hidden">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{contractFile.name}</span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-neutral-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0 ml-2"
                  onClick={() => setContractFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="flex items-center gap-4 p-4 border border-border border-dashed rounded-xl bg-[#1A1A1A]/30 cursor-pointer hover:border-orange-500 transition-colors group"
                onClick={() => contractInputRef.current?.click()}
              >
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-neutral-500 group-hover:text-orange-500 transition-colors">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors">Anexar contrato do cliente</h4>
                  <p className="text-xs text-neutral-500">Apenas PDF · Máx. 10MB<br/>Ficará disponível no perfil do cliente</p>
                </div>
                <div className="px-3 py-1 rounded bg-background border border-border text-xs font-mono text-neutral-500 group-hover:border-orange-500/50 group-hover:text-orange-500 transition-colors">
                  PDF
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-[10px] text-neutral-500">Campos com <span className="text-orange-500">*</span> são obrigatórios</p>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="text-neutral-400 hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-foreground min-w-[140px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Cliente"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
