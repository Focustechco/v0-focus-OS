'use client';

import React from 'react';
import { RefreshCw, Settings, CheckCircle2 } from 'lucide-react';

interface ClickUpSyncBarProps {
  lastSync?: string;
  isSyncing?: boolean;
}

export function ClickUpSyncBar({ lastSync, isSyncing }: ClickUpSyncBarProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#161616] border border-[#1f1f1f] rounded-xl mb-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
          <span className="text-sm font-medium text-white">Sincronizado com ClickUp</span>
        </div>
        <div className="h-4 w-px bg-[#1f1f1f]" />
        <div className="flex items-center space-x-2 px-2 py-1 bg-[#1f1f1f] rounded-md border border-[#333]">
          <img src="https://clickup.com/favicon.ico" alt="ClickUp" className="w-3 h-3" />
          <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">ClickUp v2</span>
        </div>
        <span className="text-xs text-[#888888]">
          Última atualização: {lastSync || 'Agora mesmo'}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <button 
          className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-[#888888] hover:text-white transition-colors bg-transparent border border-[#1f1f1f] rounded-lg hover:bg-[#1f1f1f]"
        >
          <RefreshCw className={isSyncing ? "w-3 h-3 animate-spin" : "w-3 h-3"} />
          <span>Sincronizar</span>
        </button>
        <button className="p-1.5 text-[#888888] hover:text-white transition-colors bg-transparent border border-[#1f1f1f] rounded-lg hover:bg-[#1f1f1f]">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
