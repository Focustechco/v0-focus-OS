"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Save, Shield, Bell, Globe, Layout, User, Briefcase, Plus, X, Eye, EyeOff, Linkedin, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const profileSchema = z.object({
  nome_completo: z.string().min(3, "Nome muito curto"),
  cargo: z.string().optional(),
  empresa: z.string().optional(),
  email_profissional: z.string().email("Email inválido").optional(),
  telefone: z.string().optional(),
  bio: z.string().max(160, "Bio deve ter no máximo 160 caracteres").optional(),
  linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
  github: z.string().url("URL inválida").optional().or(z.literal("")),
  setor: z.string().optional(),
})

interface ProfileFormsProps {
  profile: any
  onUpdate: () => void
}

export function ProfileForms({ profile, onUpdate }: ProfileFormsProps) {
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [techs, setTechs] = useState<string[]>(profile?.tecnologias || [])

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome_completo: profile?.nome_completo || "",
      cargo: profile?.cargo || "",
      empresa: profile?.empresa || "",
      email_profissional: profile?.email_profissional || "",
      telefone: profile?.telefone || "",
      bio: profile?.bio || "",
      linkedin: profile?.linkedin || "",
      github: profile?.github || "",
      setor: profile?.setor || "",
    }
  })

  const bioContent = watch("bio") || ""

  const handleSaveInfo = async (data: any) => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from("perfil")
        .update({
          ...data,
          tecnologias: techs
        })
        .eq("usuario_id", profile.usuario_id)

      if (error) throw error
      toast.success("Perfil atualizado com sucesso!")
      onUpdate()
    } catch (error: any) {
      toast.error("Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (texto: string, cor: string) => {
    try {
      const { error } = await supabase
        .from("perfil")
        .update({ status_texto: texto, status_cor: cor })
        .eq("usuario_id", profile.usuario_id)

      if (error) throw error
      toast.success(`Status alterado para: ${texto}`)
      onUpdate()
    } catch (error) {
      toast.error("Erro ao atualizar status")
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !techs.includes(tagInput.trim())) {
      setTechs([...techs, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTechs(techs.filter(t => t !== tag))
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["personal", "status"]} className="space-y-4 border-none">
        
        {/* Seção 1: Informações Pessoais */}
        <AccordionItem value="personal" className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden px-4">
          <AccordionTrigger className="hover:no-underline py-4 group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white tracking-widest uppercase font-mono">Informações Pessoais</p>
                <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Dados base e biografia</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Nome Completo</Label>
                <Input {...register("nome_completo")} className="bg-[#0A0A0A] border-[#2A2A2A] text-white" />
                {errors.nome_completo && <p className="text-red-500 text-[10px]">{errors.nome_completo.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Cargo / Função</Label>
                <Input {...register("cargo")} className="bg-[#0A0A0A] border-[#2A2A2A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Empresa</Label>
                <Input {...register("empresa")} className="bg-[#0A0A0A] border-[#2A2A2A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Email Profissional</Label>
                <Input {...register("email_profissional")} className="bg-[#0A0A0A] border-[#2A2A2A] text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Telefone</Label>
                <Input {...register("telefone")} placeholder="(00) 00000-0000" className="bg-[#0A0A0A] border-[#2A2A2A] text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Biografia Curta</Label>
                <span className="text-[10px] font-mono text-neutral-600">{bioContent.length}/160</span>
              </div>
              <Textarea 
                {...register("bio")} 
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white min-h-[100px] resize-none" 
              />
            </div>
            <Button 
                onClick={handleSubmit(handleSaveInfo)} 
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 2: Status de Disponibilidade */}
        <AccordionItem value="status" className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden px-4">
          <AccordionTrigger className="hover:no-underline py-4 group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <Layout className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white tracking-widest uppercase font-mono">Status de Disponibilidade</p>
                <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Como outros te veem no sistema</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Disponível", color: "verde", css: "bg-green-500" },
                { label: "Em reunião", color: "amarelo", css: "bg-yellow-500" },
                { label: "Ocupado", color: "vermelho", css: "bg-red-500" },
                { label: "Ausente", color: "cinza", css: "bg-neutral-500" },
              ].map((s) => (
                <button
                  key={s.color}
                  onClick={() => handleStatusChange(s.label, s.color)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                    profile?.status_cor === s.color 
                        ? "bg-orange-500/5 border-orange-500 text-white" 
                        : "bg-[#0A0A0A] border-[#2A2A2A] text-neutral-500 hover:border-neutral-700"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${s.css} ${profile?.status_cor === s.color ? 'animate-pulse ring-4 ring-orange-500/20' : ''}`} />
                  <span className="text-[10px] font-mono tracking-widest uppercase">{s.label}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 3: Presença Profissional */}
        <AccordionItem value="professional" className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-4 group">
                <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-white tracking-widest uppercase font-mono">Presença Profissional</p>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Social, Setor e Stack</p>
                </div>
                </div>
            </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">URL LinkedIn</Label>
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <Input {...register("linkedin")} className="bg-[#0A0A0A] border-[#2A2A2A] text-white pl-10" placeholder="https://linkedin.com/in/..." />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">URL GitHub</Label>
                    <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <Input {...register("github")} className="bg-[#0A0A0A] border-[#2A2A2A] text-white pl-10" placeholder="https://github.com/..." />
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Setor de Atuação</Label>
                    <Select defaultValue={profile?.setor}>
                        <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                            <SelectValue placeholder="Selecione um setor" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-[#2A2A2A] text-white">
                            <SelectItem value="Tech">Setor Tech / Dev</SelectItem>
                            <SelectItem value="Comercial">Setor Comercial / CRM</SelectItem>
                            <SelectItem value="Criativo">Setor Criativo / Design</SelectItem>
                            <SelectItem value="Adm">Administração</SelectItem>
                            <SelectItem value="Financeiro">Financeiro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Stack Tecnológica / Hard Skills</Label>
                    <div className="flex gap-2">
                        <Input 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                            className="bg-[#0A0A0A] border-[#2A2A2A] text-white" 
                            placeholder="Digite e pressione Enter..."
                        />
                        <Button variant="outline" size="icon" onClick={addTag} className="bg-[#1A1A1A] border-[#2A2A2A]">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {techs.map((t) => (
                            <span key={t} className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-mono tracking-widest uppercase rounded-full">
                                {t}
                                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(t)} />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <Button onClick={handleSubmit(handleSaveInfo)} className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase">
                Atualizar Perfil Profissional
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 4: Segurança */}
        <AccordionItem value="security" className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-4 group">
                <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-900 rounded-lg text-neutral-600 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-white tracking-widest uppercase font-mono">Segurança e Acesso</p>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Senhas e autenticação</p>
                </div>
                </div>
            </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Alterar Senha de Acesso</Label>
                    <div className="relative">
                        <Input type={showNewPassword ? "text" : "password"} className="bg-[#0A0A0A] border-[#2A2A2A] text-white pr-10" placeholder="Nova senha" />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? <EyeOff className="w-4 h-4 text-neutral-600" /> : <Eye className="w-4 h-4 text-neutral-600" />}
                        </button>
                    </div>
                    <Input type="password" className="bg-[#0A0A0A] border-[#2A2A2A] text-white" placeholder="Confirmar nova senha" />
                </div>
                <Button className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-mono text-xs tracking-widest uppercase transition-all">
                    Atualizar Senha
                </Button>
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-2">
                <h4 className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Gerenciar Sessões</h4>
                <p className="text-[10px] text-neutral-600 italic">Encerre o acesso em outros dispositivos onde você pode estar logado.</p>
                <Button variant="ghost" className="text-neutral-500 hover:text-white text-[10px] font-mono tracking-widest uppercase p-0 h-auto">
                    Encerrar outras sessões ativas
                </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Seção 5: Preferências */}
        <AccordionItem value="preferences" className="bg-[#111111] border border-[#2A2A2A] rounded-xl overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-4 group">
                <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Globe className="w-4 h-4" />
                </div>
                <div className="text-left">
                    <p className="text-sm font-bold text-white tracking-widest uppercase font-mono">Preferências da Aplicação</p>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Notificações e localidade</p>
                </div>
                </div>
            </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-white font-medium">Notificações Push</p>
                        <p className="text-xs text-neutral-500">Alertas em tempo real no navegador</p>
                    </div>
                    <Switch />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-white font-medium">Notificações por E-mail</p>
                        <p className="text-xs text-neutral-500">Resumos diários e alertas críticos</p>
                    </div>
                    <Switch defaultChecked />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Fuso Horário</Label>
                    <Select defaultValue="utc-3">
                        <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-[#2A2A2A] text-white">
                            <SelectItem value="utc-3">Brasília (UTC-3)</SelectItem>
                            <SelectItem value="utc-0">Londres (UTC+0)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Formato de Data</Label>
                    <Select defaultValue="br">
                        <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-[#2A2A2A] text-white">
                            <SelectItem value="br">DD/MM/AAAA</SelectItem>
                            <SelectItem value="us">MM/DD/AAAA</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}
