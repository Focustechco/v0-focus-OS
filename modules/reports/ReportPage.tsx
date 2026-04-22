import React, { useRef } from 'react'
import ReportHeader from './ReportHeader'
import ReportConfigPanel from './ReportConfigPanel'
import ClientReport from './views/ClientReport'
import TeamReport from './views/TeamReport'
import TechLeadReport from './views/TechLeadReport'
import { useReportFilters } from './hooks/useReportFilters'
import { useReportData } from './hooks/useReportData'
import { useState } from 'react'
import { toast } from 'sonner'

interface ReportPageProps {
  projetoIdInicial?: string
}

export default function ReportPage({ projetoIdInicial }: ReportPageProps) {
  const { filtros, setTipo, setProjeto, setSprint, setPeriodo, resetar } = useReportFilters(projetoIdInicial)
  const { dadosCliente, dadosEquipe, dadosTechLead, projeto, sprintsFiltradas, isLoading } = useReportData(filtros)
  const [isDownloading, setIsDownloading] = useState(false)

  // Ref que aponta sempre para o conteúdo visível do relatório atual
  const reportContentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!projeto) {
      toast.error('Selecione um projeto primeiro.')
      return
    }

    const el = reportContentRef.current
    if (!el) {
      toast.error('Conteúdo do relatório não encontrado.')
      return
    }

    setIsDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      // Expande todos os accordions antes de capturar (para relatório equipe)
      const closedItems = el.querySelectorAll<HTMLElement>('[data-sprint-closed]')
      closedItems.forEach(i => i.click())

      // Pequena pausa para o DOM re-renderizar
      await new Promise(r => setTimeout(r, 120))

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        backgroundColor: '#0a0a0a',
        ignoreElements: (node) => {
          // Remove botões interativos do PDF
          return node.tagName === 'BUTTON' || (node as HTMLElement).dataset?.pdfIgnore === 'true'
        }
      })

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()

      const dpr = 2
      const totalPages = Math.ceil(canvas.height / (canvas.width / pageW * pageH * dpr))

      for (let page = 0; page < totalPages; page++) {
        const srcY = page * (pageH * (canvas.width / pageW)) * dpr
        const srcH = Math.min(pageH * (canvas.width / pageW) * dpr, canvas.height - srcY)
        if (srcH <= 0) break

        const sliceCanvas = document.createElement('canvas')
        sliceCanvas.width = canvas.width
        sliceCanvas.height = Math.ceil(srcH)
        sliceCanvas.getContext('2d')?.drawImage(
          canvas,
          0, srcY, canvas.width, srcH,
          0, 0, canvas.width, Math.ceil(srcH)
        )

        const sliceH = (Math.ceil(srcH) / canvas.width) * pageW

        if (page > 0) pdf.addPage()
        pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, pageW, sliceH)
      }

      const tipoLabel = filtros.tipo === 'cliente' ? 'Cliente' : filtros.tipo === 'equipe' ? 'Equipe' : 'TechLead'
      const projName = (projeto.nome || 'Projeto').replace(/[^a-z0-9]/gi, '_')
      pdf.save(`Relatorio_${tipoLabel}_${projName}.pdf`)

      toast.success('PDF exportado com sucesso!')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ReportHeader
        projeto={projeto}
        tipoAtivo={filtros.tipo}
        onChangeTipo={setTipo}
        onDownloadPDF={handleDownloadPDF}
        isDownloading={isDownloading}
      />
      <ReportConfigPanel
        filtros={filtros}
        onChangeProjeto={setProjeto}
        onChangeSprint={setSprint}
        onChangePeriodo={setPeriodo}
        onResetar={resetar}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-neutral-500 font-mono text-sm animate-pulse">Carregando dados estruturais...</div>
        </div>
      ) : (
        <>
          {!filtros.projetoId || filtros.projetoId === 'none' ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#141414] border border-[#1f1f1f] flex items-center justify-center mb-4 text-neutral-600">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-display text-white mb-2">Central de Relatórios Ativos</h3>
              <p className="text-sm text-neutral-500 max-w-md">Selecione um projeto acima para visualizar os dados atualizados em tempo real, organizados para o Cliente, para a Equipe ou para a liderança técnica.</p>
            </div>
          ) : (
            /* Este div é capturado pelo html2canvas ao exportar */
            <div ref={reportContentRef}>
              {filtros.tipo === 'cliente' && dadosCliente && (
                <ClientReport dados={dadosCliente} />
              )}
              {filtros.tipo === 'equipe' && dadosEquipe && (
                <TeamReport dados={dadosEquipe} tasks={(dadosEquipe as any).tasks} />
              )}
              {filtros.tipo === 'techlead' && dadosTechLead && (
                <TechLeadReport dados={dadosTechLead} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
