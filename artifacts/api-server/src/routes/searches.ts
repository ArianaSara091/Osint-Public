import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
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

function buildOsintResults(query: string, type: string): object {
  const now = new Date().toISOString();
  if (type === "domain") {
    return {
      whois: {
        domain: query,
        registrar: "NameCheap, Inc.",
        registeredOn: "2018-03-15",
        expiresOn: "2027-03-15",
        updatedOn: "2024-01-10",
        status: ["clientTransferProhibited"],
        nameservers: [`ns1.${query}`, `ns2.${query}`],
      },
      dns: {
        A: ["104.26.10.78", "104.26.11.78"],
        MX: [`mail.${query}`],
        TXT: ["v=spf1 include:_spf.google.com ~all"],
        NS: [`ns1.${query}`, `ns2.${query}`],
      },
      ssl: {
        issuer: "Let's Encrypt",
        validFrom: "2024-01-01",
        validUntil: "2024-04-01",
        subject: `*.${query}`,
      },
      geolocation: {
        ip: "104.26.10.78",
        country: "United States",
        city: "San Francisco",
        org: "Cloudflare, Inc.",
        asn: "AS13335",
      },
      queryTime: now,
    };
  } else if (type === "ip") {
    return {
      ip: query,
      hostname: `ip-${query.replace(/\./g, "-")}.example.com`,
      city: "Amsterdam",
      region: "North Holland",
      country: "Netherlands",
      org: "AS1234 Digital Ocean",
      asn: "AS1234",
      timezone: "Europe/Amsterdam",
      openPorts: [22, 80, 443],
      abuse: { score: 12, reports: 3, lastReported: "2024-11-15" },
      queryTime: now,
    };
  } else if (type === "username") {
    return {
      username: query,
      profiles: [
        { platform: "GitHub", url: `https://github.com/${query}`, found: true },
        { platform: "Twitter/X", url: `https://x.com/${query}`, found: true },
        { platform: "Reddit", url: `https://reddit.com/u/${query}`, found: Math.random() > 0.5 },
        { platform: "LinkedIn", url: `https://linkedin.com/in/${query}`, found: Math.random() > 0.5 },
        { platform: "Instagram", url: `https://instagram.com/${query}`, found: Math.random() > 0.5 },
        { platform: "HackerNews", url: `https://news.ycombinator.com/user?id=${query}`, found: Math.random() > 0.5 },
      ].filter((p) => p.found),
      queryTime: now,
    };
  } else if (type === "email") {
    const [local, domain] = query.split("@");
    return {
      email: query,
      valid: true,
      disposable: false,
      domain: domain || "unknown.com",
      breaches: [
        { name: "Adobe", date: "2013-10-04", count: 153000000 },
        { name: "LinkedIn", date: "2016-05-05", count: 164611595 },
      ],
      socialProfiles: [
        { platform: "Gravatar", url: `https://gravatar.com/${local}` },
      ],
      queryTime: now,
    };
  } else if (type === "phone") {
    return {
      phone: query,
      valid: true,
      countryCode: "+1",
      country: "United States",
      carrier: "Verizon Wireless",
      lineType: "mobile",
      location: "California",
      queryTime: now,
    };
  } else if (type === "discord") {
    const isNumericId = /^\d{17,20}$/.test(query);
    const userId = isNumericId ? query : `${Math.floor(Math.random() * 900000000000000000) + 100000000000000000}`;
    const createdAt = new Date(Number(BigInt(userId) >> BigInt(22)) + 1420070400000).toISOString();
    const discriminators = ["0", "1337", "9999", "4242", "0001"];
    const discriminator = discriminators[Math.floor(Math.random() * discriminators.length)];
    const nitroTypes = ["None", "Nitro Classic", "Nitro", "Nitro Basic"];
    const nitro = nitroTypes[Math.floor(Math.random() * nitroTypes.length)];
    const flags = ["EARLY_SUPPORTER", "VERIFIED_DEVELOPER", "ACTIVE_DEVELOPER"];
    const activeFlags = flags.filter(() => Math.random() > 0.6);
    const mutualServers = [
      { id: "802234567890123456", name: "OSINT Community", memberCount: 12847 },
      { id: "701234567890123456", name: "Security Research Hub", memberCount: 5421 },
      { id: "903456789012345678", name: "Dev Underground", memberCount: 34219 },
    ].filter(() => Math.random() > 0.4);
    return {
      userId,
      username: isNumericId ? `user_${userId.slice(-6)}` : query,
      discriminator,
      globalName: isNumericId ? null : query,
      createdAt,
      avatar: `https://cdn.discordapp.com/avatars/${userId}/a_fake_hash.webp`,
      avatarHash: "a_fake_hash",
      banner: Math.random() > 0.6 ? `https://cdn.discordapp.com/banners/${userId}/banner_hash.gif` : null,
      bannerColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`,
      accentColor: Math.floor(Math.random() * 16777215),
      bot: false,
      system: false,
      mfaEnabled: Math.random() > 0.4,
      verified: Math.random() > 0.3,
      nitro,
      nitroSince: nitro !== "None" ? "2021-06-14T00:00:00.000Z" : null,
      boostingSince: Math.random() > 0.5 ? "2022-11-01T00:00:00.000Z" : null,
      publicFlags: activeFlags,
      connectedAccounts: [
        { type: "github", name: isNumericId ? `dev_${userId.slice(-4)}` : query, verified: true },
        { type: "twitter", name: isNumericId ? `@user_${userId.slice(-5)}` : `@${query}`, verified: Math.random() > 0.5 },
        { type: "spotify", name: isNumericId ? `User ${userId.slice(-6)}` : query, verified: true },
      ].filter(() => Math.random() > 0.4),
      mutualServers,
      relationships: {
        friends: Math.floor(Math.random() * 300),
        pendingIncoming: Math.floor(Math.random() * 5),
        pendingOutgoing: Math.floor(Math.random() * 3),
        blocked: 0,
      },
      premiumGuildSubscriptions: Math.floor(Math.random() * 3),
      locale: "en-US",
      phone: Math.random() > 0.7 ? "+1 *** *** **89" : null,
      email: Math.random() > 0.5 ? `${isNumericId ? `user${userId.slice(-6)}` : query}@gmail.com` : null,
      queryTime: now,
    };
  } else if (type === "breach") {
    const breachDatabases = [
      {
        name: "LinkedIn",
        date: "2016-05-05",
        count: 164611595,
        description: "In May 2016, LinkedIn had 164 million email addresses and passwords exposed.",
        dataClasses: ["Email addresses", "Passwords"],
        severity: "critical",
        hashedPasswords: true,
        algorithm: "SHA1 unsalted",
        sampleData: {
          email: query.includes("@") ? query : `${query}@linkedin.com`,
          password: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",
          passwordDecrypted: Math.random() > 0.5 ? "p@ssw0rd123" : null,
        },
      },
      {
        name: "Adobe",
        date: "2013-10-04",
        count: 153000000,
        description: "In October 2013, 153 million Adobe accounts were breached.",
        dataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"],
        severity: "high",
        hashedPasswords: true,
        algorithm: "3DES encrypted",
        sampleData: {
          email: query.includes("@") ? query : `${query}@example.com`,
          username: query.includes("@") ? query.split("@")[0] : query,
          passwordHint: "my dog's name",
          password: "encrypted:a3d9f2c1e8b4",
        },
      },
      {
        name: "Collection #1",
        date: "2019-01-07",
        count: 772904991,
        description: "Collection #1 is a set of email addresses and passwords totalling 2,692,818,238 rows.",
        dataClasses: ["Email addresses", "Passwords"],
        severity: "critical",
        hashedPasswords: false,
        algorithm: "Plaintext",
        sampleData: {
          email: query.includes("@") ? query : `${query}@hotmail.com`,
          password: Math.random() > 0.5 ? "Summer2018!" : "hunter2",
          token: null,
        },
      },
      {
        name: "Dropbox",
        date: "2012-07-01",
        count: 68648009,
        description: "In mid-2012, Dropbox suffered a data breach which exposed the stored credentials of tens of millions of their customers.",
        dataClasses: ["Email addresses", "Passwords"],
        severity: "high",
        hashedPasswords: true,
        algorithm: "bcrypt/SHA1",
        sampleData: {
          email: query.includes("@") ? query : `${query}@gmail.com`,
          password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        },
      },
      {
        name: "Twitch",
        date: "2021-10-06",
        count: 2800000,
        description: "In October 2021, Twitch suffered a massive data breach exposing source code, streamer earnings, and auth tokens.",
        dataClasses: ["Auth tokens", "Email addresses", "Passwords", "Payment methods (partial)"],
        severity: "critical",
        hashedPasswords: false,
        algorithm: "Plaintext tokens",
        sampleData: {
          email: query.includes("@") ? query : `${query}@twitch.tv`,
          authToken: `oauth:${Math.random().toString(36).substring(2, 32)}`,
          streamKey: `live_${Math.random().toString(36).substring(2, 32)}`,
        },
      },
      {
        name: "RockYou2021",
        date: "2021-06-08",
        count: 8459060239,
        description: "In June 2021, a file called RockYou2021.txt was compiled containing 8.4 billion passwords.",
        dataClasses: ["Passwords"],
        severity: "medium",
        hashedPasswords: false,
        algorithm: "Plaintext wordlist",
        sampleData: {
          password: "123456",
        },
      },
    ];
    const foundBreaches = breachDatabases.filter(() => Math.random() > 0.3);
    const allTokens = foundBreaches
      .filter((b) => b.sampleData && "authToken" in b.sampleData)
      .map((b) => ({ source: b.name, token: (b.sampleData as Record<string, unknown>).authToken, date: b.date }));
    return {
      query,
      totalBreaches: foundBreaches.length,
      totalRecords: foundBreaches.reduce((sum, b) => sum + b.count, 0),
      riskScore: foundBreaches.length === 0 ? "clean" : foundBreaches.length < 2 ? "low" : foundBreaches.length < 4 ? "medium" : "critical",
      firstSeen: foundBreaches.length > 0 ? foundBreaches.sort((a, b) => a.date.localeCompare(b.date))[0].date : null,
      lastSeen: foundBreaches.length > 0 ? foundBreaches.sort((a, b) => b.date.localeCompare(a.date))[0].date : null,
      breaches: foundBreaches,
      exposedTokens: allTokens,
      pasteExposure: Math.random() > 0.6 ? [
        { source: "Pastebin", date: "2023-04-12", title: "combo list 2023", url: "https://pastebin.com/XXXXXXXX" },
        { source: "GitHub Gist", date: "2022-11-30", title: "leaked creds", url: "https://gist.github.com/XXXXXXXX" },
      ] : [],
      queryTime: now,
    };
  }
  return { query, type, queryTime: now };
}

function serializeSearch(row: typeof searchesTable.$inferSelect) {
  return { ...row, createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt };
}

router.get("/searches", async (req, res): Promise<void> => {
  const parsed = ListSearchesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { type, limit } = parsed.data;
  if (type && type !== "all") {
    const results = await db
      .select()
      .from(searchesTable)
      .where(eq(searchesTable.type, type))
      .orderBy(desc(searchesTable.createdAt))
      .limit(limit ?? 20);
    res.json(ListSearchesResponse.parse(results.map(serializeSearch)));
    return;
  }
  const results = await db.select().from(searchesTable).orderBy(desc(searchesTable.createdAt)).limit(limit ?? 20);
  res.json(ListSearchesResponse.parse(results.map(serializeSearch)));
});

router.post("/searches", async (req, res): Promise<void> => {
  const parsed = CreateSearchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { query: searchQuery, type } = parsed.data;
  const results = buildOsintResults(searchQuery, type);
  const [search] = await db
    .insert(searchesTable)
    .values({ query: searchQuery, type, status: "completed", results })
    .returning();
  res.status(201).json(GetSearchResponse.parse(serializeSearch(search)));
});

router.get("/searches/stats", async (_req, res): Promise<void> => {
  const total = await db.select({ count: sql<number>`count(*)::int` }).from(searchesTable);
  const byTypeRows = await db
    .select({ type: searchesTable.type, count: sql<number>`count(*)::int` })
    .from(searchesTable)
    .groupBy(searchesTable.type);
  const recentRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(searchesTable)
    .where(sql`created_at > now() - interval '24 hours'`);
  const byType: Record<string, number> = {};
  for (const row of byTypeRows) {
    byType[row.type] = row.count;
  }
  res.json(
    GetSearchStatsResponse.parse({
      total: total[0]?.count ?? 0,
      byType,
      recentCount: recentRows[0]?.count ?? 0,
    })
  );
});

router.get("/searches/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSearchParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [search] = await db.select().from(searchesTable).where(eq(searchesTable.id, params.data.id));
  if (!search) {
    res.status(404).json({ error: "Search not found" });
    return;
  }
  res.json(GetSearchResponse.parse(search));
});

router.delete("/searches/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteSearchParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(searchesTable).where(eq(searchesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Search not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
