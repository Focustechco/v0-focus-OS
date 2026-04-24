"use client"

import { useCallback, useMemo, useState } from "react"
import { uploadDriveFile } from "@/lib/services/drive-api"
import type { DriveFile } from "@/lib/types/drive"

export type DriveUploadItem = {
  id: string
  file: File
  progress: number
  status: "idle" | "uploading" | "done" | "error"
  error?: string
  fileReference?: DriveFile
}

function createUploadId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`
}

export function useDriveUpload() {
  const [queue, setQueue] = useState<DriveUploadItem[]>([])

  const addFiles = useCallback((files: FileList | File[]) => {
    const nextFiles = Array.from(files).map((file) => ({
      id: createUploadId(file),
      file,
      progress: 0,
      status: "idle" as const,
      error: undefined,
    }))

    setQueue((current) => [...current, ...nextFiles])
  }, [])

  const removeItem = useCallback((id: string) => {
    setQueue((current) => current.filter((item) => item.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setQueue((current) => current.filter((item) => item.status !== "done"))
  }, [])

  const uploadAll = useCallback(
    async (folderId: string) => {
      for (const item of queue) {
        if (item.status === "done" || item.status === "uploading") {
          continue
        }

        setQueue((current) =>
          current.map((currentItem) =>
            currentItem.id === item.id
              ? { ...currentItem, status: "uploading", progress: 0, error: undefined }
              : currentItem,
          ),
        )

        try {
          await uploadDriveFile(item.file, folderId, (progress) => {
            setQueue((current) =>
              current.map((currentItem) =>
                currentItem.id === item.id
                  ? { ...currentItem, progress: Math.min(100, Math.round(progress)) }
                  : currentItem,
              ),
            )
          })

          setQueue((current) =>
            current.map((currentItem) =>
              currentItem.id === item.id
                ? { ...currentItem, status: "done", progress: 100 }
                : currentItem,
            ),
          )
        } catch (error: any) {
          setQueue((current) =>
            current.map((currentItem) =>
              currentItem.id === item.id
                ? {
                    ...currentItem,
                    status: "error",
                    error: error?.message || "Falha ao enviar arquivo",
                  }
                : currentItem,
            ),
          )
        }
      }
    },
    [queue],
  )

  return {
    queue,
    addFiles,
    uploadAll,
    removeItem,
    clearCompleted,
    hasPending: useMemo(
      () => queue.some((item) => item.status === "idle" || item.status === "error"),
      [queue],
    ),
  }
}
