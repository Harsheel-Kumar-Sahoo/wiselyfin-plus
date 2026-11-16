import mongoose, { Schema, type InferSchemaType } from "mongoose";

// One row per badge earned. Created only by the server.
const userBadgeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badgeId: { type: String, required: true },
  },
  { timestamps: true }
);

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge =
  (mongoose.models.UserBadge as mongoose.Model<InferSchemaType<typeof userBadgeSchema>>) ||
  mongoose.model("UserBadge", userBadgeSchema);