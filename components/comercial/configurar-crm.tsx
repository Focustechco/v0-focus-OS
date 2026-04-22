"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClickUpConfig, useClickUpSetup } from "@/hooks/use-clickup"
import { Check, X, Link2, Info, ExternalLink, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ConfigurarCRM() {
  const { config, isConfigured, isLoaded, saveConfig } = useClickUpConfig()
  const { teams, teamsLoading, getSpacesForTeam, getListsForSpace } = useClickUpSetup()
  
  const [saving, setSaving] = useState(false)
  
  const [spaces, setSpaces] = useState<any[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [spacesLoading, setSpacesLoading] = useState(false)
  const [listsLoading, setListsLoading] = useState(false)

  // Carrega spaces se já houver um teamId
  useEffect(() => {
    if (config.teamId) {
      loadSpaces(config.teamId)
    }
  }, [config.teamId])

  // Carrega lists se já houver um spaceId
  useEffect(() => {
    if (config.spaceId) {
      loadLists(config.spaceId)
    }
  }, [config.spaceId])

  const loadSpaces = async (teamId: string) => {
    setSpacesLoading(true)
    try {
      const data = await getSpacesForTeam(teamId)
      setSpaces(data.spaces || [])
    } catch (error: any) {
      toast.error("Erro ao carregar spaces: " + error.message)
    } finally {
      setSpacesLoading(false)
    }
  }

  const loadLists = async (spaceId: string) => {
    setListsLoading(true)
    try {
      const data = await getListsForSpace(spaceId)
      setLists(data.lists || [])
    } catch (error: any) {
      toast.error("Erro ao carregar listas: " + error.message)
    } finally {
      setListsLoading(false)
    }
  }

  const handleWorkspaceChange = async (val: string) => {
    setSaving(true)
    try {
      await saveConfig({ teamId: val, spaceId: null, listId: null })
      setSpaces([])
      setLists([])
      toast.success("Workspace atualizado! Agora selecione o Space.")
      loadSpaces(val)
    } catch (error: any) {
      toast.error("Erro ao salvar workspace: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSpaceChange = async (val: string) => {
    setSaving(true)
    try {
      await saveConfig({ spaceId: val, listId: null })
      setLists([])
      toast.success("Space atualizado! Agora selecione a Lista.")
      loadLists(val)
    } catch (error: any) {
      toast.error("Erro ao salvar space: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleListChange = async (val: string) => {
    setSaving(true)
    try {
      await saveConfig({ listId: val })
      toast.success("CRM configurado com sucesso!")
    } catch (error: any) {
      toast.error("Erro ao salvar lista: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border shadow-2xl shadow-orange-500/5">
        <CardHeader className="border-b border-border bg-orange-500/5">
          <CardTitle className="text-sm font-bold text-foreground tracking-widest flex items-center gap-2">
            <Link2 className="w-5 h-5 text-orange-500" />
            INTEGRAÇÃO COMERCIAL (CLICKUP CRM)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {!isLoaded ? (
            <div className="flex items-center gap-2 text-neutral-500 italic">
               <Loader2 className="w-4 h-4 animate-spin" />
               Carregando config...
            </div>
          ) : isConfigured ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1: Workspace */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-[10px] font-bold border border-orange-500/20">1</div>
                    <label className="text-[10px] font-mono uppercase tracking-widest">WORKSPACE</label>
                  </div>
                  <Select 
                    value={config.teamId || ""} 
                    onValueChange={handleWorkspaceChange}
                    disabled={saving || teamsLoading}
                  >
                    <SelectTrigger className="bg-background border-border h-11 text-sm">
                      <SelectValue placeholder="Selecione o Workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team: any) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 2: Space */}
                <div className={cn("space-y-3 transition-opacity", !config.teamId && "opacity-40 pointer-events-none")}>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-[10px] font-bold border border-orange-500/20">2</div>
                    <label className="text-[10px] font-mono uppercase tracking-widest">SPACE</label>
                  </div>
                  <Select 
                    value={config.spaceId || ""} 
                    onValueChange={handleSpaceChange}
                    disabled={saving || spacesLoading || !config.teamId}
                  >
                    <SelectTrigger className="bg-background border-border h-11 text-sm">
                      {spacesLoading ? (
                        <div className="flex items-center gap-2">
                           <Loader2 className="w-3 h-3 animate-spin" />
                           Buscando...
                        </div>
                      ) : (
                        <SelectValue placeholder="Selecione o Space" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {spaces.map((space: any) => (
                        <SelectItem key={space.id} value={space.id}>
                          {space.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 3: List */}
                <div className={cn("space-y-3 transition-opacity", (!config.spaceId || !config.teamId) && "opacity-40 pointer-events-none")}>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-[10px] font-bold border border-orange-500/20">3</div>
                    <label className="text-[10px] font-mono uppercase tracking-widest">LISTA CRM</label>
                  </div>
                  <Select 
                    value={config.listId || ""} 
                    onValueChange={handleListChange}
                    disabled={saving || listsLoading || !config.spaceId}
                  >
                    <SelectTrigger className="bg-background border-border h-11 text-sm">
                       {listsLoading ? (
                        <div className="flex items-center gap-2">
                           <Loader2 className="w-3 h-3 animate-spin" />
                           Buscando...
                        </div>
                      ) : (
                        <SelectValue placeholder="Selecione a Lista" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {lists.map((list: any) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Banner */}
              <div className={cn(
                "p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all",
                isConfigured && config.listId 
                  ? "bg-green-500/10 border-green-500/30 text-green-500" 
                  : "bg-orange-500/10 border-orange-500/30 text-orange-500"
              )}>
                <div className="flex items-center gap-3">
                  {isConfigured && config.listId ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">
                      {isConfigured && config.listId ? "Integração Online" : "Configuração Incompleta"}
                    </p>
                    <p className="text-[11px] opacity-80 font-mono">
                      {isConfigured && config.listId 
                        ? `Conectado à lista ClickUp ID: ${config.listId}`
                        : "Selecione todos os níveis acima para ativar o CRM"}
                    </p>
                  </div>
                </div>
                {isConfigured && config.listId && (
                  <Button variant="outline" size="sm" className="bg-white/5 border-green-500/20 hover:bg-green-500/20 h-8 text-[10px] font-bold" asChild>
                    <a href={`https://app.clickup.com/list/${config.listId}`} target="_blank" rel="noreferrer">
                      ABRIR NO CLICKUP <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-start gap-4 p-6 rounded-xl border border-red-500/30 bg-red-500/5">
              <X className="w-6 h-6 text-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-red-400 uppercase tracking-widest">Erro de Autenticação</p>
                <p className="text-xs text-neutral-400">
                  O token da API do ClickUp não foi encontrado no servidor. Por favor, verifique o arquivo .env.local.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10 italic">
        <Info className="w-4 h-4 text-orange-500 mt-0.5" />
        <p className="text-[11px] text-neutral-500 leading-relaxed">
          <b>Nota:</b> Toda alteração de workspace ou space limpa as seleções dependentes para evitar inconsistências. 
          A sincronização de leads é feita de forma assíncrona baseada na lista final selecionada.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-sm font-medium text-foreground tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-500" />
            COMO CONFIGURAR
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-sm text-foreground">
          <p className="text-xs text-neutral-400">
            A integração de CRM necessita que você indique exatamente onde estão os seus negócios no ClickUp.
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-xs text-neutral-300">
            <li>
              Certifique-se de que a variável de ambiente <code className="rounded bg-background px-1 font-mono text-orange-300">CLICKUP_API_TOKEN</code> está definida.
            </li>
            <li>No topo desta página, identifique o <b>Workspace (Team)</b> onde sua empresa estrutura os fluxos.</li>
            <li>Em seguida, selecione o <b>Space</b> específico.</li>
            <li>Por fim, aponte a <b>Lista</b> (List) onde estão os negócios a serem consumidos (ex: "CRM", "Leads").</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
