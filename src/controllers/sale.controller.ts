import type { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "axios";
import models from "../models";

export async function createSale(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId, amount, conversationsGenerated, adId, customerName, notes, saleDate } = req.body;

    if (!workspaceId || amount === undefined) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Workspace ID and amount are required." });
      return;
    }

    const sale = await models.sales.create({
      workspaceId,
      amount,
      conversationsGenerated: conversationsGenerated || 0,
      adId,
      customerName,
      notes,
      saleDate: saleDate || new Date(),
    });

    res.status(HttpStatusCode.Created).send({
      message: "Sale registered successfully.",
      sale,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSalesByWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId } = req.params;

    const sales = await models.sales.find({ workspaceId }).sort({ saleDate: -1 });

    res.status(HttpStatusCode.Ok).send({
      message: "Sales retrieved successfully.",
      sales,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSalesStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId } = req.params;

    const sales = await models.sales.find({ workspaceId });
    
    let totalRevenue = 0;
    let totalConversations = 0;

    sales.forEach(sale => {
      totalRevenue += sale.amount;
      totalConversations += sale.conversationsGenerated || 0;
    });

    res.status(HttpStatusCode.Ok).send({
      message: "Sales stats retrieved successfully.",
      stats: {
        totalRevenue,
        totalConversations,
        totalSales: sales.length,
      },
    });
  } catch (error) {
    next(error);
  }
}
