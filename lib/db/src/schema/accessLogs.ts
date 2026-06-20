import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const accessLogsTable = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  action: text("action").notNull().default("login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AccessLog = typeof accessLogsTable.$inferSelect;
