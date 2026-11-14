import mongoose, { Schema, type InferSchemaType } from "mongoose";

// Every FinCoin change is one row here. The balance can always be re-added from these rows.
const ledgerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true }, // positive = earned, negative = spent
    balanceAfter: { type: Number, required: true },
    reason: { type: String, required: true }, // for example "lesson_reward"
    // Makes sure the same reward can never be paid twice, for example "lesson:<id>".
    refKey: { type: String, required: true },
  },
  { timestamps: true }
);

ledgerSchema.index({ userId: 1, refKey: 1 }, { unique: true });
ledgerSchema.index({ userId: 1, createdAt: -1 });

export const LedgerEntry =
  (mongoose.models.LedgerEntry as mongoose.Model<InferSchemaType<typeof ledgerSchema>>) ||
  mongoose.model("LedgerEntry", ledgerSchema);