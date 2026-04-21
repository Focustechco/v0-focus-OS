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
import { Moon, Sun, Check } from "lucide-react"
import { useTheme } from "next-themes"

interface AparenciaSectionProps {
  onChange: () => void
}

const accentColors = [
  { name: "Orange", hex: "#FF6B00" },
  { name: "Cyan", hex: "#00D4FF" },
  { name: "Green", hex: "#00FF88" },
  { name: "Red", hex: "#FF3B3B" },
  { name: "Purple", hex: "#9B59FF" },
]

export function AparenciaSection({ onChange }: AparenciaSectionProps) {
  const { theme, setTheme } = useTheme()
  const [accentColor, setAccentColor] = useState("#FF6B00")
  const [density, setDensity] = useState<"compacta" | "normal" | "confortavel">("normal")
  const [sidebarMode, setSidebarMode] = useState<"expandida" | "mini">("expandida")

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Aparencia
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Personalize a aparencia do sistema
        </p>
      </div>

      {/* Theme */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Tema</Label>
          <div className="flex gap-4">
            <button
              onClick={() => { setTheme("dark"); onChange() }}
              className={`flex-1 p-4 rounded border-2 transition-all ${
                theme === "dark"
                  ? "border-orange-500 bg-[#1a1a1a]"
                  : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-neutral-600"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Moon className={`w-5 h-5 ${theme === "dark" ? "text-orange-500" : "text-neutral-400"}`} />
                <span className={`font-mono text-sm ${theme === "dark" ? "text-foreground" : "text-neutral-400"}`}>DARK</span>
                {theme === "dark" && <Check className="w-4 h-4 text-orange-500" />}
              </div>
              <div className="mt-3 h-16 rounded bg-secondary border border-[#2a2a2a] flex items-center justify-center">
                <div className="w-8 h-2 bg-orange-500 rounded" />
              </div>
            </button>
            <button
              onClick={() => { setTheme("light"); onChange() }}
              className={`flex-1 p-4 rounded border-2 transition-all ${
                theme === "light"
                  ? "border-orange-500 bg-white"
                  : "border-[#2a2a2a] bg-neutral-100 hover:border-neutral-600"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Sun className={`w-5 h-5 ${theme === "light" ? "text-orange-500" : "text-neutral-500"}`} />
                <span className={`font-mono text-sm ${theme === "light" ? "text-black" : "text-neutral-500"}`}>LIGHT</span>
                {theme === "light" && <Check className="w-4 h-4 text-orange-500" />}
              </div>
              <div className="mt-3 h-16 rounded bg-white border border-neutral-200 flex items-center justify-center">
                <div className="w-8 h-2 bg-orange-500 rounded" />
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Cor de Destaque</Label>
          <div className="flex items-center gap-3">
            {accentColors.map((color) => (
              <button
                key={color.hex}
                onClick={() => { setAccentColor(color.hex); onChange() }}
                className={`w-10 h-10 rounded-md transition-all flex items-center justify-center ${
                  accentColor === color.hex ? "ring-2 ring-white ring-offset-2 ring-offset-[#141414]" : ""
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {accentColor === color.hex && <Check className="w-5 h-5 text-foreground" />}
              </button>
            ))}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-neutral-500 text-sm font-mono">#</span>
              <Input
                value={accentColor.replace("#", "")}
                onChange={(e) => { setAccentColor(`#${e.target.value}`); onChange() }}
                className="w-24 bg-[#1a1a1a] border-[#2a2a2a] text-foreground font-mono text-sm uppercase"
                maxLength={6}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Density */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Densidade da Interface</Label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "compacta" as const, label: "COMPACTA", lines: 4 },
              { value: "normal" as const, label: "NORMAL", lines: 3 },
              { value: "confortavel" as const, label: "CONFORTAVEL", lines: 2 },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => { setDensity(option.value); onChange() }}
                className={`p-4 rounded border-2 transition-all ${
                  density === option.value
                    ? "border-orange-500 bg-[#1a1a1a]"
                    : "border-[#2a2a2a] hover:border-neutral-600"
                }`}
              >
                <span className={`font-mono text-xs ${density === option.value ? "text-orange-500" : "text-neutral-400"}`}>
                  {option.label}
                </span>
                <div className="mt-3 space-y-1">
                  {Array.from({ length: option.lines }).map((_, i) => (
                    <div key={i} className="h-1.5 bg-neutral-700 rounded" style={{ width: `${100 - i * 15}%` }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Fonte do Sistema</Label>
          <Select defaultValue="jetbrains" onValueChange={onChange}>
            <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-foreground font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
              <SelectItem value="jetbrains">JetBrains Mono</SelectItem>
              <SelectItem value="ibm-plex">IBM Plex Mono</SelectItem>
              <SelectItem value="fira">Fira Code</SelectItem>
              <SelectItem value="roboto">Roboto Mono</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sidebar Mode */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Sidebar</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setSidebarMode("expandida"); onChange() }}
              className={`p-4 rounded border-2 transition-all ${
                sidebarMode === "expandida"
                  ? "border-orange-500 bg-[#1a1a1a]"
                  : "border-[#2a2a2a] hover:border-neutral-600"
              }`}
            >
              <span className={`font-mono text-xs ${sidebarMode === "expandida" ? "text-orange-500" : "text-neutral-400"}`}>
                EXPANDIDA
              </span>
              <div className="mt-3 flex gap-1">
                <div className="w-12 h-16 bg-neutral-700 rounded" />
                <div className="flex-1 h-16 bg-neutral-800 rounded" />
              </div>
            </button>
            <button
              onClick={() => { setSidebarMode("mini"); onChange() }}
              className={`p-4 rounded border-2 transition-all ${
                sidebarMode === "mini"
                  ? "border-orange-500 bg-[#1a1a1a]"
                  : "border-[#2a2a2a] hover:border-neutral-600"
              }`}
            >
              <span className={`font-mono text-xs ${sidebarMode === "mini" ? "text-orange-500" : "text-neutral-400"}`}>
                MINI ICONES
              </span>
              <div className="mt-3 flex gap-1">
                <div className="w-4 h-16 bg-neutral-700 rounded" />
                <div className="flex-1 h-16 bg-neutral-800 rounded" />
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm font-medium">Animacoes</p>
              <p className="text-neutral-500 text-xs">Ativar micro-animacoes e transicoes</p>
            </div>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
            <div>
              <p className="text-foreground text-sm font-medium">Timestamps Relativos</p>
              <p className="text-neutral-500 text-xs">Exibir horarios relativos (ex: ha 2 horas)</p>
            </div>
            <Switch defaultChecked onCheckedChange={onChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
