"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Moon, Sun, Check, Monitor, Layout, Smartphone } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface AparenciaSectionProps {
  onChange: () => void
}


export function AparenciaSection({ onChange }: AparenciaSectionProps) {
  const { theme, setTheme } = useTheme()
  const [density, setDensity] = useState<"compacta" | "normal" | "confortavel">("normal")
  const [sidebarMode, setSidebarMode] = useState<"expandida" | "mini">("expandida")

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-sm font-bold tracking-widest text-orange-500 uppercase flex items-center gap-2">
          <Layout className="w-4 h-4" />
          PERSONALIZAÇÃO
        </h2>
        <p className="text-neutral-500 text-xs font-mono">
          Ajuste a interface do Focus OS para o seu fluxo de trabalho
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 ml-1">Tema do Sistema</Label>
          <div className="flex bg-secondary/50 p-1 rounded-lg border border-border h-12">
            {[
              { id: "dark", label: "Dark", icon: Moon },
              { id: "light", label: "Light", icon: Sun },
              { id: "system", label: "Auto", icon: Monitor },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); onChange() }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-md transition-all text-xs font-bold uppercase tracking-wider",
                  theme === t.id 
                    ? "bg-background text-orange-500 shadow-sm border border-border" 
                    : "text-neutral-500 hover:text-foreground hover:bg-white/5"
                )}
              >
                <t.icon className={cn("w-3.5 h-3.5", theme === t.id ? "text-orange-500" : "text-neutral-500")} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Density Selection */}
        <div className="space-y-3">
          <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 ml-1">Densidade da UI</Label>
          <div className="flex bg-secondary/50 p-1 rounded-lg border border-border h-12">
            {[
              { id: "compacta", label: "Compacta" },
              { id: "normal", label: "Normal" },
              { id: "confortavel", label: "Confort" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => { setDensity(d.id as any); onChange() }}
                className={cn(
                  "flex-1 flex items-center justify-center rounded-md transition-all text-[10px] font-bold uppercase tracking-wider",
                  density === d.id 
                    ? "bg-background text-orange-500 shadow-sm border border-border" 
                    : "text-neutral-500 hover:text-foreground hover:bg-white/5"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Mode */}
        <div className="space-y-3">
          <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 ml-1">Layout da Sidebar</Label>
          <div className="flex bg-secondary/50 p-1 rounded-lg border border-border h-12">
            {[
              { id: "expandida", label: "Expandida" },
              { id: "mini", label: "Mini Ícones" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => { setSidebarMode(s.id as any); onChange() }}
                className={cn(
                  "flex-1 flex items-center justify-center rounded-md transition-all text-[10px] font-bold uppercase tracking-wider",
                  sidebarMode === s.id 
                    ? "bg-background text-orange-500 shadow-sm border border-border" 
                    : "text-neutral-500 hover:text-foreground hover:bg-white/5"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-3">
          <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 ml-1">Fonte da Interface</Label>
          <Select defaultValue="jetbrains" onValueChange={onChange}>
            <SelectTrigger className="bg-secondary/50 border-border text-foreground font-mono h-12 text-xs uppercase tracking-wider font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
              <SelectItem value="ibm-plex">IBM Plex Mono</SelectItem>
              <SelectItem value="fira">Fira Code</SelectItem>
              <SelectItem value="roboto">Roboto Mono</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      {/* Switches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Animações Fluídas", desc: "Transições e micro-interações", checked: true },
          { label: "Timestamps Dinâmicos", desc: "Exibir 'há 2 horas' em vez de datas", checked: true },
          { label: "Glassmorphism", desc: "Efeito de transparência nas janelas", checked: true },
          { label: "Barra de Ferramentas", desc: "Acesso rápido em telas menores", checked: false },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/50 hover:border-orange-500/30 transition-all group">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-widest group-hover:text-orange-500 transition-colors">{item.label}</p>
              <p className="text-[10px] text-neutral-500 font-mono">{item.desc}</p>
            </div>
            <Switch defaultChecked={item.checked} onCheckedChange={onChange} className="data-[state=checked]:bg-orange-500" />
          </div>
        ))}
      </div>

      <div className="pt-4 flex items-center gap-3 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 italic">
        <Layout className="w-4 h-4 text-orange-500 mt-0.5" />
        <p className="text-[10px] text-neutral-500 leading-relaxed font-mono">
          As preferências visuais são salvas no seu perfil e sincronizadas entre dispositivos. 
          Algumas alterações na densidade podem exigir recarregamento da página.
        </p>
      </div>
    </div>
  )
}
