"use client"

import { useMemo, useRef, type DragEvent } from "react"
import { UploadCloud } from "lucide-react"
import { formatDriveSize } from "@/lib/utils/drive-utils"
import type { DriveUploadItem } from "@/lib/hooks/use-drive-upload"

interface DriveUploadPanelProps {
  queue: DriveUploadItem[]
  addFiles: (files: FileList | File[]) => void
  uploadAll: (folderId: string) => Promise<void>
  clearCompleted: () => void
  hasPending: boolean
  currentFolderName: string
  currentFolderId: string
}

export function DriveUploadPanel({
  queue,
  addFiles,
  uploadAll,
  clearCompleted,
  hasPending,
  currentFolderName,
  currentFolderId,
}: DriveUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const pendingCount = useMemo(
    () => queue.filter((item) => item.status === "idle" || item.status === "error").length,
    [queue],
  )

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    addFiles(files)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    handleFiles(files)
  }

  return (
    <div className="flex flex-col h-full bg-[#080808] text-neutral-100">
      <div className="p-4 border-b border-neutral-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Enviar para o Drive</p>
            <p className="text-xs text-neutral-500">Selecione arquivos e envie diretamente para a pasta atual.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-neutral-700 bg-[#111111] px-4 py-2 text-xs text-neutral-100 hover:border-[#FF6B00] transition"
            >
              Selecionar arquivos
            </button>
            <button
              type="button"
              onClick={() => uploadAll(currentFolderId)}
              disabled={!hasPending}
              className="rounded-xl bg-[#FF6B00] px-4 py-2 text-xs font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar todos ({pendingCount})
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex-1 p-8"
      >
        <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[34px] border border-dashed border-neutral-700 bg-[#0B0B0B] p-8 text-center">
          <UploadCloud className="mb-4 h-10 w-10 text-[#FF6B00]" />
          <p className="text-sm font-semibold text-neutral-100">Arraste e solte arquivos aqui</p>
          <p className="mt-2 text-xs text-neutral-500">Os arquivos serão enviados para <span className="font-semibold text-white">{currentFolderName}</span>.</p>
          <p className="mt-4 text-[11px] text-neutral-500">Suporta uploads múltiplos. Clique no botão acima para escolher do seu computador.</p>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center justify-between gap-3 text-xs text-neutral-400">
          <span>Fila de upload ({queue.length})</span>
          <button
            type="button"
            onClick={clearCompleted}
            className="text-[#FF6B00] hover:text-white"
          >
            Limpar concluídos
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="rounded-3xl border border-neutral-800 bg-[#0B0B0B] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-100">{item.file.name}</p>
                  <p className="text-xs text-neutral-500">{formatDriveSize(item.file.size)}</p>
                </div>
                <span className="text-[11px] text-neutral-400 uppercase">{item.status}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-[#121212] overflow-hidden">
                <div className="h-full rounded-full bg-[#FF6B00] transition-all" style={{ width: `${item.progress}%` }} />
              </div>
              {item.error ? (
                <p className="mt-2 text-[11px] text-pink-500">{item.error}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
