import { Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
              BLACK_OSINT
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Open-source intelligence platform
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Sign in to continue</h2>
            <p className="text-sm text-muted-foreground">
              Connect your Discord account to access the platform.
            </p>
          </div>

          <Button
            onClick={handleDiscordLogin}
            className="w-full h-12 font-semibold text-white rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95"
            style={{ backgroundColor: "#5865F2" }}
          >
            <DiscordIcon />
            Continue with Discord
          </Button>

          <p className="text-xs text-center text-muted-foreground/70 leading-relaxed">
            By signing in you agree to use this platform responsibly.
            Only your Discord ID, username, and avatar are stored.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50">
          <Zap className="w-3 h-3" />
          <span>Secured · Encrypted · Private</span>
        </div>
      </div>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}
