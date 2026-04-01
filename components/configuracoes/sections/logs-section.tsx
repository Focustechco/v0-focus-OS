"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  User,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  user: string
  action: string
  module: string
  details: string
  ip: string
  status: "success" | "warning" | "error" | "info"
}

const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32:45",
    user: "Admin",
    action: "LOGIN",
    module: "Autenticacao",
    details: "Login realizado com sucesso",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:30:12",
    user: "Maria Silva",
    action: "UPDATE",
    module: "Projetos",
    details: "Projeto 'App Mobile' atualizado",
    ip: "192.168.1.101",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:28:55",
    user: "Sistema",
    action: "SYNC",
    module: "ClickUp",
    details: "Sincronizacao automatica executada",
    ip: "localhost",
    status: "info",
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:25:33",
    user: "Joao Santos",
    action: "DELETE",
    module: "Tasks",
    details: "Tarefa removida do backlog",
    ip: "192.168.1.102",
    status: "warning",
  },
  {
    id: "5",
    timestamp: "2024-01-15 14:20:18",
    user: "API",
    action: "ERROR",
    module: "Webhook",
    details: "Falha na conexao com servico externo",
    ip: "api.external.com",
    status: "error",
  },
  {
    id: "6",
    timestamp: "2024-01-15 14:15:00",
    user: "Admin",
    action: "CONFIG",
    module: "Sistema",
    details: "Configuracoes de notificacao alteradas",
    ip: "192.168.1.100",
    status: "success",
  },
  {
    id: "7",
    timestamp: "2024-01-15 14:10:22",
    user: "Carlos Lima",
    action: "CREATE",
    module: "Comercial",
    details: "Novo deal criado: Cliente XYZ",
    ip: "192.168.1.103",
    status: "success",
  },
  {
    id: "8",
    timestamp: "2024-01-15 14:05:44",
    user: "Sistema",
    action: "BACKUP",
    module: "Database",
    details: "Backup automatico concluido",
    ip: "localhost",
    status: "info",
  },
]

const statusConfig = {
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
}

export function LogsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterModule, setFilterModule] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesModule = filterModule === "all" || log.module === filterModule
    const matchesStatus = filterStatus === "all" || log.status === filterStatus
    return matchesSearch && matchesModule && matchesStatus
  })

  const modules = [...new Set(mockLogs.map((log) => log.module))]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Sucesso</p>
                <p className="text-xl font-mono text-white">
                  {mockLogs.filter((l) => l.status === "success").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Alertas</p>
                <p className="text-xl font-mono text-white">
                  {mockLogs.filter((l) => l.status === "warning").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Erros</p>
                <p className="text-xl font-mono text-white">
                  {mockLogs.filter((l) => l.status === "error").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Info</p>
                <p className="text-xl font-mono text-white">
                  {mockLogs.filter((l) => l.status === "info").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white"
              />
            </div>

            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Modulo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="all">Todos Modulos</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                <Activity className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Alerta</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-white font-mono text-sm tracking-wider">
            REGISTRO DE ATIVIDADES
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-neutral-500 font-mono text-xs">TIMESTAMP</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">USUARIO</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">ACAO</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">MODULO</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">DETALHES</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">IP</TableHead>
                <TableHead className="text-neutral-500 font-mono text-xs">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const StatusIcon = statusConfig[log.status].icon
                return (
                  <TableRow
                    key={log.id}
                    className="border-[#2A2A2A] hover:bg-[#1A1A1A] transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-neutral-400">
                      <div className="flex items-center gap-2">
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
                      <Badge
                        variant="outline"
                        className="border-orange-500/30 text-orange-500 font-mono text-[10px]"
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-sm">{log.module}</TableCell>
                    <TableCell className="text-neutral-300 text-sm max-w-[200px] truncate">
                      {log.details}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500">{log.ip}</TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-1 ${statusConfig[log.status].color}`}
                      >
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
    </div>
  )
}
