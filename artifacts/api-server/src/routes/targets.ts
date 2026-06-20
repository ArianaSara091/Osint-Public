import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, targetsTable } from "@workspace/db";
import {
  CreateTargetBody,
  GetTargetParams,
  UpdateTargetParams,
  UpdateTargetBody,
  DeleteTargetParams,
  ListTargetsResponse,
  GetTargetResponse,
  UpdateTargetResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeTarget(row: typeof targetsTable.$inferSelect) {
  return { ...row, createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt };
}

router.get("/targets", async (_req, res): Promise<void> => {
  const targets = await db.select().from(targetsTable).orderBy(desc(targetsTable.createdAt));
  res.json(ListTargetsResponse.parse(targets.map(serializeTarget)));
});

router.post("/targets", async (req, res): Promise<void> => {
  const parsed = CreateTargetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [target] = await db.insert(targetsTable).values(parsed.data).returning();
  res.status(201).json(GetTargetResponse.parse(serializeTarget(target)));
});

router.get("/targets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTargetParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [target] = await db.select().from(targetsTable).where(eq(targetsTable.id, params.data.id));
  if (!target) {
    res.status(404).json({ error: "Target not found" });
    return;
  }
  res.json(GetTargetResponse.parse(serializeTarget(target)));
});

router.patch("/targets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateTargetParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTargetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [target] = await db
    .update(targetsTable)
    .set(parsed.data)
    .where(eq(targetsTable.id, params.data.id))
    .returning();
  if (!target) {
    res.status(404).json({ error: "Target not found" });
    return;
  }
  res.json(UpdateTargetResponse.parse(serializeTarget(target)));
});

router.delete("/targets/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteTargetParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(targetsTable).where(eq(targetsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Target not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
