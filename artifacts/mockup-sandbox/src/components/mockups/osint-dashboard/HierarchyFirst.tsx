import React from "react";
import { Search, Activity, Globe, Mail, Phone, Hash, AlertTriangle, CheckCircle2, XCircle, Clock, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock Data
const RECENT_OPS = [
  { id: "op-1", query: "johndoe@protonmail.com", type: "Email", status: "Completed", time: "2 mins ago", icon: Mail },
  { id: "op-2", query: "+1 (555) 019-2834", type: "Phone", status: "Active", time: "15 mins ago", icon: Phone },
  { id: "op-3", query: "x.com/shadow_broker", type: "Social", status: "Completed", time: "1 hour ago", icon: Globe },
  { id: "op-4", query: "192.168.1.105", type: "IP Address", status: "Failed", time: "3 hours ago", icon: Hash },
];

const TRENDING_SIGNALS = [
  { rank: 1, name: "APT29 Phishing Campaign", hits: "12.4k" },
  { rank: 2, name: "CVE-2024-38012", hits: "9.2k" },
  { rank: 3, name: "Telegram Dark Web Market", hits: "8.1k" },
  { rank: 4, name: "Emotet Botnet Node", hits: "6.5k" },
  { rank: 5, name: "NullBulge Ransomware", hits: "5.3k" },
  { rank: 6, name: "SolarWinds Supply Chain", hits: "4.8k" },
  { rank: 7, name: "Cobalt Strike Beacon", hits: "3.9k" },
  { rank: 8, name: "Log4Shell Exploits", hits: "3.1k" },
];

export function HierarchyFirst() {
  return (
    <div className="min-h-screen bg-[#0a0e14] text-slate-200 p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER / HERO SEARCH (Primary Visual Weight) */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-light tracking-tight text-white">Sentinel OSINT</h1>
            <p className="text-slate-500 text-sm">Initiate new investigation or query threat intelligence databases.</p>
          </div>

          <div className="bg-[#111827] rounded-xl p-2 ring-1 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col md:flex-row gap-2 relative z-10">
            <div className="flex-1 flex items-center bg-[#0a0e14] rounded-lg px-4 border border-slate-800 focus-within:border-cyan-500/50 transition-colors">
              <Search className="w-5 h-5 text-cyan-500 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Enter email, phone, IP, domain, or handle..." 
                className="w-full bg-transparent border-none text-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-0 py-4"
              />
            </div>
            <div className="w-full md:w-48 shrink-0">
              <Select defaultValue="all">
                <SelectTrigger className="w-full h-full min-h-[60px] bg-[#0a0e14] border-slate-800 text-slate-300 rounded-lg">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-slate-800 text-slate-200">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="email">Email Identity</SelectItem>
                  <SelectItem value="phone">Phone Records</SelectItem>
                  <SelectItem value="domain">Domain / IP</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="h-[60px] px-8 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-lg rounded-lg shrink-0 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              Execute Search
            </Button>
          </div>
        </section>

        {/* COMPRESSED STATS ROW (Secondary Visual Weight) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#111827] border-slate-800/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Searches</p>
              <p className="text-xl text-slate-200 font-semibold">14,289</p>
            </div>
            <Activity className="w-5 h-5 text-slate-600" />
          </Card>
          <Card className="bg-[#111827] border-slate-800/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Active 24h</p>
              <p className="text-xl text-slate-200 font-semibold">342</p>
            </div>
            <Clock className="w-5 h-5 text-slate-600" />
          </Card>
          <Card className="bg-[#111827] border-slate-800/60 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Top Type</p>
              <p className="text-xl text-slate-200 font-semibold">Domain / IP</p>
            </div>
            <Globe className="w-5 h-5 text-slate-600" />
          </Card>
        </section>

        {/* MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* RECENT OPERATIONS (Hierarchical List) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Recent Operations
              </h2>
              <Button variant="link" className="text-cyan-500 hover:text-cyan-400 text-sm p-0 h-auto">
                View All History <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {RECENT_OPS.map((op) => {
                const Icon = op.icon;
                const statusColor = 
                  op.status === "Active" ? "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" : 
                  op.status === "Failed" ? "text-red-400 bg-red-400/10 border-red-400/20" : 
                  "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
                
                const StatusIcon = 
                  op.status === "Active" ? Activity : 
                  op.status === "Failed" ? XCircle : 
                  CheckCircle2;

                return (
                  <div key={op.id} className="group flex items-center gap-4 p-4 rounded-lg bg-[#111827]/50 hover:bg-[#111827] border border-transparent hover:border-slate-800 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-slate-200 truncate">{op.query}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">{op.type}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="text-xs text-slate-500">{op.time}</span>
                      </div>
                    </div>

                    <Badge variant="outline" className={`ml-auto font-normal flex gap-1.5 items-center px-2.5 py-0.5 ${statusColor}`}>
                      <StatusIcon className="w-3 h-3" />
                      {op.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </section>

          {/* TRENDING SIGNALS (Ranked List) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                Trending Signals
              </h2>
            </div>

            <div className="bg-[#111827] border border-slate-800/60 rounded-xl p-1">
              {TRENDING_SIGNALS.map((signal, idx) => (
                <div key={signal.rank} className="flex items-center gap-4 p-3 hover:bg-slate-800/30 rounded-lg transition-colors group cursor-pointer">
                  <div className={`w-6 text-center text-sm font-mono ${idx < 3 ? 'text-cyan-500 font-bold' : 'text-slate-600'}`}>
                    {signal.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-slate-300 font-medium truncate group-hover:text-cyan-400 transition-colors">{signal.name}</h4>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {signal.hits}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
