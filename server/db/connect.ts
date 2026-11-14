import mongoose from "mongoose";
import { getEnv } from "../config/env.js";

// Reuses one connection across requests, which is important on serverless hosting.
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export async function connectDb(): Promise<typeof mongoose> {
  if (!globalForMongoose.mongooseConn) {
    mongoose.set("strictQuery", true);
    globalForMongoose.mongooseConn = mongoose
      .connect(getEnv().MONGODB_URI, {
        dbName: "wiselyfin",
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 5,
      })
      .catch((err) => {
        globalForMongoose.mongooseConn = undefined;
        throw err;
      });
  }
  return globalForMongoose.mongooseConn;
}