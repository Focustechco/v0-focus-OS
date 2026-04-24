'use client';

import React from 'react';
import { CheckCircle2, XCircle, Clock, ExternalLink, MessageSquare } from 'lucide-react';

interface ApprovalCardProps {
  approval: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalCard({ approval, onApprove, onReject }: ApprovalCardProps) {
  const statusColors: Record<string, string> = {
    'pending': 'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20',
    'approved': 'text-[#4ade80] bg-[#16a34a22] border-[#16a34a44]',
    'rejected': 'text-[#fca5a5] bg-[#7f1d1d]/20 border-[#7f1d1d]/40',
  };

  const statusLabels: Record<string, string> = {
    'pending': 'PENDENTE',
    'approved': 'APROVADO',
    'rejected': 'REJEITADO',
  };

  const isPending = approval.status === 'pending';
  const task = approval.clickup_tasks_cache;

  return (
    <div className="bg-[#161616] border border-[#1f1f1f] rounded-xl p-6 hover:border-[#333] transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl border ${statusColors[approval.status]}`}>
            {approval.status === 'approved' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : approval.status === 'rejected' ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h4 className="font-bold text-white group-hover:text-[#f97316] transition-colors">
                {task?.name || 'Solicitação de Aprovação'}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[approval.status]}`}>
                {statusLabels[approval.status]}
              </span>
            </div>
            <p className="text-xs text-[#888888] flex items-center space-x-2">
              <span>Solicitado por @adriano</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Há 2 horas</span>
              </span>
              <span>•</span>
              <span className="text-[#333]">#cu-{approval.clickup_task_id}</span>
            </p>
          </div>
        </div>
        <button className="p-2 text-[#444] hover:text-white transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-4 mb-6">
        <p className="text-sm text-[#888888] italic">
          "{approval.notes || 'Nenhuma observação enviada.'}"
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 text-xs font-bold text-[#444] hover:text-[#888] transition-colors uppercase">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comentários</span>
          </button>
        </div>

        {isPending && (
          <div className="flex space-x-3">
            <button 
              onClick={() => onReject(approval.id)}
              className="px-4 py-1.5 text-xs font-bold text-[#888888] bg-[#1f1f1f] border border-[#333] rounded-lg hover:bg-[#2a2a2a] transition-colors uppercase"
            >
              Rejeitar
            </button>
            <button 
              onClick={() => onApprove(approval.id)}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#16a34a] rounded-lg hover:bg-[#15803d] transition-colors uppercase shadow-[0_0_15px_rgba(22,163,74,0.2)]"
            >
              Aprovar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
