import mongoose, { Schema, type InferSchemaType } from "mongoose";

// A savings goal. Amounts are stored in paise.
const goalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    targetPaise: { type: Number, required: true, min: 1 },
    savedPaise: { type: Number, default: 0, min: 0 },
    targetDay: { type: String, default: "" }, // optional, for example "2027-03-31"
  },
  { timestamps: true }
);

export const Goal =
  (mongoose.models.Goal as mongoose.Model<InferSchemaType<typeof goalSchema>>) ||
  mongoose.model("Goal", goalSchema);