"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { BacklogModule } from "@/components/backlog/backlog-module"

export default function BacklogPage() {
  return (
    <PageWrapper title="BACKLOG" breadcrumb="BACKLOG">
      <BacklogModule />
    </PageWrapper>
  )
}
