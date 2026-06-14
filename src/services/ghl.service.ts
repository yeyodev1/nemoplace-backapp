import axios from 'axios';
import models from '../models';
import { Types } from 'mongoose';

const GHL_API_BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

export class GhlService {
  /**
   * Save GHL integration details to the workspace
   */
  async saveIntegration(
    workspaceId: string,
    integrationData: { locationId: string; apiKey: string }
  ) {
    const workspace = await models.workspaces.findByIdAndUpdate(
      workspaceId,
      {
        $set: {
          'ghl.locationId': integrationData.locationId,
          'ghl.apiKey': integrationData.apiKey,
          'ghl.lastSyncedAt': new Date(),
        },
      },
      { new: true }
    );

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return workspace;
  }

  /**
   * Remove GHL integration from the workspace
   */
  async removeIntegration(workspaceId: string) {
    const workspace = await models.workspaces.findByIdAndUpdate(
      workspaceId,
      {
        $unset: { ghl: 1 },
      },
      { new: true }
    );

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    return workspace;
  }

  /**
   * Get contacts from GHL, optionally filtering by source
   */
  async getContacts(locationId: string, apiKey: string, query?: string) {
    try {
      const response = await axios.get(`${GHL_API_BASE_URL}/contacts/`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Version: API_VERSION,
          Accept: 'application/json',
        },
        params: {
          locationId,
          query, // optionally filter by name, email, phone, etc.
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching GHL contacts:', error.response?.data || error.message);
      throw new Error('Failed to fetch contacts from Go High Level');
    }
  }
}

export const ghlService = new GhlService();
