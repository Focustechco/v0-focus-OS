'use client';
import { useState } from 'react';
import { useProjectsConfig } from '@/hooks/useProjectsConfig';
import { ClickUpConfigModal } from './ClickUpConfigModal';
import { RefreshCw, Settings } from 'lucide-react';

export function ClickUpSyncBar({ lastSync, onSync, isSyncing }: { lastSync?: string|null; onSync?: () => void; isSyncing?: boolean }) {
  const { config } = useProjectsConfig();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-[#161616] border border-[#1f1f1f] rounded-xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${config?.list_id ? 'bg-[#4ade80] text-[#4ade80]' : 'bg-[#fbbf24] text-[#fbbf24]'}`} />
            <span className="text-sm font-medium text-white">
              {config?.list_id ? 'Sincronizado com ClickUp' : 'Não configurado'}
            </span>
          </div>
          
          <div className="hidden sm:block h-4 w-px bg-[#1f1f1f]" />
          
          <div className="flex items-center space-x-2 px-2 py-1 bg-[#1f1f1f] rounded-md border border-[#333] w-fit">
            <img src="https://clickup.com/favicon.ico" alt="ClickUp" className="w-3 h-3" />
            <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">ClickUp v2</span>
          </div>
          
          {lastSync && (
            <span className="text-xs text-[#888888]">
              Última atualização: {lastSync}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 mt-4 sm:mt-0">
          <button 
            onClick={onSync}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-[#888888] hover:text-white transition-colors bg-transparent border border-[#1f1f1f] rounded-lg hover:bg-[#1f1f1f]"
          >
            <RefreshCw className={isSyncing ? "w-3 h-3 animate-spin" : "w-3 h-3"} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
          
          <button 
            onClick={() => setModalOpen(true)}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium transition-colors border rounded-lg ${
              modalOpen 
                ? 'bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316]' 
                : 'bg-transparent border-[#1f1f1f] text-[#888888] hover:text-white hover:bg-[#1f1f1f]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configurar</span>
          </button>
        </div>
      </div>
      <ClickUpConfigModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
