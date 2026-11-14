import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    emailVerified: { type: Boolean, default: false },
    language: { type: String, enum: ["en", "hi", "ta", "te", "bn"], default: "en" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    finCoins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDay: { type: String, default: "" },
    failedLogins: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User =
  (mongoose.models.User as mongoose.Model<InferSchemaType<typeof userSchema>>) ||
  mongoose.model("User", userSchema);