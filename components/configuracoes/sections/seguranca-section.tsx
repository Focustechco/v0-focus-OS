"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Shield, Smartphone, Key, LogOut, AlertTriangle, Check, X } from "lucide-react"

interface SegurancaSectionProps {
  onChange: () => void
}

const sessions = [
  { device: "MacBook Pro - Chrome", ip: "189.123.45.67", location: "Sao Paulo, BR", started: "Agora", current: true },
  { device: "iPhone 15 - Safari", ip: "189.123.45.68", location: "Sao Paulo, BR", started: "2h atras", current: false },
  { device: "Windows PC - Firefox", ip: "200.45.67.89", location: "Rio de Janeiro, BR", started: "1 dia atras", current: false },
]

const accessLogs = [
  { timestamp: "29/03/2026 14:30", ip: "189.123.45.67", device: "Chrome / MacOS", status: "success" },
  { timestamp: "29/03/2026 10:15", ip: "189.123.45.67", device: "Chrome / MacOS", status: "success" },
  { timestamp: "28/03/2026 22:45", ip: "200.45.67.89", device: "Firefox / Windows", status: "success" },
  { timestamp: "28/03/2026 18:30", ip: "189.123.45.68", device: "Safari / iOS", status: "success" },
  { timestamp: "27/03/2026 09:00", ip: "45.67.89.12", device: "Unknown", status: "failed" },
]

export function SegurancaSection({ onChange }: SegurancaSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Seguranca
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Configuracoes de seguranca e autenticacao
        </p>
      </div>

      {/* 2FA */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-orange-500/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-white font-medium">Autenticacao em 2 Fatores</p>
                <p className="text-neutral-500 text-sm">Proteja sua conta com uma camada extra de seguranca</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/20 text-green-500 text-xs font-mono">ATIVO</Badge>
              <Button variant="outline" className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono text-xs">
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Sessoes Ativas</Label>
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <div
                key={i}
                className={`p-4 rounded border ${
                  session.current ? "border-green-500/30 bg-green-500/5" : "border-[#2a2a2a] bg-[#1a1a1a]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-[#0d0d0d] flex items-center justify-center">
                      <Shield className={`w-5 h-5 ${session.current ? "text-green-500" : "text-neutral-500"}`} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        {session.device}
                        {session.current && <Badge className="bg-green-500/20 text-green-500 text-[9px]">ATUAL</Badge>}
                      </p>
                      <p className="text-neutral-500 text-xs font-mono">
                        {session.ip} • {session.location} • {session.started}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 font-mono text-xs">
                      <LogOut className="w-4 h-4 mr-2" />
                      Encerrar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-6 space-y-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase block">Politica de Senha</Label>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Caracteres minimos</span>
                <span className="text-orange-500 font-mono text-sm">12</span>
              </div>
              <Slider defaultValue={[12]} min={8} max={32} step={1} onValueChange={onChange} className="w-full" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked onCheckedChange={onChange} className="border-[#2a2a2a] data-[state=checked]:bg-orange-500" />
                <span className="text-neutral-400 text-sm">Exigir letras maiusculas</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked onCheckedChange={onChange} className="border-[#2a2a2a] data-[state=checked]:bg-orange-500" />
                <span className="text-neutral-400 text-sm">Exigir numeros</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox defaultChecked onCheckedChange={onChange} className="border-[#2a2a2a] data-[state=checked]:bg-orange-500" />
                <span className="text-neutral-400 text-sm">Exigir simbolos especiais</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Timeout */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-neutral-400 font-mono text-xs uppercase">Timeout de Sessao</Label>
              <p className="text-neutral-600 text-xs mt-1">Encerrar sessao automaticamente apos inatividade</p>
            </div>
            <Select defaultValue="1h" onValueChange={onChange}>
              <SelectTrigger className="w-40 bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="15min">15 minutos</SelectItem>
                <SelectItem value="30min">30 minutos</SelectItem>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="4h">4 horas</SelectItem>
                <SelectItem value="never">Nunca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Access Log */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Log de Acesso</Label>
          <ScrollArea className="h-[200px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left p-2 text-neutral-500 font-mono text-[10px]">DATA/HORA</th>
                  <th className="text-left p-2 text-neutral-500 font-mono text-[10px]">IP</th>
                  <th className="text-left p-2 text-neutral-500 font-mono text-[10px]">DISPOSITIVO</th>
                  <th className="text-left p-2 text-neutral-500 font-mono text-[10px]">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {accessLogs.map((log, i) => (
                  <tr key={i} className="border-b border-[#2a2a2a]">
                    <td className="p-2 text-neutral-400 font-mono text-xs">{log.timestamp}</td>
                    <td className="p-2 text-neutral-400 font-mono text-xs">{log.ip}</td>
                    <td className="p-2 text-white text-xs">{log.device}</td>
                    <td className="p-2">
                      {log.status === "success" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-[#141414] border-red-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <Label className="text-red-500 font-mono text-xs uppercase">Zona de Perigo</Label>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10 font-mono text-xs">
              <Key className="w-4 h-4 mr-2" />
              Revogar Todos os Tokens
            </Button>
            <Button variant="outline" className="bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10 font-mono text-xs">
              <LogOut className="w-4 h-4 mr-2" />
              Encerrar Todas as Sessoes
            </Button>
            <Button variant="outline" className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono text-xs">
              Exportar Todos os Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
