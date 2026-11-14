import mongoose, { Schema, type InferSchemaType } from "mongoose";

// One-time tokens for email verification and password reset.
const actionTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: ["verify_email", "reset_password"], required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

actionTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ActionToken =
  (mongoose.models.ActionToken as mongoose.Model<InferSchemaType<typeof actionTokenSchema>>) ||
  mongoose.model("ActionToken", actionTokenSchema);