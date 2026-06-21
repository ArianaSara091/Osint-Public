import React from "react";

const safe = (v: unknown): React.ReactNode => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};
import { X, Shield, Zap, Globe, Server, User, Mail, Phone, AlertTriangle, CheckCircle, XCircle, Link, Key, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchResultPanelProps {
  search: {
    id: number;
    query: string;
    type: string;
    status: string;
    results: unknown;
    createdAt: string;
  };
  onClose: () => void;
}

function DataRow({ label, value, mono = true, sensitive = false }: { label: string; value: React.ReactNode; mono?: boolean; sensitive?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border/30 last:border-0 gap-4">
      <span className="text-xs text-muted-foreground uppercase tracking-wide shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-right break-all ${mono ? "font-mono" : ""} ${sensitive ? "text-amber-400" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
      </div>
      <div className="bg-background/40 rounded-lg px-4 py-1 border border-border/30">
        {children}
      </div>
    </div>
  );
}

function DiscordResult({ results }: { results: Record<string, unknown> }) {
  const flags = (results.publicFlags as string[]) ?? [];

  if (results.error) {
    return (
      <div className="p-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-sm flex items-start gap-3">
        <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold mb-1">Lookup Failed</div>
          <div>{results.error as string}</div>
        </div>
      </div>
    );
  }

  const avatarUrl = results.avatar as string | null;
  const bannerUrl = results.banner as string | null;

  return (
    <div className="space-y-5">
      {(avatarUrl || bannerUrl) && (
        <div className="relative rounded-lg overflow-hidden border border-border/30 bg-background/40">
          {bannerUrl && (
            <img src={bannerUrl} alt="Banner" className="w-full h-24 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <div className="flex items-end gap-4 px-4 pb-4 pt-2">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-primary/40 -mt-8 relative z-10 bg-background"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="pb-1">
              <div className="font-mono font-bold text-lg text-foreground">
                {results.globalName as string || results.username as string}
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                @{results.username as string}
                {!!results.discriminator && results.discriminator !== "0" && `#${String(results.discriminator)}`}
              </div>
            </div>
          </div>
        </div>
      )}

      <Section title="Account Identity" icon={<Zap className="w-4 h-4" />}>
        <DataRow label="User ID (Snowflake)" value={results.userId as string} />
        <DataRow label="Username" value={results.username as string} />
        {!!results.globalName && <DataRow label="Display Name" value={results.globalName as string} />}
        {!!results.discriminator && results.discriminator !== "0" && (
          <DataRow label="Discriminator" value={`#${String(results.discriminator)}`} />
        )}
        <DataRow label="Account Created" value={new Date(results.createdAt as string).toUTCString()} />
      </Section>

      <Section title="Account Status">
        <DataRow label="Bot Account" value={(results.bot as boolean) ? "Yes" : "No"} />
        <DataRow label="System Account" value={(results.system as boolean) ? "Yes" : "No"} />
        <DataRow label="Nitro Tier" value={(results.nitro as string) || "None"} />
        {!!results.bannerColor && (
          <DataRow label="Banner Color" value={
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded border border-border/50"
                style={{ backgroundColor: results.bannerColor as string }}
              />
              {results.bannerColor as string}
            </span>
          } />
        )}
        {!!results.accentColor && (
          <DataRow label="Accent Color" value={
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded border border-border/50"
                style={{ backgroundColor: results.accentColor as string }}
              />
              {results.accentColor as string}
            </span>
          } />
        )}
        {results.rawPublicFlags !== undefined && (
          <DataRow label="Raw Flags (decimal)" value={String(results.rawPublicFlags)} />
        )}
      </Section>

      {flags.length > 0 && (
        <Section title="Public Badges & Flags">
          <div className="py-2 flex flex-wrap gap-2">
            {flags.map((f) => (
              <Badge key={f} variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/30">
                {f.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      <div className="text-xs text-muted-foreground font-mono px-1 pt-1 border-t border-border/20">
        Note: Discord's public API exposes limited data. Fields like MFA status, email, phone, mutual servers, and connected accounts are only visible to the account owner or require special OAuth scopes.
      </div>
    </div>
  );
}

function BreachResult({ results }: { results: Record<string, unknown> }) {
  const riskScore = results.riskScore as string;
  const breaches = (results.breaches as Record<string, unknown>[]) ?? [];
  const tokens = (results.exposedTokens as Record<string, unknown>[]) ?? [];
  const pastes = (results.pasteExposure as Record<string, unknown>[]) ?? [];

  const riskColor =
    riskScore === "critical" ? "text-red-400 border-red-500/30 bg-red-500/10" :
    riskScore === "medium" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
    riskScore === "low" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
    "text-green-400 border-green-500/30 bg-green-500/10";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between p-4 rounded-lg border bg-background/40 border-border/30">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Risk Assessment</div>
          <Badge variant="outline" className={`text-sm font-mono uppercase font-bold px-3 py-1 ${riskColor}`}>
            {riskScore}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-primary">{results.totalBreaches as number}</div>
          <div className="text-xs text-muted-foreground">breaches found</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold">{((results.totalRecords as number) / 1_000_000).toFixed(1)}M</div>
          <div className="text-xs text-muted-foreground">records exposed</div>
        </div>
      </div>

      <Section title="Breach Timeline" icon={<Shield className="w-4 h-4" />}>
        {!!results.firstSeen && <DataRow label="First Seen" value={results.firstSeen as string} />}
        {!!results.lastSeen && <DataRow label="Last Seen" value={results.lastSeen as string} />}
      </Section>

      {breaches.length === 0 ? (
        <div className="p-6 text-center rounded-lg border border-green-500/20 bg-green-500/5 text-green-400 font-mono">
          <CheckCircle className="w-8 h-8 mx-auto mb-2" />
          No breaches found in monitored databases.
        </div>
      ) : (
        <div className="space-y-3">
          {breaches.map((breach, i) => (
            <div key={i} className="rounded-lg border border-border/40 bg-background/40 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 ${
                    breach.severity === "critical" ? "text-red-400" :
                    breach.severity === "high" ? "text-amber-400" : "text-yellow-400"
                  }`} />
                  <span className="font-mono font-bold">{breach.name as string}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] font-mono uppercase ${
                    breach.severity === "critical" ? "text-red-400 border-red-500/30" :
                    breach.severity === "high" ? "text-amber-400 border-amber-500/30" :
                    "text-yellow-400 border-yellow-500/30"
                  }`}>
                    {breach.severity as string}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{breach.date as string}</span>
                </div>
              </div>
              <div className="px-4 py-3 space-y-1">
                <DataRow label="Records" value={((breach.count as number) / 1_000_000).toFixed(1) + "M"} />
                <DataRow label="Algorithm" value={breach.algorithm as string} />
                <DataRow
                  label="Data Classes"
                  value={(breach.dataClasses as string[]).join(", ")}
                  mono={false}
                />
                {!!breach.sampleData && (
                  <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
                    {Object.entries(breach.sampleData as Record<string, unknown>)
                      .filter(([, v]) => v !== null && v !== undefined)
                      .map(([k, v]) => (
                        <DataRow key={k} label={k} value={String(v)} sensitive={["password", "authToken", "streamKey", "passwordDecrypted"].includes(k)} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tokens.length > 0 && (
        <Section title="Exposed Tokens" icon={<Key className="w-4 h-4" />}>
          {tokens.map((t, i) => (
            <div key={i} className="py-2 border-b border-border/30 last:border-0">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground uppercase">{t.source as string}</span>
                <span className="text-xs text-muted-foreground">{t.date as string}</span>
              </div>
              <div className="font-mono text-xs text-amber-400 break-all mt-1">{t.token as string}</div>
            </div>
          ))}
        </Section>
      )}

      {pastes.length > 0 && (
        <Section title="Paste Exposure">
          {pastes.map((p, i) => (
            <div key={i} className="py-2 border-b border-border/30 last:border-0">
              <DataRow label={p.source as string} value={p.title as string} />
              <DataRow label="Date" value={p.date as string} />
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function GenericResult({ results, type }: { results: Record<string, unknown>; type: string }) {
  const renderValue = (v: unknown): React.ReactNode => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (Array.isArray(v)) {
      if (v.length === 0) return "—";
      if (typeof v[0] === "string" || typeof v[0] === "number") return v.join(", ");
      return (
        <div className="space-y-1">
          {v.slice(0, 6).map((item, i) => (
            <div key={i} className="text-xs bg-primary/5 rounded px-2 py-1">
              {typeof item === "object" ? JSON.stringify(item) : String(item)}
            </div>
          ))}
        </div>
      );
    }
    if (typeof v === "object") {
      return (
        <div className="space-y-1">
          {Object.entries(v as Record<string, unknown>).map(([k, val]) => (
            <div key={k} className="text-xs">
              <span className="text-muted-foreground">{k}: </span>
              <span className="font-mono">{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }
    return String(v);
  };

  return (
    <div className="space-y-5">
      {Object.entries(results)
        .filter(([k]) => k !== "queryTime")
        .map(([key, value]) => {
          const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
          if (isObject) {
            return (
              <Section key={key} title={key.replace(/([A-Z])/g, " $1").toUpperCase()}>
                {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                  <DataRow key={k} label={k} value={renderValue(v)} />
                ))}
              </Section>
            );
          }
          return null;
        })
        .filter(Boolean)}
      <Section title={`${type} Details`}>
        {Object.entries(results)
          .filter(([k, v]) => k !== "queryTime" && (typeof v !== "object" || v === null))
          .map(([k, v]) => (
            <DataRow key={k} label={k} value={renderValue(v)} />
          ))}
      </Section>
    </div>
  );
}

export default function SearchResultPanel({ search, onClose }: SearchResultPanelProps) {
  const results = search.results as Record<string, unknown>;
  if (!results) return null;

  const getIcon = () => {
    switch (search.type) {
      case "discord": return <Zap className="w-5 h-5" />;
      case "breach": return <Shield className="w-5 h-5" />;
      case "domain": return <Globe className="w-5 h-5" />;
      case "ip": return <Server className="w-5 h-5" />;
      case "username": return <User className="w-5 h-5" />;
      case "email": return <Mail className="w-5 h-5" />;
      case "phone": return <Phone className="w-5 h-5" />;
      default: return null;
    }
  };

  const getTitle = () => {
    switch (search.type) {
      case "discord": return "DISCORD ACCOUNT DOSSIER";
      case "breach": return "DATA BREACH REPORT";
      default: return `${search.type.toUpperCase()} INTEL REPORT`;
    }
  };

  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/30">
        <CardTitle className="flex items-center gap-3 font-mono text-sm">
          <span className="text-primary">{getIcon()}</span>
          <span>{getTitle()}</span>
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
            {search.query}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {new Date(search.createdAt).toLocaleString()}
          </span>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
        {search.type === "discord" ? (
          <DiscordResult results={results} />
        ) : search.type === "breach" ? (
          <BreachResult results={results} />
        ) : (
          <GenericResult results={results} type={search.type} />
        )}
      </CardContent>
    </Card>
  );
}
