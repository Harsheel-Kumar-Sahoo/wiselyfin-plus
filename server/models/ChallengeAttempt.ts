import mongoose, { Schema, type InferSchemaType } from "mongoose";

// One daily challenge attempt per user per day. The unique index allows only one.
const challengeAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    day: { type: String, required: true }, // for example "2026-11-16"
    correct: { type: Boolean, required: true },
  },
  { timestamps: true }
);

challengeAttemptSchema.index({ userId: 1, day: 1 }, { unique: true });

export const ChallengeAttempt =
  (mongoose.models.ChallengeAttempt as mongoose.Model<InferSchemaType<typeof challengeAttemptSchema>>) ||
  mongoose.model("ChallengeAttempt", challengeAttemptSchema);