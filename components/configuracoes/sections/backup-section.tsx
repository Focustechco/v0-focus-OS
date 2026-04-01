"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  HardDrive,
  Cloud,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Trash2,
} from "lucide-react"

interface BackupEntry {
  id: string
  name: string
  date: string
  size: string
  type: "auto" | "manual"
  status: "completed" | "in_progress" | "failed"
}

const mockBackups: BackupEntry[] = [
  {
    id: "1",
    name: "backup_2024-01-15_14-00",
    date: "15/01/2024 14:00",
    size: "245 MB",
    type: "auto",
    status: "completed",
  },
  {
    id: "2",
    name: "backup_2024-01-14_14-00",
    date: "14/01/2024 14:00",
    size: "243 MB",
    type: "auto",
    status: "completed",
  },
  {
    id: "3",
    name: "backup_manual_2024-01-13",
    date: "13/01/2024 16:32",
    size: "242 MB",
    type: "manual",
    status: "completed",
  },
  {
    id: "4",
    name: "backup_2024-01-12_14-00",
    date: "12/01/2024 14:00",
    size: "240 MB",
    type: "auto",
    status: "completed",
  },
  {
    id: "5",
    name: "backup_2024-01-11_14-00",
    date: "11/01/2024 14:00",
    size: "238 MB",
    type: "auto",
    status: "failed",
  },
]

export function BackupSection() {
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [cloudSync, setCloudSync] = useState(true)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)

  const handleManualBackup = () => {
    setIsBackingUp(true)
    setBackupProgress(0)

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsBackingUp(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Ultimo Backup</p>
                <p className="text-sm font-mono text-white">Hoje, 14:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Armazenamento Usado</p>
                <p className="text-sm font-mono text-white">1.2 GB / 5 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Sync Cloud</p>
                <p className="text-sm font-mono text-green-500">Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Settings */}
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-white font-mono text-sm tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-500" />
            CONFIGURACOES DE BACKUP
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Backup Automatico</Label>
              <p className="text-xs text-neutral-500">
                Realizar backups automaticos no horario programado
              </p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>

          {autoBackup && (
            <div className="space-y-2">
              <Label className="text-neutral-400 text-sm">Frequencia</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger className="w-[200px] bg-[#0A0A0A] border-[#2A2A2A] text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]">
            <div className="space-y-1">
              <Label className="text-white">Sincronizacao na Nuvem</Label>
              <p className="text-xs text-neutral-500">
                Enviar backups automaticamente para armazenamento cloud
              </p>
            </div>
            <Switch checked={cloudSync} onCheckedChange={setCloudSync} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Criando Backup...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Criar Backup Agora
                </>
              )}
            </Button>
            <Button variant="outline" className="border-[#2A2A2A] text-neutral-400 hover:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Restaurar Backup
            </Button>
          </div>

          {isBackingUp && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Progresso</span>
                <span className="text-orange-500 font-mono">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-white font-mono text-sm tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            HISTORICO DE BACKUPS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#2A2A2A]">
            {mockBackups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-4 hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      backup.status === "completed"
                        ? "bg-green-500/10"
                        : backup.status === "in_progress"
                          ? "bg-blue-500/10"
                          : "bg-red-500/10"
                    }`}
                  >
                    {backup.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : backup.status === "in_progress" ? (
                      <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-mono text-sm">{backup.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-neutral-500">{backup.date}</span>
                      <span className="text-xs text-neutral-600">|</span>
                      <span className="text-xs text-neutral-500">{backup.size}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          backup.type === "auto"
                            ? "border-blue-500/30 text-blue-400"
                            : "border-orange-500/30 text-orange-400"
                        }`}
                      >
                        {backup.type === "auto" ? "AUTO" : "MANUAL"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {backup.status === "completed" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-neutral-400 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
