"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { FluxoTab } from "@/components/projetos/fluxo-tab"

export default function FluxoEtapasPage() {
  return (
    <PageWrapper title="FLUXO DE ETAPAS" breadcrumb="INTELIGENCE > FLUXO">
      <div className="p-6 bg-[#0d0d0d] rounded-lg border border-[#2A2A2A] min-h-[calc(100vh-200px)]">
        <FluxoTab />
      </div>
    </PageWrapper>
  )
}
