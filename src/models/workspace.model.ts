import { Schema, model, Document, Types } from "mongoose";

export interface IMetaAds {
  accessToken?: string;
  pageAccessToken?: string;
  pageId?: string;
  pageName?: string;
  pagePictureUrl?: string;
  adAccountId?: string;
  adAccountName?: string;
  lastSyncedAt?: Date;
}

export interface IGhlIntegration {
  locationId?: string;
  apiKey?: string;
  lastSyncedAt?: Date;
}

export interface IWorkspace extends Document {
  name: string;
  metaAds?: IMetaAds;
  ghl?: IGhlIntegration;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    metaAds: {
      accessToken: { type: String },
      pageAccessToken: { type: String },
      pageId: { type: String },
      pageName: { type: String },
      pagePictureUrl: { type: String },
      adAccountId: { type: String },
      adAccountName: { type: String },
      lastSyncedAt: { type: Date },
    },
    ghl: {
      locationId: { type: String },
      apiKey: { type: String },
      lastSyncedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const WorkspaceModel = model<IWorkspace>("Workspace", WorkspaceSchema);
