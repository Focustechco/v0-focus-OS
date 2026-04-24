"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, RefreshCw } from "lucide-react"
import { DriveFileBrowser } from "@/components/drive/DriveFileBrowser"
import { DriveUploadPanel } from "@/components/drive/DriveUploadPanel"
import { DriveReportPanel } from "@/components/drive/DriveReportPanel"
import { useDriveAuth } from "@/lib/hooks/use-drive-auth"
import { useDriveFiles } from "@/lib/hooks/use-drive-files"
import { useDriveUpload } from "@/lib/hooks/use-drive-upload"
import { getDriveDownloadUrl, createDriveFolder } from "@/lib/services/drive-api"
import { buildDriveReportCsv } from "@/lib/utils/drive-utils"
import { useToast } from "@/hooks/use-toast"
import type { DriveFile } from "@/lib/types/drive"

const TABS = [
  { id: "files", label: "Arquivos" },
  { id: "upload", label: "Upload" },
  { id: "report", label: "Relatório" },
] as const

type TabId = (typeof TABS)[number]["id"]

export function DriveModule() {
  const { isAuthenticated, isLoading: authLoading, connect, disconnect, refresh: refreshAuth } = useDriveAuth()
  const [activeTab, setActiveTab] = useState<TabId>("files")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [currentFolderId, setCurrentFolderId] = useState("root")
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: "Meu Drive" }])
  const { rawFiles, files, search, setSearch, isLoading, refresh: refreshFiles } = useDriveFiles(currentFolderId)
  const { queue, addFiles, uploadAll, removeItem, clearCompleted, hasPending } = useDriveUpload()
  const { toast } = useToast()

  const currentFolderName = useMemo(
    () => breadcrumbs[breadcrumbs.length - 1]?.name || "Meu Drive",
    [breadcrumbs],
  )

  const handleFolderClick = useCallback(
    (file: DriveFile) => {
      setCurrentFolderId(file.id)
      setBreadcrumbs((current) => [...current, { id: file.id, name: file.name }])
    },
    [],
  )

  const handleBreadcrumbClick = useCallback((index: number) => {
    const nextBreadcrumbs = breadcrumbs.slice(0, index + 1)
    setBreadcrumbs(nextBreadcrumbs)
    setCurrentFolderId(nextBreadcrumbs[index]?.id || "root")
  }, [breadcrumbs])

  const handleCreateFolder = useCallback(async () => {
    const folderName = window.prompt("Nome da nova pasta:")
    if (!folderName) return

    try {
      await createDriveFolder(currentFolderId, folderName)
      await refreshFiles()
      toast({ type: "success", title: `Pasta “${folderName}” criada com sucesso.` })
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

  // When connection becomes active, refresh file list
  useEffect(() => {
    if (isConnected) refreshFiles()
  }, [isConnected, refreshFiles])

  return (
    <div className="flex flex-col h-full bg-[#080808] text-neutral-100">
      <div className="flex flex-col gap-4 border-b border-neutral-800 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">Google Drive</p>
            <p className="text-sm text-neutral-400">Acesse, gerencie e envie arquivos diretamente para o seu Drive conectado.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={isConnected ? disconnect : connect}
              className="rounded-2xl bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#ff9a32]"
            >
              {isConnected ? "Desconectar" : authLoading ? "Verificando..." : "Conectar ao Drive"}
            </button>
            {isConnected ? (
              <button
                type="button"
                onClick={refreshAuth}
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 bg-[#111111] px-4 py-2 text-sm text-neutral-100 hover:border-[#FF6B00] transition"
              >
                <RefreshCw className="w-4 h-4" /> Recarregar status
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Conexão</p>
            <p className="mt-3 text-lg font-semibold text-white">{isConnected ? "Ativado" : "Desconectado"}</p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Pasta ativa</p>
            <p className="mt-3 text-lg font-semibold text-white">{currentFolderName}</p>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Arquivo(s)</p>
            <p className="mt-3 text-lg font-semibold text-white">{rawFiles.length}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-neutral-800 bg-[#080808] px-4 py-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm transition ${activeTab === tab.id ? "bg-[#FF6B00] text-black" : "bg-[#111111] text-neutral-300 hover:bg-[#1B1B1B]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {!isConnected ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-neutral-400">
            <CheckCircle2 className="h-14 w-14 text-[#FF6B00]" />
            <p className="text-lg font-semibold text-white">Conecte seu Google Drive para começar</p>
            <p className="max-w-xl text-sm text-neutral-500">
              Depois de conectado, você poderá navegar pelas pastas, enviar arquivos e gerar relatórios diretamente do Drive.
            </p>
            <button
              type="button"
              onClick={connect}
              className="rounded-2xl bg-[#FF6B00] px-6 py-3 text-sm font-semibold text-black"
            >
              Conectar ao Drive
            </button>
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            {activeTab === "files" && (
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
              />
            )}

            {activeTab === "upload" && (
              <DriveUploadPanel
                queue={queue}
                addFiles={addFiles}
                uploadAll={handleUploadAll}
                clearCompleted={clearCompleted}
                hasPending={hasPending}
                currentFolderName={currentFolderName}
                currentFolderId={currentFolderId}
              />
            )}

            {activeTab === "report" && <DriveReportPanel files={rawFiles} onDownloadCsv={handleDownloadReport} />}
          </div>
        )}
      </div>
    </div>
  )
}
