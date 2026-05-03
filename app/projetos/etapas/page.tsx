'use client';

import React from 'react';
import { ProjectsLayout } from '@/components/projetos/ProjectsLayout';
import { EtapasModule } from '@/components/projetos/etapas-module';

export default function EtapasPage() {
  return (
    <ProjectsLayout>
      <div className="animate-in fade-in duration-500">
        <EtapasModule />
      </div>
    </ProjectsLayout>
  );
}
