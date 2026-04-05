"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { CommandCenter } from "@/components/command-center"

export default function CommandCenterPage() {
  return (
    <PageWrapper title="COMMAND CENTER" breadcrumb="DASHBOARD">
      <CommandCenter />
    </PageWrapper>
  )
}
