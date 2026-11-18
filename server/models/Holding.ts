import mongoose, { Schema, type InferSchemaType } from "mongoose";

// Shares a user currently owns. costPaise is the total money spent on the shares still held.
const holdingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    qty: { type: Number, required: true, min: 0 },
    costPaise: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

holdingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Holding =
  (mongoose.models.Holding as mongoose.Model<InferSchemaType<typeof holdingSchema>>) ||
  mongoose.model("Holding", holdingSchema);