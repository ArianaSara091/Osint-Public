import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, Radar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono">
      <div className="max-w-md w-full text-center space-y-8 p-8 border border-border/50 rounded-lg bg-card/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />
        
        <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-destructive animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">ERR_404</h1>
          <p className="text-xl text-muted-foreground uppercase">Sector Not Found</p>
        </div>
        
        <div className="bg-muted p-4 rounded text-left border border-border font-mono text-xs text-muted-foreground space-y-1">
          <p>{`> System intercept failed.`}</p>
          <p>{`> Requested endpoint does not exist.`}</p>
          <p>{`> Terminating connection attempt.`}</p>
        </div>
        
        <Link href="/">
          <Button className="w-full font-mono tracking-widest h-12 bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
            <Radar className="w-4 h-4 mr-2" />
            RETURN TO DASHBOARD
          </Button>
        </Link>
      </div>
    </div>
  );
}