"use client"

import { useState, useRef } from "react"
import { useEquipe, type TeamMember } from "@/lib/hooks/use-equipe"
import { useProjects } from "@/lib/hooks/use-projetos"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building2,
  Github,
  Linkedin,
  FileText,
  FolderKanban,
  Download,
  ArrowRight,
  Upload,
  Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { NovoMembroModal } from "./novo-membro-modal"

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-orange-500/20 text-orange-500 border-orange-500/30" },
  colaborador: { label: "Colaborador", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  estagiario: { label: "Estagiário", color: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30" },
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

interface MembroDetalhesDrawerProps {
  memberId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MembroDetalhesDrawer({ memberId, open, onOpenChange }: MembroDetalhesDrawerProps) {
  const { equipe, updateMembro, mutate } = useEquipe()
  const { projects } = useProjects()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [uploadingContract, setUploadingContract] = useState(false)
  const contractInputRef = useRef<HTMLInputElement>(null)

  const membro = equipe.find((m) => m.id === memberId)
  const linkedProjects = projects.filter(
    (p) => p.tech_lead_id === memberId || p.dev_secundario_id === memberId
  )

  if (!membro) return null

  const tipoInfo = TIPO_LABELS[membro.tipo] ?? TIPO_LABELS.colaborador

  const handleToggleStatus = async () => {
    const newStatus = membro.status === "ativo" ? "inativo" : "ativo"
    await updateMembro(membro.id, { status: newStatus })
  }

  const handleContractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !membro) return

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      toast.error('Formato inválido. Envie arquivos PDF ou DOC/DOCX.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Arquivo muito grande. O limite é 20 MB.')
      return
    }

    try {
      setUploadingContract(true)
      const ext = file.name.split('.').pop()
      const path = `contratos/${membro.id}/contrato.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('contratos')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('contratos')
        .getPublicUrl(path)

      await updateMembro(membro.id, { contrato_url: publicUrl })
      toast.success(`${file.name} enviado com sucesso!`)
      mutate()
    } catch (err: any) {
      console.error('[ContractUpload]', err)
      toast.error(err.message || 'Erro ao enviar o contrato. Tente novamente.')
    } finally {
      setUploadingContract(false)
      if (contractInputRef.current) contractInputRef.current.value = ''
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#141414] border-[#2A2A2A] text-white sm:max-w-[520px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-[#2A2A2A]">
                <AvatarImage src={membro.foto_url} />
                <AvatarFallback
                  className="text-xl font-bold"
                  style={{ backgroundColor: membro.cor_avatar ?? "#FF6B00" }}
                >
                  {initials(membro.nome)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#141414] ${membro.status === "ativo" ? "bg-green-500" : "bg-neutral-600"}`} />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-white font-display text-xl">{membro.nome}</SheetTitle>
              <p className="text-neutral-500 text-sm">{membro.cargo}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`text-[10px] ${tipoInfo.color}`}>
                  {tipoInfo.label}
                </Badge>
                <Badge variant="outline" className={`text-[10px] ${membro.status === "ativo" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"}`}>
                  {membro.status === "ativo" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Info Contato */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-[0.2em]">
                Contato
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Mail, label: membro.email },
                  { icon: Phone, label: membro.telefone },
                  { icon: Building2, label: membro.setor },
                  { icon: Calendar, label: membro.data_admissao ? `Admissão: ${new Date(membro.data_admissao).toLocaleDateString()}` : null },
                ].map(({ icon: Icon, label }) => label ? (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                    <span className="text-neutral-300">{label}</span>
                  </div>
                ) : null)}
              </div>
              <div className="flex items-center gap-3">
                {membro.linkedin && (
                  <a href={membro.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {membro.github && (
                  <a href={membro.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
              </div>
            </div>

            {/* Bio */}
            {membro.bio && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-[0.2em]">Bio</h3>
                <p className="text-sm text-neutral-300 leading-relaxed">{membro.bio}</p>
              </div>
            )}

            {/* Stack */}
            {membro.tecnologias && membro.tecnologias.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-[0.2em]">Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {membro.tecnologias.map((t) => (
                    <Badge key={t} className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contrato */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-[0.2em]">Contrato</h3>
                <button
                  onClick={() => contractInputRef.current?.click()}
                  disabled={uploadingContract}
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-orange-500 hover:text-orange-400 disabled:opacity-50 transition-colors"
                >
                  {uploadingContract ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  {uploadingContract ? 'Enviando...' : 'Fazer upload'}
                </button>
                <input
                  ref={contractInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleContractUpload}
                />
              </div>

              {membro.contrato_url ? (
                <a
                  href={membro.contrato_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg hover:border-orange-500/30 transition-all group"
                >
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-neutral-300 flex-1 truncate">
                    {decodeURIComponent(membro.contrato_url.split('/').pop() || 'contrato')}
                  </span>
                  <Download className="w-4 h-4 text-neutral-600 group-hover:text-orange-500 transition-colors" />
                </a>
              ) : (
                <button
                  onClick={() => contractInputRef.current?.click()}
                  disabled={uploadingContract}
                  className="w-full flex flex-col items-center justify-center gap-2 p-6 border border-dashed border-[#2A2A2A] rounded-lg hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group disabled:opacity-50"
                >
                  <FileText className="w-6 h-6 text-neutral-600 group-hover:text-orange-500 transition-colors" />
                  <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">Nenhum contrato. Clique para enviar.</span>
                  <span className="text-[9px] font-mono text-neutral-600 uppercase">PDF, DOC ou DOCX · Máx 20 MB</span>
                </button>
              )}
            </div>

            {/* Projetos Vinculados */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono uppercase text-neutral-500 tracking-[0.2em]">
                  Projetos Vinculados
                </h3>
                <Badge className="bg-orange-500/10 text-orange-500 border-none font-mono text-[10px]">
                  {linkedProjects.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {linkedProjects.length === 0 ? (
                  <p className="text-xs text-neutral-600 text-center py-4">Nenhum projeto vinculado</p>
                ) : (
                  linkedProjects.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                          <span className="text-[9px] font-mono font-bold text-orange-500">{p.codigo}</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{p.nome}</p>
                          <p className="text-[10px] text-neutral-500 uppercase">{p.status}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-700" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#2A2A2A] flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-[#2A2A2A] text-neutral-400 hover:text-white"
            onClick={handleToggleStatus}
          >
            {membro.status === "ativo" ? "Desativar" : "Ativar"}
          </Button>
          <Button 
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => setEditModalOpen(true)}
          >
            Editar Perfil
          </Button>
        </div>
      </SheetContent>

      <NovoMembroModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        member={membro}
      />
    </Sheet>
  )
}
