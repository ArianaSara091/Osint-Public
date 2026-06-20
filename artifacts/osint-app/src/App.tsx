import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout";
import { AuthProvider, useAuth } from "@/contexts/auth";
import { useEffect } from "react";

import Dashboard from "@/pages/dashboard";
import Searches from "@/pages/searches";
import Targets from "@/pages/targets";
import TargetDetail from "@/pages/target-detail";
import Posts from "@/pages/posts";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import AdminLogs from "@/pages/admin-logs";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (state.status === "unauthenticated") {
    return <Redirect to="/login" />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/searches" component={Searches} />
        <Route path="/targets" component={Targets} />
        <Route path="/targets/:id" component={TargetDetail} />
        <Route path="/posts" component={Posts} />
        <Route path="/admin/logs" component={AdminLogs} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route component={ProtectedRoutes} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
