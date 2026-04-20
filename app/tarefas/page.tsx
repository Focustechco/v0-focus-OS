"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { MinhasTarefasModule } from "@/components/tarefas/minhas-tarefas-module"

export default function TarefasPage() {
  return (
    <PageWrapper title="TAREFAS" breadcrumb="TAREFAS">
      <MinhasTarefasModule />
    </PageWrapper>
  )
}
