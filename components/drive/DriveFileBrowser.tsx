"use client"

import { Search, LayoutGrid, LayoutList, Folder, Download, FolderPlus } from "lucide-react"
import type { DriveFile } from "@/lib/types/drive"
import { formatDriveSize, formatDriveDate, isDriveFolder } from "@/lib/utils/drive-utils"

interface DriveFileBrowserProps {
  files: DriveFile[]
  loading: boolean
  search: string
  setSearch: (value: string) => void
  viewMode: "list" | "grid"
  setViewMode: (value: "list" | "grid") => void
  breadcrumbs: Array<{ id: string; name: string }>
  onBreadcrumbClick: (index: number) => void
  onFolderClick: (file: DriveFile) => void
  onFileOpen: (file: DriveFile) => void
  onCreateFolder: () => Promise<void>
  onRefresh: () => Promise<void>
}

export function DriveFileBrowser({
  files,
  loading,
  search,
  setSearch,
  viewMode,
  setViewMode,
  breadcrumbs,
  onBreadcrumbClick,
  onFolderClick,
  onFileOpen,
  onCreateFolder,
  onRefresh,
}: DriveFileBrowserProps) {
  return (
    <div className="flex flex-col h-full bg-[#080808] text-sm text-neutral-100">
      <div className="flex flex-col gap-3 p-4 border-b border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 uppercase tracking-[0.18em] font-semibold">
              {breadcrumbs.map((crumb, index) => (
                <button
                  key={crumb.id}
                  onClick={() => onBreadcrumbClick(index)}
                  className={`transition-colors hover:text-[#FF6B00] ${index === breadcrumbs.length - 1 ? "text-white font-bold" : "text-neutral-500"}`}
                >
                  {crumb.name}
                  {index < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
                </button>
              ))}
            </div>
            <div className="text-xs text-neutral-400">Navegue nas pastas e arquivos do Google Drive conectado.</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRefresh}
              className="px-3 py-2 rounded-lg border border-neutral-700 text-xs text-neutral-200 hover:border-[#FF6B00] hover:text-[#FF6B00] transition"
            >
              Atualizar
            </button>
            <button
              onClick={onCreateFolder}
              className="px-3 py-2 rounded-lg border border-neutral-700 text-xs text-neutral-200 hover:border-[#FF6B00] hover:text-[#FF6B00] transition flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" /> Nova pasta
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar arquivos..."
              className="w-full rounded-xl border border-neutral-800 bg-[#101014] py-2 pl-10 pr-3 text-sm text-neutral-100 outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-xl p-2 border ${viewMode === "list" ? "border-[#FF6B00] bg-[#161616] text-[#FF6B00]" : "border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}
              aria-label="Modo lista"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-xl p-2 border ${viewMode === "grid" ? "border-[#FF6B00] bg-[#161616] text-[#FF6B00]" : "border-neutral-800 text-neutral-400 hover:border-neutral-600"}`}
              aria-label="Modo grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        {loading ? (
          <div className="flex h-full items-center justify-center py-20">
            <span className="text-sm text-[#FF6B00]">Carregando arquivos...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-20 text-center text-neutral-500">
            <Folder className="w-12 h-12" />
            <p className="text-sm font-medium text-neutral-200">Nenhum arquivo encontrado nesta pasta.</p>
            <p className="text-xs">Use o botão “Nova pasta” ou arraste um arquivo para enviar.</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-[#0D0D0D] text-neutral-400 text-[11px] uppercase tracking-[0.18em]">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3 w-24">Tipo</th>
                  <th className="p-3 w-28">Tamanho</th>
                  <th className="p-3 w-40">Última modificação</th>
                  <th className="p-3 w-24 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-neutral-800 hover:bg-[#101014] cursor-pointer">
                    <td className="p-3" onClick={() => (isDriveFolder(file) ? onFolderClick(file) : onFileOpen(file))}>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-200 font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-neutral-400">{isDriveFolder(file) ? "Pasta" : "Arquivo"}</td>
                    <td className="p-3 text-neutral-400">{formatDriveSize(file.size)}</td>
                    <td className="p-3 text-neutral-400">{formatDriveDate(file.modifiedTime)}</td>
                    <td className="p-3 text-right">
                      {!isDriveFolder(file) && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onFileOpen(file)
                          }}
                          className="text-neutral-400 hover:text-[#FF6B00]"
                          aria-label="Abrir arquivo"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => (isDriveFolder(file) ? onFolderClick(file) : onFileOpen(file))}
                className="group rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-4 text-left transition hover:border-[#FF6B00]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-2xl bg-[#141414] p-3">
                    <Folder className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-neutral-100">{file.name}</p>
                    <p className="text-neutral-500">{isDriveFolder(file) ? "Pasta" : "Arquivo"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{formatDriveSize(file.size)}</span>
                  <span>{formatDriveDate(file.modifiedTime)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
