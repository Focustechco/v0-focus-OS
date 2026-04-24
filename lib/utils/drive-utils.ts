import type { DriveFile } from "@/lib/types/drive"

export function formatDriveSize(bytes?: number) {
  if (bytes === undefined || bytes === null) {
    return "--"
  }

  if (bytes === 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function formatDriveDate(iso?: string) {
  if (!iso) return "--"

  const date = new Date(iso)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function isDriveFolder(file: DriveFile) {
  return file.mimeType === "application/vnd.google-apps.folder"
}

export function buildDriveReportCsv(files: DriveFile[]) {
  const header = ["Nome", "Tipo", "Tamanho", "Modificado", "Link"]
  const rows = files.map((file) => [
    file.name,
    isDriveFolder(file) ? "Pasta" : "Arquivo",
    formatDriveSize(file.size),
    formatDriveDate(file.modifiedTime),
    file.webViewLink || "",
  ])

  const escapeCell = (value: string) => {
    const escaped = value.replace(/"/g, '""')
    return `"${escaped}"`
  }

  return [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n")
}
