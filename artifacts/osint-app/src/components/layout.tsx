import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Search, Crosshair, Globe, Database, Radar, LogOut, Shield } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth";

interface LayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();
  const { state, logout } = useAuth();
  const user = state.status === "authenticated" ? state.user : null;

  const navItems = [
    { href: "/", label: "Dashboard", icon: Radar },
    { href: "/searches", label: "Search History", icon: Search },
    { href: "/targets", label: "Saved Targets", icon: Crosshair },
    { href: "/posts", label: "Public Posts", icon: Globe },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-sidebar">
        <div className="h-14 flex items-center px-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary font-mono font-bold tracking-tight">
            <Database className="w-4 h-4" />
            <span>BLACK OSINT</span>
          </div>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}

          {/* Owner-only: Admin Logs */}
          {user?.isOwner && (
            <>
              <div className="mt-3 mb-1 px-3">
                <span className="text-[10px] font-mono uppercase text-muted-foreground/50 tracking-widest">Owner</span>
              </div>
              <Link href="/admin/logs">
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium ${
                    location === "/admin/logs"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Access Logs
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* User + logout */}
        {user && (
          <div className="px-3 pb-3 pt-1 border-t border-border/50">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full ring-1 ring-border flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {(user.global_name ?? user.username)[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {user.global_name ?? user.username}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="p-4 border-t border-border/50 text-xs font-mono text-muted-foreground flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${health?.status === "ok" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {health?.status === "ok" ? "SYSTEM_ONLINE" : "SYSTEM_OFFLINE"}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />
        <div className="flex-1 overflow-y-auto z-10 relative">{children}</div>
      </main>
    </div>
  );
}
