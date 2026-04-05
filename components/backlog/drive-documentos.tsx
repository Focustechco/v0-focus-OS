"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  FileSpreadsheet,
  File,
  Upload,
  Search,
  Link2,
  ExternalLink,
  MoreVertical,
  Trash2,
  Eye,
  Download,
  FolderOpen,
  Plus,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Filter,
  Table,
} from "lucide-react"
import { useFocusOS, type Contract, type DriveFile, type SheetImport } from "@/contexts/focus-os-context"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export function DriveDocumentos() {
  const focusOS = useFocusOS()
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [importSheetDialogOpen, setImportSheetDialogOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null)

  const isDriveConnected = focusOS.integrations.googleDrive.connected
  const isSheetsConnected = focusOS.integrations.googleSheets.connected

  const filteredContracts = focusOS.backlog.contracts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFiles = focusOS.backlog.driveFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSheets = focusOS.backlog.importedSheets.filter((s) =>
    s.sheetName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />
    }
    if (mimeType.includes("document") || mimeType.includes("word")) {
      return <FileText className="w-5 h-5 text-blue-500" />
    }
    if (mimeType.includes("pdf")) {
      return <File className="w-5 h-5 text-red-500" />
    }
    return <File className="w-5 h-5 text-neutral-400" />
  }

  const getStatusBadge = (status: Contract["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/20 text-green-500 text-[10px]">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            ATIVO
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-orange-500/20 text-orange-500 text-[10px]">
            <Clock className="w-3 h-3 mr-1" />
            PENDENTE
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-500/20 text-red-500 text-[10px]">
            <AlertCircle className="w-3 h-3 mr-1" />
            EXPIRADO
          </Badge>
        )
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleMockUpload = () => {
    const mockContract: Omit<Contract, "id" | "uploadedAt"> = {
      name: `Novo Contrato - ${new Date().toLocaleDateString("pt-BR")}`,
      driveFileId: `mock_${Date.now()}`,
      url: "#",
      status: "pending",
    }
    focusOS.addContract(mockContract)
    setUploadDialogOpen(false)
  }

  const handleMockImportSheet = () => {
    const mockSheet: Omit<SheetImport, "id" | "importedAt"> = {
      sheetId: `sheet_${Date.now()}`,
      sheetName: `Planilha Importada - ${new Date().toLocaleDateString("pt-BR")}`,
      rowCount: Math.floor(Math.random() * 500) + 50,
    }
    focusOS.importSheet(mockSheet)
    setImportSheetDialogOpen(false)
  }

  if (!isDriveConnected && !isSheetsConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-[#141414] border border-[#2a2a2a] flex items-center justify-center mb-6">
          <HardDrive className="w-10 h-10 text-neutral-600" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma Integracao Conectada</h3>
        <p className="text-neutral-500 text-center max-w-md mb-6">
          Conecte o Google Drive ou Google Sheets nas configuracoes para gerenciar seus documentos e planilhas aqui.
        </p>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => {
            // Navigate to settings
            window.location.href = "/configuracoes"
          }}
        >
          Ir para Configuracoes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with search and actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-[#141414] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm sm:text-base">Drive & Documentos</h2>
            <p className="text-neutral-500 text-xs sm:text-sm truncate">Gerencie contratos, planilhas e arquivos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Buscar arquivos.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#141414] border-[#2a2a2a] text-white w-full text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white flex-shrink-0"
            onClick={() => {
              focusOS.syncIntegration("googleDrive")
              focusOS.syncIntegration("googleSheets")
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content tabs */}
      <Tabs defaultValue="contratos" className="w-full">
        <TabsList className="bg-[#141414] border border-[#2a2a2a] p-1 h-auto w-full flex flex-wrap sm:flex-nowrap gap-1">
          <TabsTrigger
            value="contratos"
            className="flex-1 sm:flex-none data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500 text-neutral-400 font-mono text-[10px] sm:text-xs px-2 sm:px-3"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">CONTRATOS</span>
            <span className="sm:hidden">CONTR.</span>
            <span className="ml-1">({focusOS.backlog.contracts.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="planilhas"
            className="flex-1 sm:flex-none data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500 text-neutral-400 font-mono text-[10px] sm:text-xs px-2 sm:px-3"
          >
            <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">PLANILHAS</span>
            <span className="sm:hidden">PLAN.</span>
            <span className="ml-1">({focusOS.backlog.importedSheets.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="arquivos"
            className="flex-1 sm:flex-none data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500 text-neutral-400 font-mono text-[10px] sm:text-xs px-2 sm:px-3"
          >
            <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">ARQUIVOS</span>
            <span className="sm:hidden">ARQ.</span>
            <span className="ml-1">({focusOS.backlog.driveFiles.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Contratos Tab */}
        <TabsContent value="contratos" className="mt-4">
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-mono text-neutral-400">
                Contratos & Documentos Juridicos
              </CardTitle>
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs"
                    disabled={!isDriveConnected}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0d0d0d] border-[#2a2a2a]">
                  <DialogHeader>
                    <DialogTitle className="text-white">Upload de Contrato</DialogTitle>
                    <DialogDescription className="text-neutral-500">
                      Faca upload de um contrato para o Google Drive
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-8 text-center hover:border-orange-500/50 transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                      <p className="text-neutral-400 text-sm mb-1">Arraste um arquivo ou clique para selecionar</p>
                      <p className="text-neutral-600 text-xs">PDF, DOCX, DOC ate 25MB</p>
                    </div>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleMockUpload}
                    >
                      Simular Upload (Demo)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {filteredContracts.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{contract.name}</p>
                            <p className="text-neutral-500 text-xs">
                              {formatDistanceToNow(contract.uploadedAt, { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(contract.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <Link2 className="w-4 h-4 mr-2" />
                                Vincular a Tarefa
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir no Drive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                              <DropdownMenuItem
                                className="text-red-500 hover:bg-red-500/10"
                                onClick={() => focusOS.removeContract(contract.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-12 h-12 text-neutral-600 mb-3" />
                  <p className="text-neutral-500 text-sm">
                    {searchQuery ? "Nenhum contrato encontrado" : "Nenhum contrato adicionado"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planilhas Tab */}
        <TabsContent value="planilhas" className="mt-4">
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-mono text-neutral-400">
                Planilhas Importadas
              </CardTitle>
              <Dialog open={importSheetDialogOpen} onOpenChange={setImportSheetDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white font-mono text-xs"
                    disabled={!isSheetsConnected}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Importar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0d0d0d] border-[#2a2a2a]">
                  <DialogHeader>
                    <DialogTitle className="text-white">Importar Planilha</DialogTitle>
                    <DialogDescription className="text-neutral-500">
                      Selecione uma planilha do Google Sheets para importar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Cole o link da planilha ou ID..."
                      className="bg-[#141414] border-[#2a2a2a] text-white"
                    />
                    <div className="border border-[#2a2a2a] rounded-lg p-4">
                      <p className="text-neutral-400 text-sm mb-3">Planilhas Disponiveis</p>
                      <div className="space-y-2">
                        {["Controle de Horas", "Budget 2024", "Relatorio Vendas"].map((name, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded hover:bg-[#2a2a2a] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4 text-green-500" />
                              <span className="text-white text-sm">{name}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Selecionar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleMockImportSheet}
                    >
                      Importar (Demo)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {filteredSheets.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredSheets.map((sheet) => (
                      <div
                        key={sheet.id}
                        className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                            <FileSpreadsheet className="w-5 h-5 text-green-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{sheet.sheetName}</p>
                            <div className="flex items-center gap-2 text-neutral-500 text-xs">
                              <span>{sheet.rowCount} linhas</span>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(sheet.importedAt, { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-500 text-[10px]">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            SINCRONIZADO
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <Table className="w-4 h-4 mr-2" />
                                Ver Dados
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Atualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir no Sheets
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                              <DropdownMenuItem
                                className="text-red-500 hover:bg-red-500/10"
                                onClick={() => focusOS.removeSheet(sheet.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-neutral-600 mb-3" />
                  <p className="text-neutral-500 text-sm">
                    {searchQuery ? "Nenhuma planilha encontrada" : "Nenhuma planilha importada"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Arquivos Tab */}
        <TabsContent value="arquivos" className="mt-4">
          <Card className="bg-[#141414] border-[#2a2a2a]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-mono text-neutral-400">
                Todos os Arquivos do Drive
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white font-mono text-xs"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </CardHeader>
            <CardContent>
              {filteredFiles.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{file.name}</p>
                            <div className="flex items-center gap-2 text-neutral-500 text-xs">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(file.modifiedTime, { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                              <DropdownMenuItem 
                                className="text-white hover:bg-[#2a2a2a]"
                                onClick={() => setPreviewFile(file)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <Download className="w-4 h-4 mr-2" />
                                Baixar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <Link2 className="w-4 h-4 mr-2" />
                                Copiar Link
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-white hover:bg-[#2a2a2a]">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir no Drive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                              <DropdownMenuItem
                                className="text-red-500 hover:bg-red-500/10"
                                onClick={() => focusOS.removeDriveFile(file.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover do Focus OS
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderOpen className="w-12 h-12 text-neutral-600 mb-3" />
                  <p className="text-neutral-500 text-sm">
                    {searchQuery ? "Nenhum arquivo encontrado" : "Nenhum arquivo no Drive"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="bg-[#0d0d0d] border-[#2a2a2a] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {previewFile && getFileIcon(previewFile.mimeType)}
              {previewFile?.name}
            </DialogTitle>
            <DialogDescription className="text-neutral-500">
              Pre-visualizacao do arquivo
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="aspect-[4/3] bg-[#141414] rounded-lg flex items-center justify-center border border-[#2a2a2a]">
              <div className="text-center">
                <Eye className="w-16 h-16 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500">Pre-visualizacao indisponivel</p>
                <p className="text-neutral-600 text-sm">Abra no Google Drive para visualizar</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                className="bg-transparent border-[#2a2a2a] text-neutral-400 hover:text-white"
                onClick={() => setPreviewFile(null)}
              >
                Fechar
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir no Drive
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
