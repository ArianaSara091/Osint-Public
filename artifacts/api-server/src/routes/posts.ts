import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, communityPostsTable } from "@workspace/db";
import {
  GetTrendingTopicsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/posts/feed", async (req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(communityPostsTable)
    .orderBy(desc(communityPostsTable.createdAt));

  if (posts.length > 0) {
    await db
      .update(communityPostsTable)
      .set({ viewCount: sql`${communityPostsTable.viewCount} + 1` });
  }

  res.json(
    posts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  );
});

router.post("/posts/feed", async (req, res): Promise<void> => {
  if (!req.session.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { content } = req.body as { content?: string };
  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: "Content is required" });
    return;
  }
  if (content.trim().length > 2000) {
    res.status(400).json({ error: "Post too long (max 2000 characters)" });
    return;
  }

  const user = req.session.user;
  const [post] = await db
    .insert(communityPostsTable)
    .values({
      content: content.trim(),
      authorId: user.id,
      authorUsername: user.username,
      authorDisplayName: user.global_name ?? user.username,
      authorAvatar: user.avatar ?? null,
    })
    .returning();

  res.status(201).json({
    ...post,
    createdAt: post.createdAt.toISOString(),
  });
});

router.delete("/posts/feed/:id", async (req, res): Promise<void> => {
  if (!req.session.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [post] = await db
    .select()
    .from(communityPostsTable)
    .where(eq(communityPostsTable.id, id));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.authorId !== req.session.user.id) {
    res.status(403).json({ error: "You can only delete your own posts" });
    return;
  }

  await db.delete(communityPostsTable).where(eq(communityPostsTable.id, id));
  res.json({ ok: true });
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
