"use client"

import { User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function PerfilIdentidadeSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">Perfil & Identidade</h2>
        <p className="text-sm text-neutral-500 font-mono uppercase tracking-wider">
          Personalize sua aparência e informações profissionais no Focus OS
        </p>
      </div>

      <Card className="p-6 bg-[#111111] border-[#2A2A2A] hover:border-orange-500/30 transition-all group">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-lg font-bold text-white">Editar Perfil Completo</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Altere sua foto de perfil, banner de capa, cargo, empresa e status de disponibilidade. 
                Gerencie também suas redes profissionais e preferências de sistema.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/perfil">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs tracking-widest uppercase px-6">
                  Acessar Central de Perfil
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-2">
          <p className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-bold">Dica de Identidade</p>
          <p className="text-xs text-neutral-500">
            Seu cargo e status de disponibilidade aparecem para toda a equipe no Dashboard e no chat interno.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] space-y-2">
            <p className="text-[10px] font-mono text-orange-500 uppercase tracking-widest font-bold">Sincronização</p>
            <p className="text-xs text-neutral-500">
                Mudanças no perfil são refletidas instantaneamente em todos os módulos do Focus OS.
            </p>
        </div>
      </div>
    </div>
  )
}
