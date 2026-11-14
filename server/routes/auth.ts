import { Router } from "express";
import { getEnv } from "../config/env.js";
import { connectDb } from "../db/connect.js";
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  requireAuth,
  setAuthCookies,
} from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { ActionToken } from "../models/ActionToken.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User } from "../models/User.js";
import { escapeHtml, sendEmail } from "../services/email.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import {
  REFRESH_TTL_SECONDS,
  hashPassword,
  hashToken,
  randomToken,
  signAccessToken,
  verifyPassword,
} from "../utils/security.js";
import { loginSchema, signupSchema } from "../validation/auth.js";

export const authRouter = Router();

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
// Used so a wrong email takes about as long as a wrong password.
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO5tIhR0Z1m5pQxF3Zr5G1vYQJmQy5b9u";

function publicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  language: string;
  theme: string;
  finCoins: number;
  xp: number;
  streak: number;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    language: user.language,
    theme: user.theme,
    finCoins: user.finCoins,
    xp: user.xp,
    streak: user.streak,
  };
}

async function startSession(res: Parameters<typeof setAuthCookies>[0], userId: string, role: "user" | "admin") {
  const refreshToken = randomToken();
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
  });
  setAuthCookies(res, signAccessToken({ sub: userId, role }), refreshToken);
}

authRouter.post(
  "/signup",
  rateLimit("signup", 10, 3600),
  asyncHandler(async (req, res) => {
    const body = signupSchema.parse(req.body);
    await connectDb();

    const existing = await User.findOne({ email: body.email }).select("_id").lean();
    if (existing) {
      throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists.");
    }

    let user;
    try {
      user = await User.create({
        name: body.name,
        email: body.email,
        passwordHash: await hashPassword(body.password),
        language: body.language ?? "en",
      });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists.");
      }
      throw err;
    }

    // Send the verification email. If this fails, signup still works.
    const verifyToken = randomToken();
    await ActionToken.create({
      userId: user._id,
      purpose: "verify_email",
      tokenHash: hashToken(verifyToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    const link = `${getEnv().APP_URL}/verify-email?token=${verifyToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your WiselyFin Plus email",
      html: `<p>Hello ${escapeHtml(user.name)},</p><p>Please confirm your email by opening this link:</p><p><a href="${link}">Verify my email</a></p><p>This link works for 24 hours.</p>`,
    });

    await startSession(res, String(user._id), "user");
    res.status(201).json({ ok: true, user: publicUser(user) });
  })
);

authRouter.post(
  "/login",
  rateLimit("login", 10, 900),
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    await connectDb();

    const user = await User.findOne({ email: body.email });
    const badLogin = new AppError(401, "BAD_LOGIN", "Email or password is not correct.");

    if (!user) {
      await verifyPassword(body.password, DUMMY_HASH);
      throw badLogin;
    }
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new AppError(
        423,
        "ACCOUNT_LOCKED",
        "Too many wrong passwords. Please try again in a few minutes."
      );
    }

    const passwordOk = await verifyPassword(body.password, user.passwordHash);
    if (!passwordOk) {
      user.failedLogins += 1;
      if (user.failedLogins >= MAX_FAILED_LOGINS) {
        user.failedLogins = 0;
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      }
      await user.save();
      throw badLogin;
    }

    if (user.failedLogins > 0 || user.lockedUntil) {
      user.failedLogins = 0;
      user.lockedUntil = null;
      await user.save();
    }

    await startSession(res, String(user._id), user.role);
    res.json({ ok: true, user: publicUser(user) });
  })
);

// Swaps the long-lived refresh cookie for a fresh pair. Each refresh token works only once.
authRouter.post(
  "/refresh",
  rateLimit("refresh", 60, 900),
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (typeof raw !== "string" || raw.length === 0) {
      throw new AppError(401, "UNAUTHORIZED", "Please log in to continue.");
    }
    await connectDb();

    const stored = await RefreshToken.findOne({ tokenHash: hashToken(raw) });
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      clearAuthCookies(res);
      throw new AppError(401, "UNAUTHORIZED", "Please log in again.");
    }
    if (stored.revoked) {
      // An old token was used again: someone may have copied it. Log out everywhere.
      await RefreshToken.updateMany({ userId: stored.userId }, { revoked: true });
      clearAuthCookies(res);
      throw new AppError(401, "UNAUTHORIZED", "Please log in again.");
    }

    const user = await User.findById(stored.userId);
    if (!user) {
      clearAuthCookies(res);
      throw new AppError(401, "UNAUTHORIZED", "Please log in again.");
    }

    stored.revoked = true;
    await stored.save();
    await startSession(res, String(user._id), user.role);
    res.json({ ok: true, user: publicUser(user) });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (typeof raw === "string" && raw.length > 0) {
      try {
        await connectDb();
        await RefreshToken.updateOne({ tokenHash: hashToken(raw) }, { revoked: true });
      } catch {
        // Logging out must always work, even if the database is down.
      }
    }
    clearAuthCookies(res);
    res.json({ ok: true });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    await connectDb();
    const user = await User.findById(req.auth?.sub);
    if (!user) throw new AppError(401, "UNAUTHORIZED", "Please log in again.");
    res.json({ ok: true, user: publicUser(user) });
  })
);