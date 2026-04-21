"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Plus, Search, ExternalLink, Globe, Lock, Eye, EyeOff, Copy,
  FolderOpen, FolderClosed, ChevronRight, Loader2, Pencil, Trash2,
  Cpu, Layers, Share2, Briefcase, LayoutGrid, Users,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// ─── Tipos ─────────────────────────────────────────────
interface Acesso {
  id: string
  nome: string
  url: string
  categoria: string
  secao: string
  pasta?: string
  descricao?: string
  icone_url?: string
  tem_credencial?: boolean
  login?: string
  senha_enc?: string
  observacao?: string
  visivel_para?: string
  criado_por?: string
  created_at?: string
}

interface Pasta {
  nome: string
  secao: string
}

// ─── Seções fixas ───────────────────────────────────────
const SECOES = [
  { id: "nossas_plataformas",   label: "Nossas Plataformas",      icon: LayoutGrid,  desc: "Ferramentas internas da empresa",   categoriaDefault: "plataforma_interna" },
  { id: "projetos",             label: "Projetos",                 icon: Briefcase,   desc: "Ambientes de cada projeto",          categoriaDefault: "projeto" },
  { id: "redes_sociais",        label: "Redes Sociais",            icon: Share2,      desc: "Perfis e pains das redes da equipe", categoriaDefault: "rede_social" },
  { id: "ferramentas_operacao", label: "Ferramentas de Operação",  icon: Cpu,         desc: "Ferramentas operacionais",            categoriaDefault: "ferramenta" },
  { id: "ecosystem_focus",      label: "Ecosystem Focus",          icon: Layers,      desc: "Stack interno Focus",                categoriaDefault: "ferramenta" },
  { id: "projetos_clientes",    label: "Projetos dos Clientes",   icon: Users,       desc: "Acessos dos projetos de clientes",   categoriaDefault: "cliente" },
]

const CATEGORIAS = [
  { value: "plataforma_interna", label: "Plataforma Interna" },
  { value: "projeto",            label: "Projeto" },
  { value: "rede_social",        label: "Rede Social" },
  { value: "ferramenta",         label: "Ferramenta" },
  { value: "cliente",            label: "Cliente" },
  { value: "outro",              label: "Outro" },
]

// Mapeamento seção → categoria padrão
function getCategoriaDefault(secaoId: string): string {
  return SECOES.find(s => s.id === secaoId)?.categoriaDefault || "plataforma_interna"
}


function getFavicon(url: string) {
  try {
    const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return null
  }
}

// ─── Card de Acesso ─────────────────────────────────────
function AcessoCard({ acesso, onEdit, onDelete, userType }: {
  acesso: Acesso
  onEdit: (a: Acesso) => void
  onDelete: (id: string) => void
  userType: string
}) {
  const [showCreds, setShowCreds] = useState(false)
  const favicon = getFavicon(acesso.url)

  const cleanUrl = acesso.url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")

  return (
    <div className="group bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 hover:border-orange-500/30 transition-all space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center flex-shrink-0">
          {favicon ? (
            <img src={favicon} alt="" className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
          ) : (
            <Globe className="w-4 h-4 text-neutral-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white truncate">{acesso.nome}</h4>
            {acesso.tem_credencial && (
              <Lock className="w-3 h-3 text-orange-500 flex-shrink-0" />
            )}
          </div>
          <a
            href={acesso.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-neutral-500 hover:text-orange-400 truncate block transition-colors"
          >
            {cleanUrl}
          </a>
        </div>
        <Badge variant="outline" className="text-[8px] border-[#2A2A2A] text-neutral-500 uppercase tracking-widest h-4 px-1.5 flex-shrink-0">
          {CATEGORIAS.find(c => c.value === acesso.categoria)?.label || acesso.categoria}
        </Badge>
      </div>

      {/* Descrição */}
      {acesso.descricao && (
        <p className="text-xs text-neutral-500 leading-snug">{acesso.descricao}</p>
      )}

      {/* Credenciais expandidas */}
      {showCreds && acesso.tem_credencial && (
        <div className="bg-[#0A0A0A] border border-orange-500/20 rounded-lg p-3 space-y-1.5 text-xs">
          {acesso.login && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-mono">Login:</span>
              <span className="text-white font-mono">{acesso.login}</span>
            </div>
          )}
          {acesso.senha_enc && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-mono">Senha:</span>
              <span className="text-orange-400 font-mono">••••••••</span>
            </div>
          )}
          {acesso.observacao && (
            <p className="text-neutral-400 text-[10px] pt-1 border-t border-[#1A1A1A]">{acesso.observacao}</p>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-[9px] font-mono uppercase tracking-widest bg-transparent border-[#2A2A2A] text-neutral-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
        >
          <a href={acesso.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3 mr-1" />
            Acessar
          </a>
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 text-[9px] font-mono uppercase tracking-widest bg-transparent border-[#2A2A2A] text-neutral-400 hover:bg-[#1A1A1A] hover:text-white transition-all"
          onClick={() => navigator.clipboard.writeText(acesso.url)}
        >
          <Copy className="w-3 h-3 mr-1" />
          Copiar
        </Button>

        {acesso.tem_credencial && (
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-7 px-2.5 text-[9px] font-mono uppercase tracking-widest bg-transparent border-[#2A2A2A] transition-all",
              showCreds ? "text-orange-500 border-orange-500/30 hover:bg-red-500/10 hover:text-red-400" : "text-neutral-400 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30"
            )}
            onClick={() => setShowCreds(!showCreds)}
          >
            {showCreds ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            {showCreds ? "Ocultar" : "Credenciais"}
          </Button>
        )}

          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 bg-transparent border-[#2A2A2A] text-neutral-500 hover:bg-[#1A1A1A] hover:text-white hover:border-neutral-500 transition-all"
              onClick={() => onEdit(acesso)}
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 bg-transparent border-[#2A2A2A] text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
              onClick={() => onDelete(acesso.id)}
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
      </div>
    </div>
  )
}

// ─── Componente de Pasta ─────────────────────────────────
function PastaGroup({ nome, acessos, onEdit, onDelete, userType }: {
  nome: string
  acessos: Acesso[]
  onEdit: (a: Acesso) => void
  onDelete: (id: string) => void
  userType: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-[#2A2A2A] rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#111] hover:bg-[#161616] transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        {open
          ? <FolderOpen className="w-4 h-4 text-orange-500 flex-shrink-0" />
          : <FolderClosed className="w-4 h-4 text-neutral-500 flex-shrink-0" />
        }
        <span className="text-sm font-medium text-white flex-1">{nome}</span>
        <span className="text-[10px] font-mono text-neutral-500">{acessos.length} acessos</span>
        <ChevronRight className={cn("w-3.5 h-3.5 text-neutral-600 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="p-3 bg-[#0D0D0D] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {acessos.map(a => (
            <AcessoCard key={a.id} acesso={a} onEdit={onEdit} onDelete={onDelete} userType={userType} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Seção ───────────────────────────────────────────────
function SecaoBlock({ secao, acessos, pastas, onEdit, onDelete, userType }: {
  secao: typeof SECOES[0]
  acessos: Acesso[]
  pastas: string[]
  onEdit: (a: Acesso) => void
  onDelete: (id: string) => void
  userType: string
}) {
  const Icon = secao.icon
  const semPasta = acessos.filter(a => !a.pasta)
  const comPasta = pastas.map(p => ({
    nome: p,
    itens: acessos.filter(a => a.pasta === p),
  })).filter(p => p.itens.length > 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-neutral-500" />
          <h3 className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">{secao.label}</h3>
          <Badge variant="outline" className="text-[9px] font-mono text-neutral-600 bg-white/5 border-white/10 uppercase h-4 px-1.5">
            {acessos.length} links
          </Badge>
        </div>
      </div>

      {acessos.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-[#2A2A2A] rounded-xl text-neutral-600 text-xs">
          Nenhum acesso cadastrado nesta seção.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pastas */}
          {comPasta.map(p => (
            <PastaGroup
              key={p.nome}
              nome={p.nome}
              acessos={p.itens}
              onEdit={onEdit}
              onDelete={onDelete}
              userType={userType}
            />
          ))}
          {/* Acessos soltos (sem pasta) */}
          {semPasta.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {semPasta.map(a => (
                <AcessoCard key={a.id} acesso={a} onEdit={onEdit} onDelete={onDelete} userType={userType} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────
const FORM_DEFAULT = {
  nome: "", url: "", categoria: "plataforma_interna", secao: "nossas_plataformas",
  pasta: "", descricao: "", visivel_para: "todos",
  temCredencial: false, login: "", senha: "", observacao: "",
}

function NovoAcessoModal({ open, onOpenChange, onSalvo, secaoInicial, pastasExistentes }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSalvo: () => void
  secaoInicial: string
  pastasExistentes: string[]
}) {
  // Ao abrir, inicializa form com seção e categoria corretas
  const [form, setForm] = useState({
    ...FORM_DEFAULT,
    secao: secaoInicial,
    categoria: getCategoriaDefault(secaoInicial),
  })
  const [saving, setSaving] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [novaPasta, setNovaPasta] = useState("")
  const [criandoPasta, setCriandoPasta] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        ...FORM_DEFAULT,
        secao: secaoInicial,
        categoria: getCategoriaDefault(secaoInicial), // ← Fix: categoria sempre derivada da seção
      })
      setNovaPasta("")
      setCriandoPasta(false)
    }
  }, [open, secaoInicial])

  // Ao mudar a seção, atualiza a categoria padrão automaticamente
  const handleSecaoChange = (novaSecao: string) => {
    setForm(prev => ({
      ...prev,
      secao: novaSecao,
      categoria: getCategoriaDefault(novaSecao), // ← Fix: sincroniza categoria
    }))
  }

  const handleSalvar = async () => {
    if (!form.nome || !form.url || !form.secao) return

    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Busca o ID do membro na tabela equipe (a FK criado_por referencia equipe.id)
      const { data: equipeMember } = await supabase
        .from("equipe")
        .select("id")
        .eq("usuario_id", user.id)
        .maybeSingle()

      const pastaFinal = criandoPasta ? novaPasta.trim() : form.pasta === "_sem_pasta" ? "" : form.pasta
      const urlFinal = form.url.startsWith("http") ? form.url : `https://${form.url}`

      // Tenta inserir com todos os campos (schema atualizado)
      const fullRow: any = {
        nome: form.nome,
        url: urlFinal,
        categoria: form.categoria,
        secao: form.secao,
        pasta: pastaFinal || null,
        descricao: form.descricao || null,
        visivel_para: form.visivel_para === 'todos' ? [] : [form.visivel_para],
        tem_credencial: form.temCredencial,
        login: form.temCredencial ? form.login : null,
        senha_enc: form.temCredencial ? form.senha : null,
        observacao: form.temCredencial ? form.observacao : null,
        criado_por: equipeMember?.id || null,
      }

      const { error: fullError } = await supabase.from("acessos").insert(fullRow)

      if (fullError) {
        // Fallback: tenta com somente os campos base
        const baseRow: any = {
          nome: form.nome,
          url: urlFinal,
          categoria: form.categoria,
          secao: form.secao, // FIX: Inclui secao no fallback!
          pasta: pastaFinal || null,
          descricao: form.descricao || null,
          criado_por: equipeMember?.id || null,
        }
        const { error: baseError } = await supabase.from("acessos").insert(baseRow)

        if (baseError) {
          const msg = baseError.message || JSON.stringify(baseError)
          console.error("[AbaAcessos] Insert error:", msg)
          alert(`Erro ao salvar: ${msg}\n\nExecute o SQL de migração no Supabase para adicionar as novas colunas.`)
          return
        }

        console.warn("[AbaAcessos] Salvo com schema antigo parcial. Erro original:", fullError)
      }

      onSalvo()
      onOpenChange(false)
    } catch (err: any) {
      const msg = err?.message || JSON.stringify(err)
      console.error("[AbaAcessos] handleSalvar error:", msg)
      alert(`Erro inesperado: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  const labelInput = "text-[10px] uppercase font-mono text-neutral-500 tracking-wider"
  const inputClass = "bg-[#0A0A0A] border-[#2A2A2A] text-white focus:border-orange-500/50 text-sm"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-orange-500 font-mono text-xs tracking-widest uppercase">
            Novo Acesso / Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Linha 1: Nome + Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelInput}>Nome da Plataforma <span className="text-orange-500">*</span></Label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Notion, GitHub..." className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelInput}>Categoria <span className="text-orange-500">*</span></Label>
              <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#111] border-[#2A2A2A]">
                  {CATEGORIAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label className={labelInput}>URL de Acesso <span className="text-orange-500">*</span></Label>
            <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://..." className={inputClass} />
          </div>

          {/* Seção + Pasta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelInput}>Seção <span className="text-orange-500">*</span></Label>
              <Select value={form.secao} onValueChange={handleSecaoChange}>
                <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#111] border-[#2A2A2A]">
                  {SECOES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelInput}>Pasta (opcional)</Label>
              {criandoPasta ? (
                <div className="flex gap-2">
                  <Input
                    value={novaPasta}
                    onChange={e => setNovaPasta(e.target.value)}
                    placeholder="Nome da pasta"
                    className={cn(inputClass, "flex-1")}
                  />
                  <Button size="sm" variant="ghost" className="text-xs text-neutral-400"
                    onClick={() => setCriandoPasta(false)}>✕</Button>
                </div>
              ) : (
                <Select value={form.pasta} onValueChange={v => {
                  if (v === "_criar") { setCriandoPasta(true); return }
                  setForm({ ...form, pasta: v })
                }}>
                  <SelectTrigger className={inputClass}><SelectValue placeholder="Sem pasta" /></SelectTrigger>
                  <SelectContent className="bg-[#111] border-[#2A2A2A]">
                    <SelectItem value="_sem_pasta">Sem pasta</SelectItem>
                    {pastasExistentes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    <SelectItem value="_criar" className="text-orange-400">+ Criar nova pasta</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label className={labelInput}>Descrição (opcional)</Label>
            <Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ex: Painel de analytics do cliente X..."
              className={cn(inputClass, "h-20 resize-none")} />
          </div>

          {/* Toggle Credenciais */}
          <div className="border border-[#2A2A2A] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Credenciais de Acesso</p>
                <p className="text-[10px] text-neutral-500">Login e senha para este acesso</p>
              </div>
              <Switch
                checked={form.temCredencial}
                onCheckedChange={v => setForm({ ...form, temCredencial: v })}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>

            {form.temCredencial && (
              <div className="space-y-3 pt-2 border-t border-[#1A1A1A]">
                <div className="space-y-1.5">
                  <Label className={labelInput}>Login / E-mail</Label>
                  <Input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })}
                    placeholder="usuario@email.com" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelInput}>Senha</Label>
                  <div className="relative">
                    <Input
                      type={showSenha ? "text" : "password"}
                      value={form.senha}
                      onChange={e => setForm({ ...form, senha: e.target.value })}
                      className={cn(inputClass, "pr-10")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                      onClick={() => setShowSenha(!showSenha)}
                    >
                      {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelInput}>Observação</Label>
                  <Input value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })}
                    placeholder="Ex: 2FA ativo, conta compartilhada..." className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {/* Visível para */}
          <div className="space-y-1.5">
            <Label className={labelInput}>Visível para</Label>
            <Select value={form.visivel_para} onValueChange={v => setForm({ ...form, visivel_para: v })}>
              <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#111] border-[#2A2A2A]">
                <SelectItem value="todos">Toda a equipe</SelectItem>
                <SelectItem value="admins">Apenas admins</SelectItem>
                <SelectItem value="especifico">Membros específicos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-neutral-400">
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={saving || !form.nome || !form.url}
            className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs uppercase tracking-widest"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Acesso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Componente Principal ────────────────────────────────
export function AbaAcessos({ userType }: { userType: string }) {
  const [acessos, setAcessos] = useState<Acesso[]>([])
  const [loading, setLoading] = useState(true)
  const [pesquisa, setPesquisa] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [secaoModal, setSecaoModal] = useState("nossas_plataformas")
  const [editando, setEditando] = useState<Acesso | null>(null)

  const loadAcessos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("acessos")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      setAcessos(data || [])
    } catch (err) {
      console.error("Erro ao carregar acessos:", err)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAcessos() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este acesso?")) return
    await supabase.from("acessos").delete().eq("id", id)
    setAcessos(prev => prev.filter(a => a.id !== id))
  }

  // Pastas únicas de todos os acessos (para o modal)
  const todasPastas = useMemo(() => {
    return [...new Set(acessos.map(a => a.pasta).filter(Boolean) as string[])]
  }, [acessos])

  // Filtro de busca global
  const acessosFiltrados = useMemo(() => {
    if (!pesquisa.trim()) return acessos
    const q = pesquisa.toLowerCase()
    return acessos.filter(a =>
      a.nome?.toLowerCase().includes(q) ||
      a.url?.toLowerCase().includes(q) ||
      a.categoria?.toLowerCase().includes(q) ||
      a.pasta?.toLowerCase().includes(q) ||
      a.descricao?.toLowerCase().includes(q)
    )
  }, [acessos, pesquisa])

  const openModal = (secaoId: string) => {
    setSecaoModal(secaoId)
    setModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header com busca e botão único */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <Input
            value={pesquisa}
            onChange={e => setPesquisa(e.target.value)}
            placeholder="Buscar por nome, URL, categoria ou pasta..."
            className="pl-9 bg-[#141414] border-[#2A2A2A] text-white placeholder:text-neutral-600 focus:border-orange-500/50"
          />
        </div>
        <Button
          onClick={() => { setSecaoModal("nossas_plataformas"); setModalOpen(true) }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-[10px] uppercase tracking-widest h-10 px-4 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          Novo Acesso
        </Button>
      </div>

      {/* Resultados de busca */}
      {pesquisa.trim() ? (
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            {acessosFiltrados.length} resultado(s) para "{pesquisa}"
          </p>
          {acessosFiltrados.length === 0 ? (
            <div className="py-12 text-center text-neutral-600 text-sm">Nenhum acesso encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {acessosFiltrados.map(a => {
                const secaoNome = SECOES.find(s => s.id === a.secao)?.label || a.secao
                return (
                  <div key={a.id}>
                    <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest mb-1">
                      {secaoNome}{a.pasta ? ` › ${a.pasta}` : ""}
                    </p>
                    <AcessoCard acesso={a} onEdit={setEditando} onDelete={handleDelete} userType={userType} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Seções fixas */
        SECOES.map(secao => {
          const secaoAcessos = acessosFiltrados.filter(a => a.secao === secao.id)
          const secaoPastas = [...new Set(secaoAcessos.map(a => a.pasta).filter(Boolean) as string[])]
          return (
            <SecaoBlock
              key={secao.id}
              secao={secao}
              acessos={secaoAcessos}
              pastas={secaoPastas}
              onEdit={setEditando}
              onDelete={handleDelete}
              userType={userType}
            />
          )
        })
      )}

      {/* Modal Novo Acesso */}
      <NovoAcessoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSalvo={loadAcessos}
        secaoInicial={secaoModal}
        pastasExistentes={todasPastas}
      />
    </div>
  )
}
