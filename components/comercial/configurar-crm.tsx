"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useClickUpConfig, useClickUpSetup } from "@/hooks/use-clickup"
import { 
  Settings, 
  Link2, 
  Check, 
  X, 
  Loader2, 
  RefreshCw,
  Database,
  Zap,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import type { ClickUpSpace, ClickUpFolder, ClickUpList } from "@/lib/clickup-api"

export function ConfigurarCRM() {
  const { config, setConfig, clearConfig, isConfigured } = useClickUpConfig()
  const { teams, teamsLoading, testToken, getSpacesForTeam, getFoldersForSpace, getListsForContainer } = useClickUpSetup(config.token)
  
  const [tokenInput, setTokenInput] = useState(config.token || "")
  const [testingToken, setTestingToken] = useState(false)
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectedUser, setConnectedUser] = useState<string | null>(null)
  
  const [spaces, setSpaces] = useState<ClickUpSpace[]>([])
  const [folders, setFolders] = useState<ClickUpFolder[]>([])
  const [lists, setLists] = useState<ClickUpList[]>([])
  
  const [loadingSpaces, setLoadingSpaces] = useState(false)
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [loadingLists, setLoadingLists] = useState(false)
  
  const [selectedSpace, setSelectedSpace] = useState<string | null>(config.spaceId)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedList, setSelectedList] = useState<string | null>(config.listId)
  
  const [syncInterval, setSyncInterval] = useState(config.syncInterval)
  const [isSaving, setIsSaving] = useState(false)

  // Test token on input
  const handleTestToken = async () => {
    if (!tokenInput.trim()) return
    
    setTestingToken(true)
    setTokenStatus('idle')
    
    const result = await testToken(tokenInput.trim())
    
    if (result.success && result.user) {
      setTokenStatus('success')
      setConnectedUser(result.user.username)
      setConfig({ token: tokenInput.trim() })
    } else {
      setTokenStatus('error')
      setConnectedUser(null)
    }
    
    setTestingToken(false)
  }

  // Load spaces when team changes
  const handleTeamChange = async (teamId: string) => {
    setConfig({ teamId })
    setLoadingSpaces(true)
    setSpaces([])
    setFolders([])
    setLists([])
    setSelectedSpace(null)
    setSelectedFolder(null)
    setSelectedList(null)
    
    try {
      const spacesData = await getSpacesForTeam(teamId)
      setSpaces(spacesData)
    } finally {
      setLoadingSpaces(false)
    }
  }

  // Load folders when space changes
  const handleSpaceChange = async (spaceId: string) => {
    setSelectedSpace(spaceId)
    setConfig({ spaceId })
    setLoadingFolders(true)
    setFolders([])
    setLists([])
    setSelectedFolder(null)
    setSelectedList(null)
    
    try {
      const foldersData = await getFoldersForSpace(spaceId)
      setFolders(foldersData)
      
      // Also load folderless lists
      const listsData = await getListsForContainer(spaceId, false)
      setLists(listsData)
    } finally {
      setLoadingFolders(false)
    }
  }

  // Load lists when folder changes
  const handleFolderChange = async (folderId: string) => {
    setSelectedFolder(folderId)
    setLoadingLists(true)
    setLists([])
    setSelectedList(null)
    
    try {
      const listsData = await getListsForContainer(folderId, true)
      setLists(listsData)
    } finally {
      setLoadingLists(false)
    }
  }

  // Handle list selection
  const handleListChange = (listId: string) => {
    setSelectedList(listId)
    setConfig({ listId })
  }

  // Save all settings
  const handleSave = async () => {
    setIsSaving(true)
    
    setConfig({
      syncInterval,
      listId: selectedList,
      spaceId: selectedSpace,
    })
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setIsSaving(false)
  }

  // Reset connection
  const handleDisconnect = () => {
    clearConfig()
    setTokenInput("")
    setTokenStatus('idle')
    setConnectedUser(null)
    setSpaces([])
    setFolders([])
    setLists([])
    setSelectedSpace(null)
    setSelectedFolder(null)
    setSelectedList(null)
  }

  // Check if token is already set
  useEffect(() => {
    if (config.token && !connectedUser) {
      testToken(config.token).then(result => {
        if (result.success && result.user) {
          setTokenStatus('success')
          setConnectedUser(result.user.username)
          setTokenInput(config.token!)
        }
      })
    }
  }, [config.token])

  return (
    <div className="space-y-6">
      {/* Connection Card */}
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
            <Link2 className="w-4 h-4 text-orange-500" />
            CONEXAO COM CLICKUP
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-400">API Token *</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="pk_xxxxxxxxxxxxxxxxxxxxx"
                className="bg-[#0A0A0A] border-[#2A2A2A] font-mono text-sm"
              />
              <Button 
                onClick={handleTestToken}
                disabled={testingToken || !tokenInput.trim()}
                variant="outline"
                className="border-[#2A2A2A] hover:border-orange-500 hover:bg-orange-500/10"
              >
                {testingToken ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Testar conexao"
                )}
              </Button>
            </div>
            <p className="text-[10px] text-neutral-500 flex items-center gap-1">
              Obtenha em: clickup.com/api &gt; Apps &gt; API Token
              <ExternalLink className="w-3 h-3" />
            </p>
          </div>

          {/* Connection Status */}
          {tokenStatus !== 'idle' && (
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              tokenStatus === 'success' 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {tokenStatus === 'success' ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <div>
                    <span className="text-green-400 text-sm font-medium">CONECTADO</span>
                    {connectedUser && (
                      <span className="text-neutral-400 text-sm ml-2">
                        Usuario: {connectedUser}
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDisconnect}
                    className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Desconectar
                  </Button>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-400 text-sm">Token invalido ou sem permissao</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mapping Card */}
      {tokenStatus === 'success' && (
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-500" />
              MAPEAMENTO DE DADOS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs text-neutral-500 mb-4">
              Selecione qual lista do ClickUp e o seu CRM:
            </p>

            {/* Workspace */}
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Workspace</Label>
              <Select 
                value={config.teamId || ""} 
                onValueChange={handleTeamChange}
                disabled={teamsLoading}
              >
                <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A]">
                  <SelectValue placeholder={teamsLoading ? "Carregando..." : "Selecione o workspace"} />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Space */}
            {config.teamId && (
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Space</Label>
                <Select 
                  value={selectedSpace || ""} 
                  onValueChange={handleSpaceChange}
                  disabled={loadingSpaces}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A]">
                    <SelectValue placeholder={loadingSpaces ? "Carregando..." : "Selecione o space"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                    {spaces.map(space => (
                      <SelectItem key={space.id} value={space.id}>
                        {space.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Folder (optional) */}
            {selectedSpace && folders.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Pasta (opcional)</Label>
                <Select 
                  value={selectedFolder || ""} 
                  onValueChange={handleFolderChange}
                  disabled={loadingFolders}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A]">
                    <SelectValue placeholder="Selecione uma pasta" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                    <SelectItem value="">Sem pasta</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* List CRM */}
            {(selectedSpace || selectedFolder) && lists.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Lista CRM *</Label>
                <Select 
                  value={selectedList || ""} 
                  onValueChange={handleListChange}
                  disabled={loadingLists}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A]">
                    <SelectValue placeholder={loadingLists ? "Carregando..." : "Selecione a lista do CRM"} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                    {lists.map(list => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedList && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-400 text-sm">Lista CRM selecionada</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sync Settings */}
      {isConfigured && (
        <Card className="bg-[#141414] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              SINCRONIZACAO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Intervalo de sincronizacao</Label>
              <Select 
                value={String(syncInterval)} 
                onValueChange={(v) => setSyncInterval(parseInt(v))}
              >
                <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141414] border-[#2A2A2A]">
                  <SelectItem value="1">A cada 1 minuto</SelectItem>
                  <SelectItem value="5">A cada 5 minutos</SelectItem>
                  <SelectItem value="10">A cada 10 minutos</SelectItem>
                  <SelectItem value="15">A cada 15 minutos</SelectItem>
                  <SelectItem value="30">A cada 30 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-[#2A2A2A]" />

            <div className="flex items-center justify-between">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                SALVAR CONFIGURACOES
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
