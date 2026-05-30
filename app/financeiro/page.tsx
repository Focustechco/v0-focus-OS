"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useInter } from "@/lib/hooks/use-inter"
import { ModalPixReceber } from "@/components/financeiro/modal-pix-receber"
import { ModalPixPagar } from "@/components/financeiro/modal-pix-pagar"
import { ModalBoletoEmitir } from "@/components/financeiro/modal-boleto-emitir"
import { ModalBoletoPagar } from "@/components/financeiro/modal-boleto-pagar"
import { ModalTed } from "@/components/financeiro/modal-ted"
import Link from "next/link"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts"
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  RefreshCw, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  Send, 
  FileText, 
  FilePlus2, 
  Forward, 
  Download, 
  History,
  ExternalLink
} from "lucide-react"

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function FinanceiroPage() {
  const { 
    saldo, 
    transacoes, 
    resumoFinanceiro, 
    isLoading, 
    isError, 
    sincronizarManual,
    exportarExtrato
  } = useInter()

  // Modal control states
  const [modalPixReceberOpen, setModalPixReceberOpen] = useState(false)
  const [modalPixPagarOpen, setModalPixPagarOpen] = useState(false)
  const [modalBoletoEmitirOpen, setModalBoletoEmitirOpen] = useState(false)
  const [modalBoletoPagarOpen, setModalBoletoPagarOpen] = useState(false)
  const [modalTedOpen, setModalTedOpen] = useState(false)

  const [syncTime, setSyncTime] = useState<string>(new Date().toLocaleTimeString())

  const handleSync = async () => {
    await sincronizarManual()
    setSyncTime(new Date().toLocaleTimeString())
  }

  // Obter apenas as 5 transações mais recentes para a visualização rápida
  const transacoesRecentes = transacoes.slice(0, 5)

  return (
    <PageWrapper title="FINANCEIRO" breadcrumb="FINANCEIRO">
      <div className="space-y-6 font-mono bg-secondary p-4 sm:p-6 -m-4 sm:-m-6 min-h-screen rounded-lg">
        
        {/* Barra de Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-500" />
              <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">Painel Financeiro</h1>
            </div>
            <Badge variant="outline" className="text-[8px] sm:text-[9px] uppercase tracking-widest border-orange-500/30 text-orange-500 w-fit">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse mr-1.5" />
              INTER_CONNECTED (mTLS V3)
            </Badge>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[9px] text-neutral-500 uppercase">Último Sync: {syncTime}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync}
              className="border-border text-neutral-400 hover:text-foreground h-8 text-[10px]"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> SYNC
            </Button>
          </div>
        </div>

        {/* Dashboard KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card Saldo */}
          <div className="bg-card border border-border p-4 rounded-lg group hover:border-orange-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Saldo Disponível</p>
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-6 w-32 bg-neutral-800 animate-pulse rounded" />
            ) : (
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {formatBRL(saldo.disponivel)}
              </span>
            )}
            <p className="text-[9px] text-neutral-600 mt-1 uppercase">
              Limite disponível: {formatBRL(saldo.limite)}
            </p>
          </div>

          {/* Card Entradas */}
          <div className="bg-card border border-border p-4 rounded-lg group hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Entradas (Mês)</p>
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-6 w-32 bg-neutral-800 animate-pulse rounded" />
            ) : (
              <span className="text-lg sm:text-xl font-bold text-green-500">
                {formatBRL(resumoFinanceiro.totalEntradasMes)}
              </span>
            )}
            <p className="text-[9px] text-neutral-600 mt-1 uppercase">Ref: últimos 30 dias</p>
          </div>

          {/* Card Saídas */}
          <div className="bg-card border border-border p-4 rounded-lg group hover:border-red-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Saídas (Mês)</p>
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-6 w-32 bg-neutral-800 animate-pulse rounded" />
            ) : (
              <span className="text-lg sm:text-xl font-bold text-red-500">
                {formatBRL(resumoFinanceiro.totalSaidasMes)}
              </span>
            )}
            <p className="text-[9px] text-neutral-600 mt-1 uppercase">Ref: últimos 30 dias</p>
          </div>

          {/* Card Resultado Líquido */}
          <div className="bg-card border border-border p-4 rounded-lg group hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Resultado Líquido</p>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Scale className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-6 w-32 bg-neutral-800 animate-pulse rounded" />
            ) : (
              <span className={`text-lg sm:text-xl font-bold ${resumoFinanceiro.resultadoLiquido >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatBRL(resumoFinanceiro.resultadoLiquido)}
              </span>
            )}
            <p className="text-[9px] text-neutral-600 mt-1 uppercase">Balanço geral mensal</p>
          </div>
        </div>

        {/* Gráfico e Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gráfico de Barras */}
          <div className="bg-card border border-border p-4 rounded-lg lg:col-span-2 space-y-4">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Fluxo Mensal (Últimos 6 meses)</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumoFinanceiro.graficoFluxo} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#aaaaaa" fontSize={10} tickLine={false} />
                  <YAxis stroke="#aaaaaa" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}
                    labelStyle={{ color: '#ffffff', fontSize: 11 }}
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Bar dataKey="entradas" fill="#1D9E75" radius={[4, 4, 0, 0]} name="Entradas" />
                  <Bar dataKey="saidas" fill="#E24B4A" radius={[4, 4, 0, 0]} name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Painel de Ações Rápidas */}
          <div className="bg-card border border-border p-4 rounded-lg space-y-4 flex flex-col justify-between">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Ações Rápidas</p>
            
            <div className="grid grid-cols-2 gap-3 flex-1 py-2">
              <Button 
                onClick={() => setModalPixPagarOpen(true)}
                className="bg-neutral-900 border border-border/80 hover:border-orange-500/50 hover:bg-neutral-850 text-foreground flex flex-col items-center justify-center p-3 h-auto gap-2 rounded-lg"
              >
                <Send className="w-5 h-5 text-orange-500" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Pagar Pix</span>
              </Button>

              <Button 
                onClick={() => setModalPixReceberOpen(true)}
                className="bg-neutral-900 border border-border/80 hover:border-orange-500/50 hover:bg-neutral-850 text-foreground flex flex-col items-center justify-center p-3 h-auto gap-2 rounded-lg"
              >
                <QrCode className="w-5 h-5 text-orange-500" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Receber Pix</span>
              </Button>

              <Button 
                onClick={() => setModalBoletoPagarOpen(true)}
                className="bg-neutral-900 border border-border/80 hover:border-orange-500/50 hover:bg-neutral-850 text-foreground flex flex-col items-center justify-center p-3 h-auto gap-2 rounded-lg"
              >
                <FileText className="w-5 h-5 text-orange-500" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Pagar Boleto</span>
              </Button>

              <Button 
                onClick={() => setModalBoletoEmitirOpen(true)}
                className="bg-neutral-900 border border-border/80 hover:border-orange-500/50 hover:bg-neutral-850 text-foreground flex flex-col items-center justify-center p-3 h-auto gap-2 rounded-lg"
              >
                <FilePlus2 className="w-5 h-5 text-orange-500" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Gerar Boleto</span>
              </Button>

              <Button 
                onClick={() => setModalTedOpen(true)}
                className="bg-neutral-900 border border-border/80 hover:border-orange-500/50 hover:bg-neutral-850 text-foreground flex flex-col items-center justify-center p-3 h-auto gap-2 rounded-lg col-span-2"
              >
                <Forward className="w-5 h-5 text-orange-500" />
                <span className="text-[9px] uppercase tracking-wider font-bold">Transferência (TED)</span>
              </Button>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border/40">
              <Button 
                variant="outline" 
                onClick={() => exportarExtrato('PDF')}
                className="flex-1 border-border text-[9px] uppercase font-bold h-8 text-neutral-400"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportarExtrato('CSV')}
                className="flex-1 border-border text-[9px] uppercase font-bold h-8 text-neutral-400"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Visualização de Transações Recentes */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4" /> Últimos Lançamentos
            </p>
            <Link href="/financeiro/extrato" className="text-[10px] text-orange-500 hover:underline uppercase flex items-center gap-1">
              Ver Extrato Completo <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/30">
            {transacoesRecentes.map((t: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    t.tipoLancamento === 'CREDITO' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {t.tipoLancamento === 'CREDITO' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{t.titulo}</p>
                    <p className="text-[9px] text-neutral-500 uppercase font-mono">{t.descricao}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={`text-[8px] tracking-wider uppercase ${
                    t.canal === 'PIX' ? 'border-green-500/30 text-green-500' :
                    t.canal === 'BOLETO' ? 'border-amber-500/30 text-amber-500' : 'border-blue-500/30 text-blue-500'
                  }`}>
                    {t.canal}
                  </Badge>
                  <div className="text-right">
                    <p className={`text-xs font-bold font-mono ${
                      t.tipoLancamento === 'CREDITO' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {t.tipoLancamento === 'CREDITO' ? '+' : '-'}{formatBRL(t.valor)}
                    </p>
                    <p className="text-[8px] text-neutral-600 font-mono">{t.dataLancamento}</p>
                  </div>
                </div>
              </div>
            ))}

            {transacoesRecentes.length === 0 && !isLoading && (
              <div className="text-center py-6 text-xs text-neutral-500">
                Nenhum lançamento recente encontrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais de Ação */}
      <ModalPixReceber 
        open={modalPixReceberOpen} 
        onOpenChange={setModalPixReceberOpen} 
      />
      <ModalPixPagar 
        open={modalPixPagarOpen} 
        onOpenChange={setModalPixPagarOpen} 
      />
      <ModalBoletoEmitir 
        open={modalBoletoEmitirOpen} 
        onOpenChange={setModalBoletoEmitirOpen} 
      />
      <ModalBoletoPagar 
        open={modalBoletoPagarOpen} 
        onOpenChange={setModalBoletoPagarOpen} 
      />
      <ModalTed 
        open={modalTedOpen} 
        onOpenChange={setModalTedOpen} 
      />

    </PageWrapper>
  )
}
