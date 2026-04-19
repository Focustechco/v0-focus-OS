"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Plus, Loader2, Globe, Shield, Briefcase, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AbaAcessos({ userType }: { userType: string }) {
  const [acessos, setAcessos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    url: "",
    categoria: "plataforma_interna",
    descricao: "",
    projeto_id: ""
  })

  useEffect(() => {
    loadAcessos()
  }, [])

  const loadAcessos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("acessos")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      setAcessos(data || [])
    } catch (error) {
      toast.error("Erro ao carregar acessos")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAcesso = async () => {
    if (!formData.nome || !formData.url) {
      toast.error("Nome e URL são obrigatórios")
      return
    }

    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: equipeMember } = await supabase
        .from("equipe")
        .select("id")
        .eq("usuario_id", user.id)
        .maybeSingle()

      const { error } = await supabase
        .from("acessos")
        .insert({
          ...formData,
          criado_por: equipeMember?.id
        })

      if (error) throw error

      toast.success("Acesso adicionado com sucesso!")
      setIsAddModalOpen(false)
      setFormData({
        nome: "",
        url: "",
        categoria: "plataforma_interna",
        descricao: "",
        projeto_id: ""
      })
      loadAcessos()
    } catch (error) {
      toast.error("Erro ao salvar acesso")
    } finally {
      setSaving(false)
    }
  }

  const platformsInternas = acessos.filter(a => a.categoria === 'plataforma_interna')
  const platformsFocus = acessos.filter(a => a.categoria === 'plataforma_focus')
  const projectAcessos = acessos.filter(a => a.categoria === 'projeto_cliente')

  const renderSection = (title: string, items: any[], category: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">{title}</h3>
            <Badge variant="outline" className="text-[9px] font-mono text-neutral-600 bg-white/5 border-white/10 uppercase">
                {items.length} links
            </Badge>
        </div>
        {userType === 'admin' && (
            <Button 
                onClick={() => {
                    setFormData({...formData, categoria: category});
                    setIsAddModalOpen(true);
                }}
                variant="ghost" 
                className="h-7 text-orange-500 hover:text-white hover:bg-orange-500/10 text-[9px] font-mono uppercase tracking-widest"
            >
                <Plus className="w-3 h-3 mr-1.5" />
                ADICIONAR
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full py-8 text-center border border-dashed border-[#2A2A2A] rounded-xl text-neutral-600 text-xs italic">
            Nenhum acesso cadastrado nesta seção.
          </div>
        ) : (
          items.map((a) => (
            <Card key={a.id} className="bg-[#141414] border-[#2A2A2A] hover:border-orange-500/30 transition-all group overflow-hidden">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center text-neutral-600 group-hover:text-orange-500 transition-colors flex-shrink-0">
                  {a.icone_url ? (
                    <img src={a.icone_url} alt={a.nome} className="w-6 h-6 rounded-sm opacity-60 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white truncate">{a.nome}</h4>
                    <p className="text-[10px] text-neutral-500 truncate">{a.url.replace('https://', '').replace('http://', '')}</p>
                  </div>
                  <Button 
                    asChild
                    variant="ghost"
                    className="h-7 px-2 text-[9px] font-mono uppercase tracking-widest text-orange-400 hover:text-white hover:bg-orange-500 p-0"
                  >
                    <a href={a.url} target="_blank" rel="noopener noreferrer">
                        ACESSAR PLATAFORMA
                        <ExternalLink className="w-3 h-3 ml-1.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-12">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {renderSection("Ferramentas de Operação", platformsInternas, "plataforma_interna")}
          {renderSection("Ecosystem Focus", platformsFocus, "plataforma_focus")}
          {renderSection("Projetos dos Clientes", projectAcessos, "projeto_cliente")}
        </>
      )}

      {/* Modal Adicionar */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-orange-500 font-mono text-sm tracking-widest uppercase">
              Novo Acesso / Link
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Nome da Plataforma</Label>
                <Input 
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white" 
                />
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(val) => setFormData({...formData, categoria: val})}>
                    <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#2A2A2A]">
                        <SelectItem value="plataforma_interna">Plataforma Interna</SelectItem>
                        <SelectItem value="plataforma_focus">Plat. Focus</SelectItem>
                        <SelectItem value="projeto_cliente">Projeto Cliente</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="col-span-full space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">URL de Acesso</Label>
                <Input 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://..."
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white" 
                />
            </div>
            <div className="col-span-full space-y-2">
              <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Descrição Opcional</Label>
              <Textarea 
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white h-20" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button 
                onClick={handleAddAcesso} 
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs uppercase"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Acesso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
