import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import imprestRouter from "./imprest";
import { requireAuth } from "../middlewares/require-auth";

const router: IRouter = Router();

// Public routes: health checks and authentication itself.
router.use(healthRouter);
router.use("/auth", authRouter);

// Everything else requires a signed-in session.
router.use(requireAuth, imprestRouter);

export default router;
