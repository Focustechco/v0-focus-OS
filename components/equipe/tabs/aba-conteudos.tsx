"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Book, FileText, PlayCircle, Folder, Search, Plus, ExternalLink, Loader2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Upload, File as FileIcon } from "lucide-react"

type ContentType = "Todos" | "ebook" | "playbook" | "treinamento" | "documento"

export function AbaConteudos({ userType }: { userType: string }) {
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ContentType>("Todos")
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "ebook",
    url: "",
    categoria: "",
    publico: true
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadContents()
  }, [])

  const loadContents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("conteudos")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      setContents(data || [])
    } catch (error: any) {
      toast.error("Erro ao carregar conteúdos")
    } finally {
      setLoading(false)
    }
  }

  const uploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `files/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('equipe-conteudos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('equipe-conteudos')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      throw error
    }
  }

  const handleAddContent = async () => {
    if (!formData.titulo) {
      toast.error("Título é obrigatório")
      return
    }

    if (!formData.url && !selectedFile) {
      toast.error("Selecione um arquivo ou informe uma URL")
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

      let finalUrl = formData.url

      if (selectedFile) {
        finalUrl = await uploadFile(selectedFile)
      }

      const { error } = await supabase
        .from("conteudos")
        .insert({
          ...formData,
          url: finalUrl,
          criado_por: equipeMember?.id
        })

      if (error) {
        console.error("Erro completo do Supabase:", error)
        throw new Error(error.message || `Erro DB: ${error.code} - ${error.details}`)
      }

      toast.success("Conteúdo adicionado com sucesso!")
      setIsAddModalOpen(false)
      setFormData({
        titulo: "",
        descricao: "",
        tipo: "ebook",
        url: "",
        categoria: "",
        publico: true
      })
      setSelectedFile(null)
      loadContents()
    } catch (error: any) {
      console.error("DETALHES DO ERRO:", error)
      // Captura detalhes extras se existirem
      const errorDetail = error.details || error.hint || ""
      const msg = error.message || error.error_description || "Erro desconhecido"
      toast.error(`Falha ao salvar: ${msg}. ${errorDetail}`)
    } finally {
      setSaving(false)
    }
  }

  const filteredContents = contents.filter(c => {
    const matchesFilter = filter === "Todos" || c.tipo === filter
    const matchesSearch = c.titulo.toLowerCase().includes(search.toLowerCase()) || 
                         c.categoria?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "ebook": return <Book className="w-5 h-5" />
      case "playbook": return <Folder className="w-5 h-5" />
      case "treinamento": return <PlayCircle className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#141414] p-4 border border-[#2A2A2A] rounded-2xl">
        <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {["Todos", "ebook", "playbook", "treinamento", "documento"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as ContentType)}
              className={`px-4 py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all whitespace-nowrap ${
                filter === t 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {t === "ebook" ? "Ebooks" : t === "playbook" ? "Playbooks" : t === "treinamento" ? "Treinamentos" : t === "documento" ? "Docs" : t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <Input 
              placeholder="Buscar conteúdos..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0A0A0A] border-[#2A2A2A] h-9 text-xs pl-9" 
            />
          </div>
          <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-[10px] tracking-widest h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            ADICIONAR
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredContents.map((c) => (
            <Card key={c.id} className="bg-[#141414] border-[#2A2A2A] group hover:border-orange-500/30 transition-all overflow-hidden flex flex-col">
              <div className="aspect-video bg-[#0A0A0A] relative flex items-center justify-center text-neutral-800 transition-colors group-hover:text-orange-500/20">
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.titulo} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                    getIcon(c.tipo)
                )}
                <div className="absolute top-2 right-2">
                    <Badge className="bg-[#111111] border-[#2A2A2A] text-[9px] font-mono uppercase text-neutral-500">
                        {c.tipo}
                    </Badge>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">{c.titulo}</h4>
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">{c.categoria || 'Sem Categoria'}</p>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2 flex-1">
                  {c.descricao || 'Sem descrição disponível.'}
                </p>
                <Button 
                  asChild
                  variant="outline"
                  className="w-full bg-[#0A0A0A] border-[#2A2A2A] hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all font-mono text-[10px] tracking-[0.2em] uppercase"
                >
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    ACESSAR CONTEÚDO
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Adicionar */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-orange-500 font-mono text-sm tracking-widest uppercase">
              Novo Conteúdo
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Título</Label>
              <Input 
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(val) => setFormData({...formData, tipo: val})}>
                <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#2A2A2A]">
                  <SelectItem value="ebook">Ebook</SelectItem>
                  <SelectItem value="playbook">Playbook</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="documento">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">URL do Conteúdo ou Arquivo</Label>
                <div className="space-y-3">
                  <Input 
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      placeholder="https://... ou faça upload abaixo"
                      className="bg-[#0A0A0A] border-[#2A2A2A] text-white" 
                      disabled={!!selectedFile}
                  />
                  
                  <div className="flex flex-col gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    
                    {selectedFile ? (
                      <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-orange-500/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-neutral-300 truncate max-w-[200px]">{selectedFile.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="h-6 w-6">
                          <X className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-[#0A0A0A] border-[#2A2A2A] h-14 border-dashed hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex flex-col items-center justify-center gap-1"
                      >
                        <Upload className="w-4 h-4 text-neutral-500" />
                        <span className="text-[10px] uppercase font-mono text-neutral-500">Upload PDF / DOC</span>
                      </Button>
                    )}
                  </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Categoria</Label>
                <Input 
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white" 
                />
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A]">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Público</Label>
                <Switch 
                    checked={formData.publico}
                    onCheckedChange={(val) => setFormData({...formData, publico: val})}
                />
            </div>
            <div className="col-span-full space-y-2">
              <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Descrição</Label>
              <Textarea 
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white h-24" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
            <Button 
                onClick={handleAddContent} 
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs uppercase"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Conteúdo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
