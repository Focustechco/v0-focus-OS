import { useState, useCallback } from 'react'
import type { FiltrosRelatorio, TipoRelatorio } from '../types/report.types'

const DEFAULT_FILTROS: FiltrosRelatorio = {
  projetoId: '',
  sprintId: 'all',
  periodo: { mes: new Date().getMonth() + 1, ano: new Date().getFullYear() },
  tipo: 'cliente'
}

export function useReportFilters(projetoIdInicial?: string) {
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    ...DEFAULT_FILTROS,
    projetoId: projetoIdInicial ?? DEFAULT_FILTROS.projetoId
  })

  const setTipo = useCallback((tipo: TipoRelatorio) => {
    setFiltros(f => ({ ...f, tipo }))
  }, [])

  const setProjeto = useCallback((projetoId: string) => {
    setFiltros(f => ({ ...f, projetoId, sprintId: 'all' }))
  }, [])

  const setSprint = useCallback((sprintId: string) => {
    setFiltros(f => ({ ...f, sprintId }))
  }, [])

  const setPeriodo = useCallback((mes: number, ano: number) => {
    setFiltros(f => ({ ...f, periodo: { mes, ano } }))
  }, [])

  const resetar = useCallback(() => {
    setFiltros({ ...DEFAULT_FILTROS, projetoId: projetoIdInicial ?? '' })
  }, [projetoIdInicial])

  return { filtros, setTipo, setProjeto, setSprint, setPeriodo, resetar }
}
