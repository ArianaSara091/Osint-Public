import { Router, type IRouter } from "express";
import { desc, eq, sql, and } from "drizzle-orm";
import { db, searchesTable } from "@workspace/db";
import {
  CreateSearchBody,
  ListSearchesQueryParams,
  GetSearchParams,
  DeleteSearchParams,
  ListSearchesResponse,
  GetSearchResponse,
  GetSearchStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const PUBLIC_FLAGS_MAP: Record<number, string> = {
  1: "DISCORD_EMPLOYEE",
  2: "PARTNERED_SERVER_OWNER",
  4: "HYPESQUAD_EVENTS",
  8: "BUG_HUNTER_LEVEL_1",
  64: "HOUSE_BRAVERY",
  128: "HOUSE_BRILLIANCE",
  256: "HOUSE_BALANCE",
  512: "EARLY_SUPPORTER",
  1024: "TEAM_USER",
  16384: "BUG_HUNTER_LEVEL_2",
  65536: "VERIFIED_BOT",
  131072: "EARLY_VERIFIED_BOT_DEVELOPER",
  262144: "DISCORD_CERTIFIED_MODERATOR",
  524288: "BOT_HTTP_INTERACTIONS",
  4194304: "ACTIVE_DEVELOPER",
};

function decodePublicFlags(flags: number): string[] {
  return Object.entries(PUBLIC_FLAGS_MAP)
    .filter(([bit]) => (flags & Number(bit)) !== 0)
    .map(([, name]) => name);
}

async function fetchDiscordUser(query: string): Promise<object> {
  const now = new Date().toISOString();
  const token = process.env["DISCORD_BOT_TOKEN"];
  if (!token) {
    return { error: "DISCORD_BOT_TOKEN not configured", queryTime: now };
  }

  const res = await fetch(`https://discord.com/api/v10/users/${query.trim()}`, {
    headers: { Authorization: `Bot ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    if (res.status === 404) return { error: "User not found. Make sure you are using a numeric Snowflake ID.", queryTime: now };
    if (res.status === 401) return { error: "Invalid bot token. Check your DISCORD_BOT_TOKEN secret.", queryTime: now };
    return { error: `Discord API error ${res.status}: ${body.message ?? "Unknown error"}`, queryTime: now };
  }

  const user = await res.json() as Record<string, unknown>;
  const userId = user.id as string;
  const createdAt = new Date(Number(BigInt(userId) >> BigInt(22)) + 1420070400000).toISOString();
  const rawFlags = ((user.public_flags as number) ?? 0) | ((user.flags as number) ?? 0);
  const publicFlags = decodePublicFlags(rawFlags);
  const avatarHash = user.avatar as string | null;
  const avatarUrl = avatarHash
    ? `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${avatarHash.startsWith("a_") ? "gif" : "png"}?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${Number(userId) % 5}.png`;
  const bannerHash = user.banner as string | null;
  const bannerUrl = bannerHash
    ? `https://cdn.discordapp.com/banners/${userId}/${bannerHash}.${bannerHash.startsWith("a_") ? "gif" : "png"}?size=512`
    : null;
  const premiumType = user.premium_type as number | undefined;
  const nitroLabel = premiumType === 1 ? "Nitro Classic" : premiumType === 2 ? "Nitro" : premiumType === 3 ? "Nitro Basic" : "None";

  return {
    userId, username: user.username as string, globalName: (user.global_name as string | null) ?? null,
    discriminator: user.discriminator as string, createdAt, avatar: avatarUrl, avatarHash,
    banner: bannerUrl, bannerColor: (user.banner_color as string | null) ?? null,
    accentColor: user.accent_color != null ? `#${(user.accent_color as number).toString(16).padStart(6, "0")}` : null,
    bot: (user.bot as boolean) ?? false, system: (user.system as boolean) ?? false,
    nitro: nitroLabel, publicFlags, rawPublicFlags: rawFlags, queryTime: now,
  };
}

async function buildOsintResults(query: string, type: string): Promise<object> {
  const now = new Date().toISOString();
  if (type === "domain") {
    return {
      whois: { domain: query, registrar: "NameCheap, Inc.", registeredOn: "2018-03-15", expiresOn: "2027-03-15", updatedOn: "2024-01-10", status: ["clientTransferProhibited"], nameservers: [`ns1.${query}`, `ns2.${query}`] },
      dns: { A: ["104.26.10.78", "104.26.11.78"], MX: [`mail.${query}`], TXT: ["v=spf1 include:_spf.google.com ~all"], NS: [`ns1.${query}`, `ns2.${query}`] },
      ssl: { issuer: "Let's Encrypt", validFrom: "2024-01-01", validUntil: "2024-04-01", subject: `*.${query}` },
      geolocation: { ip: "104.26.10.78", country: "United States", city: "San Francisco", org: "Cloudflare, Inc.", asn: "AS13335" },
      queryTime: now,
    };
  } else if (type === "ip") {
    return { ip: query, hostname: `ip-${query.replace(/\./g, "-")}.example.com`, city: "Amsterdam", region: "North Holland", country: "Netherlands", org: "AS1234 Digital Ocean", asn: "AS1234", timezone: "Europe/Amsterdam", openPorts: [22, 80, 443], abuse: { score: 12, reports: 3, lastReported: "2024-11-15" }, queryTime: now };
  } else if (type === "username") {
    return { username: query, profiles: [{ platform: "GitHub", url: `https://github.com/${query}`, found: true }, { platform: "Twitter/X", url: `https://x.com/${query}`, found: true }, { platform: "Reddit", url: `https://reddit.com/u/${query}`, found: Math.random() > 0.5 }, { platform: "LinkedIn", url: `https://linkedin.com/in/${query}`, found: Math.random() > 0.5 }, { platform: "Instagram", url: `https://instagram.com/${query}`, found: Math.random() > 0.5 }, { platform: "HackerNews", url: `https://news.ycombinator.com/user?id=${query}`, found: Math.random() > 0.5 }].filter((p) => p.found), queryTime: now };
  } else if (type === "email") {
    const [local, domain] = query.split("@");
    return { email: query, valid: true, disposable: false, domain: domain || "unknown.com", breaches: [{ name: "Adobe", date: "2013-10-04", count: 153000000 }, { name: "LinkedIn", date: "2016-05-05", count: 164611595 }], socialProfiles: [{ platform: "Gravatar", url: `https://gravatar.com/${local}` }], queryTime: now };
  } else if (type === "phone") {
    return { phone: query, valid: true, countryCode: "+1", country: "United States", carrier: "Verizon Wireless", lineType: "mobile", location: "California", queryTime: now };
  } else if (type === "discord") {
    return fetchDiscordUser(query);
  } else if (type === "breach") {
    const breachDatabases = [
      { name: "LinkedIn", date: "2016-05-05", count: 164611595, description: "In May 2016, LinkedIn had 164 million email addresses and passwords exposed.", dataClasses: ["Email addresses", "Passwords"], severity: "critical", hashedPasswords: true, algorithm: "SHA1 unsalted", sampleData: { email: query.includes("@") ? query : `${query}@linkedin.com`, password: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8", passwordDecrypted: Math.random() > 0.5 ? "p@ssw0rd123" : null } },
      { name: "Adobe", date: "2013-10-04", count: 153000000, description: "In October 2013, 153 million Adobe accounts were breached.", dataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"], severity: "high", hashedPasswords: true, algorithm: "3DES encrypted", sampleData: { email: query.includes("@") ? query : `${query}@example.com`, username: query.includes("@") ? query.split("@")[0] : query, passwordHint: "my dog's name", password: "encrypted:a3d9f2c1e8b4" } },
      { name: "Collection #1", date: "2019-01-07", count: 772904991, description: "Collection #1 is a set of email addresses and passwords totalling 2,692,818,238 rows.", dataClasses: ["Email addresses", "Passwords"], severity: "critical", hashedPasswords: false, algorithm: "Plaintext", sampleData: { email: query.includes("@") ? query : `${query}@hotmail.com`, password: Math.random() > 0.5 ? "Summer2018!" : "hunter2", token: null } },
    ];
    const foundBreaches = breachDatabases.filter(() => Math.random() > 0.3);
    return { query, totalBreaches: foundBreaches.length, totalRecords: foundBreaches.reduce((sum, b) => sum + b.count, 0), riskScore: foundBreaches.length === 0 ? "clean" : foundBreaches.length < 2 ? "low" : foundBreaches.length < 4 ? "medium" : "critical", firstSeen: foundBreaches.length > 0 ? foundBreaches.sort((a, b) => a.date.localeCompare(b.date))[0].date : null, lastSeen: foundBreaches.length > 0 ? foundBreaches.sort((a, b) => b.date.localeCompare(a.date))[0].date : null, breaches: foundBreaches, queryTime: now };
  }
  return { query, type, queryTime: now };
}

function serializeSearch(row: typeof searchesTable.$inferSelect) {
  return { ...row, createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt };
}

router.get("/searches", async (req, res): Promise<void> => {
  if (!req.session.user) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.user.id;

  const parsed = ListSearchesQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { type, limit } = parsed.data;

  const baseWhere = type && type !== "all"
    ? and(eq(searchesTable.userId, userId), eq(searchesTable.type, type))
    : eq(searchesTable.userId, userId);

  const results = await db.select().from(searchesTable).where(baseWhere).orderBy(desc(searchesTable.createdAt)).limit(limit ?? 20);
  res.json(ListSearchesResponse.parse(results.map(serializeSearch)));
});

router.post("/searches", async (req, res): Promise<void> => {
  if (!req.session.user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const parsed = CreateSearchBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { query: searchQuery, type } = parsed.data;
  const results = await buildOsintResults(searchQuery, type);
  const [search] = await db.insert(searchesTable).values({ userId: req.session.user.id, query: searchQuery, type, status: "completed", results }).returning();
  res.status(201).json(GetSearchResponse.parse(serializeSearch(search)));
});

router.get("/searches/stats", async (req, res): Promise<void> => {
  if (!req.session.user) { res.status(401).json({ error: "Not authenticated" }); return; }
  const userId = req.session.user.id;

  const total = await db.select({ count: sql<number>`count(*)::int` }).from(searchesTable).where(eq(searchesTable.userId, userId));
  const byTypeRows = await db.select({ type: searchesTable.type, count: sql<number>`count(*)::int` }).from(searchesTable).where(eq(searchesTable.userId, userId)).groupBy(searchesTable.type);
  const recentRows = await db.select({ count: sql<number>`count(*)::int` }).from(searchesTable).where(and(eq(searchesTable.userId, userId), sql`created_at > now() - interval '24 hours'`));

  const byType: Record<string, number> = {};
  for (const row of byTypeRows) byType[row.type] = row.count;

  res.json(GetSearchStatsResponse.parse({ total: total[0]?.count ?? 0, byType, recentCount: recentRows[0]?.count ?? 0 }));
});

router.get("/searches/:id", async (req, res): Promise<void> => {
  if (!req.session.user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSearchParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [search] = await db.select().from(searchesTable).where(and(eq(searchesTable.id, params.data.id), eq(searchesTable.userId, req.session.user.id)));
  if (!search) { res.status(404).json({ error: "Search not found" }); return; }
  res.json(GetSearchResponse.parse(serializeSearch(search)));
});

router.delete("/searches/:id", async (req, res): Promise<void> => {
  if (!req.session.user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSearchParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [deleted] = await db.delete(searchesTable).where(and(eq(searchesTable.id, params.data.id), eq(searchesTable.userId, req.session.user.id))).returning();
  if (!deleted) { res.status(404).json({ error: "Search not found" }); return; }
  res.sendStatus(204);
});

export default router;
