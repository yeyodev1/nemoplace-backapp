import { Router } from "express";
import * as metaController from "../controllers/meta.controller";

const metaRouter = Router();

// In a real app we'd have auth middleware here
// metaRouter.use(authMiddleware);

metaRouter.post("/authenticate", metaController.authenticateMeta);
metaRouter.post("/save-integration", metaController.saveMetaIntegration);
metaRouter.get("/:workspaceId/adaccounts", metaController.getAdAccounts);
metaRouter.get("/:workspaceId/ads-insights", metaController.getAdsInsights);

export default metaRouter;
