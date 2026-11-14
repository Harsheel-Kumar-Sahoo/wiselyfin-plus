import type { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env.js";
import { connectDb } from "../db/connect.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/errors.js";
import {
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_SECONDS,
  verifyAccessToken,
  type AccessPayload,
} from "../utils/security.js";

export const ACCESS_COOKIE = "wf_access";
export const REFRESH_COOKIE = "wf_refresh";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessPayload;
    }
  }
}

function baseCookie(maxAgeSeconds: number, path: string) {
  return {
    httpOnly: true,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "lax" as const,
    path,
    maxAge: maxAgeSeconds * 1000,
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, baseCookie(ACCESS_TTL_SECONDS, "/"));
  res.cookie(REFRESH_COOKIE, refreshToken, baseCookie(REFRESH_TTL_SECONDS, "/api/auth"));
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE];
  const payload = typeof token === "string" ? verifyAccessToken(token) : null;
  if (!payload) {
    return next(new AppError(401, "UNAUTHORIZED", "Please log in to continue."));
  }
  req.auth = payload;
  return next();
}

// The admin role is checked against the database, not only the login token.
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  requireAuth(req, res, async (err?: unknown) => {
    if (err) return next(err);
    try {
      await connectDb();
      const user = await User.findById(req.auth?.sub).select("role").lean();
      if (!user || user.role !== "admin") {
        return next(new AppError(403, "FORBIDDEN", "You do not have permission to do this."));
      }
      return next();
    } catch (e) {
      return next(e);
    }
  });
}