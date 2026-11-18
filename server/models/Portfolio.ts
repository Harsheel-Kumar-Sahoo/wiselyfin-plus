import mongoose, { Schema, type InferSchemaType } from "mongoose";

// One row per user: the virtual cash left. Amounts are in paise.
const portfolioSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    cashPaise: { type: Number, required: true, min: 0 },
    startingPaise: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Portfolio =
  (mongoose.models.Portfolio as mongoose.Model<InferSchemaType<typeof portfolioSchema>>) ||
  mongoose.model("Portfolio", portfolioSchema);