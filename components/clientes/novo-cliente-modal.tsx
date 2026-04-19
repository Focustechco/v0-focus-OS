"use client"

import { useState } from "react"
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
import { Building2, User, Mail, Phone, FileText, Loader2 } from "lucide-react"

export function NovoClienteModal({ open, onOpenChange, onSuccess }: any) {
  const router = useRouter()
  const { addCliente } = useClientes()
  const { showToast } = useToast()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    observacoes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.empresa) {
      showToast("error", "Nome e Empresa sao obrigatorios.")
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await addCliente(formData)
      
      if (error) {
        showToast("error", error.message || "Erro ao cadastrar cliente.")
      } else if (data) {
        onSuccess?.()
        onOpenChange(false)
        setFormData({ nome: "", empresa: "", email: "", telefone: "", observacoes: "" })
        
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-[#2A2A2A] text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">Novo Cliente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3 text-orange-500" />
                Nome do Contato *
              </Label>
              <Input 
                placeholder="Ex: Carlos Silva"
                className="bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-3 h-3 text-orange-500" />
                Empresa *
              </Label>
              <Input 
                placeholder="Ex: TechCorp LTDA"
                className="bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500"
                value={formData.empresa}
                onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3 text-neutral-500" />
                Email
              </Label>
              <Input 
                type="email"
                placeholder="contato@empresa.com"
                className="bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3 h-3 text-neutral-500" />
                Telefone
              </Label>
              <Input 
                placeholder="(00) 00000-0000"
                className="bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3 text-neutral-500" />
              Observacoes
            </Label>
            <Textarea 
              placeholder="Detalhes adicionais sobre o cliente..."
              className="bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500 min-h-[100px]"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-neutral-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white min-w-[120px]"
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
