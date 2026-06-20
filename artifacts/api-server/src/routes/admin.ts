import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, accessLogsTable } from "@workspace/db";

const router: IRouter = Router();

const OWNER_ID = process.env["OWNER_DISCORD_ID"];

function isOwner(userId: string): boolean {
  return !!OWNER_ID && userId === OWNER_ID;
}

router.get("/admin/logs", async (req, res): Promise<void> => {
  if (!req.session.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (!isOwner(req.session.user.id)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const logs = await db
    .select()
    .from(accessLogsTable)
    .orderBy(desc(accessLogsTable.createdAt))
    .limit(200);

  res.json(
    logs.map((l) => ({
      ...l,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    })),
  );
});

export { isOwner };
export default router;
