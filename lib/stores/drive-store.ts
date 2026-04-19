import { create } from "zustand";
import { DriveFile, FolderNode } from "@/lib/types/drive";

interface DriveState {
  currentFolderId: string;
  files: DriveFile[];
  folders: FolderNode[];
  breadcrumb: { id: string; name: string }[];
  isLoading: boolean;
  error: string | null;

  // Actions
  navigateTo: (folderId: string, folderName: string) => Promise<void>;
  fetchContents: (folderId: string) => Promise<void>;
  fetchTree: (rootId?: string) => Promise<void>;
  resetBreadcrumb: () => void;
}

export const useDriveStore = create<DriveState>((set, get) => ({
  currentFolderId: "root",
  files: [],
  folders: [],
  breadcrumb: [{ id: "root", name: "FOCUS_OS" }],
  isLoading: false,
  error: null,

  navigateTo: async (folderId: string, folderName: string) => {
    const { breadcrumb } = get();
    
    // Se voltar para um nível anterior no breadcrumb
    const existingIndex = breadcrumb.findIndex(b => b.id === folderId);
    let newBreadcrumb;
    
    if (existingIndex !== -1) {
      newBreadcrumb = breadcrumb.slice(0, existingIndex + 1);
    } else {
      newBreadcrumb = [...breadcrumb, { id: folderId, name: folderName }];
    }

    set({ currentFolderId: folderId, breadcrumb: newBreadcrumb });
    await get().fetchContents(folderId);
  },

  fetchContents: async (folderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/drive/folder/${folderId}`);
      if (!res.ok) throw new Error("Erro ao carregar arquivos do Drive");
      const data = await res.json();
      set({ files: data.files, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchTree: async (rootId = "root") => {
    try {
      const res = await fetch(`/api/drive/tree?rootId=${rootId}`);
      if (!res.ok) throw new Error("Erro ao carregar árvore de pastas");
      const data = await res.json();
      set({ folders: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  resetBreadcrumb: () => {
    set({ breadcrumb: [{ id: "root", name: "FOCUS_OS" }], currentFolderId: "root" });
  }
}));
