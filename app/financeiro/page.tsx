"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { TabelaCobrancas } from "@/components/financeiro/tabela-cobrancas"
import { Button } from "@/components/ui/button"
import { Plus, Wallet, FileText, Download } from "lucide-react"
import { useState } from "react"
import { ModalGerarCobranca } from "@/components/financeiro/modal-gerar-cobranca"

export default function FinanceiroPage() {
  const [isModalGerarOpen, setIsModalGerarOpen] = useState(false)

  return (
    <PageWrapper title="FINANCEIRO" breadcrumb="FINANCEIRO">
      <div className="space-y-6 font-mono bg-[#060606] p-6 -m-6 min-h-screen">
        {/* Dashboard Cards Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-lg">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Saldo Previsto</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-foreground">R$ 45.230,00</span>
              <Wallet className="w-5 h-5 text-orange-500 opacity-50" />
            </div>
          </div>
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-lg">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Recebido (Mês)</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-green-500">R$ 12.450,00</span>
              <Download className="w-5 h-5 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-lg">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Inadimplência</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-red-500">2.4%</span>
              <FileText className="w-5 h-5 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-orange-500 tracking-tighter flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              COBRANCAS_LIST.SH
            </h2>
          </div>
          <Button 
            onClick={() => setIsModalGerarOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold h-9 text-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            NOVA_COBRANCA
          </Button>
        </div>

        {/* Main Table */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden">
          <TabelaCobrancas />
        </div>
      </div>

      <ModalGerarCobranca 
        open={isModalGerarOpen} 
        onOpenChange={setIsModalGerarOpen} 
      />
    </PageWrapper>
  )
}
