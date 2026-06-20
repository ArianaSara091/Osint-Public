import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AuthUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  email: string | null;
  isOwner: boolean;
};

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };

type AuthContextValue = {
  state: AuthState;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) { setState({ status: "unauthenticated" }); return null; }
        return r.json() as Promise<AuthUser>;
      })
      .then((user) => { if (user) setState({ status: "authenticated", user }); })
      .catch(() => setState({ status: "unauthenticated" }));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setState({ status: "unauthenticated" });
  };

  return (
    <AuthContext.Provider value={{ state, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
