"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Plus, ExternalLink, Link as LinkIcon, Trash2, FolderOpen, FolderClosed, Loader2, Star
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// ─── Tipos ─────────────────────────────────────────────
interface Acesso {
  id: string
  nome: string
  url: string
  pasta?: string // Usaremos pasta como "Grupo"
  descricao?: string
  tem_credencial?: boolean
  login?: string
  senha_enc?: string
  criado_por?: string
  favorito?: boolean // Caso tenhamos uma flag, por enquanto mockamos ou adicionamos
}

// ─── Modal Acesso (Link) ─────────────────────────────────
const FORM_DEFAULT = {
  nome: "", url: "", pasta: "", descricao: "", login: "", senha: "", favorito: false
}

function AcessoModal({ open, onOpenChange, onSalvo, acessoEdit, grupoPadrao }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSalvo: () => void
  acessoEdit?: Acesso | null
  grupoPadrao: string
}) {
  const [form, setForm] = useState(FORM_DEFAULT)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (acessoEdit) {
        setForm({
          nome: acessoEdit.nome || "",
          url: acessoEdit.url || "",
          pasta: acessoEdit.pasta || grupoPadrao,
          descricao: acessoEdit.descricao || "",
          login: acessoEdit.login || "",
          senha: acessoEdit.senha_enc || "",
          favorito: acessoEdit.favorito || false
        })
      } else {
        setForm({ ...FORM_DEFAULT, pasta: grupoPadrao })
      }
    }
  }, [open, acessoEdit, grupoPadrao])

  const handleSalvar = async () => {
    if (!form.nome || !form.url) return

    try {
      setSaving(true)
      const urlFinal = form.url.startsWith("http") ? form.url : `https://${form.url}`
      
      const payload: any = {
        nome: form.nome,
        url: urlFinal,
        pasta: form.pasta || "GERAL",
        descricao: form.descricao || null,
        tem_credencial: !!(form.login || form.senha),
        login: form.login || null,
        senha_enc: form.senha || null,
        categoria: "plataforma_interna", // fixo para compatibilidade
        secao: "links", // fixo para compatibilidade
      }

      if (acessoEdit) {
        const { error } = await supabase.from("acessos").update(payload).eq("id", acessoEdit.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("acessos").insert([payload])
        if (error) throw error
      }

      onSalvo()
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      alert("Erro ao salvar: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const labelInput = "text-[12px] font-medium text-neutral-300"
  const inputClass = "bg-[#252525] border-transparent text-foreground focus:border-orange-500/50 text-sm h-10 rounded-lg"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1C1C1C] border-[#222] text-foreground sm:max-w-[450px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-orange-500">
            {acessoEdit ? form.nome : "Novo Acesso"}
          </DialogTitle>
        </DialogHeader>

        {!acessoEdit && (
          <div className="space-y-1.5 mb-4">
            <Label className={labelInput}>Nome do Link</Label>
            <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Digga mais" className={inputClass} />
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className={labelInput}>Descrição</Label>
            <Textarea 
              value={form.descricao} 
              onChange={e => setForm({ ...form, descricao: e.target.value })}
              className={cn(inputClass, "h-24 resize-none")} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelInput}>Login</Label>
              <Input 
                value={form.login} 
                onChange={e => setForm({ ...form, login: e.target.value })}
                className={inputClass} 
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelInput}>Senha</Label>
              <Input 
                type="text"
                value={form.senha} 
                onChange={e => setForm({ ...form, senha: e.target.value })}
                className={inputClass} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={labelInput}>Link</Label>
            <Input 
              value={form.url} 
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://..." 
              className={inputClass} 
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <a 
            href={form.url.startsWith("http") ? form.url : `https://${form.url}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors"
          >
            Acessar Link <ExternalLink className="w-4 h-4" />
          </a>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setForm({ ...form, favorito: !form.favorito })}
              className={cn("flex items-center gap-1.5 text-sm transition-colors", form.favorito ? "text-orange-500" : "text-neutral-500 hover:text-neutral-300")}
            >
              <Star className={cn("w-4 h-4", form.favorito && "fill-current")} />
              Favorito
            </button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="bg-[#2A2A2A] hover:bg-[#333] text-white rounded-lg h-9 px-4">
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={saving || !form.nome || !form.url}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-9 px-6 font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Componente Principal ────────────────────────────────
export function AbaAcessos({ userType }: { userType: string }) {
  const [acessos, setAcessos] = useState<Acesso[]>([])
  const [loading, setLoading] = useState(true)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Acesso | null>(null)
  const [grupoAtual, setGrupoAtual] = useState("GERAL")
  
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({})

  const loadAcessos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("acessos")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      
      // Retrocompatibilidade: transformar 'secao' em 'pasta' se 'pasta' for nulo
      const normalized = (data || []).map(a => ({
        ...a,
        pasta: a.pasta || a.secao || "GERAL"
      }))
      setAcessos(normalized)
      
      // Abrir todos por padrão
      const groups = [...new Set(normalized.map(a => a.pasta))]
      const openState: Record<string, boolean> = {}
      groups.forEach(g => openState[g] = true)
      setGruposAbertos(openState)

    } catch (err) {
      console.error("Erro ao carregar acessos:", err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAcessos() }, [])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm("Tem certeza que deseja excluir este acesso?")) return
    try {
      const { error } = await supabase.from("acessos").delete().eq("id", id)
      if (error) {
        console.error("Erro ao excluir:", error)
        alert("Erro ao excluir: " + error.message)
        return
      }
      setAcessos(prev => prev.filter(a => String(a.id) !== String(id)))
    } catch (err) {
      console.error(err)
      alert("Erro inesperado ao excluir.")
    }
  }

  const handleDeleteGrupo = async (e: React.MouseEvent, grupo: string) => {
    e.stopPropagation()
    if (!confirm(`Deseja realmente excluir o grupo "${grupo}" e TODOS os acessos dentro dele?`)) return
    try {
      // Deletar acessos onde a pasta (ou secao) é igual ao grupo
      // Como usamos 'pasta' ou 'secao', precisaremos deletar do banco
      const idsToDelete = acessos.filter(a => a.pasta === grupo).map(a => a.id)
      for (const id of idsToDelete) {
         await supabase.from("acessos").delete().eq("id", id)
      }
      setAcessos(prev => prev.filter(a => a.pasta !== grupo))
    } catch(err) {
       console.error("Erro ao excluir grupo", err)
    }
  }

  const toggleGrupo = (grupo: string) => {
    setGruposAbertos(prev => ({ ...prev, [grupo]: !prev[grupo] }))
  }

  const openNovoGrupo = () => {
    const nome = prompt("Nome do novo grupo:")
    if (nome && nome.trim()) {
       setGrupoAtual(nome.trim().toUpperCase())
       setEditando(null)
       setModalOpen(true)
    }
  }

  const openAddAcesso = (grupo: string) => {
    setGrupoAtual(grupo)
    setEditando(null)
    setModalOpen(true)
  }

  const openEditAcesso = (acesso: Acesso) => {
    setGrupoAtual(acesso.pasta || "GERAL")
    setEditando(acesso)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
      </div>
    )
  }

  const grupos = [...new Set(acessos.map(a => a.pasta || "GERAL"))]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={openNovoGrupo}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg h-9 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Criar Novo Grupo
        </Button>
      </div>

      <div className="space-y-4">
        {grupos.map(grupo => {
          const links = acessos.filter(a => a.pasta === grupo)
          const isOpen = gruposAbertos[grupo]

          return (
            <div key={grupo} className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl overflow-hidden">
              {/* Header do Grupo */}
              <div 
                onClick={() => toggleGrupo(grupo)}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#1C1C1C] hover:bg-[#252525] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <FolderOpen className="w-5 h-5 text-orange-500" /> : <FolderClosed className="w-5 h-5 text-orange-500" />}
                  <span className="font-bold text-sm text-white uppercase tracking-wider">{grupo}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-neutral-400 font-medium">{links.length} links</span>
                  <button 
                    onClick={(e) => handleDeleteGrupo(e, grupo)}
                    className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lista de Links (Se Expandido) */}
              {isOpen && (
                <div className="p-4 space-y-2 bg-[#1C1C1C] border-t border-[#2A2A2A]">
                  {links.map(link => (
                    <div 
                      key={link.id} 
                      onClick={() => openEditAcesso(link)}
                      className="flex items-center gap-3 p-3.5 bg-[#252525] rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer group"
                    >
                      <LinkIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-neutral-200 flex-1 truncate">{link.nome}</span>
                      
                      <button 
                        onClick={(e) => handleDelete(e, link.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-500 transition-all p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button 
                    onClick={() => openAddAcesso(grupo)}
                    className="w-full py-3.5 flex items-center justify-center gap-2 text-sm text-neutral-400 hover:text-white border border-dashed border-[#333] rounded-lg hover:bg-[#252525] transition-colors mt-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Acesso
                  </button>
                </div>
              )}
            </div>
          )
        })}
        
        {grupos.length === 0 && (
           <div className="py-12 text-center border border-dashed border-[#333] rounded-xl text-neutral-500 text-sm">
             Nenhum grupo de links criado. Clique em "Criar Novo Grupo" para começar.
           </div>
        )}
      </div>

      <AcessoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSalvo={loadAcessos}
        acessoEdit={editando}
        grupoPadrao={grupoAtual}
      />
    </div>
  )
}
