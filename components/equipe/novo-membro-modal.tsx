"use client"

import { useState, useRef, useEffect } from "react"
import { useEquipe, type TeamMember } from "@/lib/hooks/use-equipe"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building2,
  Shield,
  Github,
  Linkedin,
  FileText,
  Upload,
  X,
  Loader2,
  Plus,
  Tag,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const SETORES = ["Tech", "Comercial", "Criativo", "Administração", "Financeiro"]
const TIPOS = [
  { value: "admin", label: "Administrador", desc: "Acesso total" },
  { value: "colaborador", label: "Colaborador", desc: "Acesso padrão" },
  { value: "estagiario", label: "Estagiário", desc: "Acesso limitado" },
]

interface NovoMembroModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  member?: TeamMember | null // Prop opcional para edição
}

export function NovoMembroModal({ open, onOpenChange, onSuccess, member }: NovoMembroModalProps) {
  const { addMembro, updateMembro, uploadAvatar, uploadContrato } = useEquipe()
  const { showToast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(member?.foto_url || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [contratoFile, setContratoFile] = useState<File | null>(null)
  const [tagInput, setTagInput] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const contratoInputRef = useRef<HTMLInputElement>(null)

  const emptyForm = {
    nome: member?.nome || "",
    email: member?.email || "",
    telefone: member?.telefone || "",
    data_nascimento: member?.data_nascimento || "",
    data_admissao: member?.data_admissao || new Date().toISOString().split("T")[0],
    cargo: member?.cargo || "",
    setor: member?.setor || "",
    tipo: (member?.tipo || "colaborador") as "admin" | "colaborador" | "estagiario",
    status: (member?.status || "ativo") as "ativo" | "inativo",
    linkedin: member?.linkedin || "",
    github: member?.github || "",
    bio: member?.bio || "",
    tecnologias: member?.tecnologias || [] as string[],
  }

  const [form, setForm] = useState(emptyForm)

  // Reset form when member changes or modal opens
  useEffect(() => {
    if (open) {
      setForm({
        nome: member?.nome || "",
        email: member?.email || "",
        telefone: member?.telefone || "",
        data_nascimento: member?.data_nascimento || "",
        data_admissao: member?.data_admissao || new Date().toISOString().split("T")[0],
        cargo: member?.cargo || "",
        setor: member?.setor || "",
        tipo: (member?.tipo || "colaborador") as "admin" | "colaborador" | "estagiario",
        status: (member?.status || "ativo") as "ativo" | "inativo",
        linkedin: member?.linkedin || "",
        github: member?.github || "",
        bio: member?.bio || "",
        tecnologias: member?.tecnologias || [],
      })
      setAvatarPreview(member?.foto_url || null)
      setAvatarFile(null)
      setContratoFile(null)
    }
  }, [open, member])

  const handleAvatarChange = (file: File) => {
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tecnologias.includes(tag)) {
      setForm({ ...form, tecnologias: [...form.tecnologias, tag] })
    }
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setForm({ ...form, tecnologias: form.tecnologias.filter((t) => t !== tag) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nome || !form.email || !form.tipo) {
      showToast("error", "Nome, Email e Tipo são obrigatórios.")
      return
    }

    setIsSubmitting(true)
    try {
      let memberId = member?.id

      if (!memberId) {
        // MODO CRIAÇÃO: FASE 1 - Insert base
        const corePayload: any = {
          nome: form.nome,
          email: form.email,
        }
        const { data, error } = await addMembro(corePayload)
        if (error || !data) {
          showToast("error", "Erro ao cadastrar membro.")
          setIsSubmitting(false)
          return
        }
        memberId = data.id
      }

      // MODO EDIÇÃO OU FASE 2 CRIAÇÃO: Update completo
      const fullPayload: any = {
        nome: form.nome,
        email: form.email,
        cargo: form.cargo || null,
        setor: form.setor || null,
        tipo: form.tipo,
        status: form.status,
        telefone: form.telefone || null,
        data_nascimento: form.data_nascimento || null,
        data_admissao: form.data_admissao || null,
        linkedin: form.linkedin || null,
        github: form.github || null,
        bio: form.bio || null,
        tecnologias: form.tecnologias,
      }

      await updateMembro(memberId, fullPayload)

      let foto_url: string | undefined
      let contrato_url: string | undefined

      // Upload files if any
      if (avatarFile) {
        const { url, error: avatarError } = await uploadAvatar(memberId, avatarFile)
        if (!avatarError && url) foto_url = url
      }
      if (contratoFile) {
        const { url, error: contratoError } = await uploadContrato(memberId, contratoFile)
        if (!contratoError && url) contrato_url = url
      }

      if (foto_url || contrato_url) {
        const fileUpdates: any = {}
        if (foto_url) fileUpdates.foto_url = foto_url
        if (contrato_url) fileUpdates.contrato_url = contrato_url
        await updateMembro(memberId, fileUpdates)
      }

      showToast("success", member ? "Perfil atualizado!" : "Membro cadastrado!")
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      console.error("Erro no cadastro/edição:", err)
      showToast("error", "Erro inesperado.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-3xl p-0">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle className="font-display text-xl">
            {member ? "Editar Perfil do Membro" : "Novo Membro da Equipe"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[75vh]">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {/* === COLUNA ESQUERDA === */}
              <div className="space-y-5">
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase border-b border-border pb-2">
                  Dados Pessoais
                </p>

                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-orange-500/50 transition-colors group overflow-hidden"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar preview" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <User className="w-6 h-6 text-neutral-600 group-hover:text-orange-500 transition-colors" />
                        <span className="text-[9px] text-neutral-600 mt-1">Foto</span>
                      </div>
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleAvatarChange(e.target.files[0])}
                  />
                  <p className="text-[10px] text-neutral-600">Clique para enviar foto</p>
                </div>

                {/* Nome */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Nome Completo *
                  </Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Adriano Pereira"
                    className="bg-[#1A1A1A] border-border focus:border-orange-500"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email Profissional *
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nome@focus.com.br"
                    className="bg-[#1A1A1A] border-border focus:border-orange-500"
                    required
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Telefone
                  </Label>
                  <Input
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="bg-[#1A1A1A] border-border focus:border-orange-500"
                  />
                </div>

                {/* Data Nascimento + Admissao */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Nascimento
                    </Label>
                    <Input
                      type="date"
                      value={form.data_nascimento}
                      onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                      className="bg-[#1A1A1A] border-border [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> Admissão
                    </Label>
                    <Input
                      type="date"
                      value={form.data_admissao}
                      onChange={(e) => setForm({ ...form, data_admissao: e.target.value })}
                      className="bg-[#1A1A1A] border-border [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* === COLUNA DIREITA === */}
              <div className="space-y-5">
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase border-b border-border pb-2">
                  Cargo & Permissões
                </p>

                {/* Cargo */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3" /> Cargo
                  </Label>
                  <Input
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    placeholder="Ex: Tech Lead, Designer, SDR"
                    className="bg-[#1A1A1A] border-border focus:border-orange-500"
                  />
                </div>

                {/* Setor */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> Setor
                  </Label>
                  <Select value={form.setor} onValueChange={(v) => setForm({ ...form, setor: v })}>
                    <SelectTrigger className="bg-[#1A1A1A] border-border">
                      <SelectValue placeholder="Selecione o setor..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-border">
                      {SETORES.map((s) => (
                        <SelectItem key={s} value={s.toLowerCase()} className="focus:bg-[#2A2A2A]">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Tipo / Nível *
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, tipo: t.value as any })}
                        className={cn(
                          "p-2 rounded-lg border text-left transition-all",
                          form.tipo === t.value
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-border bg-[#1A1A1A] hover:border-neutral-600"
                        )}
                      >
                        <p className={cn("text-xs font-bold", form.tipo === t.value ? "text-orange-500" : "text-foreground")}>
                          {t.label}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-border">
                  <div>
                    <p className="text-xs font-medium text-foreground">Status</p>
                    <p className="text-[10px] text-neutral-500">
                      {form.status === "ativo" ? "Membro ativo" : "Membro inativo"}
                    </p>
                  </div>
                  <Switch
                    checked={form.status === "ativo"}
                    onCheckedChange={(v) => setForm({ ...form, status: v ? "ativo" : "inativo" })}
                  />
                </div>

                {/* LinkedIn + GitHub */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                      <Linkedin className="w-3 h-3" /> LinkedIn
                    </Label>
                    <Input
                      value={form.linkedin}
                      onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                      placeholder="URL do perfil"
                      className="bg-[#1A1A1A] border-border text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                      <Github className="w-3 h-3" /> GitHub
                    </Label>
                    <Input
                      value={form.github}
                      onChange={(e) => setForm({ ...form, github: e.target.value })}
                      placeholder="URL do perfil"
                      className="bg-[#1A1A1A] border-border text-xs"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500">
                    Bio <span className="text-neutral-600">(máx 160 chars)</span>
                  </Label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value.substring(0, 160) })}
                    placeholder="Breve descrição do profissional..."
                    className="bg-[#1A1A1A] border-border min-h-[60px] text-sm resize-none"
                    maxLength={160}
                  />
                  <p className="text-[10px] text-right text-neutral-600">{form.bio.length}/160</p>
                </div>

                {/* Stack / Tecnologias */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-mono uppercase text-neutral-500 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Stack / Tecnologias
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder="Ex: React, Node.js... Enter para adicionar"
                      className="bg-[#1A1A1A] border-border text-xs flex-1"
                    />
                    <Button type="button" onClick={addTag} size="icon" variant="outline" className="border-border">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  {form.tecnologias.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.tecnologias.map((tag) => (
                        <Badge
                          key={tag}
                          className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] group cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag}
                          <X className="w-2.5 h-2.5 ml-1 opacity-0 group-hover:opacity-100" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* === SEÇÃO CONTRATO (full width) === */}
              <div className="md:col-span-2 space-y-3">
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase border-b border-border pb-2">
                  Contrato
                </p>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                    isDragging
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-border hover:border-neutral-600"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const file = e.dataTransfer.files[0]
                    if (file) setContratoFile(file)
                  }}
                  onClick={() => contratoInputRef.current?.click()}
                >
                  {contratoFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-foreground">{contratoFile.name}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setContratoFile(null) }}
                        className="text-neutral-500 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : member?.contrato_url ? (
                    <div className="flex flex-col items-center gap-2">
                       <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-orange-500">
                          <FileText className="w-4 h-4" />
                          <span className="text-[10px] font-bold">CONTRATO ATUAL JÁ ENVIADO</span>
                       </div>
                       <p className="text-xs text-neutral-400">Clique para substituir por um novo arquivo</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-neutral-600" />
                      <p className="text-sm text-neutral-500">
                        Arraste o arquivo aqui ou clique para selecionar
                      </p>
                      <p className="text-[10px] text-neutral-600">PDF, DOC · Máx 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={contratoInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setContratoFile(e.target.files[0])}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-border">
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
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-foreground min-w-[180px]"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {member ? "Salvando..." : "Cadastrando..."}</>
              ) : (
                <>{member ? <Briefcase className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />} {member ? "Salvar Alterações" : "Cadastrar Membro"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
