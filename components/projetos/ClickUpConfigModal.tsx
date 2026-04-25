'use client';

import { useState, useEffect } from 'react';
import { useProjectsConfig } from '@/hooks/useProjectsConfig';
import { Loader2 } from 'lucide-react';

type Option = { id: string; name: string };

export function ClickUpConfigModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config, save } = useProjectsConfig();

  const [workspaces, setWorkspaces] = useState<Option[]>([]);
  const [spaces,     setSpaces]     = useState<Option[]>([]);
  const [lists,      setLists]      = useState<Option[]>([]);

  const [wsId, setWsId] = useState('');
  const [spId, setSpId] = useState('');
  const [lsId, setLsId] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle'|'online'|'pending'>('idle');

  // Carrega workspaces ao abrir
  useEffect(() => {
    if (!open) return;
    fetch('/api/clickup/workspaces')
      .then(r => r.json())
      .then(d => setWorkspaces(d.workspaces ?? []));
      
    // Pré-preenche com config atual
    if (config) {
      setWsId(config.workspace_id || '');
      setSpId(config.space_id || '');
      setLsId(config.list_id || '');
      setStatus(config.list_id ? 'online' : 'pending');
    }
  }, [open, config]);

  // Carrega spaces ao trocar workspace
  useEffect(() => {
    if (!wsId) { setSpaces([]); setSpId(''); setLists([]); setLsId(''); return; }
    
    // Only fetch if we've actually changed the workspace or initially loading
    let isMounted = true;
    fetch(`/api/clickup/spaces?teamId=${wsId}`)
      .then(r => r.json())
      .then(d => {
        if (isMounted) setSpaces(d.spaces ?? []);
      });
      
    // Only reset if we manually change it and it's not the initial load matching config
    if (config && wsId !== config.workspace_id) {
      setSpId(''); setLists([]); setLsId(''); setStatus('pending');
    }
    
    return () => { isMounted = false; };
  }, [wsId]); // Removed config dependency to avoid loops

  // Carrega listas ao trocar space
  useEffect(() => {
    if (!spId) { setLists([]); setLsId(''); return; }
    
    let isMounted = true;
    fetch(`/api/clickup/lists?spaceId=${spId}`)
      .then(r => r.json())
      .then(d => {
        if (isMounted) setLists(d.lists ?? []);
      });
      
    if (config && spId !== config.space_id) {
      setLsId(''); setStatus('pending');
    }
    
    return () => { isMounted = false; };
  }, [spId]); // Removed config dependency to avoid loops

  useEffect(() => {
    setStatus(lsId ? 'online' : wsId ? 'pending' : 'idle');
  }, [lsId, wsId]);

  const handleSave = async () => {
    if (!lsId) return;
    setSaving(true);
    const wsName = workspaces.find(w => w.id === wsId)?.name ?? '';
    const spName = spaces.find(s => s.id === spId)?.name ?? '';
    const lsName = lists.find(l => l.id === lsId)?.name ?? '';
    
    await save({ 
      workspace_id: wsId, 
      workspace_name: wsName,
      space_id: spId,     
      space_name: spName,
      list_id: lsId,      
      list_name: lsName 
    });
    
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:50,
                  display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:80 }}>
      <div style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:12,
                    width:'90%', maxWidth:640, overflow:'hidden' }}
           className="animate-in fade-in zoom-in-95 duration-200">
        <div style={{ background:'#161616', borderBottom:'1px solid #1f1f1f',
                      padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:14, fontWeight:500, color:'#fff' }}>
            Integração Projetos (ClickUp)
          </span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#666', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }} className="sm:grid-cols-3 grid-cols-1">
            {[
              { label:'1 · Workspace', value:wsId, onChange:(v:string)=>setWsId(v), options:workspaces, disabled:false },
              { label:'2 · Space',     value:spId, onChange:(v:string)=>setSpId(v), options:spaces, disabled:!wsId },
              { label:'3 · Lista',     value:lsId, onChange:(v:string)=>setLsId(v), options:lists,  disabled:!spId },
            ].map(f => (
              <div key={f.label} style={{ display:'flex', flexDirection:'column', gap:5 }}>
                <label style={{ fontSize:11, color:'#666', textTransform:'uppercase', letterSpacing:'.05em' }}>{f.label}</label>
                <select value={f.value} onChange={e=>f.onChange(e.target.value)} disabled={f.disabled}
                  style={{ background:'#1a1a1a', border:'1px solid #2a2a2a', color: f.disabled ? '#444':'#e0e0e0',
                           borderRadius:7, padding:'8px 10px', fontSize:13, width:'100%' }}>
                  <option value="">Selecionar...</option>
                  {f.options.map((o:Option) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ borderRadius:8, padding:'12px 16px', marginBottom:16,
                        background: status==='online' ? '#0a2a1a' : '#1a1a1a',
                        border: `1px solid ${status==='online' ? '#1a5a3a' : '#2a2a2a'}`,
                        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color: status==='online' ? '#4ade80' : '#fbbf24' }}>
                {status==='online' ? 'INTEGRAÇÃO ONLINE' : 'AGUARDANDO SELEÇÃO'}
              </div>
              <div style={{ fontSize:11, color:'#555', marginTop:2 }}>
                {status==='online'
                  ? `Conectado à lista ClickUp ID: ${lsId}`
                  : 'Selecione workspace, space e lista para conectar'}
              </div>
            </div>
            {status==='online' && lsId && (
              <a href={`https://app.clickup.com/${wsId}/v/li/${lsId}`}
                target="_blank" rel="noreferrer"
                style={{ background:'transparent', border:'1px solid #f9731444', color:'#f97316',
                         borderRadius:6, padding:'6px 12px', fontSize:11, textDecoration:'none', whiteSpace:'nowrap' }}
                className="hover:bg-[#f9731611] transition-colors">
                ABRIR NO CLICKUP ↗
              </a>
            )}
          </div>

          <p style={{ fontSize:11, color:'#444', borderTop:'1px solid #1f1f1f', paddingTop:12, marginBottom:16 }}>
            Nota: Toda alteração de workspace ou space limpa as seleções dependentes para evitar inconsistências.
            A sincronização reflete imediatamente em Sprints, Backlog, Aprovações e Prazos & Entregas.
          </p>

          <button onClick={handleSave} disabled={!lsId || saving}
            style={{ background: lsId ? '#f97316' : '#2a2a2a', color: lsId ? '#fff' : '#555',
                     border:'none', borderRadius:7, padding:'9px 0', fontSize:13,
                     fontWeight:500, cursor: lsId ? 'pointer' : 'not-allowed', width:'100%',
                     display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            className={lsId && !saving ? "hover:bg-[#ea580c] transition-colors" : ""}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Salvando...' : 'Salvar configuração'}
          </button>
        </div>
      </div>
    </div>
  );
}
