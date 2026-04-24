import type { DriveFile } from "@/lib/types/drive"

type JsonResponse<T> = T & { error?: string }

export async function fetchJson<T = unknown>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init)
  const payload = (await response.json()) as JsonResponse<T>

  if (!response.ok) {
    throw new Error(payload.error || response.statusText || "Erro ao acessar Drive")
  }

  return payload as T
}

export type DriveAuthStatus = {
  connected: boolean
}

export async function getDriveStatus() {
  return fetchJson<DriveAuthStatus>("/api/drive/status")
}

export async function getDriveAuthUrl() {
  return fetchJson<{ authUrl: string }>("/api/drive/auth")
}

export async function disconnectDrive() {
  return fetchJson<{ disconnected: boolean }>("/api/drive/status", {
    method: "DELETE",
  })
}

export async function getDriveFiles(folderId: string = "root") {
  return fetchJson<{ files: DriveFile[] }>(`/api/drive/files?folderId=${encodeURIComponent(folderId)}`)
}

export async function createDriveFolder(parentId: string, name: string) {
  return fetchJson<{ folder: DriveFile }>("/api/drive/folder/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parentId, name }),
  })
}

export async function getDriveDownloadUrl(fileId: string) {
  return fetchJson<{ downloadUrl: string; viewUrl?: string }>(
    `/api/drive/download?fileId=${encodeURIComponent(fileId)}`,
  )
}

export function uploadDriveFile(
  file: File,
  folderId: string,
  onProgress?: (progress: number) => void,
): Promise<{ file: DriveFile }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/drive/upload")

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress?.((event.loaded / event.total) * 100)
    }

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload)
        } else {
          reject(new Error(payload.error || xhr.statusText || "Falha no upload"))
        }
      } catch (error) {
        reject(new Error("Resposta inválida do servidor"))
      }
    }

    xhr.onerror = () => {
      reject(new Error("Erro de rede ao enviar o arquivo"))
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("folderId", folderId || "root")
    xhr.send(formData)
  })
}
