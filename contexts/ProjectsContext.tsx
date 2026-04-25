'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useClickUpSpaces } from '@/hooks/useClickUpSpaces';

interface ProjectsContextData {
  selectedListId: string;
  setSelectedListId: (id: string) => void;
  selectedListName: string;
  spaces: any[];
  allLists: any[];
  isLoadingSpaces: boolean;
  spacesError: string | null;
}

const ProjectsContext = createContext<ProjectsContextData>({} as ProjectsContextData);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { spaces, isLoading: isLoadingSpaces, error: spacesError } = useClickUpSpaces();
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [selectedListName, setSelectedListName] = useState<string>('');

  const allLists = spaces.flatMap((s: any) => [
    ...(s.folderless_lists || []).map((l: any) => ({ ...l, spaceName: s.name, folderName: null })),
    ...(s.folders || []).flatMap((f: any) =>
      (f.lists || []).map((l: any) => ({ ...l, spaceName: s.name, folderName: f.name }))
    ),
  ]);

  useEffect(() => {
    // Carrega do localStorage se existir
    const saved = localStorage.getItem('@focus-os:selectedListId');
    if (saved) {
      setSelectedListId(saved);
    }
  }, []);

  useEffect(() => {
    if (allLists.length > 0 && !selectedListId) {
      setSelectedListId(allLists[0].id);
      setSelectedListName(allLists[0].name);
    } else if (selectedListId && allLists.length > 0) {
      const list = allLists.find(l => l.id === selectedListId);
      if (list) {
        setSelectedListName(list.name);
        localStorage.setItem('@focus-os:selectedListId', selectedListId);
      }
    }
  }, [allLists.length, selectedListId]);

  return (
    <ProjectsContext.Provider value={{ selectedListId, setSelectedListId, selectedListName, spaces, allLists, isLoadingSpaces, spacesError }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjectsContext() {
  return useContext(ProjectsContext);
}
