"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Monitor,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Zap,
  Database,
  Globe,
  Server,
  User,
} from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  user: string
  action: string
  module: string
  details: string
  status: "success" | "warning" | "error" | "info"
}

const recentLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "14:32:45",
    user: "Admin",
    action: "LOGIN",
    module: "Auth",
    details: "Login realizado com sucesso",
    status: "success",
  },
  {
    id: "2",
    timestamp: "14:30:12",
    user: "Maria Silva",
    action: "UPDATE",
    module: "Projetos",
    details: "Projeto atualizado",
    status: "success",
  },
  {
    id: "3",
    timestamp: "14:28:55",
    user: "Sistema",
    action: "SYNC",
    module: "ClickUp",
    details: "Sincronizacao executada",
    status: "info",
  },
  {
    id: "4",
    timestamp: "14:25:33",
    user: "Joao Santos",
    action: "DELETE",
    module: "Tasks",
    details: "Tarefa removida",
    status: "warning",
  },
  {
    id: "5",
    timestamp: "14:20:18",
    user: "API",
    action: "ERROR",
    module: "Webhook",
    details: "Falha na conexao",
    status: "error",
  },
]

const statusConfig = {
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
}

const systemServices = [
  { name: "API Principal", status: "online", uptime: "99.9%", latency: "45ms" },
  { name: "Database", status: "online", uptime: "99.8%", latency: "12ms" },
  { name: "ClickUp Sync", status: "online", uptime: "98.5%", latency: "120ms" },
  { name: "Webhook Handler", status: "degraded", uptime: "95.2%", latency: "340ms" },
  { name: "File Storage", status: "online", uptime: "99.9%", latency: "28ms" },
]

export function SistemaSection() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">CPU</p>
                <div className="flex items-center gap-2">
                  <Progress value={34} className="h-2 flex-1" />
                  <span className="text-sm font-mono text-white">34%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">Memoria</p>
                <div className="flex items-center gap-2">
                  <Progress value={62} className="h-2 flex-1" />
                  <span className="text-sm font-mono text-white">62%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-500 mb-1">Disco</p>
                <div className="flex items-center gap-2">
                  <Progress value={45} className="h-2 flex-1" />
                  <span className="text-sm font-mono text-white">45%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Uptime</p>
                <p className="text-xl font-mono text-white">15d 8h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A] flex flex-row items-center justify-between">
          <CardTitle className="text-white font-mono text-sm tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-orange-500" />
            STATUS DOS SERVICOS
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-neutral-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-neutral-500 font-mono text-xs">SERVICO</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">STATUS</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">UPTIME</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">LATENCIA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemServices.map((service, index) => (
                <TableRow key={index} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                  <TableCell className="font-medium text-white flex items-center gap-2">
                    {service.name === "API Principal" && <Globe className="w-4 h-4 text-orange-500" />}
                    {service.name === "Database" && <Database className="w-4 h-4 text-blue-500" />}
                    {service.name === "ClickUp Sync" && <RefreshCw className="w-4 h-4 text-green-500" />}
                    {service.name === "Webhook Handler" && <Zap className="w-4 h-4 text-yellow-500" />}
                    {service.name === "File Storage" && <HardDrive className="w-4 h-4 text-purple-500" />}
                    {service.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`font-mono text-[10px] ${
                        service.status === "online"
                          ? "bg-green-500/10 text-green-500 border-green-500/30"
                          : service.status === "degraded"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                          : "bg-red-500/10 text-red-500 border-red-500/30"
                      }`}
                    >
                      {service.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-neutral-400">{service.uptime}</TableCell>
                  <TableCell className="font-mono text-sm text-neutral-400">{service.latency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-white font-mono text-sm tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            LOGS RECENTES
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-neutral-500 font-mono text-xs">HORA</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">USUARIO</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">ACAO</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">MODULO</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">DETALHES</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => {
                const StatusIcon = statusConfig[log.status].icon
                return (
                  <TableRow key={log.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                    <TableCell className="font-mono text-xs text-neutral-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-neutral-500" />
                        <span className="text-white text-sm">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-orange-500/30 text-orange-500 font-mono text-[10px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-sm">{log.module}</TableCell>
                    <TableCell className="text-neutral-300 text-sm">{log.details}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${statusConfig[log.status].color}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-white font-mono text-sm tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-orange-500" />
            INFORMACOES DO SISTEMA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-neutral-500 text-xs mb-1">Versao</p>
              <p className="text-white font-mono">v2.4.1</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Build</p>
              <p className="text-white font-mono">2026.03.15</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Ambiente</p>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30 font-mono text-[10px]">
                PRODUCTION
              </Badge>
            </div>
            <div>
              <p className="text-neutral-500 text-xs mb-1">Ultima Atualizacao</p>
              <p className="text-white font-mono">15/01/2026</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
