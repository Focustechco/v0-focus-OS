"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { ComercialModule } from "@/components/comercial/comercial-module"

export default function ComercialPage() {
  return (
    <PageWrapper title="COMERCIAL / CRM" breadcrumb="COMERCIAL / CRM">
      <ComercialModule />
    </PageWrapper>
  )
}
