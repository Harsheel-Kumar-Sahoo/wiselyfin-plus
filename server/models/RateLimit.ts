import mongoose, { Schema, type InferSchemaType } from "mongoose";

// Counts requests per key (for example "login:1.2.3.4"). Rows delete themselves.
const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit =
  (mongoose.models.RateLimit as mongoose.Model<InferSchemaType<typeof rateLimitSchema>>) ||
  mongoose.model("RateLimit", rateLimitSchema);