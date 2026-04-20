"use client"

import { PageWrapper } from "@/components/page-wrapper"
import { CommandCenter } from "@/components/command-center"

export default function HomePage() {
  return (
    <PageWrapper title="DASHBOARD" breadcrumb="DASHBOARD">
      <CommandCenter />
    </PageWrapper>
  )
}
