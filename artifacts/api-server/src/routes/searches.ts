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
