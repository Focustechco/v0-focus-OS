"use client"

import { useState, useRef, useEffect } from "react";
import { useMinhasTarefas } from "@/lib/hooks/use-minhas-tarefas";

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Icon = {
  bolt: (s = 16, c = "#FF6B00") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  calendar: (s = 13, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  check: (s = 13, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  alert: (s = 13, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  clock: (s = 12, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  folder: (s = 11, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  plus: (s = 14, c = "#000") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  chevL: (s = 15, c = "#888") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevR: (s = 15, c = "#888") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  x: (s = 14, c = "#555") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  trash: (s = 13, c = "#ef4444") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  edit: (s = 13, c = "#888") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const HOURS     = Array.from({ length: 13 }, (_, i) => i + 7);
const DAYS_WEEK = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const PROJECTS  = ["Geral"]; 
const PRIORITIES = ["BAIXA", "MÉDIA", "ALTA"];
const COLORS    = ["#FF6B00", "#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#ec4899"];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    background: "#0a0a0a", color: "#d8d8d8", minHeight: "100%", height: "100%",
    fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
    display: "flex", flexDirection: "column", fontSize: 13,
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 24px", borderBottom: "1px solid #181818",
  },
  pageTitle: { fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: -0.5 },
  chip: {
    fontSize: 11, padding: "3px 10px", borderRadius: 6,
    border: "1px solid #1e1e1e", color: "#555", background: "#0f0f0f",
  },
  primaryBtn: {
    background: "#FF6B00", color: "#000", border: "none",
    padding: "8px 16px", borderRadius: 7, fontWeight: 800, fontSize: 12,
    cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.2,
  },
  controls: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 24px", borderBottom: "1px solid #131313", gap: 10,
  },
  todayBtn: {
    background: "#FF6B00", color: "#000", border: "none",
    padding: "5px 13px", borderRadius: 6, fontWeight: 700, fontSize: 11,
    cursor: "pointer", fontFamily: "inherit",
  },
  navBtn: {
    background: "#111", border: "1px solid #1e1e1e", width: 28, height: 28,
    borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
  },
  monthLbl: { fontSize: 12, fontWeight: 700, color: "#bbb", textTransform: "capitalize", letterSpacing: 0.3 },
  tGroup: { display: "flex", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 7, overflow: "hidden" },
  tBtn: {
    background: "none", color: "#505050", border: "none", padding: "5px 12px",
    fontSize: 10, cursor: "pointer", fontFamily: "inherit", fontWeight: 700,
    letterSpacing: 0.5, textTransform: "uppercase", transition: "all 0.1s",
  },
  tBtnOn: { background: "#FF6B00", color: "#000" },

  calWrap: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  dayHdr: { display: "flex", borderBottom: "1px solid #161616", flexShrink: 0 },
  dayCell: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "9px 0", borderRight: "1px solid #131313" },
  dayCellToday: { background: "#FF6B0007" },
  dayName: { fontSize: 9, color: "#3a3a3a", fontWeight: 700, letterSpacing: 1.3, textTransform: "uppercase" },
  dayNum: { fontSize: 16, fontWeight: 800, color: "#4a4a4a", marginTop: 3 },
  dayNumToday: { background: "#FF6B00", color: "#000", width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 },
  hourLbl: { height: 64, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 10, paddingTop: 6, fontSize: 9, color: "#2e2e2e", fontWeight: 600, letterSpacing: 0.4 },
  dayCol: { flex: 1, position: "relative", borderRight: "1px solid #0f0f0f" },
  dayColToday: { background: "#FF6B0003" },
  hrLine: { height: 64, borderTop: "1px solid #141414", boxSizing: "border-box" },
  nowLine: { position: "absolute", left: 0, right: 0, height: 1, background: "#FF6B00", zIndex: 3, pointerEvents: "none" },
  nowDot: { width: 7, height: 7, borderRadius: "50%", background: "#FF6B00", position: "absolute", left: -3, top: -3 },
  clickLayer: { position: "absolute", inset: 0, zIndex: 1, cursor: "crosshair" },

  overlay: { position: "fixed", inset: 0, background: "#000000d8", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" },
  modal: { background: "#0e0e0e", border: "1px solid #1c1c1c", borderRadius: 12, padding: 22, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 14, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 100px #000000a0" },
  mHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  mTitle: { fontSize: 14, fontWeight: 800, color: "#f0f0f0" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" },
  typeBtn: { flex: 1, padding: "8px 12px", borderRadius: 8, background: "#131313", border: "1px solid #1e1e1e", color: "#505050", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s" },
  typeBtnOn: { background: "#FF6B0015", border: "1px solid #FF6B0055", color: "#FF6B00" },
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 },
  g3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 11 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  lbl: { fontSize: 9, color: "#3e3e3e", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" },
  inp: { background: "#090909", border: "1px solid #1e1e1e", borderRadius: 7, padding: "8px 11px", color: "#cccccc", fontSize: 12, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" },
  sel: { background: "#090909", border: "1px solid #1e1e1e", borderRadius: 7, padding: "8px 11px", color: "#cccccc", fontSize: 12, fontFamily: "inherit", outline: "none", width: "100%", cursor: "pointer" },
  prioBtn: { padding: "5px 13px", borderRadius: 6, background: "#131313", border: "1px solid #1c1c1c", color: "#4a4a4a", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.6 },
  prioBtnOn: { background: "#FF6B0015", border: "1px solid #FF6B00", color: "#FF6B00" },
  ghostBtn: { background: "none", border: "1px solid #1e1e1e", color: "#606060", padding: "7px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const toTop = (min: number, sh = 7) => ((min - sh * 60) / 60) * 64;
const evH   = (s: string, e: string) => Math.max(((toMin(e) - toMin(s)) / 60) * 64, 28);

function weekDates(base: Date) {
  const d = new Date(base); d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x; });
}
const fmtD  = (d: Date) => d.toLocaleDateString("pt-BR", { day: "numeric" });
const fmtMY = (d: Date) => d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
const isToday = (d: Date) => {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
};

function EventCard({ ev, onClick }: { ev: any, onClick: any }) {
  const top = toTop(toMin(ev.start));
  const h   = evH(ev.start, ev.end);
  return (
    <div onClick={() => onClick(ev)} style={{
      position: "absolute", top, left: 3, right: 3, height: h,
      background: ev.color + "18", border: `1px solid ${ev.color}38`,
      borderLeft: `3px solid ${ev.color}`, borderRadius: 5,
      padding: "4px 8px", cursor: "pointer", overflow: "hidden",
      transition: "background 0.12s", zIndex: 2, boxSizing: "border-box",
    }}
      onMouseEnter={e => e.currentTarget.style.background = ev.color + "32"}
      onMouseLeave={e => e.currentTarget.style.background = ev.color + "18"}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: ev.color, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {ev.title}
      </div>
      {h > 34 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, color: "#555", fontSize: 10 }}>
          {Icon.clock(9, "#444")} {ev.start} – {ev.end}
        </div>
      )}
      {h > 50 && ev.priority && (
        <div style={{ marginTop: 3, fontSize: 9, fontWeight: 700, letterSpacing: 0.7, background: ev.color + "22", borderRadius: 3, padding: "1px 6px", display: "inline-block", color: ev.color }}>
          {ev.priority}
        </div>
      )}
      {h > 50 && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 3, color: "#444", fontSize: 9 }}>
          {Icon.folder(9, "#3a3a3a")} {ev.project}
        </div>
      )}
    </div>
  );
}

function EventModal({ onClose, onSave, initial }: { onClose: any, onSave: any, initial?: any }) {
  const [form, setForm] = useState(initial || {
    title: "", type: "compromisso", project: PROJECTS[0],
    start: "09:00", end: "10:00", day: new Date().getDay(),
    color: "#FF6B00", priority: "MÉDIA", description: "",
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div style={S.overlay as any} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modal as any}>

        <div style={S.mHead as any}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {Icon.bolt(15, "#FF6B00")}
            <span style={S.mTitle as any}>{initial ? "Editar evento" : "Novo evento"}</span>
          </div>
          <button onClick={onClose} style={S.iconBtn as any}>{Icon.x(14, "#444")}</button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {[
            { v: "compromisso", label: "Compromisso", ic: Icon.calendar(12, "currentColor") },
            { v: "tarefa",      label: "Tarefa",      ic: Icon.check(12, "currentColor") },
          ].map(({ v, label, ic }) => (
            <button key={v} onClick={() => set("type", v)}
              style={{ ...S.typeBtn, ...(form.type === v ? S.typeBtnOn : {}) } as any}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{ic} {label}</span>
            </button>
          ))}
        </div>

        <div style={S.g2 as any}>
          <div style={S.field as any}><label style={S.lbl as any}>Título *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Daily standup..." style={S.inp as any} />
          </div>
          <div style={S.field as any}><label style={S.lbl as any}>Projeto</label>
            <select value={form.project} onChange={e => set("project", e.target.value)} style={S.sel as any}>
              {PROJECTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={S.g3 as any}>
          <div style={S.field as any}><label style={S.lbl as any}>Dia</label>
            <select value={form.day} onChange={e => set("day", Number(e.target.value))} style={S.sel as any}>
              {DAYS_WEEK.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div style={S.field as any}><label style={S.lbl as any}>Início</label>
            <input type="time" value={form.start} onChange={e => set("start", e.target.value)} style={S.inp as any} />
          </div>
          <div style={S.field as any}><label style={S.lbl as any}>Fim</label>
            <input type="time" value={form.end} onChange={e => set("end", e.target.value)} style={S.inp as any} />
          </div>
        </div>

        {form.type === "tarefa" && (
          <div style={S.field as any}><label style={S.lbl as any}>Prioridade</label>
            <div style={{ display: "flex", gap: 7 }}>
              {PRIORITIES.map(p => (
                <button key={p} onClick={() => set("priority", p)}
                  style={{ ...S.prioBtn, ...(form.priority === p ? S.prioBtnOn : {}) } as any}>{p}</button>
              ))}
            </div>
          </div>
        )}

        <div style={S.field as any}><label style={S.lbl as any}>Cor</label>
          <div style={{ display: "flex", gap: 7 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => set("color", c)} style={{
                width: 22, height: 22, borderRadius: 4, background: c, cursor: "pointer", border: "none",
                outline: form.color === c ? `2px solid ${c}` : "2px solid transparent", outlineOffset: 2,
              }} />
            ))}
          </div>
        </div>

        <div style={S.field as any}><label style={S.lbl as any}>Descrição</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Detalhes..." rows={2} style={{ ...S.inp, resize: "vertical", lineHeight: 1.6 } as any} />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={S.ghostBtn as any}>Cancelar</button>
          <button onClick={() => { if (form.title.trim()) { onSave(form); onClose(); } }} style={S.primaryBtn as any}>
            {initial ? "Salvar" : "Criar evento"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ ev, onClose, onDelete, onEdit }: { ev: any, onClose: any, onDelete: any, onEdit: any }) {
  return (
    <div style={S.overlay as any} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modal, maxWidth: 380 } as any}>
        <div style={S.mHead as any}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
            <span style={S.mTitle as any}>{ev.title}</span>
          </div>
          <button onClick={onClose} style={S.iconBtn as any}>{Icon.x(14, "#444")}</button>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <span style={{ ...S.chip, borderColor: ev.color + "50", color: ev.color } as any}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {ev.type === "tarefa" ? Icon.check(11, ev.color) : Icon.calendar(11, ev.color)}
              {ev.type === "tarefa" ? "Tarefa" : "Compromisso"}
            </span>
          </span>
          {ev.priority && <span style={{ ...S.chip, borderColor: "#FF6B0050", color: "#FF6B00" } as any}>{ev.priority}</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#777", fontSize: 12 }}>
            {Icon.clock(12, "#555")} {DAYS_WEEK[ev.day]} · {ev.start} – {ev.end}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#555", fontSize: 12 }}>
            {Icon.folder(11, "#444")} {ev.project}
          </div>
          {ev.description && (
            <div style={{ color: "#555", fontSize: 12, lineHeight: 1.7, borderTop: "1px solid #181818", paddingTop: 10, marginTop: 2 }}>
              {ev.description}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={() => onDelete(ev.id)}
            style={{ ...S.ghostBtn, color: "#ef4444", borderColor: "#ef444435", display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, padding: 0 } as any}>
            {Icon.trash(13, "#ef4444")}
          </button>
          <button onClick={onEdit}
            style={{ ...S.ghostBtn, display: "flex", alignItems: "center", gap: 5 } as any}>
            {Icon.edit(13, "#777")} Editar
          </button>
          <button onClick={onClose} style={S.primaryBtn as any}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export function AgendaModule() {
  const [base, setBase]       = useState(new Date());
  
  // Integração real com o DB do Focus OS
  const { tarefas } = useMinhasTarefas();
  
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [modal, setModal]     = useState<any>(null);   // null | "new" | "detail" | "edit"
  const [sel, setSel]         = useState<any>(null);
  const [filter, setFilter]   = useState("todos");
  const scrollRef             = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 64; }, []);

  // Transforma as tarefas do BD em Eventos e preserva tb eventos manuais já no estado (se houver)
  useEffect(() => {
    // Retira eventos do tipo tarefa antigos para sobescrever com db atualizado
    setLocalEvents(prev => {
      const nonTasks = prev.filter(e => e.type !== "tarefa");
      const mappedTasks = tarefas.map(t => {
        let dayIdx = 1; 
        if (t.prazo) dayIdx = new Date(t.prazo).getDay();
        
        let pColor = "#22c55e"; // baixa
        if (t.prioridade === "media") pColor = "#f59e0b";
        if (t.prioridade === "alta" || t.prioridade === "ALTA") pColor = "#ef4444";
        
        return {
          id: t.id,
          title: t.titulo,
          type: "tarefa",
          project: t.projeto_nome || "Geral",
          start: "10:00", // fixo mock caso n tenha hora
          end: "11:00",
          day: dayIdx,
          color: pColor,
          priority: String(t.prioridade).toUpperCase(),
          description: t.descricao || "",
          realDate: t.prazo
        }
      });
      return [...nonTasks, ...mappedTasks];
    });
  }, [tarefas]);

  const wk       = weekDates(base);
  const prevWk   = () => { const d = new Date(base); d.setDate(d.getDate() - 7); setBase(d); };
  const nextWk   = () => { const d = new Date(base); d.setDate(d.getDate() + 7); setBase(d); };
  const filtered = localEvents.filter(e => filter === "todos" || e.type === filter);

  const save = (form: any) => {
    if (form.id) setLocalEvents(p => p.map(e => e.id === form.id ? { ...e, ...form } : e));
    else         setLocalEvents(p => [...p, { ...form, id: Date.now() }]);
  };
  const del  = (id: any) => { setLocalEvents(p => p.filter(e => e.id !== id)); setModal(null); };

  const nMeet = localEvents.filter(e => e.type === "compromisso").length;
  const nTask = localEvents.filter(e => e.type === "tarefa").length;
  const nHigh = localEvents.filter(e => e.priority === "ALTA").length;

  return (
    <div style={S.root as any}>

      {/* TOP BAR */}
      <div style={S.topBar as any}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Icon.bolt(17, "#FF6B00")}
            <span style={S.pageTitle as any}>Agenda</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={S.chip as any}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {Icon.calendar(11, "#555")} {nMeet} compromissos
              </span>
            </span>
            <span style={S.chip as any}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {Icon.check(11, "#555")} {nTask} tarefas
              </span>
            </span>
            {nHigh > 0 && (
              <span style={{ ...S.chip, borderColor: "#ef444435", color: "#ef4444" } as any}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {Icon.alert(11, "#ef4444")} {nHigh} alta prioridade
                </span>
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setModal("new")} style={S.primaryBtn as any}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {Icon.plus(13, "#000")} Novo evento
          </span>
        </button>
      </div>

      {/* CONTROLS */}
      <div style={S.controls as any}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <button onClick={() => setBase(new Date())} style={S.todayBtn as any}>Hoje</button>
          <button onClick={prevWk} style={S.navBtn as any}>{Icon.chevL(15, "#777")}</button>
          <button onClick={nextWk} style={S.navBtn as any}>{Icon.chevR(15, "#777")}</button>
          <span style={S.monthLbl as any}>{fmtMY(wk[3])}</span>
        </div>
        <div style={S.tGroup as any}>
          {[["todos","Todos"],["compromisso","Compromissos"],["tarefa","Tarefas"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ ...S.tBtn, ...(filter === v ? S.tBtnOn : {}) } as any}>{l}</button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div style={S.calWrap as any}>
        <div style={S.dayHdr as any}>
          <div style={{ width: 52, flexShrink: 0 }} />
          {wk.map((d, i) => (
            <div key={i} style={{ ...S.dayCell, ...(isToday(d) ? S.dayCellToday : {}) } as any}>
              <span style={S.dayName as any}>{DAYS_WEEK[i]}</span>
              <span style={isToday(d) ? { ...S.dayNum, ...S.dayNumToday } : S.dayNum as any}>{fmtD(d)}</span>
            </div>
          ))}
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ display: "flex", minHeight: HOURS.length * 64 }}>
            <div style={{ width: 52, flexShrink: 0 }}>
              {HOURS.map(h => (
                <div key={h} style={S.hourLbl as any}>{String(h).padStart(2,"0")}:00</div>
              ))}
            </div>

            {wk.map((d, di) => (
              <div key={di} style={{ ...S.dayCol, ...(isToday(d) ? S.dayColToday : {}) } as any}>
                {HOURS.map(h => <div key={h} style={S.hrLine as any} />)}

                {isToday(d) && (
                  <div style={{ ...S.nowLine, top: toTop(new Date().getHours() * 60 + new Date().getMinutes()) } as any}>
                    <div style={S.nowDot as any} />
                  </div>
                )}

                {filtered.filter(e => e.day === di).map(ev => (
                  <EventCard key={ev.id} ev={ev} onClick={(ev: any) => { setSel(ev); setModal("detail"); }} />
                ))}

                <div style={S.clickLayer as any} onClick={() => setModal("new")} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal === "new"    && <EventModal onClose={() => setModal(null)} onSave={save} />}
      {modal === "edit"   && sel && <EventModal initial={sel} onClose={() => { setModal(null); setSel(null); }} onSave={save} />}
      {modal === "detail" && sel && (
        <DetailModal ev={sel}
          onClose={() => { setModal(null); setSel(null); }}
          onDelete={del}
          onEdit={() => setModal("edit")}
        />
      )}
    </div>
  );
}
