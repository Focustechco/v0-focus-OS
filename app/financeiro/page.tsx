"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { TabelaCobrancas } from "@/components/financeiro/tabela-cobrancas"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  DollarSign,
  Loader2,
  RefreshCw
} from "lucide-react"
import { useState } from "react"
import { ModalGerarCobranca } from "@/components/financeiro/modal-gerar-cobranca"
import { useAsaas } from "@/lib/hooks/use-asaas"

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function FinanceiroPage() {
  const [isModalGerarOpen, setIsModalGerarOpen] = useState(false)
  const { resumo, isLoading, isError, mutateCobrancas } = useAsaas()

  return (
    <PageWrapper title="FINANCEIRO" breadcrumb="FINANCEIRO">
      <div className="space-y-4 sm:space-y-6 font-mono bg-secondary p-4 sm:p-6 -m-4 sm:-m-6 min-h-screen rounded-lg">

        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">Painel Financeiro</h1>
            </div>
            <Badge variant="outline" className="text-[8px] sm:text-[9px] uppercase tracking-widest border-green-500/30 text-green-500 w-fit">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5" />
              ASAAS_CONNECTED
            </Badge>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 sm:flex-none border-border text-neutral-400 hover:text-foreground h-8 text-[10px]"
              onClick={() => mutateCobrancas()}
            >
              <RefreshCw className="w-3 h-3 mr-1.5" /> SYNC
            </Button>
            <Button 
              onClick={() => setIsModalGerarOpen(true)}
              className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-black font-bold h-8 text-[10px]"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              NOVA COBRANÇA
            </Button>
          </div>
        </div>

        {/* Dashboard KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Saldo Previsto */}
          <div className="bg-card border border-border p-4 rounded-lg group hover:border-orange-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Saldo Previsto</p>
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            ) : (
              <span className="text-base sm:text-xl font-bold text-foreground">
                {resumo ? formatBRL(resumo.saldoPrevisto) : 'R$ —'}
              </span>
            )}
            <p className="text-[9px] text-neutral-600 mt-1">
              {resumo ? `${resumo.qtdPendente} cobrança(s) pendente(s)` : '—'}
            </p>
          </div>

          {/* Recebido */}
          <div className="bg-card border border-border p-4 rounded-lg group hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Recebido</p>
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            ) : (
              <span className="text-base sm:text-xl font-bold text-green-500">
                {resumo ? formatBRL(resumo.totalRecebido) : 'R$ —'}
              </span>
            )}
            <p className="text-[9px] text-neutral-600 mt-1">
              {resumo ? `${resumo.qtdRecebido} pagamento(s) confirmado(s)` : '—'}
            </p>
          </div>

          {/* Pendente */}
          <div className="bg-card border border-border p-4 rounded-lg group hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Pendente</p>
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            ) : (
              <span className="text-base sm:text-xl font-bold text-yellow-500">
                {resumo ? formatBRL(resumo.totalPendente) : 'R$ —'}
              </span>
            )}
            <p className="text-[9px] text-neutral-600 mt-1">
              {resumo ? `${resumo.qtdPendente} aguardando pagamento` : '—'}
            </p>
          </div>

          {/* Vencido / Inadimplência */}
          <div className="bg-card border border-border p-4 rounded-lg group hover:border-red-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Inadimplência</p>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            </div>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            ) : (
              <span className="text-base sm:text-xl font-bold text-red-500">
                {resumo ? `${resumo.inadimplencia}%` : '—'}
              </span>
            )}
            <p className="text-[9px] text-neutral-600 mt-1">
              {resumo ? `${resumo.qtdVencido} cobrança(s) vencida(s)` : '—'}
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <h2 className="text-xs font-bold text-orange-500 tracking-widest uppercase">Cobranças</h2>
          <span className="text-[10px] text-neutral-600 font-mono">/ LISTA COMPLETA</span>
        </div>

        {/* Error Banner */}
        {isError && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-400 font-bold">Erro de conexão com o Asaas</p>
              <p className="text-[10px] text-neutral-500 mt-1">
                Verifique se a variável <code className="text-orange-500">ASAAS_API_KEY</code> está 
                configurada corretamente no arquivo <code className="text-orange-500">.env.local</code>.
                Se estiver usando sandbox, a URL deve ser <code className="text-orange-500">https://sandbox.asaas.com/api/v3</code>.
              </p>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
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
