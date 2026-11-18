import mongoose, { Schema, type InferSchemaType } from "mongoose";

// The trade ledger. Every buy and sell is one row that is never changed or deleted.
const tradeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ["buy", "sell"], required: true },
    qty: { type: Number, required: true, min: 1 },
    pricePaise: { type: Number, required: true, min: 1 },
    totalPaise: { type: Number, required: true, min: 1 },
    realizedPaise: { type: Number, default: 0 }, // profit or loss made by a sell
    cashAfterPaise: { type: Number, required: true },
    priceSource: { type: String, enum: ["delayed", "simulated"], required: true },
  },
  { timestamps: true }
);

tradeSchema.index({ userId: 1, createdAt: -1 });

export const Trade =
  (mongoose.models.Trade as mongoose.Model<InferSchemaType<typeof tradeSchema>>) ||
  mongoose.model("Trade", tradeSchema);