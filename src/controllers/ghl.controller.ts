import type { Request, Response, NextFunction } from "express";
import { ghlService } from "../services/ghl.service";
import { HttpStatusCode } from "axios";
import models from "../models";

export async function saveGhlIntegration(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId, locationId, apiKey } = req.body;

    if (!workspaceId || !locationId || !apiKey) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Invalid integration data provided. Location ID and API Key are required." });
      return;
    }

    const workspace = await ghlService.saveIntegration(workspaceId, { locationId, apiKey });

    res.status(HttpStatusCode.Ok).send({
      message: "Go High Level integration saved successfully.",
      workspace,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeGhlIntegration(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Workspace ID is required." });
      return;
    }

    const workspace = await ghlService.removeIntegration(workspaceId);

    res.status(HttpStatusCode.Ok).send({
      message: "Go High Level integration removed successfully.",
      workspace,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId } = req.params;
    const workspace = await models.workspaces.findById(workspaceId);

    if (!workspace || !workspace.ghl?.apiKey || !workspace.ghl?.locationId) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Workspace not integrated with Go High Level." });
      return;
    }

    const query = req.query.query as string | undefined;

    const contactsData = await ghlService.getContacts(workspace.ghl.locationId, workspace.ghl.apiKey, query);

    // Filter contacts that might be from ads if needed, 
    // or just return them and let frontend decide/display
    const contacts = contactsData.contacts || [];
    
    res.status(HttpStatusCode.Ok).send({
      message: "Ad leads retrieved successfully.",
      leads: contacts,
    });
  } catch (error) {
    next(error);
  }
}

export async function webhookHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId } = req.params;
    const payload = req.body;
    
    console.log(`[GHL Webhook - Workspace ${workspaceId}] Received payload:`, payload);

    // Validate workspace exists
    const workspace = await models.workspaces.findById(workspaceId);
    if (!workspace) {
      res.status(HttpStatusCode.NotFound).send({ message: "Workspace not found for this webhook." });
      return;
    }

    // Extract data from the GHL webhook payload.
    // This expects a Custom Webhook from a GHL Workflow, or a standard GHL payload
    const customerName = payload.customerName || payload.fullName || payload.contactName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'Cliente GHL';
    
    // We try to extract adId from source, adId, or parse it from a message body
    let adId = payload.adId || payload.source;
    
    // Fallback: If they send messageBody with "Ref: 12345" or "ad_id=12345"
    if (!adId && payload.messageBody) {
      const match = payload.messageBody.match(/Ref:\s*(\d+)/i) || payload.messageBody.match(/{{ad\.id}}/i);
      if (match && match[1]) {
        adId = match[1];
      }
    }
    
    // Si no hay adId, asumimos que es un anuncio genérico de WhatsApp
    adId = adId || 'whatsapp_ad';

    const notes = payload.notes || 'Generado automáticamente por webhook de GHL (Conversación)';

    // Register a "Sale" with 0 amount, representing a generated conversation
    const newConversation = new models.sales({
      workspaceId: workspace._id,
      adId: adId,
      amount: 0, // It's just a conversation for now
      conversationsGenerated: 1,
      customerName: customerName,
      notes: notes,
      saleDate: new Date()
    });

    await newConversation.save();

    res.status(HttpStatusCode.Ok).send({
      message: "Webhook processed successfully, conversation registered.",
      data: newConversation
    });
  } catch (error) {
    console.error("Error processing GHL webhook:", error);
    next(error);
  }
}
