import mongoose, { Schema, type InferSchemaType } from "mongoose";

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

// The correctAnswer field is stored here but is NEVER sent to the browser.
const questionSchema = new Schema(
  {
    prompt: { type: textSchema, required: true },
    options: { type: [textSchema], required: true },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: textSchema, required: true },
  },
  { _id: true }
);

const lessonSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    pathId: { type: Schema.Types.ObjectId, ref: "Path", required: true, index: true },
    order: { type: Number, default: 0 },
    title: { type: textSchema, required: true },
    // Lesson body is plain text. Blank lines separate paragraphs.
    body: { type: textSchema, required: true },
    questions: { type: [questionSchema], default: [] },
    rewardCoins: { type: Number, default: 10 },
    rewardXp: { type: Number, default: 20 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Lesson =
  (mongoose.models.Lesson as mongoose.Model<InferSchemaType<typeof lessonSchema>>) ||
  mongoose.model("Lesson", lessonSchema);