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
  { name: "Google", status: "connected", icon: "mail" },
  { name: "AWS", status: "connected", icon: "cloud" },
  { name: "Stripe", status: "pending", icon: "credit" },
]

export default function SistemasPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <PageWrapper title="SISTEMAS">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-base sm:text-xl font-display font-bold text-white">Sistemas</h1>
          <p className="text-xs sm:text-sm text-neutral-500">Configuracoes e monitoramento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* System Status */}
          <Card className="lg:col-span-2 bg-[#141414] border-[#2A2A2A]">
            <CardHeader className="border-b border-[#2A2A2A] px-3 sm:px-6 py-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                STATUS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
              <div className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-none overflow-y-auto">
                {systemStatus.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${service.status === "online" ? "bg-green-500" : service.status === "degraded" ? "bg-yellow-500" : "bg-red-500"} animate-pulse`} />
                      <span className="text-xs sm:text-sm text-white truncate">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs flex-shrink-0">
                      <div className="text-neutral-500 hidden sm:block">
                        <span className="text-white font-mono">{service.uptime}</span>
                      </div>
                      <div className={`font-mono ${parseInt(service.latency) > 100 ? "text-yellow-500" : "text-green-500"}`}>
                        {service.latency}
                      </div>
                      <Badge className={`text-[8px] sm:text-[9px] ${service.status === "online" ? "bg-green-500/20 text-green-500" : service.status === "degraded" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"}`}>
                        {service.status === "online" ? "ON" : service.status === "degraded" ? "WARN" : "OFF"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* System Resources */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
                <div className="p-2 sm:p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-center">
                  <Cpu className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500 mx-auto mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-white font-mono">23%</div>
                  <div className="text-[8px] sm:text-[10px] text-neutral-500">CPU</div>
                </div>
                <div className="p-2 sm:p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-center">
                  <HardDrive className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-white font-mono">4.2G</div>
                  <div className="text-[8px] sm:text-[10px] text-neutral-500">RAM</div>
                </div>
                <div className="p-2 sm:p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] text-center">
                  <Database className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-white font-mono">67%</div>
                  <div className="text-[8px] sm:text-[10px] text-neutral-500">Disco</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardHeader className="border-b border-[#2A2A2A] px-3 sm:px-6 py-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-500" />
                CONFIG
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 space-y-2 sm:space-y-4">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                  <Label className="text-xs sm:text-sm text-white">Notif.</Label>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} className="scale-75 sm:scale-100" />
              </div>

              <div className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-2">
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                  <Label className="text-xs sm:text-sm text-white">Dark</Label>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} className="scale-75 sm:scale-100" />
              </div>

              <div className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                  <Label className="text-xs sm:text-sm text-white">Backup</Label>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} className="scale-75 sm:scale-100" />
              </div>

              <div className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                  <Label className="text-xs sm:text-sm text-white">2FA</Label>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} className="scale-75 sm:scale-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations & Security */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Integrations */}
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardHeader className="border-b border-[#2A2A2A] px-3 sm:px-6 py-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500" />
                INTEGRACOES
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 space-y-2 sm:space-y-3">
              <div className="max-h-[180px] sm:max-h-none overflow-y-auto space-y-2 sm:space-y-3">
                {integrations.map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-[#1A1A1A] flex items-center justify-center">
                        <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-white">{integration.name}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {integration.status === "connected" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                          <Badge className="bg-green-500/20 text-green-500 text-[8px] sm:text-[9px] hidden sm:flex">OK</Badge>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                          <Badge className="bg-yellow-500/20 text-yellow-500 text-[8px] sm:text-[9px] hidden sm:flex">PEND</Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-3 sm:mt-4 bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm h-8 sm:h-10">
                Adicionar
              </Button>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardHeader className="border-b border-[#2A2A2A] px-3 sm:px-6 py-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-orange-500" />
                SEGURANCA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm text-white">Usuarios Ativos</span>
                  <Badge className="bg-orange-500/20 text-orange-500 text-[10px] sm:text-xs">19</Badge>
                </div>
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-white font-mono">4</div>
                    <div className="text-[8px] sm:text-[9px] text-neutral-500">Admin</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-white font-mono">5</div>
                    <div className="text-[8px] sm:text-[9px] text-neutral-500">Lead</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-white font-mono">8</div>
                    <div className="text-[8px] sm:text-[9px] text-neutral-500">Dev</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-white font-mono">2</div>
                    <div className="text-[8px] sm:text-[9px] text-neutral-500">Sales</div>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm text-white">Backup</span>
                  <span className="text-[10px] sm:text-xs text-green-500 font-mono">03:00 UTC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-white">Acesso</span>
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-mono truncate ml-2">Gabriel - 5m</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button variant="outline" size="sm" className="border-[#2A2A2A] text-neutral-400 hover:text-white text-[10px] sm:text-xs h-8 sm:h-9">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Usuarios</span>
                  <span className="sm:hidden">Users</span>
                </Button>
                <Button variant="outline" size="sm" className="border-[#2A2A2A] text-neutral-400 hover:text-white text-[10px] sm:text-xs h-8 sm:h-9">
                  <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">API Keys</span>
                  <span className="sm:hidden">Keys</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] sm:text-xs text-neutral-500">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <span>FOCUS OS v3.0</span>
                <span className="text-neutral-600 hidden sm:inline">|</span>
                <span className="hidden sm:inline">Build 2025.06.25</span>
                <span className="text-neutral-600 hidden sm:inline">|</span>
                <span className="hidden sm:inline">Next.js 16</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-500 font-mono">ONLINE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
