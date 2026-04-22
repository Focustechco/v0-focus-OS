import React from 'react'
import { FiltrosRelatorio, TipoRelatorio } from './types/report.types'
import { useProjects } from '@/lib/hooks/use-projetos'
import { useSprints } from '@/lib/hooks/use-sprints'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

interface ReportConfigPanelProps {
  filtros: FiltrosRelatorio
  onChangeProjeto: (projetoId: string) => void
  onChangeSprint: (sprintId: string) => void
  onChangePeriodo: (mes: number, ano: number) => void
  onResetar: () => void
}

export default function ReportConfigPanel({
  filtros,
  onChangeProjeto,
  onChangeSprint,
  onChangePeriodo,
  onResetar
}: ReportConfigPanelProps) {
  const { projects } = useProjects()
  const { sprints } = useSprints(filtros.projetoId || undefined)

  const handleMonthChange = (val: string) => {
    // simplistic handling
    onChangePeriodo(parseInt(val), filtros.periodo.ano)
  }

  return (
    <div className="w-full bg-[#080808] border-b border-[#1f1f1f] px-6 py-4 flex flex-col sm:flex-row items-center gap-4">
      
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs font-mono text-neutral-500 mb-1 block">PROJETO</label>
        <Select value={filtros.projetoId || "none"} onValueChange={(val) => onChangeProjeto(val)}>
          <SelectTrigger className="w-full bg-[#141414] border-[#2a2a2a] text-white">
            <SelectValue placeholder="Selecione um projeto..." />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
            <SelectItem value={"none"} disabled>Selecione um projeto...</SelectItem>
            {projects?.map((p: any) => (
              <SelectItem key={p.id} value={p.id} className="focus:bg-[#2a2a2a] focus:text-white">
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-xs font-mono text-neutral-500 mb-1 block">SPRINT</label>
        <Select value={filtros.sprintId} onValueChange={onChangeSprint} disabled={!filtros.projetoId}>
          <SelectTrigger className="w-full bg-[#141414] border-[#2a2a2a] text-white">
            <SelectValue placeholder="Todas as sprints" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
            <SelectItem value="all" className="focus:bg-[#2a2a2a] focus:text-white">Todas as Sprints</SelectItem>
            {sprints?.map((s: any) => (
              <SelectItem key={s.id} value={s.id} className="focus:bg-[#2a2a2a] focus:text-white">
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="text-xs font-mono text-neutral-500 mb-1 block">PERÍODO</label>
        <Select value={filtros.periodo.mes.toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-full bg-[#141414] border-[#2a2a2a] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
            <SelectItem value="1" className="focus:bg-[#2a2a2a] focus:text-white">Janeiro</SelectItem>
            <SelectItem value="2" className="focus:bg-[#2a2a2a] focus:text-white">Fevereiro</SelectItem>
            <SelectItem value="3" className="focus:bg-[#2a2a2a] focus:text-white">Março</SelectItem>
            <SelectItem value="4" className="focus:bg-[#2a2a2a] focus:text-white">Abril</SelectItem>
            <SelectItem value="5" className="focus:bg-[#2a2a2a] focus:text-white">Maio</SelectItem>
            <SelectItem value="6" className="focus:bg-[#2a2a2a] focus:text-white">Junho</SelectItem>
            <SelectItem value="7" className="focus:bg-[#2a2a2a] focus:text-white">Julho</SelectItem>
            <SelectItem value="8" className="focus:bg-[#2a2a2a] focus:text-white">Agosto</SelectItem>
            <SelectItem value="9" className="focus:bg-[#2a2a2a] focus:text-white">Setembro</SelectItem>
            <SelectItem value="10" className="focus:bg-[#2a2a2a] focus:text-white">Outubro</SelectItem>
            <SelectItem value="11" className="focus:bg-[#2a2a2a] focus:text-white">Novembro</SelectItem>
            <SelectItem value="12" className="focus:bg-[#2a2a2a] focus:text-white">Dezembro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end mb-0.5">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onResetar}
          className="bg-[#141414] border-[#2a2a2a] text-neutral-400 hover:text-white hover:bg-[#1f1f1f]"
          title="Resetar Filtros"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
