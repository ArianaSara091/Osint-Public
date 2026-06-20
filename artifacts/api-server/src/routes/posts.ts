import { Router, type IRouter } from "express";
import {
  SearchPostsBody,
  SearchPostsResponse,
  GetTrendingTopicsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generatePosts(query: string, platform: string, limit: number) {
  const platforms = platform === "all" ? ["twitter", "reddit", "mastodon"] : [platform];
  const posts = [];
  const authors = [
    { name: "Alex Chen", handle: "@alexchen_sec" },
    { name: "Sara Moran", handle: "@saramoran" },
    { name: "DataHunter42", handle: "@datahunter42" },
    { name: "OpenIntel", handle: "@openintel" },
    { name: "ResearchBot", handle: "@researchbot" },
    { name: "CyberWatcher", handle: "@cyberwatcher" },
  ];
  const contents = [
    `Just discovered some interesting connections involving "${query}" — thread below`,
    `Anyone else tracking "${query}"? Found some public records worth noting.`,
    `Public data on "${query}" is more revealing than most people realize.`,
    `New findings on "${query}" — all from open sources. Here's what I found:`,
    `${query} shows up in 3 different public databases. Cross-referencing now.`,
    `Running an analysis on "${query}" — initial results are interesting.`,
    `The digital footprint of "${query}" spans multiple platforms. Notable patterns emerging.`,
    `Public records for "${query}" updated. Key changes in the last 30 days.`,
  ];

  for (let i = 0; i < Math.min(limit, 16); i++) {
    const author = authors[i % authors.length];
    const plat = platforms[i % platforms.length];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    posts.push({
      id: `post-${Date.now()}-${i}`,
      platform: plat,
      author: author.name,
      authorHandle: author.handle,
      content: contents[i % contents.length],
      publishedAt: date.toISOString(),
      url: plat === "twitter" ? `https://x.com/${author.handle.slice(1)}/status/${Date.now() + i}` :
           plat === "reddit" ? `https://reddit.com/r/OSINT/comments/${Date.now() + i}` :
           `https://mastodon.social/${author.handle}/posts/${Date.now() + i}`,
      likes: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 100),
    });
  }
  return posts;
}

router.post("/posts/search", async (req, res): Promise<void> => {
  const parsed = SearchPostsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { query, platform = "all", limit = 20 } = parsed.data;
  const posts = generatePosts(query, platform, limit);
  res.json(SearchPostsResponse.parse(posts));
});

router.get("/posts/trending", async (_req, res): Promise<void> => {
  const trending = [
    { topic: "data breach", count: 1243, category: "security" },
    { topic: "domain squatting", count: 892, category: "domain" },
    { topic: "phishing campaign", count: 756, category: "security" },
    { topic: "leaked credentials", count: 634, category: "security" },
    { topic: "social engineering", count: 521, category: "social" },
    { topic: "exposed API keys", count: 489, category: "security" },
    { topic: "fake profiles", count: 412, category: "social" },
    { topic: "identity fraud", count: 387, category: "identity" },
    { topic: "dark web mentions", count: 356, category: "security" },
    { topic: "IP spoofing", count: 298, category: "network" },
  ];
  res.json(GetTrendingTopicsResponse.parse(trending));
});

export default router;
