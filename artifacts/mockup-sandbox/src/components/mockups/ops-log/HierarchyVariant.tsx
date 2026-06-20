import { useState } from "react";
import { Globe, User, Mail, Phone, Server, Shield, Zap, Search, ChevronDown, ChevronRight, Trash2 } from "lucide-react";

const MOCK = [
  { id: 1, query: "149508730412833594", type: "discord", status: "completed", createdAt: "2026-06-20T11:58:00Z" },
  { id: 2, query: "ariANA", type: "username", status: "completed", createdAt: "2026-06-20T11:50:00Z" },
  { id: 3, query: "cloudflare.com", type: "domain", status: "completed", createdAt: "2026-06-20T09:30:00Z" },
  { id: 4, query: "8.8.8.8", type: "ip", status: "completed", createdAt: "2026-06-20T09:00:00Z" },
  { id: 5, query: "user@gmail.com", type: "email", status: "pending", createdAt: "2026-06-19T22:00:00Z" },
  { id: 6, query: "admin@breach.db", type: "breach", status: "completed", createdAt: "2026-06-19T20:00:00Z" },
  { id: 7, query: "+1 555 000 1234", type: "phone", status: "failed", createdAt: "2026-06-19T18:00:00Z" },
];

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  discord: { icon: <Zap className="w-3.5 h-3.5" />, color: "#5865F2", label: "Discord ID" },
  username: { icon: <User className="w-3.5 h-3.5" />, color: "#22d3ee", label: "Username" },
  domain: { icon: <Globe className="w-3.5 h-3.5" />, color: "#34d399", label: "Domain" },
  ip: { icon: <Server className="w-3.5 h-3.5" />, color: "#f59e0b", label: "IP Address" },
  email: { icon: <Mail className="w-3.5 h-3.5" />, color: "#a78bfa", label: "Email" },
  breach: { icon: <Shield className="w-3.5 h-3.5" />, color: "#f87171", label: "Data Breach" },
  phone: { icon: <Phone className="w-3.5 h-3.5" />, color: "#fb923c", label: "Phone" },
};

const STATUS_STYLE: Record<string, string> = {
  completed: "text-emerald-400 bg-emerald-400/10",
  pending: "text-amber-400 bg-amber-400/10",
  failed: "text-red-400 bg-red-400/10",
};

const grouped = MOCK.reduce<Record<string, typeof MOCK>>((acc, s) => {
  (acc[s.type] = acc[s.type] || []).push(s);
  return acc;
}, {});

export default function HierarchyVariant() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white font-sans">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Page header — tight & intentional */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[#22d3ee] mb-1">
            <Search className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-[0.2em]">Operations Log</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Search History</h1>
          <p className="text-sm text-white/40 mt-0.5">{MOCK.length} records across {Object.keys(grouped).length} intelligence types</p>
        </div>

        {/* Grouped by type — hierarchy is the tradeoff */}
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => {
            const meta = TYPE_META[type];
            return (
              <section key={type}>
                {/* Section heading — type is the primary axis */}
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ color: meta.color }} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest">
                    {meta.icon} {meta.label}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-white/25 font-mono">{items.length}</span>
                </div>

                <div className="space-y-1.5">
                  {items.map((s) => {
                    const isOpen = open === s.id;
                    return (
                      <div key={s.id}>
                        <button
                          onClick={() => setOpen(isOpen ? null : s.id)}
                          className="w-full text-left"
                        >
                          <div className={`rounded-lg border px-4 py-3 flex items-center justify-between gap-4 transition-all
                            ${isOpen
                              ? "bg-white/5 border-[#22d3ee]/30 rounded-b-none"
                              : "bg-white/[0.03] border-white/8 hover:bg-white/5 hover:border-white/15"
                            }`}>

                            {/* Primary: query — the most important thing */}
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-base font-semibold text-white truncate block">{s.query}</span>
                              {/* Secondary: time — supporting metadata */}
                              <span className="text-xs text-white/35 font-mono mt-0.5 block">
                                {new Date(s.createdAt).toLocaleString()} · #{s.id}
                              </span>
                            </div>

                            {/* Status — clear signal, not overwhelming */}
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${STATUS_STYLE[s.status]}`}>
                              {s.status}
                            </span>

                            {/* Expand indicator */}
                            {isOpen
                              ? <ChevronDown className="w-4 h-4 text-[#22d3ee] shrink-0" />
                              : <ChevronRight className="w-4 h-4 text-white/25 shrink-0" />
                            }
                          </div>
                        </button>

                        {isOpen && (
                          <div className="rounded-b-lg border border-t-0 border-[#22d3ee]/30 bg-[#22d3ee]/[0.03] px-4 py-4 text-sm text-white/60 font-mono">
                            Intelligence report would render here.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Tradeoff callout */}
        <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.02] px-5 py-4">
          <p className="text-xs text-white/40 leading-relaxed">
            <span className="text-[#22d3ee] font-semibold">Tradeoff:</span> Groups records by intelligence type, making it fast to scan "all Discord lookups" or "all domains." Loses chronological flow — you can't see what you did in order.
          </p>
        </div>
      </div>
    </div>
  );
}
