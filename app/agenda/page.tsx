"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { AgendaModule } from "@/components/agenda-module"

export default function AgendaPage() {
  return (
    <PageWrapper title="AGENDA" breadcrumb="AGENDA">
      {/* Ajuste para ocupar a altura total disponível no main */}
      <div className="h-full">
        <AgendaModule />
      </div>
    </PageWrapper>
  )
}
