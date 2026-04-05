"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { ProjetosModule } from "@/components/projetos/projetos-module"

export default function ProjetosPage() {
  return (
    <PageWrapper title="PROJETOS" breadcrumb="PROJETOS">
      <ProjetosModule />
    </PageWrapper>
  )
}
