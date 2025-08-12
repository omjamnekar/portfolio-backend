import { Schema, model, Document } from "mongoose";

export interface IRepo extends Document {
  provider: "github" | "linkedin" | string;
  remoteId: string; // provider-specific id
  title: string;
  description?: string;
  url?: string;
  language?: string;
  topics?: string[];
  isFeatured?: boolean;
  hidden?: boolean;
  fetchedAt: Date;
  raw?: any;
}

const RepoSchema = new Schema<IRepo>(
  {
    provider: { type: String, required: true, index: true },
    remoteId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: String,
    url: String,
    language: String,
    topics: [String],
    isFeatured: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    fetchedAt: { type: Date, default: Date.now },
    raw: Schema.Types.Mixed,
  },
  { timestamps: true }
);

RepoSchema.index({ provider: 1, remoteId: 1 }, { unique: true });

export const Repo = model<IRepo>("Repo", RepoSchema);
