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
  AlertCircle,
  Copy,
  ExternalLink
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { ModalEnviarBoleto } from "./modal-enviar-boleto"
import { ModalAnexarNF } from "./modal-anexar-nf"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "PENDENTE", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  RECEIVED: { label: "RECEBIDO", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  CONFIRMED: { label: "CONFIRMADO", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  OVERDUE: { label: "VENCIDO", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  REFUNDED: { label: "ESTORNADO", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  RECEIVED_IN_CASH: { label: "RECEB. EM ESPÉCIE", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  REFUND_REQUESTED: { label: "ESTORNO SOLICIT.", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  CHARGEBACK_REQUESTED: { label: "CHARGEBACK", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  CHARGEBACK_DISPUTE: { label: "DISPUTA", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  AWAITING_CHARGEBACK_REVERSAL: { label: "AGUARD. REVERSÃO", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  DUNNING_REQUESTED: { label: "NEGOCIAÇÃO", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  DUNNING_RECEIVED: { label: "RECEB. NEGOCIAÇÃO", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  AWAITING_RISK_ANALYSIS: { label: "ANÁLISE DE RISCO", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
}

const BILLING_TYPE_MAP: Record<string, string> = {
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão",
  PIX: "Pix",
  UNDEFINED: "—",
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

export function TabelaCobrancas() {
  const { cobrancas, isLoading, buscarBoletoPdf, buscarLinhaDigitavel } = useAsaas()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isModalEnviarOpen, setIsModalEnviarOpen] = useState(false)
  const [isModalNFOpen, setIsModalNFOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-orange-500 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-[10px] tracking-widest animate-pulse font-mono">SYNCING_ASAAS_DATA...</span>
      </div>
    )
  }

  const handleDownload = async (id: string) => {
    try {
      const url = await buscarBoletoPdf(id)
      if (url) window.open(url, '_blank')
    } catch (error) {
      console.error("Erro ao baixar boleto:", error)
    }
  }

  const handleCopyLinha = async (id: string) => {
    try {
      const linha = await buscarLinhaDigitavel(id)
      if (linha) {
        await navigator.clipboard.writeText(linha)
        alert("Linha digitável copiada!")
      }
    } catch (error) {
      console.error("Erro ao copiar linha digitável:", error)
    }
  }

  return (
    <div className="w-full">
      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-3 p-4 sm:hidden">
        {cobrancas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-neutral-600">
            <AlertCircle className="w-6 h-6 opacity-30" />
            <span className="text-xs font-mono">Nenhuma cobrança encontrada</span>
          </div>
        ) : (
          cobrancas.map((cob: any) => {
            const statusInfo = STATUS_MAP[cob.status] || { label: cob.status, color: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20" }
            const isBoleto = cob.billingType === "BOLETO"
            
            return (
              <div key={cob.id} className="bg-secondary/30 border border-border rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-orange-500/70 font-mono mb-1">#{cob.id.substring(4, 12)}</p>
                    <p className="text-sm font-bold text-foreground">{cob.customerName || "Cliente Sem Nome"}</p>
                  </div>
                  <Badge variant="outline" className={`text-[8px] uppercase tracking-widest ${statusInfo.color}`}>
                    {statusInfo.label}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-y border-border/50 py-3">
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-wider mb-1">Valor</p>
                    <p className="text-sm font-bold font-mono">{formatBRL(cob.value)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-wider mb-1">Vencimento</p>
                    <p className={`text-sm font-bold font-mono ${cob.status === "OVERDUE" ? 'text-red-500' : 'text-foreground'}`}>
                      {formatDate(cob.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-neutral-500 font-mono">
                    {BILLING_TYPE_MAP[cob.billingType] || cob.billingType}
                  </p>
                  <div className="flex gap-2">
                    {isBoleto && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 border-border text-neutral-400"
                        onClick={() => handleDownload(cob.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 border-border text-neutral-400">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border text-neutral-400 font-mono w-48">
                        {cob.invoiceUrl && (
                          <DropdownMenuItem 
                            className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                            onClick={() => window.open(cob.invoiceUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-2" /> VER FATURA
                          </DropdownMenuItem>
                        )}
                        {isBoleto && (
                          <DropdownMenuItem 
                            className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                            onClick={() => handleCopyLinha(cob.id)}
                          >
                            <Copy className="w-3 h-3 mr-2" /> COPIAR LINHA
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                          onClick={() => { setSelectedId(cob.id); setIsModalEnviarOpen(true) }}
                        >
                          <Send className="w-3 h-3 mr-2" /> ENVIAR POR EMAIL
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                          onClick={() => { setSelectedId(cob.id); setIsModalNFOpen(true) }}
                        >
                          <FileCheck className="w-3 h-3 mr-2" /> ANEXAR NOTA FISCAL
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider text-[10px]">ID</th>
              <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider text-[10px]">CLIENTE</th>
              <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider text-[10px]">TIPO</th>
              <th className="text-right p-4 text-neutral-500 font-mono font-medium tracking-wider text-[10px]">VALOR</th>
              <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider text-[10px]">VENCIMENTO</th>
              <th className="text-left p-4 text-neutral-500 font-mono font-medium tracking-wider text-[10px]">STATUS</th>
              <th className="text-right p-4 text-neutral-500 font-mono font-medium tracking-wider text-[10px]">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cobrancas.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-neutral-600">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-6 h-6 opacity-30" />
                    <span className="text-xs font-mono">Nenhuma cobrança encontrada</span>
                  </div>
                </td>
              </tr>
            ) : (
              cobrancas.map((cob: any) => {
                const statusInfo = STATUS_MAP[cob.status] || { label: cob.status, color: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20" }
                const isOverdue = cob.status === "OVERDUE"
                const isBoleto = cob.billingType === "BOLETO"
                
                return (
                  <tr key={cob.id} className="hover:bg-accent/5 transition-colors group">
                    <td className="p-4 font-mono text-orange-500/70 text-[10px]">
                      {cob.id.substring(4, 12)}
                    </td>
                    <td className="p-4 text-foreground font-medium text-xs">
                      {cob.customerName || cob.customer?.substring(0, 12)}
                    </td>
                    <td className="p-4 text-neutral-400 text-[10px]">
                      {BILLING_TYPE_MAP[cob.billingType] || cob.billingType}
                    </td>
                    <td className="p-4 font-mono text-foreground text-right font-bold">
                      {formatBRL(cob.value)}
                    </td>
                    <td className={`p-4 font-mono text-[10px] ${isOverdue ? 'text-red-500' : 'text-neutral-400'}`}>
                      {formatDate(cob.dueDate)}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`text-[8px] uppercase tracking-widest ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:text-orange-500">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-neutral-400 font-mono w-48">
                          {cob.invoiceUrl && (
                            <DropdownMenuItem 
                              className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                              onClick={() => window.open(cob.invoiceUrl, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-2" /> VER FATURA
                            </DropdownMenuItem>
                          )}
                          {isBoleto && (
                            <>
                              <DropdownMenuItem 
                                className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                                onClick={() => handleDownload(cob.id)}
                              >
                                <Download className="w-3 h-3 mr-2" /> DOWNLOAD BOLETO
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                                onClick={() => handleCopyLinha(cob.id)}
                              >
                                <Copy className="w-3 h-3 mr-2" /> COPIAR LINHA
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem 
                            className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                            onClick={() => { setSelectedId(cob.id); setIsModalEnviarOpen(true) }}
                          >
                            <Send className="w-3 h-3 mr-2" /> ENVIAR POR EMAIL
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer" 
                            onClick={() => { setSelectedId(cob.id); setIsModalNFOpen(true) }}
                          >
                            <FileCheck className="w-3 h-3 mr-2" /> ANEXAR NOTA FISCAL
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

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
