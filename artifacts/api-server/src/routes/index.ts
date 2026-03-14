import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import settingsRouter from "./settings.js";
import projectsRouter from "./projects.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(settingsRouter);
router.use(projectsRouter);

export default router;
