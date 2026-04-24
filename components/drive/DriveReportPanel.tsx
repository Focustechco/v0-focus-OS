"use client"

import { Download, Folder, FileText, ShieldCheck } from "lucide-react"
import { buildDriveReport } from "@/lib/utils/report-utils"
import { formatDriveDate, formatDriveSize, isDriveFolder } from "@/lib/utils/drive-utils"
import type { DriveFile } from "@/lib/types/drive"

interface DriveReportPanelProps {
  files: DriveFile[]
  onDownloadCsv: () => void
}

export function DriveReportPanel({ files, onDownloadCsv }: DriveReportPanelProps) {
  const report = buildDriveReport(files)

  return (
    <div className="flex flex-col h-full bg-[#080808] text-neutral-100">
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Relatório de arquivos</p>
            <p className="text-xs text-neutral-500">Resumo rápido dos arquivos do Drive dentro da pasta atual.</p>
          </div>
          <button
            type="button"
            onClick={onDownloadCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] px-4 py-2 text-xs font-semibold text-black"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
        <div className="rounded-[28px] border border-neutral-800 bg-[#0B0B0B] p-5">
          <div className="flex items-center gap-3 text-sm font-semibold text-white mb-4">
            <ShieldCheck className="w-5 h-5 text-[#FF6B00]" /> Panorama
          </div>
          <div className="space-y-4 text-sm text-neutral-300">
            <div className="flex justify-between gap-4">
              <span>Total de itens</span>
              <span>{report.totalFiles + report.totalFolders}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Arquivos</span>
              <span>{report.totalFiles}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Pastas</span>
              <span>{report.totalFolders}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Tamanho total</span>
              <span>{formatDriveSize(report.totalSize)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Última modificação</span>
              <span>{report.lastUpdated ? formatDriveDate(report.lastUpdated) : "--"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-neutral-800 bg-[#0B0B0B] p-5">
          <div className="flex items-center gap-3 text-sm font-semibold text-white mb-4">
            <FileText className="w-5 h-5 text-[#FF6B00]" /> Detalhes
          </div>
          <div className="space-y-4 text-sm text-neutral-300">
            {files.slice(0, 5).map((file) => (
              <div key={file.id} className="rounded-2xl border border-neutral-800 bg-[#121212] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-[11px] text-neutral-500">{isDriveFolder(file) ? "Pasta" : "Arquivo"}</p>
                  </div>
                  <span className="text-[11px] text-neutral-400">{formatDriveSize(file.size)}</span>
                </div>
                <p className="mt-2 text-[11px] text-neutral-500">{formatDriveDate(file.modifiedTime)}</p>
              </div>
            ))}
            {files.length === 0 && <p className="text-sm text-neutral-500">Nenhum arquivo para gerar relatório.</p>}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-800 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4" />
          <span>Dados disponíveis para exportação de relatório.</span>
        </div>
      </div>
    </div>
  )
}
