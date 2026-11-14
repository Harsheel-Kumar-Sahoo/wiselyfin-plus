import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { getEnv } from "../config/env.js";

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// A random text that is safe to put in links and cookies.
export function randomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Only the scrambled version of a token is stored in the database.
export function hashToken(token: string): string {
  return crypto.createHmac("sha256", getEnv().JWT_REFRESH_SECRET).update(token).digest("hex");
}

export type AccessPayload = { sub: string; role: "user" | "admin" };

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, getEnv().JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL_SECONDS });
}

export function verifyAccessToken(token: string): AccessPayload | null {
  try {
    const decoded = jwt.verify(token, getEnv().JWT_ACCESS_SECRET);
    if (typeof decoded === "string") return null;
    const role = decoded.role;
    if (!decoded.sub || (role !== "user" && role !== "admin")) return null;
    return { sub: decoded.sub, role };
  } catch {
    return null;
  }
}