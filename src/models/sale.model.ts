import { Schema, model, Document, Types } from "mongoose";

export interface ISale extends Document {
  workspaceId: Types.ObjectId;
  adId?: string;
  amount: number;
  conversationsGenerated: number;
  customerName?: string;
  servicioContratado?: string;
  ubicacion?: string;
  notes?: string;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    adId: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    conversationsGenerated: {
      type: Number,
      default: 0,
      min: 0,
    },
    customerName: {
      type: String,
      trim: true,
    },
    servicioContratado: {
      type: String,
      trim: true,
    },
    ubicacion: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SaleModel = model<ISale>("Sale", SaleSchema);
