"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Key, Copy, Trash2, Plus, ExternalLink, Play, Check, AlertCircle } from "lucide-react"

interface ApiSectionProps {
  onChange: () => void
}

const apiKeys = [
  { id: 1, name: "Producao", prefix: "fk_prod_***", created: "15/01/2026", lastUsed: "Agora", permissions: ["read", "write"] },
  { id: 2, name: "Staging", prefix: "fk_stag_***", created: "10/02/2026", lastUsed: "2 dias atras", permissions: ["read"] },
  { id: 3, name: "CI/CD Pipeline", prefix: "fk_cicd_***", created: "01/03/2026", lastUsed: "1h atras", permissions: ["read", "write", "delete"] },
]

const webhooks = [
  { url: "https://api.slack.com/hooks/...", events: ["task.created", "task.completed"], lastDelivery: "success", lastTime: "5 min atras" },
  { url: "https://hooks.zapier.com/...", events: ["deal.created"], lastDelivery: "success", lastTime: "1h atras" },
  { url: "https://api.custom.com/...", events: ["sprint.started"], lastDelivery: "failed", lastTime: "2h atras" },
]

const scopes = ["Projetos", "Tasks", "Deals", "Clientes", "Relatorios", "Usuarios"]

export function ApiSection({ onChange }: ApiSectionProps) {
  const [newKeyModal, setNewKeyModal] = useState(false)

  const codeSnippet = `import { FocusClient } from '@focus/sdk';

const client = new FocusClient({
  apiKey: process.env.FOCUS_API_KEY,
});

// Listar projetos
const projects = await client.projects.list();
console.log(projects);`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          API & Desenvolvedores
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Gerencie chaves de API e webhooks
        </p>
      </div>

      {/* API Keys */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-neutral-400 font-mono text-xs uppercase">Chaves de API</Label>
            <Button
              onClick={() => setNewKeyModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-foreground font-mono text-xs"
            >
              <Plus className="w-4 h-4 mr-2" />
              Gerar Nova Chave
            </Button>
          </div>
          <ScrollArea className="w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left p-3 text-neutral-500 font-mono text-[10px]">NOME</th>
                  <th className="text-left p-3 text-neutral-500 font-mono text-[10px]">PREFIXO</th>
                  <th className="text-left p-3 text-neutral-500 font-mono text-[10px]">CRIADA EM</th>
                  <th className="text-left p-3 text-neutral-500 font-mono text-[10px]">ULTIMO USO</th>
                  <th className="text-left p-3 text-neutral-500 font-mono text-[10px]">PERMISSOES</th>
                  <th className="text-right p-3 text-neutral-500 font-mono text-[10px]">ACOES</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id} className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a]">
                    <td className="p-3 text-foreground text-sm">{key.name}</td>
                    <td className="p-3 text-neutral-400 font-mono text-sm">{key.prefix}</td>
                    <td className="p-3 text-neutral-400 font-mono text-sm">{key.created}</td>
                    <td className="p-3 text-neutral-400 font-mono text-sm">{key.lastUsed}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {key.permissions.map((perm) => (
                          <Badge key={perm} className="bg-[#1a1a1a] text-neutral-400 text-[9px] font-mono">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-orange-500">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-neutral-400 font-mono text-xs uppercase">Webhooks</Label>
            <Button variant="outline" className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-foreground font-mono text-xs">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Webhook
            </Button>
          </div>
          <div className="space-y-3">
            {webhooks.map((webhook, i) => (
              <div key={i} className="p-4 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-foreground text-sm font-mono truncate max-w-md">{webhook.url}</code>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] font-mono ${webhook.lastDelivery === "success" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                      {webhook.lastDelivery === "success" ? <Check className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                      {webhook.lastTime}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-orange-500">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-1">
                  {webhook.events.map((event) => (
                    <Badge key={event} className="bg-secondary text-neutral-500 text-[9px] font-mono">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Rate Limits</Label>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#FF6B00"
                  strokeWidth="12"
                  strokeDasharray={`${(65 / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-foreground text-2xl font-display font-bold">65</p>
                  <p className="text-neutral-500 text-xs font-mono">/100</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-foreground font-medium">65 requisicoes/min</p>
              <p className="text-neutral-500 text-sm">Limite: 100 req/min</p>
              <p className="text-neutral-600 text-xs font-mono mt-2">Resetar em: 45s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Documentacao</Label>
          <Button variant="outline" className="bg-transparent border-orange-500/30 text-orange-500 hover:bg-orange-500/10 font-mono text-xs">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Documentacao da API
          </Button>
        </CardContent>
      </Card>

      {/* SDK Snippet */}
      <Card className="bg-card border-[#2a2a2a]">
        <CardContent className="p-6">
          <Label className="text-neutral-400 font-mono text-xs uppercase mb-4 block">Quick Start</Label>
          <div className="bg-secondary rounded p-4 overflow-x-auto">
            <pre className="text-sm font-mono">
              <code className="text-foreground">{codeSnippet}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* New Key Modal */}
      <Dialog open={newKeyModal} onOpenChange={setNewKeyModal}>
        <DialogContent className="bg-card border-[#2a2a2a] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-500" />
              Gerar Nova Chave
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Nome</Label>
              <Input
                placeholder="Ex: Producao"
                className="bg-[#1a1a1a] border-[#2a2a2a] text-foreground font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Expiracao</Label>
              <Select defaultValue="never">
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-foreground font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                  <SelectItem value="never">Nunca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Escopos</Label>
              <div className="grid grid-cols-2 gap-2">
                {scopes.map((scope) => (
                  <div key={scope} className="flex items-center gap-2">
                    <Checkbox className="border-[#2a2a2a] data-[state=checked]:bg-orange-500" />
                    <Label className="text-neutral-400 text-sm font-mono cursor-pointer">{scope}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setNewKeyModal(false)} className="text-neutral-400 font-mono">
              Cancelar
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-foreground font-mono">
              Gerar Chave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
