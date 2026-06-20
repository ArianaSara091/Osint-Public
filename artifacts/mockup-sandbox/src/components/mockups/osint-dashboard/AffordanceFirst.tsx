import React, { useState } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp,
  Globe, 
  Server, 
  User, 
  Mail, 
  Phone, 
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentOperations = [
  { id: 1, query: "192.168.1.104", type: "ip", typeLabel: "IP Address", status: "completed", timestamp: "10 mins ago", results: 142 },
  { id: 2, query: "darknet_forum_user_09", type: "username", typeLabel: "Username", status: "pending", timestamp: "25 mins ago", results: null },
  { id: 3, query: "suspicious-domain-xs.net", type: "domain", typeLabel: "Domain", status: "completed", timestamp: "1 hour ago", results: 8 },
  { id: 4, query: "john.doe@example.com", type: "email", typeLabel: "Email", status: "failed", timestamp: "3 hours ago", results: null },
];

const trendingSignals = [
  { id: 1, topic: "CVE-2024-1234", category: "Vulnerability", hits: 8432 },
  { id: 2, topic: "Lazarus Group", category: "Threat Actor", hits: 5120 },
  { id: 3, topic: "crypto_mixer_xyz", category: "Dark Web", hits: 3410 },
  { id: 4, topic: "telegram_leak_db", category: "Data Leak", hits: 2891 },
  { id: 5, topic: "solarwinds_reprise", category: "Malware", hits: 2104 },
  { id: 6, topic: "nginx_bypass_0day", category: "Vulnerability", hits: 1840 },
  { id: 7, topic: "phishing_campaign_x", category: "Campaign", hits: 1520 },
  { id: 8, topic: "apt_29_infrastructure", category: "Threat Actor", hits: 1205 },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "ip": return <Server className="w-4 h-4" />;
    case "domain": return <Globe className="w-4 h-4" />;
    case "username": return <User className="w-4 h-4" />;
    case "email": return <Mail className="w-4 h-4" />;
    case "phone": return <Phone className="w-4 h-4" />;
    default: return <Search className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          Failed
        </span>
      );
    default:
      return null;
  }
};

export function AffordanceFirst() {
  const [searchType, setSearchType] = useState("ip");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            Sentinel OSINT
          </h1>
          <p className="text-slate-400 text-sm">Target intelligence and threat hunting dashboard.</p>
        </div>

        {/* Search Bar Component */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden rounded-xl border">
          <div className="p-4 bg-slate-900/50 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Initiate Investigation</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              
              {/* Fake Select for styling control */}
              <div className="relative group sm:w-48">
                <select 
                  className="w-full appearance-none bg-slate-800 border-2 border-slate-700 hover:border-cyan-500/50 text-slate-200 rounded-lg py-3 pl-10 pr-10 outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all cursor-pointer font-medium"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="ip">IP Address</option>
                  <option value="domain">Domain Name</option>
                  <option value="email">Email Address</option>
                  <option value="username">Username</option>
                  <option value="phone">Phone Number</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                  {getTypeIcon(searchType)}
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Input */}
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  placeholder={`Enter ${searchType} to scan...`} 
                  className="w-full bg-slate-950 border-2 border-slate-700 hover:border-slate-600 text-slate-100 rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Execute Button */}
              <button className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(8,145,178,0.6)] transition-all active:scale-95 flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
                Execute Search
              </button>
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900 border-slate-800 rounded-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Total Searches</p>
                <p className="text-3xl font-bold text-white">24,592</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg text-cyan-400">
                <Search className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 rounded-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Recent 24h</p>
                <p className="text-3xl font-bold text-white">843</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg text-emerald-400">
                <Activity className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 rounded-xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Top Target Type</p>
                <p className="text-3xl font-bold text-white">Domain</p>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg text-indigo-400">
                <Globe className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Operations - Highly Interactive */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Operations</h2>
              <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View All History →</button>
            </div>
            
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/50">
              {recentOperations.map((op) => (
                <div key={op.id}>
                  <div 
                    onClick={() => toggleRow(op.id)}
                    className="p-4 flex items-center gap-4 hover:bg-slate-800/80 cursor-pointer transition-colors relative group"
                  >
                    {/* Hover indicator bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-900 transition-colors">
                      {getTypeIcon(op.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-mono text-sm text-slate-200 font-semibold group-hover:text-cyan-300 transition-colors">{op.query}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{op.typeLabel} • {op.timestamp}</div>
                    </div>
                    
                    <div>
                      {getStatusBadge(op.status)}
                    </div>
                    
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 group-hover:bg-cyan-900/40 text-slate-400 group-hover:text-cyan-400 transition-colors">
                      {expandedRow === op.id ? <ChevronUp className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedRow === op.id && (
                    <div className="px-14 py-4 bg-slate-950/50 border-t border-slate-800/50 text-sm animate-in slide-in-from-top-2 duration-200">
                      <div className="flex gap-6 text-slate-400 mb-4">
                        <div>
                          <span className="block text-xs uppercase tracking-wider mb-1">Status</span>
                          <span className="text-slate-200">{op.status === 'completed' ? 'Finished successfully' : op.status === 'pending' ? 'Scan in progress...' : 'Scan aborted due to error'}</span>
                        </div>
                        {op.results !== null && (
                          <div>
                            <span className="block text-xs uppercase tracking-wider mb-1">Findings</span>
                            <span className="text-slate-200">{op.results} signals detected</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors border border-slate-700">View Report</button>
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors border border-slate-700">Re-run Scan</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trending Signals - Read-only styling */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Trending Signals</h2>
            </div>
            
            <Card className="bg-slate-900 border-slate-800 rounded-xl overflow-hidden">
              <div className="divide-y divide-slate-800/50">
                {trendingSignals.map((signal, idx) => (
                  <div key={signal.id} className="p-3 flex items-center gap-3">
                    <div className="w-6 text-center text-xs font-bold text-slate-600">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-300 truncate">{signal.topic}</div>
                      <div className="text-xs text-slate-500">{signal.category}</div>
                    </div>
                    <div className="text-xs font-mono text-cyan-500/80 bg-cyan-500/10 px-2 py-0.5 rounded">
                      {signal.hits.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
