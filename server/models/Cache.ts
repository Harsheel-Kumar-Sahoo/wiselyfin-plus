import mongoose, { Schema, type InferSchemaType } from "mongoose";

// A small key-value cache. Rows delete themselves when they expire.
const cacheSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
});

cacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cache =
  (mongoose.models.Cache as mongoose.Model<InferSchemaType<typeof cacheSchema>>) ||
  mongoose.model("Cache", cacheSchema);