import axios from "axios";
import models from "../models";

export class MetaService {
  private get appId() {
    return process.env.META_APP_ID;
  }
  private get appSecret() {
    return process.env.META_APP_SECRET;
  }
  private readonly graphUrl = "https://graph.facebook.com/v22.0";

  async exchangeToken(shortToken: string): Promise<string> {
    try {
      if (!this.appId || !this.appSecret) {
        throw new Error("Meta App Credentials are not configured in backend environments.");
      }

      const response = await axios.get(`${this.graphUrl}/oauth/access_token`, {
        params: {
          grant_type: "fb_exchange_token",
          client_id: this.appId,
          client_secret: this.appSecret,
          fb_exchange_token: shortToken,
        },
      });

      return response.data.access_token;
    } catch (error: any) {
      const metaError = error.response?.data || error.message;
      console.error("Meta Token Exchange Error:", metaError);
      throw new Error(`Failed to exchange Meta access token. Meta Error: ${JSON.stringify(metaError)}`);
    }
  }

  private async fetchAllPaginated<T>(url: string, params: Record<string, any>): Promise<T[]> {
    let allData: T[] = [];
    let nextUrl: string | null = null;

    try {
      const response = await axios.get(url, { params });
      allData = [...allData, ...response.data.data];
      nextUrl = response.data.paging?.next || null;

      while (nextUrl) {
        const nextResponse = await axios.get(nextUrl);
        allData = [...allData, ...nextResponse.data.data];
        nextUrl = nextResponse.data.paging?.next || null;
      }

      return allData;
    } catch (error: any) {
      console.error(`Meta Pagination Error for URL ${url}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async listUserPages(userAccessToken: string) {
    try {
      const pages = await this.fetchAllPaginated<any>(`${this.graphUrl}/me/accounts`, {
        access_token: userAccessToken,
        fields: "id,name,access_token,category,category_list,tasks,picture{url}",
        limit: 100,
      });
      return pages;
    } catch (error: any) {
      console.error("Meta List Pages Error:", error.response?.data || error.message);
      throw new Error("Failed to list Facebook Pages.");
    }
  }

  async saveIntegration(
    workspaceId: string,
    data: {
      accessToken: string;
      pageAccessToken?: string;
      pageId: string;
      pageName: string;
      pagePictureUrl?: string;
      adAccountId?: string;
      adAccountName?: string;
    }
  ) {
    const updateQuery: Record<string, any> = {
      "metaAds.lastSyncedAt": new Date(),
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateQuery[`metaAds.${key}`] = value;
      }
    }

    const workspace = await models.workspaces.findByIdAndUpdate(
      workspaceId,
      { $set: updateQuery },
      { new: true, upsert: true } // If workspace doesn't exist, this fails unless we do something else, but let's assume it exists or use upsert
    );

    if (!workspace) throw new Error("Workspace not found.");
    return workspace;
  }

  async listAdAccounts(accessToken: string) {
    try {
      const accounts = await this.fetchAllPaginated<any>(`${this.graphUrl}/me/adaccounts`, {
        access_token: accessToken,
        fields: "name,account_id,account_status,currency",
        limit: 100,
      });
      return accounts;
    } catch (error: any) {
      const metaError = error.response?.data || error.message;
      console.error("Meta List AdAccounts Error:", metaError);
      throw new Error(`Failed to list Facebook Ad Accounts. Meta Error: ${JSON.stringify(metaError)}`);
    }
  }

  private dateParams(datePreset: string, timeRange?: { since: string; until: string }) {
    return timeRange ? { time_range: JSON.stringify(timeRange) } : { date_preset: datePreset };
  }

  async getAdInsights(
    adAccountId: string,
    accessToken: string,
    datePreset: string = "this_month",
    timeRange?: { since: string; until: string }
  ) {
    try {
      const [aggregatedResponse, dailyResponse, adsStatusResponse] = await Promise.all([
        axios.get(`${this.graphUrl}/act_${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            level: "ad",
            fields:
              "ad_id,ad_name,campaign_name,spend,impressions,clicks,cpc,cpm,reach,actions,action_values,cost_per_action_type,purchase_roas",
            ...this.dateParams(datePreset, timeRange),
          },
        }),
        axios.get(`${this.graphUrl}/act_${adAccountId}/insights`, {
          params: {
            access_token: accessToken,
            level: "account",
            fields: "spend,clicks,impressions,actions,date_start",
            ...this.dateParams(datePreset, timeRange),
            time_increment: 1,
          },
        }),
        axios
          .get(`${this.graphUrl}/act_${adAccountId}/ads`, {
            params: {
              access_token: accessToken,
              fields: "id,effective_status,adcreatives{thumbnail_url,image_url}",
              limit: 500,
            },
          })
          .catch(() => ({ data: { data: [] } })),
      ]);

      const statusMap: Record<string, string> = {};
      const creativeMap: Record<string, string> = {};
      
      for (const ad of adsStatusResponse.data.data || []) {
        statusMap[ad.id] = ad.effective_status;
        const creative = ad.adcreatives?.data?.[0];
        if (creative) {
          creativeMap[ad.id] = creative.image_url || creative.thumbnail_url;
        }
      }

      const insights = (aggregatedResponse.data.data || []).map((row: any) => ({
        ...row,
        effective_status: statusMap[row.ad_id] ?? "UNKNOWN",
        creative_url: creativeMap[row.ad_id] || null,
      }));

      return {
        insights,
        dailySpend: dailyResponse.data.data || [],
      };
    } catch (error: any) {
      const metaError = error.response?.data || error.message;
      console.error("Meta Ads Insights Error:", metaError);
      throw new Error(`Failed to fetch Ads insights. Meta Error: ${JSON.stringify(metaError)}`);
    }
  }
}

export const metaService = new MetaService();
