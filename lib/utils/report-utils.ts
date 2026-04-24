import type { DriveFile } from "@/lib/types/drive"
import { buildDriveReportCsv, formatDriveSize, formatDriveDate, isDriveFolder } from "@/lib/utils/drive-utils"

export type DriveReport = {
  totalFiles: number
  totalFolders: number
  totalSize: number
  lastUpdated?: string
  csvContent: string
  summary: string
  rows: Array<Record<string, string>>
}

export function buildDriveReport(files: DriveFile[]): DriveReport {
  const totalFiles = files.filter((file) => !isDriveFolder(file)).length
  const totalFolders = files.filter((file) => isDriveFolder(file)).length
  const totalSize = files.reduce((sum, file) => sum + (file.size ?? 0), 0)
  const lastUpdated = files
    .map((file) => file.modifiedTime)
    .filter(Boolean)
    .sort()
    .reverse()[0]

  return {
    totalFiles,
    totalFolders,
    totalSize,
    lastUpdated,
    csvContent: buildDriveReportCsv(files),
    summary: `${totalFiles} arquivos, ${totalFolders} pastas`,
    rows: files.map((file) => ({
      Nome: file.name,
      Tipo: isDriveFolder(file) ? "Pasta" : "Arquivo",
      Tamanho: formatDriveSize(file.size),
      Modificado: formatDriveDate(file.modifiedTime),
      Link: file.webViewLink ?? "",
    })),
  }
}
