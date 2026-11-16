import mongoose, { Schema, type InferSchemaType } from "mongoose";

// One row per income or expense entry. Amounts are stored in paise (1 rupee = 100 paise)
// so that adding them never gives small rounding errors.
const expenseSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["expense", "income"], required: true },
    amountPaise: { type: Number, required: true, min: 1 },
    category: { type: String, required: true, trim: true, maxlength: 30 },
    note: { type: String, default: "", trim: true, maxlength: 120 },
    day: { type: String, required: true }, // for example "2026-11-16"
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, day: -1 });

export const Expense =
  (mongoose.models.Expense as mongoose.Model<InferSchemaType<typeof expenseSchema>>) ||
  mongoose.model("Expense", expenseSchema);