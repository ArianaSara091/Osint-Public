import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  BarChart3,
  ShieldAlert,
  Clock,
  ChevronDown,
  TrendingUp,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock Data
const RECENT_OPERATIONS = [
  {
    id: "OP-9921",
    query: "discord.gg/malware-market",
    type: "URL",
    status: "completed",
    timestamp: "2023-10-27 14:32",
  },
  {
    id: "OP-9920",
    query: "0x7a56...9fB2",
    type: "Wallet",
    status: "pending",
    timestamp: "2023-10-27 14:15",
  },
  {
    id: "OP-9919",
    query: "shadow_broker_22",
    type: "Username",
    status: "failed",
    timestamp: "2023-10-27 13:45",
  },
  {
    id: "OP-9918",
    query: "192.168.1.100",
    type: "IP",
    status: "completed",
    timestamp: "2023-10-27 12:10",
  },
];

const TRENDING_SIGNALS = [
  { rank: 1, signal: "CVE-2023-38545", hits: 14502 },
  { rank: 2, signal: "Lazarus Group Activity", hits: 9210 },
  { rank: 3, signal: "Phishing: Microsoft365", hits: 8405 },
  { rank: 4, signal: "Ransomware: LockBit 3.0", hits: 6720 },
  { rank: 5, signal: "Telegram C2 Channels", hits: 5104 },
  { rank: 6, signal: "Compromised AWS Keys", hits: 4890 },
  { rank: 7, signal: "0-day: iOS WebKit", hits: 3200 },
  { rank: 8, signal: "DarkWeb Market Dump", hits: 2840 },
];

export function AccessibilityFirst() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");

  return (
    <div
      className="min-h-screen p-6 md:p-12 font-sans"
      style={{ backgroundColor: "#090d13", color: "#f8fafc" }}
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="border-b-2 border-slate-700 pb-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Black OSINT
          </h1>
          <p className="text-lg text-slate-300">
            Security Intelligence Dashboard
          </p>
        </header>

        {/* Primary Action: Search */}
        <section
          className="rounded-xl p-8 border-2"
          style={{ backgroundColor: "#131a24", borderColor: "#334155" }}
        >
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
            <Search className="w-7 h-7 text-cyan-400" />
            Initiate Investigation
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-3">
                <Label
                  htmlFor="target-type"
                  className="text-[16px] font-semibold text-slate-200"
                >
                  Target Type
                </Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger
                    id="target-type"
                    className="h-[52px] text-[16px] bg-[#090d13] border-2 border-slate-600 focus:border-cyan-400 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#131a24]"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#131a24] border-2 border-slate-600">
                    <SelectItem value="all" className="text-[16px] py-3 focus:bg-slate-800">
                      All Types
                    </SelectItem>
                    <SelectItem value="ip" className="text-[16px] py-3 focus:bg-slate-800">
                      IP Address
                    </SelectItem>
                    <SelectItem value="domain" className="text-[16px] py-3 focus:bg-slate-800">
                      Domain / URL
                    </SelectItem>
                    <SelectItem value="wallet" className="text-[16px] py-3 focus:bg-slate-800">
                      Crypto Wallet
                    </SelectItem>
                    <SelectItem value="user" className="text-[16px] py-3 focus:bg-slate-800">
                      Username
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3 space-y-3">
                <Label
                  htmlFor="search-query"
                  className="text-[16px] font-semibold text-slate-200"
                >
                  Search Target
                </Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    id="search-query"
                    placeholder="Enter indicator of compromise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 h-[52px] text-[16px] px-4 bg-[#090d13] border-2 border-slate-600 placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131a24]"
                  />
                  <Button
                    type="button"
                    className="h-[52px] px-8 text-[16px] font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131a24]"
                  >
                    Run Search
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="rounded-xl p-6 border-2 flex items-start gap-4"
            style={{ backgroundColor: "#131a24", borderColor: "#334155" }}
          >
            <div className="p-3 bg-slate-800 rounded-lg">
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-300 mb-1">
                Total Searches
              </h3>
              <p className="text-3xl font-bold font-mono tracking-tight text-white">
                14,291
              </p>
            </div>
          </div>
          <div
            className="rounded-xl p-6 border-2 flex items-start gap-4"
            style={{ backgroundColor: "#131a24", borderColor: "#334155" }}
          >
            <div className="p-3 bg-slate-800 rounded-lg">
              <Clock className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-300 mb-1">
                Recent 24h
              </h3>
              <p className="text-3xl font-bold font-mono tracking-tight text-white">
                384
              </p>
            </div>
          </div>
          <div
            className="rounded-xl p-6 border-2 flex items-start gap-4"
            style={{ backgroundColor: "#131a24", borderColor: "#334155" }}
          >
            <div className="p-3 bg-slate-800 rounded-lg">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-300 mb-1">
                Top Type
              </h3>
              <p className="text-2xl font-bold tracking-tight text-white mt-1">
                Domains (42%)
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Operations */}
          <section
            className="lg:col-span-2 rounded-xl border-2 overflow-hidden flex flex-col"
            style={{ backgroundColor: "#131a24", borderColor: "#334155" }}
          >
            <div className="p-6 border-b-2 border-slate-700 bg-slate-800/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Target className="w-6 h-6 text-cyan-400" />
                Recent Operations
              </h2>
            </div>
            <div className="p-0 flex-1">
              <ul className="divide-y-2 divide-slate-700">
                {RECENT_OPERATIONS.map((op) => (
                  <li
                    key={op.id}
                    className="p-6 hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[15px] font-bold text-slate-300">
                          {op.id}
                        </span>
                        <span className="px-3 py-1 rounded border-2 border-slate-600 bg-slate-800 text-[14px] font-semibold text-slate-200">
                          {op.type}
                        </span>
                      </div>
                      <p className="text-lg font-mono font-bold text-white break-all">
                        {op.query}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {op.status === "completed" && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-950 border-2 border-emerald-600 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-[15px] font-bold">
                              Completed
                            </span>
                          </div>
                        )}
                        {op.status === "pending" && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-amber-950 border-2 border-amber-500 text-amber-400">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="text-[15px] font-bold">
                              Pending
                            </span>
                          </div>
                        )}
                        {op.status === "failed" && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-950 border-2 border-red-500 text-red-400">
                            <XCircle className="w-5 h-5" />
                            <span className="text-[15px] font-bold">
                              Failed
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[14px] font-mono text-slate-300">
                        {op.timestamp}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Trending Signals */}
          <section
            className="rounded-xl border-2 flex flex-col"
            style={{ backgroundColor: "#131a24", borderColor: "#334155" }}
          >
            <div className="p-6 border-b-2 border-slate-700 bg-slate-800/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                Trending Signals
              </h2>
            </div>
            <div className="p-0 flex-1">
              <ul className="divide-y-2 divide-slate-700">
                {TRENDING_SIGNALS.map((signal) => (
                  <li
                    key={signal.rank}
                    className="p-5 flex items-center gap-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-800 border-2 border-slate-600 text-white font-bold text-lg">
                      {signal.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-bold text-white truncate mb-1">
                        {signal.signal}
                      </p>
                      <p className="text-[14px] text-slate-300 font-mono">
                        {signal.hits.toLocaleString()} hits
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
