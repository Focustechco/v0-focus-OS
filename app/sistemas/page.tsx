"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Settings,
  Database,
  Cloud,
  Shield,
  Bell,
  Users,
  Key,
  Globe,
  Palette,
  Activity,
  HardDrive,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

const systemStatus = [
  { name: "API Principal", status: "online", uptime: "99.9%", latency: "45ms" },
  { name: "Banco de Dados", status: "online", uptime: "99.8%", latency: "12ms" },
  { name: "Cache Redis", status: "online", uptime: "100%", latency: "2ms" },
  { name: "Storage S3", status: "online", uptime: "99.9%", latency: "78ms" },
  { name: "Email Service", status: "degraded", uptime: "98.5%", latency: "230ms" },
]

const integrations = [
  { name: "GitHub", status: "connected", icon: "git" },
  { name: "Slack", status: "connected", icon: "message" },
  { name: "Google Workspace", status: "connected", icon: "mail" },
  { name: "AWS", status: "connected", icon: "cloud" },
  { name: "Stripe", status: "pending", icon: "credit" },
]

export default function SistemasPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <PageWrapper title="SISTEMAS" breadcrumb="SISTEMAS">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-display font-bold text-white">Sistemas</h1>
              <p className="text-sm text-neutral-500">Configuracoes e monitoramento do sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Status */}
            <Card className="lg:col-span-2 bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="border-b border-[#2A2A2A]">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-500" />
                  STATUS DO SISTEMA
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {systemStatus.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${service.status === "online" ? "bg-green-500" : service.status === "degraded" ? "bg-yellow-500" : "bg-red-500"} animate-pulse`} />
                        <span className="text-sm text-white">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-neutral-500">
                          Uptime: <span className="text-white font-mono">{service.uptime}</span>
                        </div>
                        <div className="text-neutral-500">
                          Latency: <span className={`font-mono ${parseInt(service.latency) > 100 ? "text-yellow-500" : "text-green-500"}`}>{service.latency}</span>
                        </div>
                        <Badge className={`text-[9px] ${service.status === "online" ? "bg-green-500/20 text-green-500" : service.status === "degraded" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"}`}>
                          {service.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* System Resources */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-center">
                    <Cpu className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white font-mono">23%</div>
                    <div className="text-[10px] text-neutral-500">CPU Usage</div>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-center">
                    <HardDrive className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white font-mono">4.2GB</div>
                    <div className="text-[10px] text-neutral-500">Memory</div>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-center">
                    <Database className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white font-mono">67%</div>
                    <div className="text-[10px] text-neutral-500">Storage</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="border-b border-[#2A2A2A]">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                  <Settings className="w-4 h-4 text-orange-500" />
                  CONFIGURACOES RAPIDAS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-neutral-400" />
                    <Label className="text-sm text-white">Notificacoes</Label>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-neutral-400" />
                    <Label className="text-sm text-white">Modo Escuro</Label>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-neutral-400" />
                    <Label className="text-sm text-white">Backup Automatico</Label>
                  </div>
                  <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-neutral-400" />
                    <Label className="text-sm text-white">Autenticacao 2FA</Label>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrations & Security */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Integrations */}
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="border-b border-[#2A2A2A]">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-500" />
                  INTEGRACOES
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {integrations.map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#1A1A1A] flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-neutral-400" />
                      </div>
                      <span className="text-sm text-white">{integration.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.status === "connected" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <Badge className="bg-green-500/20 text-green-500 text-[9px]">CONECTADO</Badge>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <Badge className="bg-yellow-500/20 text-yellow-500 text-[9px]">PENDENTE</Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                  Adicionar Integracao
                </Button>
              </CardContent>
            </Card>

            {/* Security & Access */}
            <Card className="bg-[#141414] border-[#2A2A2A]">
              <CardHeader className="border-b border-[#2A2A2A]">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-orange-500" />
                  SEGURANCA & ACESSO
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white">Usuarios Ativos</span>
                    <Badge className="bg-orange-500/20 text-orange-500">19</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white font-mono">4</div>
                      <div className="text-[9px] text-neutral-500">Admins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white font-mono">5</div>
                      <div className="text-[9px] text-neutral-500">Tech Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white font-mono">8</div>
                      <div className="text-[9px] text-neutral-500">Devs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white font-mono">2</div>
                      <div className="text-[9px] text-neutral-500">Comercial</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Ultimo Backup</span>
                    <span className="text-xs text-green-500 font-mono">Hoje, 03:00 UTC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Ultimo Acesso</span>
                    <span className="text-xs text-neutral-400 font-mono">Gabriel - 5 min atras</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white">
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar Usuarios
                  </Button>
                  <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white">
                    <Key className="w-4 h-4 mr-2" />
                    API Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Info */}
          <Card className="bg-[#141414] border-[#2A2A2A] mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-4">
                  <span>FOCUS PROJECT OS v3.0</span>
                  <span className="text-neutral-600">|</span>
                  <span>Build 2025.06.25</span>
                  <span className="text-neutral-600">|</span>
                  <span>Next.js 16</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-500 font-mono">SISTEMA OPERACIONAL</span>
                </div>
              </div>
            </CardContent>
          </Card>
    </PageWrapper>
  )
}
