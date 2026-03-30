"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Mail, Smartphone, Webhook } from "lucide-react"

interface NotificacoesSectionProps {
  onChange: () => void
}

const channels = [
  { id: "app", label: "Notificacoes no App", icon: Bell, enabled: true },
  { id: "email", label: "Email", icon: Mail, enabled: true },
  { id: "push", label: "Push Mobile", icon: Smartphone, enabled: false },
  { id: "webhook", label: "Webhook", icon: Webhook, enabled: false },
]

const events = [
  "Nova Task",
  "Task Concluida",
  "Sprint Iniciada",
  "Sprint Encerrada",
  "Novo Deal",
  "Deal Aprovado",
  "Contrato Pendente",
  "Novo Membro",
  "Sistema Offline",
  "Backup Concluido",
]

const days = ["D", "S", "T", "Q", "Q", "S", "S"]

export function NotificacoesSection({ onChange }: NotificacoesSectionProps) {
  const [channelStates, setChannelStates] = useState<Record<string, boolean>>(
    Object.fromEntries(channels.map((c) => [c.id, c.enabled]))
  )
  const [quietMode, setQuietMode] = useState(false)
  const [notifications, setNotifications] = useState<Record<string, Record<string, boolean>>>({})

  const toggleChannel = (channelId: string) => {
    setChannelStates((prev) => ({ ...prev, [channelId]: !prev[channelId] }))
    onChange()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Notificacoes
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Configure como e quando receber notificacoes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channels */}
        <Card className="bg-[#141414] border-[#2a2a2a]">
          <CardContent className="p-6">
            <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Canais</Label>
            <div className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                  <div className="flex items-center gap-3">
                    <channel.icon className={`w-5 h-5 ${channelStates[channel.id] ? "text-orange-500" : "text-neutral-500"}`} />
                    <span className={`text-sm ${channelStates[channel.id] ? "text-white" : "text-neutral-500"}`}>
                      {channel.label}
                    </span>
                  </div>
                  <Switch
                    checked={channelStates[channel.id]}
                    onCheckedChange={() => toggleChannel(channel.id)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Matrix */}
        <Card className="bg-[#141414] border-[#2a2a2a]">
          <CardContent className="p-6">
            <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Eventos por Canal</Label>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-neutral-500 font-mono text-[10px]">EVENTO</th>
                    {channels.map((c) => (
                      <th key={c.id} className="text-center p-2">
                        <c.icon className="w-4 h-4 mx-auto text-neutral-500" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event} className="border-t border-[#2a2a2a]">
                      <td className="p-2 text-white text-xs">{event}</td>
                      {channels.map((channel) => (
                        <td key={channel.id} className="text-center p-2">
                          <Switch
                            defaultChecked={channel.enabled}
                            disabled={!channelStates[channel.id]}
                            onCheckedChange={onChange}
                            className="scale-75 data-[state=checked]:bg-orange-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiet Hours */}
      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-neutral-400 font-mono text-xs uppercase">Modo Silencioso</Label>
              <p className="text-neutral-600 text-xs mt-1">Pausar notificacoes em horarios especificos</p>
            </div>
            <Switch
              checked={quietMode}
              onCheckedChange={(checked) => { setQuietMode(checked); onChange() }}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>

          {quietMode && (
            <div className="pt-4 border-t border-[#2a2a2a] space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-500 font-mono text-xs">DE</Label>
                  <Input
                    type="time"
                    defaultValue="22:00"
                    onChange={onChange}
                    className="w-28 bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-500 font-mono text-xs">ATE</Label>
                  <Input
                    type="time"
                    defaultValue="08:00"
                    onChange={onChange}
                    className="w-28 bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {days.map((day, i) => (
                  <button
                    key={i}
                    onClick={onChange}
                    className="w-10 h-10 rounded border border-[#2a2a2a] text-neutral-400 font-mono text-sm hover:border-orange-500 hover:text-orange-500 transition-colors data-[selected=true]:bg-orange-500 data-[selected=true]:text-white data-[selected=true]:border-orange-500"
                    data-selected={i > 0 && i < 6}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
