"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { ConfiguracoesModule } from "@/components/configuracoes/configuracoes-module"

export default function ConfiguracoesPage() {
  return (
    <PageWrapper title="CONFIGURACOES" breadcrumb="CONFIGURACOES">
      <div className="-m-3 sm:-m-4 lg:-m-6">
        <ConfiguracoesModule />
      </div>
    </PageWrapper>
  )
}
