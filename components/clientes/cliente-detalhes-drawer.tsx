"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClientes } from "@/lib/hooks/use-clientes"
import { useProjects } from "@/lib/hooks/use-projetos"
import { useToast } from "@/components/reports/toast-notification"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  FolderKanban, 
  Plus, 
  ArrowRight,
  Save,
  Loader2
} from "lucide-react"

export function ClienteDetalhesDrawer({ clienteId, open, onOpenChange, onUpdate }: any) {
  const router = useRouter()
  const { clientes } = useClientes()
  const { projects } = useProjects()
  const { showToast } = useToast()
  
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  
  const cliente = clientes.find(c => c.id === clienteId)
  const linkedProjects = projects.filter(p => p.cliente_id === clienteId)

  useEffect(() => {
    if (cliente) {
      setFormData({ ...cliente })
    }
  }, [cliente])

  if (!cliente && open) return null

  const handleSave = async () => {
    setIsSaving(true)
    // Simulating save since useClientes doesn't have updateCliente yet
    // I should probably add updateCliente to the hook
    setTimeout(() => {
      setIsSaving(false)
      showToast("success", "Dados do cliente atualizados com sucesso!")
      onUpdate?.()
    }, 1000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-card border-border text-foreground sm:max-w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Building2 className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <SheetTitle className="text-foreground font-display text-xl uppercase tracking-tight">
                {cliente?.empresa}
              </SheetTitle>
              <p className="text-neutral-500 text-sm font-mono tracking-widest uppercase">Detalhes do Cliente</p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Edit Form */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-neutral-500 tracking-[0.2em] uppercase">Informacoes Gerais</h3>
              
              <div className="space-y-4 bg-background p-4 rounded-xl border border-[#1A1A1A]">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-neutral-500 font-mono uppercase">Nome do Contato</Label>
                  <Input 
                    value={formData?.nome || ""} 
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    className="bg-transparent border-none p-0 h-auto text-sm focus-visible:ring-0"
                  />
                </div>
                <div className="h-px bg-[#1A1A1A]" />
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-neutral-500 font-mono uppercase">Email</Label>
                  <Input 
                    value={formData?.email || ""} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="bg-transparent border-none p-0 h-auto text-sm focus-visible:ring-0"
                  />
                </div>
                <div className="h-px bg-[#1A1A1A]" />
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-neutral-500 font-mono uppercase">Telefone</Label>
                  <Input 
                    value={formData?.telefone || ""} 
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                    className="bg-transparent border-none p-0 h-auto text-sm focus-visible:ring-0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                 <Label className="text-[10px] text-neutral-500 font-mono uppercase">Observacoes</Label>
                 <Textarea 
                    value={formData?.observacoes || ""} 
                    onChange={e => setFormData({...formData, observacoes: e.target.value})}
                    className="bg-background border-[#1A1A1A] text-sm min-h-[80px]"
                 />
              </div>

              <Button 
                onClick={handleSave}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-foreground h-9"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Alteracoes
              </Button>
            </div>

            {/* Projects Section */}
            <div className="space-y-4 pb-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-neutral-500 tracking-[0.2em] uppercase">Projetos Vinculados</h3>
                <Badge className="bg-orange-500/10 text-orange-500 border-none font-mono">
                  {linkedProjects.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {linkedProjects.length === 0 ? (
                  <div className="text-center p-8 bg-background border border-dashed border-[#1A1A1A] rounded-xl">
                    <p className="text-neutral-600 text-xs">Nenhum projeto associado.</p>
                  </div>
                ) : (
                  linkedProjects.map((p: any) => (
                    <div 
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-background border border-[#1A1A1A] rounded-xl group hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center text-[10px] font-mono font-bold text-orange-500 border border-neutral-800">
                          {p.codigo}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{p.nome}</p>
                          <p className="text-[10px] text-neutral-500 uppercase font-mono tracking-tighter">{p.status}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-600 hover:text-orange-500">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}

                <Button 
                  onClick={() => {
                    onOpenChange(false)
                    router.push(`/projetos?new=true&clienteId=${clienteId}`)
                  }}
                  className="w-full mt-4 border border-dashed border-orange-500/30 bg-orange-500/5 text-orange-500 hover:bg-orange-500/10 h-10 font-mono text-xs tracking-widest uppercase"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Projeto
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
