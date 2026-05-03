"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"

import { RefreshCw, FolderIcon, FileText, Clock, Share2, Plus, Wifi, WifiOff } from "lucide-react"
import { DriveFileBrowser } from "@/components/drive/DriveFileBrowser"
import { DriveUploadPanel } from "@/components/drive/DriveUploadPanel"
import { DriveReportPanel } from "@/components/drive/DriveReportPanel"
import { useDriveAuth } from "@/lib/hooks/use-drive-auth"
import { useDriveFiles } from "@/lib/hooks/use-drive-files"
import { useDriveUpload } from "@/lib/hooks/use-drive-upload"
import { getDriveDownloadUrl, createDriveFolder } from "@/lib/services/drive-api"
import { buildDriveReportCsv, isDriveFolder } from "@/lib/utils/drive-utils"
import { useToast } from "@/hooks/use-toast"
import type { DriveFile } from "@/lib/types/drive"

const MIME_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "folder", label: "Pastas", mime: "application/vnd.google-apps.folder" },
  { id: "doc", label: "Docs", mime: "application/vnd.google-apps.document" },
  { id: "sheet", label: "Sheets", mime: "application/vnd.google-apps.spreadsheet" },
  { id: "pdf", label: "PDF", mime: "application/pdf" },
  { id: "image", label: "Imagens", mime: "image/" },
] as const

export function DriveModule() {
  const { isAuthenticated, isLoading: authLoading, connect, disconnect, refresh: refreshAuth } = useDriveAuth()
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [currentFolderId, setCurrentFolderId] = useState("root")
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: "Meu Drive" }])
  const [mimeFilter, setMimeFilter] = useState("all")
  const { rawFiles, files: searchedFiles, search, setSearch, isLoading, isError, error, refresh: refreshFiles } = useDriveFiles(currentFolderId)
  const { queue, addFiles, uploadAll, removeItem, clearCompleted, hasPending } = useDriveUpload()
  const { toast } = useToast()

  const currentFolderName = useMemo(
    () => breadcrumbs[breadcrumbs.length - 1]?.name || "Meu Drive",
    [breadcrumbs],
  )

  // Filtered files by mimeType
  const files = useMemo(() => {
    if (mimeFilter === "all") return searchedFiles
    const filter = MIME_FILTERS.find(f => f.id === mimeFilter)
    if (!filter || !("mime" in filter)) return searchedFiles
    return searchedFiles.filter(f =>
      mimeFilter === "image" ? f.mimeType.startsWith("image/") : f.mimeType === filter.mime
    )
  }, [searchedFiles, mimeFilter])

  // Dynamic metrics
  const metrics = useMemo(() => {
    const folders = rawFiles.filter(f => isDriveFolder(f)).length
    const totalFiles = rawFiles.filter(f => !isDriveFolder(f)).length
    const today = new Date().toDateString()
    const modifiedToday = rawFiles.filter(f => f.modifiedTime && new Date(f.modifiedTime).toDateString() === today).length
    const shared = rawFiles.filter(f => f.shared).length
    return { folders, totalFiles, modifiedToday, shared }
  }, [rawFiles])

  const handleFolderClick = useCallback(
    (file: DriveFile) => {
      setCurrentFolderId(file.id)
      setBreadcrumbs((current) => [...current, { id: file.id, name: file.name }])
      setMimeFilter("all")
    },
    [],
  )

  const handleBreadcrumbClick = useCallback((index: number) => {
    const nextBreadcrumbs = breadcrumbs.slice(0, index + 1)
    setBreadcrumbs(nextBreadcrumbs)
    setCurrentFolderId(nextBreadcrumbs[index]?.id || "root")
    setMimeFilter("all")
  }, [breadcrumbs])

  const handleCreateFolder = useCallback(async () => {
    const folderName = window.prompt("Nome da nova pasta:")
    if (!folderName) return
    try {
      await createDriveFolder(currentFolderId, folderName)
      await refreshFiles()
      toast({ type: "success", title: `Pasta "${folderName}" criada com sucesso.` })
    } catch (error: any) {
      toast({ type: "error", title: error?.message || "Falha ao criar pasta no Drive" })
    }
  }, [currentFolderId, refreshFiles, toast])

  const handleFileOpen = useCallback(
    async (file: DriveFile) => {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        handleFolderClick(file)
        return
      }
      try {
        const result = await getDriveDownloadUrl(file.id)
        window.open(result.viewUrl ?? result.downloadUrl, "_blank")
      } catch (error: any) {
        toast({ type: "error", title: error?.message || "Não foi possível abrir o arquivo" })
      }
    },
    [handleFolderClick, toast],
  )

  const handleRefreshFiles = useCallback(async () => {
    await refreshFiles()
    toast({ type: "success", title: "Lista de arquivos atualizada" })
  }, [refreshFiles, toast])

  const handleUploadAll = useCallback(async () => {
    try {
      await uploadAll(currentFolderId)
      await refreshFiles()
      toast({ type: "success", title: "Uploads concluídos" })
    } catch (error: any) {
      toast({ type: "error", title: error?.message || "Erro ao enviar arquivos" })
    }
  }, [currentFolderId, refreshFiles, toast, uploadAll])

  const handleDownloadReport = useCallback(() => {
    const csv = buildDriveReportCsv(rawFiles)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `drive-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, [rawFiles])

  const isConnected = isAuthenticated && !authLoading

  useEffect(() => {
    if (isConnected) refreshFiles()
  }, [isConnected, refreshFiles])

  return (
    <PageWrapper title="Documentos">
      <div className="flex flex-col h-full bg-[#0f0f0f] text-neutral-100">

        {/* ─── BARRA DE AÇÕES E MÉTRICAS ─── */}
        <div className="flex flex-col gap-4 border-b border-[#222] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status de Conexão */}
            <div className="flex items-center gap-3">
              {isConnected ? (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-medium">
                  <Wifi className="w-3 h-3" /> Drive conectado
                </span>
              ) : (
                <button
                  onClick={connect}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e87c2a]/10 border border-[#e87c2a]/30 text-[#e87c2a] text-[11px] font-bold hover:bg-[#e87c2a]/20 transition"
                >
                  <WifiOff className="w-3 h-3" /> Conectar Drive
                </button>
              )}

              {isConnected && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshFiles}
                    className="p-2 rounded-xl border border-[#222] bg-[#161616] text-neutral-400 hover:border-[#e87c2a] hover:text-[#e87c2a] transition"
                    title="Sincronizar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={disconnect}
                    className="px-3 py-1.5 rounded-xl border border-[#222] bg-[#161616] text-neutral-400 text-xs hover:border-red-500/50 hover:text-red-400 transition"
                  >
                    Desconectar
                  </button>
                </div>
              )}
            </div>
            
            {isConnected && (
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 uppercase tracking-widest font-mono">
                Pasta atual: <span className="text-white font-bold ml-1">{currentFolderName}</span>
              </div>
            )}
          </div>

          {/* ─── METRIC CARDS ─── */}
          {isConnected && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: FolderIcon, label: "Pastas", value: metrics.folders, color: "text-amber-400" },
                { icon: FileText, label: "Arquivos", value: metrics.totalFiles, color: "text-blue-400" },
                { icon: Clock, label: "Modificados hoje", value: metrics.modifiedToday, color: "text-green-400" },
                { icon: Share2, label: "Compartilhados", value: metrics.shared, color: "text-purple-400" },
              ].map(m => (
                <div key={m.label} className="rounded-2xl border border-[#222] bg-[#161616] p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-[#111] ${m.color}`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{m.value}</p>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 overflow-hidden">
          {!isConnected ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#161616] border border-[#222] flex items-center justify-center">
                <FolderIcon className="w-10 h-10 text-[#e87c2a]" />
              </div>
              <div>
                <p className="text-lg font-bold text-white mb-2">Conecte seu Google Drive</p>
                <p className="max-w-md text-sm text-neutral-500">
                  Para acessar os documentos da sua empresa, conecte sua conta do Google Drive. Seus arquivos serão listados automaticamente.
                </p>
              </div>
              <button
                onClick={connect}
                className="rounded-2xl bg-[#e87c2a] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#e87c2a]/10 hover:bg-[#e87c2a]/90 transition"
              >
                Conectar ao Google Drive
              </button>
            </div>
          ) : isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#161616] border border-[#222] flex items-center justify-center">
                <WifiOff className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-red-400 mb-2">Erro de Conexão com o Drive</p>
                <p className="max-w-md text-sm text-neutral-500">
                  A conexão com o Google Drive falhou. O seu token pode ter expirado ou as credenciais (.env) estão inválidas.
                </p>
                <p className="mt-2 text-xs text-neutral-600 bg-[#111] p-2 rounded-lg border border-[#222] inline-block">
                  Erro: {error?.message || "Não autorizado"}
                </p>
              </div>
              <button
                onClick={disconnect}
                className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-500/20 transition mt-2"
              >
                Desconectar e Tentar Novamente
              </button>
            </div>
          ) : (
            <DriveFileBrowser
              files={files}
              loading={isLoading}
              search={search}
              setSearch={setSearch}
              viewMode={viewMode}
              setViewMode={setViewMode}
              breadcrumbs={breadcrumbs}
              onBreadcrumbClick={handleBreadcrumbClick}
              onFolderClick={handleFolderClick}
              onFileOpen={handleFileOpen}
              onCreateFolder={handleCreateFolder}
              onRefresh={handleRefreshFiles}
              mimeFilter={mimeFilter}
              setMimeFilter={setMimeFilter}
              mimeFilters={MIME_FILTERS}
            />
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
