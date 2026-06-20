import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      username: string;
      global_name: string | null;
      avatar: string | null;
      email: string | null;
    };
  }
}
