"use client"

import {
  Search, LayoutGrid, LayoutList, Folder, FolderPlus,
  ChevronRight, MoreVertical, ExternalLink, Copy, RefreshCw,
  FileText, FileSpreadsheet, Presentation, Image, File as FileIcon
} from "lucide-react"
import type { DriveFile } from "@/lib/types/drive"
import { formatDriveSize, formatDriveDate, isDriveFolder } from "@/lib/utils/drive-utils"

// ─── MIME TYPE HELPERS ──────────────────────────────────────────────────────

function getMimeLabel(mime: string): string {
  if (mime === "application/vnd.google-apps.folder") return "Pasta"
  if (mime === "application/vnd.google-apps.document") return "Doc"
  if (mime === "application/vnd.google-apps.spreadsheet") return "Sheet"
  if (mime === "application/vnd.google-apps.presentation") return "Slides"
  if (mime === "application/pdf") return "PDF"
  if (mime.startsWith("image/")) return "Imagem"
  if (mime.startsWith("video/")) return "Vídeo"
  return "Arquivo"
}

function getMimeIcon(mime: string) {
  if (mime === "application/vnd.google-apps.folder") return Folder
  if (mime === "application/vnd.google-apps.document") return FileText
  if (mime === "application/vnd.google-apps.spreadsheet") return FileSpreadsheet
  if (mime === "application/vnd.google-apps.presentation") return Presentation
  if (mime.startsWith("image/")) return Image
  return FileIcon
}

function getMimeColor(mime: string): { bg: string; text: string; dot: string } {
  if (mime === "application/vnd.google-apps.folder") return { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" }
  if (mime === "application/vnd.google-apps.document") return { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" }
  if (mime === "application/vnd.google-apps.spreadsheet") return { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400" }
  if (mime === "application/vnd.google-apps.presentation") return { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" }
  if (mime === "application/pdf") return { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" }
  if (mime.startsWith("image/")) return { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" }
  return { bg: "bg-neutral-500/10", text: "text-neutral-400", dot: "bg-neutral-400" }
}

// ─── INTERFACES ─────────────────────────────────────────────────────────────

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
  mimeFilter: string
  setMimeFilter: (v: string) => void
  mimeFilters: readonly { id: string; label: string }[]
}

// ─── FOLDER CARD ────────────────────────────────────────────────────────────

function FolderCard({ file, onClick }: { file: DriveFile; onClick: () => void }) {
  const isShared = file.shared
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 p-4 rounded-xl border border-[#222] bg-[#161616] hover:border-[#e87c2a]/50 transition-all text-left w-full"
    >
      <div className={`p-2.5 rounded-xl ${isShared ? "bg-green-500/10" : "bg-[#111]"}`}>
        <Folder className={`w-5 h-5 ${isShared ? "text-green-400" : "text-neutral-500"}`} />
      </div>
      <span className="flex-1 text-[13px] font-medium text-neutral-200 uppercase tracking-wide truncate group-hover:text-white transition-colors">
        {file.name}
      </span>
      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-[#e87c2a] transition-colors" />
    </button>
  )
}

// ─── FILE CARD ──────────────────────────────────────────────────────────────

function FileCard({ file, onOpen }: { file: DriveFile; onOpen: () => void }) {
  const Icon = getMimeIcon(file.mimeType)
  const colors = getMimeColor(file.mimeType)
  const label = getMimeLabel(file.mimeType)

  return (
    <div className="group rounded-xl border border-[#222] bg-[#161616] overflow-hidden hover:border-[#e87c2a]/40 transition-all">
      {/* Thumbnail area */}
      <div className={`relative h-28 ${colors.bg} flex items-center justify-center`}>
        <Icon className={`w-10 h-10 ${colors.text} opacity-60`} />
        <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text} border border-white/5 uppercase tracking-wider`}>
          {label}
        </span>
        <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
          Drive
        </span>
      </div>
      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-medium text-neutral-200 truncate" title={file.name}>{file.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-mono">{formatDriveDate(file.modifiedTime)}</span>
          <button
            onClick={onOpen}
            className="text-[10px] font-bold text-[#e87c2a] hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Abrir <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SKELETON LOADERS ───────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#222] bg-[#161616] overflow-hidden animate-pulse">
      <div className="h-28 bg-[#1a1a1a]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#222] rounded w-3/4" />
        <div className="h-2 bg-[#1a1a1a] rounded w-1/2" />
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

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
  mimeFilter,
  setMimeFilter,
  mimeFilters,
}: DriveFileBrowserProps) {
  const folders = files.filter(f => isDriveFolder(f))
  const documents = files.filter(f => !isDriveFolder(f))

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-sm text-neutral-100">
      {/* ─── TOOLBAR ─── */}
      <div className="flex flex-col gap-3 p-4 border-b border-[#222]">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-widest">
          <span className="text-neutral-500">Documentos</span>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-neutral-600" />
              <button
                onClick={() => onBreadcrumbClick(index)}
                className={`transition-colors hover:text-[#e87c2a] ${index === breadcrumbs.length - 1 ? "text-white" : "text-neutral-500"}`}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        {/* Search + filters + view toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar arquivos..."
                className="w-full rounded-xl border border-[#222] bg-[#161616] py-2 pl-10 pr-3 text-sm text-neutral-100 outline-none focus:border-[#e87c2a] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Mime type filters */}
            {mimeFilters.map(f => (
              <button
                key={f.id}
                onClick={() => setMimeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all flex-shrink-0 ${
                  mimeFilter === f.id
                    ? "bg-[#e87c2a]/10 border-[#e87c2a]/30 text-[#e87c2a]"
                    : "bg-[#161616] border-[#222] text-neutral-400 hover:border-neutral-500"
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="w-px h-6 bg-[#222] mx-1 flex-shrink-0" />

            {/* View toggle */}
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-2 border ${viewMode === "list" ? "border-[#e87c2a] bg-[#161616] text-[#e87c2a]" : "border-[#222] text-neutral-500 hover:border-neutral-500"}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-2 border ${viewMode === "grid" ? "border-[#e87c2a] bg-[#161616] text-[#e87c2a]" : "border-[#222] text-neutral-500 hover:border-neutral-500"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-[#222] mx-1 flex-shrink-0" />

            <button
              onClick={onCreateFolder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#222] bg-[#161616] text-neutral-400 text-[11px] hover:border-[#e87c2a] hover:text-[#e87c2a] transition flex-shrink-0"
            >
              <FolderPlus className="w-3.5 h-3.5" /> Nova pasta
            </button>
          </div>
        </div>
      </div>

      {/* ─── FILE LISTING ─── */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : files.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#222] flex items-center justify-center">
              <Folder className="w-8 h-8 text-neutral-600" />
            </div>
            <p className="text-sm font-medium text-neutral-300">Nenhum arquivo nesta pasta</p>
            <p className="text-xs text-neutral-500 max-w-sm">Esta pasta está vazia. Adicione arquivos pelo Google Drive ou use o botão "Nova pasta".</p>
            {breadcrumbs.length > 1 && (
              <button
                onClick={() => onBreadcrumbClick(breadcrumbs.length - 2)}
                className="px-4 py-2 rounded-xl border border-[#222] bg-[#161616] text-xs text-neutral-300 hover:border-[#e87c2a] transition"
              >
                ← Voltar
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="space-y-6">
            {/* Folders section */}
            {folders.length > 0 && (
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Pastas ({folders.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {folders.map(f => (
                    <FolderCard key={f.id} file={f} onClick={() => onFolderClick(f)} />
                  ))}
                </div>
              </section>
            )}

            {/* Files section */}
            {documents.length > 0 && (
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Arquivos ({documents.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {documents.map(f => (
                    <FileCard key={f.id} file={f} onOpen={() => onFileOpen(f)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* List view */
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-[#161616] text-neutral-500 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="p-3 rounded-tl-xl">Nome</th>
                  <th className="p-3 w-24">Tipo</th>
                  <th className="p-3 w-28">Tamanho</th>
                  <th className="p-3 w-40">Modificado</th>
                  <th className="p-3 w-24 text-right rounded-tr-xl">Ações</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const Icon = getMimeIcon(file.mimeType)
                  const colors = getMimeColor(file.mimeType)
                  const isFolder = isDriveFolder(file)
                  return (
                    <tr
                      key={file.id}
                      onClick={() => isFolder ? onFolderClick(file) : onFileOpen(file)}
                      className="border-b border-[#1a1a1a] hover:bg-[#161616] cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                            <Icon className={`w-4 h-4 ${colors.text}`} />
                          </div>
                          <span className="text-neutral-200 font-medium truncate">{file.name}</span>
                          {file.shared && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Compartilhado</span>}
                        </div>
                      </td>
                      <td className="p-3 text-neutral-500 text-xs">{getMimeLabel(file.mimeType)}</td>
                      <td className="p-3 text-neutral-500 text-xs font-mono">{formatDriveSize(file.size)}</td>
                      <td className="p-3 text-neutral-500 text-xs font-mono">{formatDriveDate(file.modifiedTime)}</td>
                      <td className="p-3 text-right">
                        {!isFolder && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onFileOpen(file) }}
                            className="text-[11px] font-bold text-[#e87c2a] hover:underline"
                          >
                            Abrir →
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global scrollbar hide */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
