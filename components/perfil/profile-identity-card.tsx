"use client"

import { useState, useRef } from "react"
import { Camera, Linkedin, Github, ExternalLink, User, CheckCircle2, Clock, Ban, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface ProfileIdentityCardProps {
  profile: any
  onUpdate: () => void
}

export function ProfileIdentityCard({ profile, onUpdate }: ProfileIdentityCardProps) {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const statusColors = {
    verde: "text-green-500 bg-green-500/10 border-green-500/20",
    amarelo: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    vermelho: "text-red-500 bg-red-500/10 border-red-500/20",
    cinza: "text-neutral-500 bg-neutral-500/10 border-neutral-500/20",
  }

  const statusIcons = {
    verde: CheckCircle2,
    amarelo: Clock,
    vermelho: Ban,
    cinza: LogOut,
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máx 5MB)")
        return
      }
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (type: 'avatar' | 'banner') => {
    if (!selectedFile) return

    try {
      setUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatares')
        .getPublicUrl(filePath)

      const updateData = type === 'avatar' 
        ? { avatar_url: publicUrl } 
        : { banner_url: publicUrl }

      const attemptUpdate = async (payload: any): Promise<void> => {
        if (Object.keys(payload).length === 0) return;
        const { error } = await supabase
          .from('perfil')
          .update(payload)
          .eq('usuario_id', user.id);

        if (error && error.message && error.message.includes("Could not find")) {
           const match = error.message.match(/'([^']+)' column/);
           if (match && match[1]) {
             const keyToRemove = match[1];
             const newPayload = { ...payload };
             delete newPayload[keyToRemove];
             console.warn(`[Perfil] Coluna ausente '${keyToRemove}', ignorando...`);
             return attemptUpdate(newPayload);
           }
        }
        if (error) throw error;
      };

      await attemptUpdate(updateData);

      // Sincroniza a foto (avatar_url) para o banco de dados 'equipe', usando a chave foto_url dessa vez,
      // para que a foto do usuario conectada via email reflita no Modulo de Equipe e no Dashboard.
      if (type === 'avatar' && user.email) {
        await supabase
          .from('equipe')
          .update({ foto_url: publicUrl })
          .eq('email', user.email)
      }

      toast.success(`${type === 'avatar' ? 'Foto' : 'Banner'} atualizado com sucesso!`)
      
      // Sincroniza o menu superior e outros componentes instantaneamente
      window.dispatchEvent(new Event('profile-updated'))
      
      onUpdate()
      setIsPhotoModalOpen(false)
      setIsBannerModalOpen(false)
      setSelectedFile(null)
      setPreview(null)
    } catch (error: any) {
      console.error(error)
      toast.error("Erro ao fazer upload")
    } finally {
      setUploading(false)
    }
  }

  const StatusIcon = (statusIcons as any)[profile?.status_cor || 'cinza'] || Clock

  return (
    <Card className="bg-background border-border overflow-hidden">
      {/* Banner */}
      <div 
        className="h-[140px] bg-[#1A1A1A] relative cursor-pointer group"
        onClick={() => setIsBannerModalOpen(true)}
      >
        {profile?.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-500/10 to-transparent" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-foreground" />
        </div>
      </div>

      <div className="relative px-6 pb-6 pt-14 text-center">
        {/* Avatar */}
        <div 
          className="absolute -top-[50px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] rounded-full border-4 border-[#111111] bg-[#1A1A1A] overflow-hidden cursor-pointer group shadow-xl"
          onClick={() => setIsPhotoModalOpen(true)}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-500/10 text-orange-500 font-bold text-2xl">
              {profile?.nome_completo?.[0] || "?"}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="w-5 h-5 text-foreground" />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{profile?.nome_completo}</h2>
            <p className="text-orange-500 text-xs font-mono tracking-widest uppercase mt-1">
              {profile?.cargo || "Sem cargo definido"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className={`font-mono text-[10px] tracking-wider uppercase border ${statusColors[profile?.status_cor as keyof typeof statusColors || 'cinza']}`}>
                <StatusIcon className="w-3 h-3 mr-1.5" />
                {profile?.status_texto || 'Ausente'}
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-neutral-400 font-mono text-[10px] tracking-wider uppercase">
              {profile?.empresa || "Focus OS"}
            </Badge>
          </div>

          <p className="text-neutral-400 text-sm italic leading-relaxed max-w-[280px] mx-auto">
            "{profile?.bio || "Olá, estou usando o Focus OS!"}"
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            {profile?.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {profile?.github && (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex flex-wrap justify-center gap-1.5">
              {profile?.tecnologias?.map((tech: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-[#1A1A1A] border border-border rounded text-[9px] font-mono text-neutral-500 hover:text-orange-500 transition-colors">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4 bg-[#1A1A1A] border-border text-neutral-400 hover:text-foreground hover:bg-[#202020] text-xs font-mono tracking-widest uppercase">
            Visualizar como outros veem
          </Button>
        </div>
      </div>

      {/* Modal Foto de Perfil */}
      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-orange-500 font-mono text-sm tracking-widest uppercase">
              Atualizar Foto de Perfil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-orange-500" alt="Preview" />
              ) : (
                <div className="space-y-2">
                  <Camera className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-500">Arraste ou clique para selecionar</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPhotoModalOpen(false)} className="text-xs font-mono uppercase">Cancelar</Button>
            <Button 
                onClick={() => uploadImage('avatar')} 
                disabled={!selectedFile || uploading}
                className="bg-orange-500 hover:bg-orange-600 text-foreground font-mono text-xs uppercase"
            >
              {uploading ? "Enviando..." : "Salvar Foto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Banner */}
      <Dialog open={isBannerModalOpen} onOpenChange={setIsBannerModalOpen}>
        <DialogContent className="bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-orange-500 font-mono text-sm tracking-widest uppercase">
              Atualizar Capa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} className="w-full h-24 object-cover rounded mx-auto border-2 border-orange-500" alt="Preview" />
              ) : (
                <div className="space-y-2">
                  <Camera className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-500">Banner recomendado (16:3)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBannerModalOpen(false)} className="text-xs font-mono uppercase">Cancelar</Button>
            <Button 
                onClick={() => uploadImage('banner')} 
                disabled={!selectedFile || uploading}
                className="bg-orange-500 hover:bg-orange-600 text-foreground font-mono text-xs uppercase"
            >
              {uploading ? "Enviando..." : "Salvar Capa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
