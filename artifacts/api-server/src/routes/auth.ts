import { Router } from "express";
import { db, accessLogsTable } from "@workspace/db";

const router = Router();

const DISCORD_CLIENT_ID = process.env["DISCORD_CLIENT_ID"]!;
const DISCORD_CLIENT_SECRET = process.env["DISCORD_CLIENT_SECRET"]!;

function getCallbackUrl(): string {
  // Render provides RENDER_EXTERNAL_URL automatically
  if (process.env["RENDER_EXTERNAL_URL"]) {
    return `${process.env["RENDER_EXTERNAL_URL"]}/api/auth/discord/callback`;
  }
  // Replit dev/prod domain
  const domains = process.env["REPLIT_DOMAINS"];
  const domain = domains?.split(",")[0];
  if (domain) return `https://${domain}/api/auth/discord/callback`;
  // Local fallback
  return `http://localhost:${process.env["PORT"] ?? 5000}/api/auth/discord/callback`;
}

router.get("/auth/discord", (_req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: getCallbackUrl(),
    response_type: "code",
    scope: "identify email",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get("/auth/discord/callback", async (req, res) => {
  const code = req.query["code"] as string | undefined;
  if (!code) { res.status(400).json({ error: "Missing code" }); return; }

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: getCallbackUrl(),
      }),
    });

    if (!tokenRes.ok) {
      req.log.error({ status: tokenRes.status }, "Discord token exchange failed");
      res.status(502).json({ error: "Token exchange failed" });
      return;
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      req.log.error({ status: userRes.status }, "Discord user fetch failed");
      res.status(502).json({ error: "User fetch failed" });
      return;
    }

    const discordUser = (await userRes.json()) as {
      id: string;
      username: string;
      global_name: string | null;
      avatar: string | null;
      email?: string | null;
    };

    const sessionUser = {
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name ?? null,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      email: discordUser.email ?? null,
    };

    req.session.user = sessionUser;

    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
      req.ip ?? null;
    const ua = (req.headers["user-agent"] as string | undefined) ?? null;

    await db.insert(accessLogsTable).values({
      userId: sessionUser.id,
      username: sessionUser.username,
      displayName: sessionUser.global_name ?? sessionUser.username,
      avatar: sessionUser.avatar,
      ipAddress: ip,
      userAgent: ua,
      action: "login",
    });

    res.redirect("/");
  } catch (err) {
    req.log.error({ err }, "Discord OAuth error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", (req, res) => {
  if (!req.session.user) { res.status(401).json({ error: "Not authenticated" }); return; }
  const OWNER_ID = process.env["OWNER_DISCORD_ID"];
  res.json({ ...req.session.user, isOwner: !!OWNER_ID && req.session.user.id === OWNER_ID });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) { req.log.error({ err }, "Session destroy error"); res.status(500).json({ error: "Logout failed" }); return; }
    res.json({ ok: true });
  });
});

export default router;
