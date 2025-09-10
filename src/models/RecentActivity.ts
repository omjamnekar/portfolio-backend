import { Schema, model, Document } from "mongoose";

export interface IRecentActivity extends Document {
  adminUserId: Schema.Types.ObjectId; // Reference to AdminUser
  activity: string; // Description of the activity
  timestamp: Date; // When the activity occurred
}

const RecentActivitySchema = new Schema<IRecentActivity>(
  {
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const RecentActivity = model<IRecentActivity>(
  "RecentActivity",
  RecentActivitySchema
);
