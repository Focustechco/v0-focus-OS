"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInter } from "@/lib/hooks/use-inter"
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Download, 
  RefreshCw, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react"

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function ExtratoPage() {
  const {
    transacoes,
    isLoading,
    filtroTipo,
    setFiltroTipo,
    filtroPeriodo,
    setFiltroPeriodo,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    busca,
    setBusca,
    pagina,
    setPagina,
    exportarExtrato,
    sincronizarManual
  } = useInter()

  const tipoAbas = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'ENTRADAS', label: 'Entradas' },
    { value: 'SAIDAS', label: 'Saídas' },
    { value: 'PIX', label: 'Pix' },
    { value: 'BOLETO', label: 'Boleto' },
    { value: 'TED', label: 'TED/TEF' }
  ]

  return (
    <PageWrapper title="EXTRATO COMPLETO" breadcrumb="FINANCEIRO / EXTRATO">
      <div className="space-y-6 font-mono bg-secondary p-4 sm:p-6 -m-4 sm:-m-6 min-h-screen rounded-lg">
        
        {/* Barra Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">Extrato Bancário (Banco Inter)</h1>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sincronizarManual}
              className="border-border text-neutral-400 hover:text-foreground h-8 text-[10px]"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportarExtrato('PDF')}
              className="border-border text-[9px] uppercase font-bold h-8 text-neutral-400"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Exportar PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          
          {/* Abas de Tipos */}
          <div className="flex flex-wrap gap-1 border-b border-border/40 pb-3">
            {tipoAbas.map((aba) => (
              <Button
                key={aba.value}
                variant="ghost"
                onClick={() => setFiltroTipo(aba.value)}
                className={`h-8 px-3 text-[10px] uppercase font-bold rounded ${
                  filtroTipo === aba.value 
                    ? 'bg-orange-500 text-black hover:bg-orange-600 hover:text-black' 
                    : 'text-neutral-400 hover:text-foreground hover:bg-accent/10'
                }`}
              >
                {aba.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Busca */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Buscar Lançamento</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-500" />
                <Input
                  placeholder="Nome, descrição ou documento..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="bg-background border-border text-xs text-foreground pl-8 h-9"
                />
              </div>
            </div>

            {/* Período */}
            <div className="space-y-2">
              <Label className="text-[10px] text-neutral-500 uppercase tracking-widest">Período</Label>
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger className="bg-background border-border text-xs text-foreground h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="1" className="text-xs">Hoje</SelectItem>
                  <SelectItem value="7" className="text-xs">Últimos 7 dias</SelectItem>
                  <SelectItem value="30" className="text-xs">Últimos 30 dias</SelectItem>
                  <SelectItem value="90" className="text-xs">Últimos 90 dias</SelectItem>
                  <SelectItem value="custom" className="text-xs">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo data início/fim se for customizado */}
            {filtroPeriodo === 'custom' && (
              <div className="grid grid-cols-2 gap-2 md:col-span-4 pt-2 border-t border-border/20">
                <div className="space-y-1">
                  <Label className="text-[9px] text-neutral-500 uppercase tracking-widest">De:</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="bg-background border-border text-xs text-foreground pl-8 h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] text-neutral-500 uppercase tracking-widest">Até:</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-500" />
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="bg-background border-border text-xs text-foreground pl-8 h-9"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabela / Lista de lançamentos */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="divide-y divide-border/30">
            {transacoes.map((t: any, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
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

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-[8px] tracking-wider uppercase ${
                      t.canal === 'PIX' ? 'border-green-500/30 text-green-500' :
                      t.canal === 'BOLETO' ? 'border-amber-500/30 text-amber-500' : 'border-blue-500/30 text-blue-500'
                    }`}>
                      {t.canal}
                    </Badge>
                    <span className="text-[9px] text-neutral-600 font-mono hidden md:inline">{t.documento}</span>
                  </div>
                  
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

            {transacoes.length === 0 && !isLoading && (
              <div className="text-center py-12 text-xs text-neutral-500 font-bold uppercase tracking-widest">
                Nenhum lançamento encontrado para os filtros selecionados.
              </div>
            )}

            {isLoading && (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-neutral-800 animate-pulse rounded" />
                ))}
              </div>
            )}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
            <span className="text-[9px] text-neutral-500 uppercase">Página {pagina + 1}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagina === 0 || isLoading}
                onClick={() => setPagina(pagina - 1)}
                className="border-border text-neutral-400 hover:text-foreground h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={transacoes.length < 50 || isLoading}
                onClick={() => setPagina(pagina + 1)}
                className="border-border text-neutral-400 hover:text-foreground h-8 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
