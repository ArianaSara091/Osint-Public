import { Router } from "express";

const router = Router();

const DISCORD_CLIENT_ID = process.env["DISCORD_CLIENT_ID"]!;
const DISCORD_CLIENT_SECRET = process.env["DISCORD_CLIENT_SECRET"]!;

function getCallbackUrl(): string {
  const domains = process.env["REPLIT_DOMAINS"];
  const domain = domains?.split(",")[0];
  return domain
    ? `https://${domain}/api/auth/discord/callback`
    : "http://localhost:5000/api/auth/discord/callback";
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

  if (!code) {
    res.status(400).json({ error: "Missing code" });
    return;
  }

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

    req.session.user = {
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name ?? null,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      email: discordUser.email ?? null,
    };

    res.redirect("/");
  } catch (err) {
    req.log.error({ err }, "Discord OAuth error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(req.session.user);
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error({ err }, "Session destroy error");
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.json({ ok: true });
  });
});

export default router;
