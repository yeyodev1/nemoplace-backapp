import { Router } from "express";
import * as saleController from "../controllers/sale.controller";

const saleRouter = Router();

// In a real app we'd have auth middleware here
// saleRouter.use(authMiddleware);

saleRouter.post("/", saleController.createSale);
saleRouter.get("/:workspaceId", saleController.getSalesByWorkspace);
saleRouter.get("/:workspaceId/stats", saleController.getSalesStats);
saleRouter.put("/:id", saleController.updateSale);
saleRouter.delete("/:id", saleController.deleteSale);

export default saleRouter;
