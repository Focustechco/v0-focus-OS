"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  HardDrive,
  Calendar,
  Check,
  Settings,
  RefreshCw,
  FolderKanban,
  TrendingUp,
  Link2,
  CalendarClock,
  Box,
  Loader2,
} from "lucide-react"

// Mock data for initial state
const initialIntegrations = [
  {
    id: "clickup",
    name: "ClickUp",
    description: "Sincronizar tarefas e deals",
    color: "#7B68EE",
    connected: false,
    modules: [
      { id: "projetos", name: "Projetos", icon: FolderKanban },
      { id: "comercial", name: "Comercial", icon: TrendingUp },
    ],
    lastSync: null,
    syncFrequency: "15",
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Sincronizar eventos",
    color: "#4285F4",
    connected: false,
    modules: [
      { id: "agenda", name: "Agenda", icon: CalendarClock },
    ],
    lastSync: null,
    syncFrequency: "15",
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Arquivos e pastas",
    color: "#34A853",
    connected: false,
    modules: [
      { id: "documentos", name: "Documentos", icon: Box },
    ],
    lastSync: null,
    syncFrequency: "15",
  },
]

export function IntegracoesSection() {
  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [configModalOpen, setConfigModalOpen] = useState<string | null>(null)
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  const activeIntegration = integrations.find(i => i.id === configModalOpen)
  const disconnectIntegration = integrations.find(i => i.id === disconnectConfirmOpen)

  const handleConnect = (id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectUri = `${origin}/api/integrations/callback/${id}`
    
    if (id === "clickup") {
      const clientId = process.env.NEXT_PUBLIC_CLICKUP_CLIENT_ID || "YOUR_CLICKUP_CLIENT_ID"
      window.location.href = `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${redirectUri}`
    } else if (id === "google_calendar" || id === "google_drive") {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"
      const scope = id === "google_calendar" 
        ? "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly"
        : "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file"
      
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
      authUrl.searchParams.append("client_id", clientId)
      authUrl.searchParams.append("redirect_uri", redirectUri)
      authUrl.searchParams.append("response_type", "code")
      authUrl.searchParams.append("scope", scope)
      authUrl.searchParams.append("access_type", "offline")
      authUrl.searchParams.append("prompt", "consent")
      
      window.location.href = authUrl.toString()
    }
  }

  const handleDisconnect = () => {
    if (!disconnectIntegration) return
    setIntegrations(prev => prev.map(i => i.id === disconnectIntegration.id ? { ...i, connected: false, lastSync: null } : i))
    toast.success(`${disconnectIntegration.name} desconectado.`)
    setDisconnectConfirmOpen(null)
  }

  const handleSync = async (id: string) => {
    setSyncing(id)
    // Simulando API
    await new Promise(r => setTimeout(r, 1500))
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, lastSync: "agora" } : i))
    setSyncing(null)
    toast.success("Sincronização concluída — 3 registros")
  }

  const handleFrequencyChange = (id: string, value: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, syncFrequency: value } : i))
    // Call API to save config
  }

  const getIcon = (id: string) => {
    if (id === "clickup") return <Link2 className="w-6 h-6 text-[#7B68EE]" />
    if (id === "google_calendar") return <Calendar className="w-6 h-6 text-[#4285F4]" />
    if (id === "google_drive") return <HardDrive className="w-6 h-6 text-[#34A853]" />
    return <Link2 className="w-6 h-6" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Integrações
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Conecte serviços externos reais para sincronização de dados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className="bg-[#161616] border-[0.5px] border-[#222] rounded-[10px] overflow-hidden"
            style={{ borderLeft: `3px solid ${integration.color}` }}
          >
            <CardContent className="p-6">
              {/* HEADER */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-[#111] flex items-center justify-center border border-[#222]">
                    {getIcon(integration.id)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-[15px]">{integration.name}</h3>
                    <p className="text-[#888] text-[12px]">{integration.description}</p>
                  </div>
                </div>
                {integration.connected ? (
                  <Badge className="bg-[#0d2010] text-[#97C459] border border-[#639922] text-[10px] font-bold px-2 py-0.5 h-6 hover:bg-[#0d2010]">
                    <Check className="w-3 h-3 mr-1" />
                    CONECTADO
                  </Badge>
                ) : (
                  <Badge className="bg-[#1a1a1a] text-[#555] border border-[#333] text-[10px] font-bold px-2 py-0.5 h-6 hover:bg-[#1a1a1a]">
                    DESCONECTADO
                  </Badge>
                )}
              </div>

              {/* MODULE CHIPS */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {integration.modules.map(mod => (
                  <div key={mod.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a2e] text-[#AFA9EC] border border-[#534AB7] text-[10px] font-medium">
                    <mod.icon className="w-3 h-3" />
                    {mod.name}
                  </div>
                ))}
              </div>

              {/* ACTIONS */}
              {integration.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#555] font-medium">Última sync: <span className="text-[#ccc]">{integration.lastSync || "Nunca"}</span></span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#555] font-medium">Frequência:</span>
                      <Select value={integration.syncFrequency} onValueChange={(v) => handleFrequencyChange(integration.id, v)}>
                        <SelectTrigger className="w-[100px] h-8 bg-[#111] border-[#333] text-[#ccc] text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-[#333] text-[#ccc]">
                          <SelectItem value="5">5 min</SelectItem>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="0">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-[#222]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfigModalOpen(integration.id)}
                      className="flex-1 bg-[#1e1e1e] border-[#333] text-[#888] hover:text-white hover:bg-[#252525] text-[12px] h-9"
                    >
                      <Settings className="w-3.5 h-3.5 mr-2" />
                      Configurar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(integration.id)}
                      disabled={syncing === integration.id}
                      className="bg-[#1e1e1e] border-[#333] text-[#888] hover:text-white hover:bg-[#252525] h-9 px-3"
                      title="Sincronizar agora"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing === integration.id ? 'animate-spin text-[#e87c2a]' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDisconnectConfirmOpen(integration.id)}
                      className="bg-transparent border-[#993C1D] text-[#F09595] hover:bg-[#2e1010] hover:text-[#F09595] h-9 text-[12px]"
                    >
                      Desconectar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#222]">
                  <Button
                    onClick={() => handleConnect(integration.id)}
                    className="w-full bg-[#e87c2a] hover:bg-[#ff8e3e] text-white text-[13px] font-bold h-10"
                  >
                    Conectar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL DE CONFIGURAÇÃO */}
      <Dialog open={!!configModalOpen} onOpenChange={() => setConfigModalOpen(null)}>
        <DialogContent className="bg-[#161616] border-[#222] text-foreground sm:max-w-[500px] p-0 overflow-hidden">
          {activeIntegration && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#222]">
                <div className="flex items-center gap-3">
                  {getIcon(activeIntegration.id)}
                  <DialogTitle className="text-lg font-bold text-white">Configurar {activeIntegration.name}</DialogTitle>
                  <Badge className="bg-[#0d2010] text-[#97C459] border border-[#639922] text-[9px] ml-auto">CONECTADO</Badge>
                </div>
              </DialogHeader>
              
              <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-6">
                {/* CONTA VINCULADA (Mock) */}
                <div className="flex items-center justify-between p-3 bg-[#111] border border-[#333] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-[10px] text-white font-bold">
                      US
                    </div>
                    <div>
                      <p className="text-[13px] text-white font-medium">usuario@exemplo.com</p>
                      <p className="text-[11px] text-[#555]">Conta conectada</p>
                    </div>
                  </div>
                  <Button onClick={() => handleConnect(activeIntegration.id)} size="sm" className="bg-[#e87c2a] hover:bg-[#ff8e3e] text-white text-[11px] font-bold h-8 px-3">
                    Trocar conta
                  </Button>
                </div>

                {/* OPÇÕES CLICKUP */}
                {activeIntegration.id === "clickup" && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label className="text-[11px] text-[#555] uppercase tracking-wider">Workspace ClickUp</Label>
                      <Select defaultValue="ws_1">
                        <SelectTrigger className="w-full bg-[#111] border-[#333] text-[#ccc]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-[#333] text-[#ccc]">
                          <SelectItem value="ws_1">Focus Workspace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-[11px] text-[#555] uppercase tracking-wider">Lista para Módulo Projetos</Label>
                      <Select defaultValue="list_p">
                        <SelectTrigger className="w-full bg-[#111] border-[#333] text-[#ccc]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-[#333] text-[#ccc]">
                          <SelectItem value="list_p">Dev / Tasks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[11px] text-[#555] uppercase tracking-wider">Lista para Módulo Comercial</Label>
                      <Select defaultValue="list_c">
                        <SelectTrigger className="w-full bg-[#111] border-[#333] text-[#ccc]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-[#333] text-[#ccc]">
                          <SelectItem value="list_c">CRM / Deals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-[#222]">
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] text-[#ccc]">Sincronizar tasks do ClickUp → Focus OS</Label>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#e87c2a]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] text-[#ccc]">Sincronizar tasks do Focus OS → ClickUp</Label>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#e87c2a]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] text-[#ccc]">Sincronizar status automaticamente</Label>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#e87c2a]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* OPÇÕES GOOGLE CALENDAR */}
                {activeIntegration.id === "google_calendar" && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label className="text-[11px] text-[#555] uppercase tracking-wider">Calendários a sincronizar</Label>
                      <div className="space-y-2 p-3 bg-[#111] border border-[#333] rounded-lg">
                        <div className="flex items-center justify-between">
                          <Label className="text-[13px] text-[#ccc]">usuario@exemplo.com (Principal)</Label>
                          <Switch defaultChecked className="data-[state=checked]:bg-[#e87c2a]" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-[13px] text-[#ccc]">Feriados</Label>
                          <Switch className="data-[state=checked]:bg-[#e87c2a]" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-[#222]">
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] text-[#ccc]">Importar eventos do Google → Agenda Focus OS</Label>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#e87c2a]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] text-[#ccc]">Exportar eventos Focus OS → Google Calendar</Label>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#e87c2a]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] text-[#ccc]">Sincronizar sprints como eventos</Label>
                        <Switch className="data-[state=checked]:bg-[#e87c2a]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* OPÇÕES GOOGLE DRIVE */}
                {activeIntegration.id === "google_drive" && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label className="text-[11px] text-[#555] uppercase tracking-wider">Pasta Raiz do Drive</Label>
                      <div className="flex gap-2">
                        <Input className="bg-[#111] border-[#333] text-[#ccc] flex-1" placeholder="Colar Link ou ID da pasta" />
                        <Button className="bg-[#1e1e1e] border border-[#333] text-[#888] hover:text-white">Navegar</Button>
                      </div>
                      <p className="text-[11px] text-[#e87c2a]">Pasta selecionada: /FocusOS_Documentos</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-[#222]">
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] text-[#ccc]">Exibir subpastas automaticamente</Label>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#e87c2a]" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] text-[#ccc]">Salvar documentos criados no Focus OS no Drive</Label>
                        <Switch defaultChecked className="data-[state=checked]:bg-[#e87c2a]" />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <DialogFooter className="px-6 py-4 border-t border-[#222] flex items-center justify-between flex-row">
                <Button 
                  variant="outline" 
                  onClick={() => setDisconnectConfirmOpen(activeIntegration.id)}
                  className="bg-transparent border-[#993C1D] text-[#F09595] hover:bg-[#2e1010] hover:text-[#F09595] h-9 text-[12px]"
                >
                  Desconectar
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setConfigModalOpen(null)} className="text-[#888] hover:text-white">Cancelar</Button>
                  <Button onClick={() => { toast.success("Configurações salvas"); setConfigModalOpen(null); }} className="bg-[#e87c2a] hover:bg-[#ff8e3e] text-white">
                    Salvar configurações
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO DE DESCONEXÃO */}
      <Dialog open={!!disconnectConfirmOpen} onOpenChange={() => setDisconnectConfirmOpen(null)}>
        <DialogContent className="bg-[#161616] border-[#222] text-foreground sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Desconectar {disconnectIntegration?.name}?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#ccc] text-sm leading-relaxed">
              Tem certeza que deseja remover esta integração?
              Os dados já sincronizados no Focus OS <strong className="text-white">não serão removidos</strong>, mas a sincronização automática será interrompida.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDisconnectConfirmOpen(null)} className="text-[#888] hover:text-white">Cancelar</Button>
            <Button onClick={handleDisconnect} className="bg-transparent border border-[#993C1D] text-[#F09595] hover:bg-[#2e1010] hover:text-[#F09595]">
              Sim, desconectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
