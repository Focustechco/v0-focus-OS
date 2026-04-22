import React from 'react'
import { TipoRelatorio } from '../types/report.types'
import { Button } from '@/components/ui/button'
import { User, Users, Code, Download, Send, Loader2 } from 'lucide-react'

interface ReportHeaderProps {
  projeto: any
  tipoAtivo: TipoRelatorio
  onChangeTipo: (tipo: TipoRelatorio) => void
  onDownloadPDF: () => void
  isDownloading?: boolean
}

export default function ReportHeader({ projeto, tipoAtivo, onChangeTipo, onDownloadPDF, isDownloading }: ReportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Tabs */}
      <div className="flex items-center bg-card rounded-lg p-1 border border-border w-full sm:w-auto">
        <button
          onClick={() => onChangeTipo('cliente')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm transition-colors ${
            tipoAtivo === 'cliente' 
              ? 'bg-[#3b82f6]/20 text-[#3b82f6] font-medium' 
              : 'text-neutral-500 hover:text-foreground'
          }`}
        >
          <User className="w-4 h-4" />
          Cliente
        </button>
        <button
          onClick={() => onChangeTipo('equipe')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm transition-colors ${
            tipoAtivo === 'equipe' 
              ? 'bg-[#f97316]/20 text-[#f97316] font-medium' 
              : 'text-neutral-500 hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          Equipe
        </button>
        <button
          onClick={() => onChangeTipo('techlead')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm transition-colors ${
            tipoAtivo === 'techlead' 
              ? 'bg-[#a855f7]/20 text-[#a855f7] font-medium' 
              : 'text-neutral-500 hover:text-foreground'
          }`}
        >
          <Code className="w-4 h-4" />
          Tech Lead
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <Button 
          variant="outline" 
          className="bg-card border-border text-foreground hover:bg-accent/10 disabled:opacity-50"
          onClick={onDownloadPDF}
          disabled={isDownloading || !projeto}
        >
          {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          PDF
        </Button>
        <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
          <Send className="w-4 h-4 mr-2" />
          Enviar Relatório
        </Button>
      </div>
    </div>
  )
}

