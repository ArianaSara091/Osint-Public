import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityPostsTable = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: text("author_id").notNull(),
  authorUsername: text("author_username").notNull(),
  authorDisplayName: text("author_display_name").notNull(),
  authorAvatar: text("author_avatar"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPostsTable).omit({
  id: true,
  viewCount: true,
  createdAt: true,
});
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPostsTable.$inferSelect;
