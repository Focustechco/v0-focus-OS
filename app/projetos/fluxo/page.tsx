'use client';

import React from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { FluxoTab } from '@/components/projetos/fluxo-tab';

export default function FluxoPage() {
  return (
    <ProjectsLayout>
      <div className="animate-in fade-in duration-500">
        <FluxoTab />
      </div>
    </ProjectsLayout>
  );
}
