"use client"

import { useAsaas } from "@/lib/hooks/use-asaas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MoreVertical, 
  Download, 
  Send, 
  FileCheck, 
  Loader2,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { ModalEnviarBoleto } from "./modal-enviar-boleto"
import { ModalAnexarNF } from "./modal-anexar-nf"

export function TabelaCobrancas() {
  const { cobrancas, isLoading, buscarBoletoPdf } = useAsaas()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isModalEnviarOpen, setIsModalEnviarOpen] = useState(false)
  const [isModalNFOpen, setIsModalNFOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-orange-500 gap-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs tracking-widest animate-pulse">SYNCING_ASAAS_DATA...</span>
      </div>
    )
  }

  const handleDownload = async (id: string) => {
    try {
      const url = await buscarBoletoPdf(id)
      window.open(url, '_blank')
    } catch (error) {
      console.error("Erro ao baixar boleto:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'CONFIRMED':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'OVERDUE':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'PENDING':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'
    }
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-[#1a1a1a] bg-[#090909]">
            <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider">ID</th>
            <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider">CLIENTE</th>
            <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider">VALOR</th>
            <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider">VENCIMENTO</th>
            <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider">STATUS</th>
            <th className="text-right p-4 text-neutral-500 font-mono font-medium tracking-wider">ACOES</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1a]">
          {cobrancas.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-neutral-600 italic">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>NO_RECORDS_FOUND_IN_ASAAS_DB</span>
                </div>
              </td>
            </tr>
          ) : (
            cobrancas.map((cob: any) => (
              <tr key={cob.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-4 font-mono text-orange-500/70">{cob.id.substring(0, 8)}...</td>
                <td className="p-4 text-foreground font-bold">CLIENTE_{cob.customer.substring(0, 4)}</td>
                <td className="p-4 font-mono">R$ {cob.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="p-4 font-mono text-neutral-400">{cob.dueDate}</td>
                <td className="p-4">
                  <Badge variant="outline" className={`text-[8px] uppercase tracking-widest ${getStatusColor(cob.status)}`}>
                    {cob.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-500 hover:text-orange-500">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-[#1a1a1a] text-neutral-400 font-mono">
                      <DropdownMenuItem className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" onClick={() => handleDownload(cob.id)}>
                        <Download className="w-3 h-3 mr-2" /> DOWNLOAD_PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" onClick={() => { setSelectedId(cob.id); setIsModalEnviarOpen(true); }}>
                        <Send className="w-3 h-3 mr-2" /> ENVIAR_EMAIL
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" onClick={() => { setSelectedId(cob.id); setIsModalNFOpen(true); }}>
                        <FileCheck className="w-3 h-3 mr-2" /> ANEXAR_NF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ModalEnviarBoleto 
        open={isModalEnviarOpen} 
        onOpenChange={setIsModalEnviarOpen} 
        cobrancaId={selectedId || ''} 
      />
      
      <ModalAnexarNF 
        open={isModalNFOpen} 
        onOpenChange={setIsModalNFOpen} 
        cobrancaId={selectedId || ''} 
      />
    </div>
  )
}
