import mongoose, { Schema, type InferSchemaType } from "mongoose";

// One row per user per lesson. Created only by the server.
const progressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    pathId: { type: Schema.Types.ObjectId, ref: "Path", required: true, index: true },
    bestScore: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const Progress =
  (mongoose.models.Progress as mongoose.Model<InferSchemaType<typeof progressSchema>>) ||
  mongoose.model("Progress", progressSchema);