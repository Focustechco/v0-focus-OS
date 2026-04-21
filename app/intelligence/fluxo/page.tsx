"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { FluxoTab } from "@/components/projetos/fluxo-tab"

export default function FluxoEtapasPage() {
  return (
    <PageWrapper title="FLUXO DE ETAPAS" breadcrumb="INTELIGENCE > FLUXO">
      <div className="p-6 bg-secondary rounded-lg border border-border min-h-[calc(100vh-200px)]">
        <FluxoTab />
      </div>
    </PageWrapper>
  )
}
