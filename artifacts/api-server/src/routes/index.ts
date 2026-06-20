import { Router, type IRouter } from "express";
import healthRouter from "./health";
import searchesRouter from "./searches";
import targetsRouter from "./targets";
import postsRouter from "./posts";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(searchesRouter);
router.use(targetsRouter);
router.use(postsRouter);

export default router;
