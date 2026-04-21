"use client"

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
  FileSpreadsheet,
  HardDrive,
  Calendar,
  Github,
  MessageCircle,
  MessageSquare,
  Zap,
  Webhook,
  Check,
  Settings,
  RefreshCw,
} from "lucide-react"

interface IntegracoesSectionProps {
  onChange: () => void
}

const integrations = [
  {
    id: "sheets",
    name: "Google Sheets",
    description: "Sincronize planilhas automaticamente",
    icon: FileSpreadsheet,
    color: "text-green-500",
    connected: true,
    lastSync: "5 min atras",
    syncFrequency: "15min",
  },
  {
    id: "drive",
    name: "Google Drive",
    description: "Acesse e armazene documentos",
    icon: HardDrive,
    color: "text-yellow-500",
    connected: true,
    lastSync: "1h atras",
    syncFrequency: "1h",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Sincronize eventos e sprints",
    icon: Calendar,
    color: "text-blue-500",
    connected: false,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Vincule PRs e commits as tasks",
    icon: Github,
    color: "text-foreground",
    connected: true,
    lastSync: "2 min atras",
    syncFrequency: "realtime",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Receba notificacoes no Slack",
    icon: MessageCircle,
    color: "text-purple-500",
    connected: false,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Alertas via WhatsApp",
    icon: MessageSquare,
    color: "text-green-400",
    connected: false,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automatize com 5000+ apps",
    icon: Zap,
    color: "text-orange-400",
    connected: false,
  },
  {
    id: "webhooks",
    name: "Webhooks Customizados",
    description: "Configure endpoints personalizados",
    icon: Webhook,
    color: "text-cyan-500",
    connected: true,
    webhookUrl: "https://api.focus.com.br/webhooks/...",
  },
]

export function IntegracoesSection({ onChange }: IntegracoesSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Integracoes
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Conecte servicos externos ao Focus OS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className={`bg-card border-[#2a2a2a] ${
              integration.connected ? "border-l-2 border-l-green-500" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-[#1a1a1a] flex items-center justify-center">
                    <integration.icon className={`w-6 h-6 ${integration.color}`} />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{integration.name}</h3>
                    <p className="text-neutral-500 text-sm">{integration.description}</p>
                  </div>
                </div>
                <Badge
                  className={`text-[10px] font-mono ${
                    integration.connected
                      ? "bg-green-500/20 text-green-500"
                      : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {integration.connected ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      CONECTADO
                    </>
                  ) : (
                    "DESCONECTADO"
                  )}
                </Badge>
              </div>

              {integration.connected ? (
                <div className="space-y-3">
                  {integration.lastSync && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 font-mono">Ultima sync:</span>
                      <span className="text-foreground">{integration.lastSync}</span>
                    </div>
                  )}
                  {integration.syncFrequency && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 font-mono">Frequencia:</span>
                      <Select defaultValue={integration.syncFrequency} onValueChange={onChange}>
                        <SelectTrigger className="w-32 h-8 bg-[#1a1a1a] border-[#2a2a2a] text-foreground font-mono text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                          <SelectItem value="realtime">Tempo real</SelectItem>
                          <SelectItem value="5min">5 minutos</SelectItem>
                          <SelectItem value="15min">15 minutos</SelectItem>
                          <SelectItem value="1h">1 hora</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {integration.webhookUrl && (
                    <div className="p-2 bg-secondary rounded font-mono text-xs text-neutral-400 truncate">
                      {integration.webhookUrl}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-foreground font-mono text-xs"
                    >
                      <Settings className="w-3 h-3 mr-2" />
                      Configurar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-foreground font-mono text-xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10 font-mono text-xs"
                    >
                      Desconectar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-foreground font-mono text-xs"
                  onClick={onChange}
                >
                  Conectar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
