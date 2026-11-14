import mongoose, { Schema, type InferSchemaType } from "mongoose";

// Text that can be shown in each of the five languages. English is required.
const textSchema = new Schema(
  {
    en: { type: String, required: true },
    hi: { type: String, default: "" },
    ta: { type: String, default: "" },
    te: { type: String, default: "" },
    bn: { type: String, default: "" },
  },
  { _id: false }
);

// A learning path, for example "Beginner" or "Scam Awareness".
const pathSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: textSchema, required: true },
    description: { type: textSchema, required: true },
    icon: { type: String, default: "BookOpen" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    completionCoins: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export const Path =
  (mongoose.models.Path as mongoose.Model<InferSchemaType<typeof pathSchema>>) ||
  mongoose.model("Path", pathSchema);