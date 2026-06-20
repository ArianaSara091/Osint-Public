import { useState, useEffect } from "react";
import { Shield, Monitor, Wifi, Clock, User, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAuth } from "@/contexts/auth";

type AccessLog = {
  id: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  action: string;
  createdAt: string;
};

function parseDevice(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/Macintosh/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function parseBrowser(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Unknown";
}

export default function AdminLogs() {
  const { state } = useAuth();
  const user = state.status === "authenticated" ? state.user : null;
  const isOwner = user && (user as typeof user & { isOwner?: boolean }).isOwner;

  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/logs", { credentials: "include" });
      if (res.status === 403) { setError("Access denied — owner only."); return; }
      if (!res.ok) { setError("Failed to load logs."); return; }
      setLogs((await res.json()) as AccessLog[]);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  if (!isOwner) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto opacity-40" />
          <p className="font-mono text-sm">ACCESS DENIED</p>
          <p className="text-xs">Owner credentials required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            ACCESS LOGS
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All user logins — IP address, device, browser. Owner-only view.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2 font-mono text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          REFRESH
        </Button>
      </div>

      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4 text-red-400 font-mono text-sm">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : logs.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="py-16 flex flex-col items-center text-muted-foreground">
            <Shield className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-mono text-sm">NO LOGIN EVENTS YET</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="bg-card border-border/60 hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">

                {/* Avatar */}
                {log.avatar ? (
                  <img src={log.avatar} alt={log.username} className="w-10 h-10 rounded-full ring-1 ring-border flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {log.displayName[0].toUpperCase()}
                  </div>
                )}

                {/* User info */}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">{log.displayName}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate">@{log.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <Wifi className="w-3.5 h-3.5 flex-shrink-0 text-cyan-500/70" />
                    <span className="truncate">{log.ipAddress ?? "—"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <Monitor className="w-3.5 h-3.5 flex-shrink-0 text-violet-500/70" />
                    <span>{parseDevice(log.userAgent)} · {parseBrowser(log.userAgent)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-mono uppercase text-green-400 border-green-500/20 bg-green-500/5 flex-shrink-0">
                  {log.action}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground/50 font-mono text-center">
        Showing last 200 events · Discord ID: {user?.id}
      </p>
    </div>
  );
}
