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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
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
  ExternalLink,
  Clock,
  Database,
  GitPullRequest,
  CalendarDays,
  Loader2,
} from "lucide-react"
import { useFocusOS, type FocusOSState } from "@/contexts/focus-os-context"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface IntegracoesSectionProps {
  onChange: () => void
}

type IntegrationKey = keyof FocusOSState["integrations"]

interface IntegrationConfig {
  id: string
  integrationKey?: IntegrationKey
  name: string
  description: string
  icon: React.ElementType
  color: string
  comingSoon?: boolean
}

const integrations: IntegrationConfig[] = [
  {
    id: "sheets",
    integrationKey: "googleSheets",
    name: "Google Sheets",
    description: "Sincronize planilhas automaticamente",
    icon: FileSpreadsheet,
    color: "text-green-500",
  },
  {
    id: "drive",
    integrationKey: "googleDrive",
    name: "Google Drive",
    description: "Acesse e armazene documentos",
    icon: HardDrive,
    color: "text-yellow-500",
  },
  {
    id: "calendar",
    integrationKey: "googleCalendar",
    name: "Google Calendar",
    description: "Sincronize eventos e sprints",
    icon: Calendar,
    color: "text-blue-500",
  },
  {
    id: "github",
    integrationKey: "github",
    name: "GitHub",
    description: "Vincule PRs e commits as tasks",
    icon: Github,
    color: "text-white",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Receba notificacoes no Slack",
    icon: MessageCircle,
    color: "text-purple-500",
    comingSoon: true,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Alertas via WhatsApp",
    icon: MessageSquare,
    color: "text-green-400",
    comingSoon: true,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automatize com 5000+ apps",
    icon: Zap,
    color: "text-orange-400",
    comingSoon: true,
  },
  {
    id: "webhooks",
    name: "Webhooks Customizados",
    description: "Configure endpoints personalizados",
    icon: Webhook,
    color: "text-cyan-500",
    comingSoon: true,
  },
]

export function IntegracoesSection({ onChange }: IntegracoesSectionProps) {
  const focusOS = useFocusOS()
  const [configSheet, setConfigSheet] = useState<IntegrationKey | null>(null)

  const getIntegrationState = (integrationKey?: IntegrationKey) => {
    if (!integrationKey) return null
    return focusOS.integrations[integrationKey]
  }

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Nunca"
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
  }

  const formatQuota = (used: number, total: number) => {
    const usedGB = (used / (1024 * 1024 * 1024)).toFixed(1)
    const totalGB = (total / (1024 * 1024 * 1024)).toFixed(0)
    const percentage = ((used / total) * 100).toFixed(0)
    return `${usedGB}GB / ${totalGB}GB (${percentage}%)`
  }

  const handleConnect = async (integrationKey: IntegrationKey) => {
    await focusOS.connectIntegration(integrationKey)
    onChange()
  }

  const handleDisconnect = (integrationKey: IntegrationKey) => {
    focusOS.disconnectIntegration(integrationKey)
    onChange()
  }

  const handleSync = async (integrationKey: IntegrationKey) => {
    await focusOS.syncIntegration(integrationKey)
    onChange()
  }

  const handleFrequencyChange = (integrationKey: "googleSheets" | "googleDrive", value: string) => {
    const frequency = value === "realtime" ? 1 : value === "manual" ? 0 : parseInt(value.replace("min", "").replace("h", "")) * (value.includes("h") ? 60 : 1)
    focusOS.updateIntegrationFrequency(integrationKey, frequency)
    onChange()
  }

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
        {integrations.map((integration) => {
          const state = getIntegrationState(integration.integrationKey)
          const isConnected = state?.connected ?? false
          const isLoading = state?.loading ?? false

          return (
            <Card
              key={integration.id}
              className={`bg-[#141414] border-[#2a2a2a] ${
                isConnected ? "border-l-2 border-l-green-500" : ""
              } ${integration.comingSoon ? "opacity-60" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-[#1a1a1a] flex items-center justify-center">
                      <integration.icon className={`w-6 h-6 ${integration.color}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{integration.name}</h3>
                      <p className="text-neutral-500 text-sm">{integration.description}</p>
                    </div>
                  </div>
                  {integration.comingSoon ? (
                    <Badge className="text-[10px] font-mono bg-neutral-800 text-neutral-500">
                      EM BREVE
                    </Badge>
                  ) : isLoading ? (
                    <Badge className="text-[10px] font-mono bg-orange-500/20 text-orange-500">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      CONECTANDO
                    </Badge>
                  ) : (
                    <Badge
                      className={`text-[10px] font-mono ${
                        isConnected
                          ? "bg-green-500/20 text-green-500"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          CONECTADO
                        </>
                      ) : (
                        "DESCONECTADO"
                      )}
                    </Badge>
                  )}
                </div>

                {integration.comingSoon ? (
                  <Button
                    disabled
                    className="w-full bg-neutral-800 text-neutral-500 font-mono text-xs cursor-not-allowed"
                  >
                    Em Breve
                  </Button>
                ) : isConnected && integration.integrationKey ? (
                  <div className="space-y-3">
                    {/* Last Sync */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Ultima sync:
                      </span>
                      <span className="text-neutral-300">{formatLastSync(state?.lastSync ?? null)}</span>
                    </div>

                    {/* Integration-specific info */}
                    {integration.integrationKey === "googleSheets" && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500 font-mono flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            Planilhas:
                          </span>
                          <span className="text-green-500">{focusOS.integrations.googleSheets.syncedSheets}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500 font-mono">Frequencia:</span>
                          <Select 
                            defaultValue={focusOS.integrations.googleSheets.frequency === 1 ? "realtime" : focusOS.integrations.googleSheets.frequency === 0 ? "manual" : `${focusOS.integrations.googleSheets.frequency}min`}
                            onValueChange={(v) => handleFrequencyChange("googleSheets", v)}
                          >
                            <SelectTrigger className="w-32 h-8 bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono text-xs">
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
                      </>
                    )}

                    {integration.integrationKey === "googleDrive" && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500 font-mono flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            Arquivos:
                          </span>
                          <span className="text-yellow-500">{focusOS.integrations.googleDrive.filesCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500 font-mono">Quota:</span>
                          <span className="text-neutral-300 text-xs">
                            {formatQuota(focusOS.integrations.googleDrive.quota.used, focusOS.integrations.googleDrive.quota.total)}
                          </span>
                        </div>
                      </>
                    )}

                    {integration.integrationKey === "googleCalendar" && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500 font-mono flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            Calendarios:
                          </span>
                          <span className="text-blue-500">{focusOS.integrations.googleCalendar.syncedCalendars}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500 font-mono">Proximos eventos:</span>
                          <span className="text-blue-500">{focusOS.integrations.googleCalendar.upcomingEvents.length}</span>
                        </div>
                      </>
                    )}

                    {integration.integrationKey === "github" && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500 font-mono flex items-center gap-1">
                            <GitPullRequest className="w-3 h-3" />
                            PRs abertos:
                          </span>
                          <span className="text-orange-500">{focusOS.integrations.github.openPRs}</span>
                        </div>
                        {focusOS.integrations.github.lastCommit && (
                          <div className="p-2 bg-[#0d0d0d] rounded font-mono text-xs text-neutral-400 truncate">
                            {focusOS.integrations.github.lastCommit}
                          </div>
                        )}
                      </>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono text-xs"
                        onClick={() => setConfigSheet(integration.integrationKey!)}
                      >
                        <Settings className="w-3 h-3 mr-2" />
                        Configurar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono text-xs"
                        onClick={() => handleSync(integration.integrationKey!)}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10 font-mono text-xs"
                        onClick={() => handleDisconnect(integration.integrationKey!)}
                      >
                        Desconectar
                      </Button>
                    </div>
                  </div>
                ) : integration.integrationKey ? (
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs"
                    onClick={() => handleConnect(integration.integrationKey!)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      "Conectar"
                    )}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Configuration Sheets */}
      <Sheet open={configSheet === "googleSheets"} onOpenChange={(open) => !open && setConfigSheet(null)}>
        <SheetContent className="bg-[#0d0d0d] border-[#2a2a2a] w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-500" />
              Google Sheets
            </SheetTitle>
            <SheetDescription className="text-neutral-500">
              Configure a sincronizacao de planilhas
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-mono">Frequencia de Sync</label>
              <Select 
                defaultValue={`${focusOS.integrations.googleSheets.frequency}min`}
                onValueChange={(v) => handleFrequencyChange("googleSheets", v)}
              >
                <SelectTrigger className="w-full bg-[#141414] border-[#2a2a2a] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-[#2a2a2a]">
                  <SelectItem value="realtime">Tempo real</SelectItem>
                  <SelectItem value="5min">5 minutos</SelectItem>
                  <SelectItem value="15min">15 minutos</SelectItem>
                  <SelectItem value="30min">30 minutos</SelectItem>
                  <SelectItem value="1h">1 hora</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-mono">Planilhas Sincronizadas</label>
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4">
                {focusOS.backlog.importedSheets.length > 0 ? (
                  <ul className="space-y-2">
                    {focusOS.backlog.importedSheets.map((sheet) => (
                      <li key={sheet.id} className="flex items-center justify-between text-sm">
                        <span className="text-white truncate flex-1">{sheet.sheetName}</span>
                        <span className="text-neutral-500 text-xs">{sheet.rowCount} linhas</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500 text-sm">Nenhuma planilha sincronizada</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Google Sheets
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={configSheet === "googleDrive"} onOpenChange={(open) => !open && setConfigSheet(null)}>
        <SheetContent className="bg-[#0d0d0d] border-[#2a2a2a] w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-yellow-500" />
              Google Drive
            </SheetTitle>
            <SheetDescription className="text-neutral-500">
              Gerencie arquivos e documentos
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-mono">Uso de Armazenamento</label>
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-500">Usado</span>
                  <span className="text-white">
                    {formatQuota(focusOS.integrations.googleDrive.quota.used, focusOS.integrations.googleDrive.quota.total)}
                  </span>
                </div>
                <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${(focusOS.integrations.googleDrive.quota.used / focusOS.integrations.googleDrive.quota.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-mono">Arquivos Recentes</label>
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 max-h-60 overflow-y-auto">
                {focusOS.backlog.driveFiles.length > 0 ? (
                  <ul className="space-y-2">
                    {focusOS.backlog.driveFiles.slice(0, 10).map((file) => (
                      <li key={file.id} className="flex items-center gap-2 text-sm">
                        <HardDrive className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-white truncate flex-1">{file.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500 text-sm">Nenhum arquivo encontrado</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Google Drive
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={configSheet === "googleCalendar"} onOpenChange={(open) => !open && setConfigSheet(null)}>
        <SheetContent className="bg-[#0d0d0d] border-[#2a2a2a] w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Google Calendar
            </SheetTitle>
            <SheetDescription className="text-neutral-500">
              Veja seus proximos eventos
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-mono">Proximos Eventos</label>
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 max-h-80 overflow-y-auto">
                {focusOS.integrations.googleCalendar.upcomingEvents.length > 0 ? (
                  <ul className="space-y-3">
                    {focusOS.integrations.googleCalendar.upcomingEvents.map((event) => (
                      <li key={event.id} className="border-l-2 border-blue-500 pl-3">
                        <p className="text-white text-sm font-medium">{event.title}</p>
                        <p className="text-neutral-500 text-xs">
                          {new Date(event.start).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {event.description && (
                          <p className="text-neutral-600 text-xs mt-1 truncate">{event.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-500 text-sm">Nenhum evento encontrado</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Google Calendar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={configSheet === "github"} onOpenChange={(open) => !open && setConfigSheet(null)}>
        <SheetContent className="bg-[#0d0d0d] border-[#2a2a2a] w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub
            </SheetTitle>
            <SheetDescription className="text-neutral-500">
              Vincule repositorios e PRs
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {focusOS.integrations.github.repoName && (
              <div className="space-y-2">
                <label className="text-sm text-neutral-400 font-mono">Repositorio</label>
                <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-white" />
                    <span className="text-white">{focusOS.integrations.github.username}/{focusOS.integrations.github.repoName}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-mono">Estatisticas</label>
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500 text-sm">PRs Abertos</span>
                  <span className="text-orange-500 font-mono">{focusOS.integrations.github.openPRs}</span>
                </div>
                {focusOS.integrations.github.lastCommit && (
                  <div>
                    <span className="text-neutral-500 text-sm">Ultimo Commit</span>
                    <p className="text-white text-xs mt-1 font-mono bg-[#0d0d0d] p-2 rounded truncate">
                      {focusOS.integrations.github.lastCommit}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-neutral-400 font-mono">Webhook URL</label>
              <div className="p-2 bg-[#141414] border border-[#2a2a2a] rounded font-mono text-xs text-neutral-400 break-all">
                {typeof window !== "undefined" ? `${window.location.origin}/api/github/webhook` : "/api/github/webhook"}
              </div>
              <p className="text-neutral-600 text-xs">Use esta URL para configurar webhooks no seu repositorio.</p>
            </div>
            <Button
              variant="outline"
              className="w-full bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir GitHub
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Loading skeleton for the integrations section
export function IntegracoesSectionSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-32 bg-[#2a2a2a]" />
        <Skeleton className="h-3 w-48 mt-2 bg-[#2a2a2a]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#141414] border-[#2a2a2a]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded bg-[#2a2a2a]" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 bg-[#2a2a2a]" />
                  <Skeleton className="h-3 w-40 mt-2 bg-[#2a2a2a]" />
                </div>
              </div>
              <Skeleton className="h-9 w-full bg-[#2a2a2a]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
