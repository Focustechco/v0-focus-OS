"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Mail, Smartphone, Webhook } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface NotificacoesSectionProps {
  onChange: () => void
}

const channels = [
  { id: "app", label: "Notificacoes no App", icon: Bell, enabled: true },
  { id: "email", label: "Email", icon: Mail, enabled: true },
  { id: "push", label: "Push Mobile", icon: Smartphone, enabled: false },
  { id: "webhook", label: "Webhook", icon: Webhook, enabled: false },
]

const eventsList = [
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
  const [loading, setLoading] = useState(true)
  const [channelStates, setChannelStates] = useState<Record<string, boolean>>({
    app: true, email: true, push: false, webhook: false
  })
  const [eventPrefs, setEventPrefs] = useState<Record<string, any>>({})
  const [quietMode, setQuietMode] = useState(false)

  const loadPrefs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch(`/api/notifications/preferences?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setChannelStates({
          app: data.appEnabled,
          email: data.emailEnabled,
          push: data.pushEnabled,
          webhook: data.webhookEnabled
        })
        setEventPrefs(data.eventPrefs || {})
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrefs()
  }, [])

  const savePrefs = async (updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await fetch(`/api/notifications/preferences`, {
        method: "POST",
        body: JSON.stringify({ userId: user.id, ...updates })
      })
      onChange()
    } catch (error) {
      console.error(error)
    }
  }

  const toggleChannel = (channelId: string) => {
    const newState = !channelStates[channelId]
    const updatedStates = { ...channelStates, [channelId]: newState }
    setChannelStates(updatedStates)
    savePrefs({
      appEnabled: updatedStates.app,
      emailEnabled: updatedStates.email,
      pushEnabled: updatedStates.push,
      webhookEnabled: updatedStates.webhook
    })
  }

  const toggleEventSetting = (event: string, channelId: string) => {
    const eventKey = event.toLowerCase().replace(/ /g, "_")
    const current = eventPrefs[eventKey] || { app: true, email: true, push: false, webhook: false }
    const updated = {
      ...eventPrefs,
      [eventKey]: { ...current, [channelId]: !current[channelId] }
    }
    setEventPrefs(updated)
    savePrefs({ eventPrefs: updated })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-in fade-in duration-500">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">Carregando Preferências...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Notificações
        </h2>
        <p className="text-neutral-600 text-sm pl-5 font-sans">
          Configure como e quando você deseja ser alertado sobre as atividades no Focus OS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canais */}
        <Card className="bg-card border-[#2a2a2a]">
          <CardContent className="p-6">
            <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block tracking-widest">Canais de Entrega</Label>
            <div className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a] group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <channel.icon className={`w-5 h-5 ${channelStates[channel.id] ? "text-orange-500" : "text-neutral-500"}`} />
                    <span className={`text-sm ${channelStates[channel.id] ? "text-foreground" : "text-neutral-500"}`}>
                      {channel.label}
                    </span>
                  </div>
                  <Switch
                    checked={channelStates[channel.id]}
                    onCheckedChange={() => toggleChannel(channel.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Eventos */}
        <Card className="bg-card border-[#2a2a2a]">
          <CardContent className="p-6">
            <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block tracking-widest">Atividades por Canal</Label>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-1 text-neutral-500 font-mono text-[10px] tracking-widest uppercase">Evento</th>
                    {channels.map((c) => (
                      <th key={c.id} className="text-center p-2">
                        <c.icon className="w-4 h-4 mx-auto text-neutral-500" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventsList.map((event) => {
                    const eventKey = event.toLowerCase().replace(/ /g, "_")
                    const current = eventPrefs[eventKey] || { app: true, email: true, push: false, webhook: false }
                    
                    return (
                      <tr key={event} className="border-t border-[#2a2a2a] group hover:bg-orange-500/[0.02]">
                        <td className="py-3 px-1 text-foreground text-xs">{event}</td>
                        {channels.map((channel) => (
                          <td key={channel.id} className="text-center p-2">
                            <Switch
                              checked={current[channel.id]}
                              disabled={!channelStates[channel.id]}
                              onCheckedChange={() => toggleEventSetting(event, channel.id)}
                              className="scale-90"
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modo Silencioso */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-neutral-400 font-mono text-xs uppercase tracking-widest">Horário de Descanso (Modo Silencioso)</Label>
              <p className="text-neutral-600 text-xs mt-1 font-sans">Nenhuma notificação visual ou sonora será enviada nestes períodos.</p>
            </div>
            <Switch
              checked={quietMode}
              onCheckedChange={(checked) => { setQuietMode(checked); onChange() }}
            />
          </div>

          {quietMode && (
            <div className="pt-4 border-t border-[#2a2a2a] space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label className="text-neutral-500 font-mono text-[10px] tracking-widest uppercase">Início</Label>
                  <Input
                    type="time"
                    defaultValue="22:00"
                    onChange={onChange}
                    className="w-28 h-9 bg-[#1a1a1a] border-[#2a2a2a] text-foreground font-mono text-xs focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-500 font-mono text-[10px] tracking-widest uppercase">Fim</Label>
                  <Input
                    type="time"
                    defaultValue="08:00"
                    onChange={onChange}
                    className="w-28 h-9 bg-[#1a1a1a] border-[#2a2a2a] text-foreground font-mono text-xs focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {days.map((day, i) => (
                  <button
                    key={i}
                    onClick={onChange}
                    className="w-9 h-9 rounded-lg border border-[#2a2a2a] text-neutral-400 font-mono text-xs hover:border-orange-500 hover:text-orange-500 transition-all data-[selected=true]:bg-orange-500/10 data-[selected=true]:text-orange-500 data-[selected=true]:border-orange-500/50"
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
