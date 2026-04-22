"use client"

import { ReportPage } from "@/modules/reports"
import { Suspense } from "react"
import { PageWrapper } from "@/components/page-wrapper"

export default function ProjetoRelatorioPage({ params }: { params: { id: string } }) {
  return (
    <PageWrapper title="RELATÓRIO DO PROJETO" breadcrumb="PROJETOS > RELATÓRIO">
      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <div className="text-orange-500 font-mono tracking-widest text-sm animate-pulse">
            CARREGANDO RELATÓRIO DO PROJETO...
          </div>
        </div>
      }>
        <ReportPage projetoIdInicial={params.id} />
      </Suspense>
    </PageWrapper>
  )
}

