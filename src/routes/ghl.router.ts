import { Router } from "express";
import { saveGhlIntegration, removeGhlIntegration, getAdLeads, webhookHandler } from "../controllers/ghl.controller";

const ghlRouter = Router();

ghlRouter.post("/integration", saveGhlIntegration);
ghlRouter.post("/integration/remove", removeGhlIntegration);
ghlRouter.get("/:workspaceId/leads", getAdLeads);
ghlRouter.post("/:workspaceId/webhook", webhookHandler);

export default ghlRouter;
