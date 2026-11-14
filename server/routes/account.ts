import { Router } from "express";
import type { Types } from "mongoose";
import { getEnv } from "../config/env.js";
import { connectDb } from "../db/connect.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { ActionToken } from "../models/ActionToken.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User } from "../models/User.js";
import { escapeHtml, sendEmail } from "../services/email.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { hashPassword, hashToken, randomToken } from "../utils/security.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../validation/auth.js";

export const accountRouter = Router();

type Purpose = "verify_email" | "reset_password";

// Makes a new one-time token and cancels any older unused one of the same kind.
async function createActionToken(userId: Types.ObjectId, purpose: Purpose, hours: number) {
  await ActionToken.updateMany({ userId, purpose, used: false }, { used: true });
  const token = randomToken();
  await ActionToken.create({
    userId,
    purpose,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
  });
  return token;
}

// Uses a token exactly once. Returns the user id, or null if the token is wrong, used or expired.
async function consumeActionToken(token: string, purpose: Purpose) {
  const found = await ActionToken.findOneAndUpdate(
    { tokenHash: hashToken(token), purpose, used: false, expiresAt: { $gt: new Date() } },
    { used: true }
  );
  return found ? found.userId : null;
}

accountRouter.post(
  "/verify-email",
  rateLimit("verify", 20, 3600),
  asyncHandler(async (req, res) => {
    const body = verifyEmailSchema.parse(req.body);
    await connectDb();
    const userId = await consumeActionToken(body.token, "verify_email");
    if (!userId) {
      throw new AppError(400, "BAD_TOKEN", "This link is not valid or has expired.");
    }
    await User.updateOne({ _id: userId }, { emailVerified: true });
    res.json({ ok: true });
  })
);

accountRouter.post(
  "/resend-verification",
  requireAuth,
  rateLimit("resend", 5, 3600),
  asyncHandler(async (req, res) => {
    await connectDb();
    const user = await User.findById(req.auth?.sub);
    if (!user) throw new AppError(401, "UNAUTHORIZED", "Please log in again.");
    if (user.emailVerified) {
      res.json({ ok: true, message: "Your email is already verified." });
      return;
    }
    const token = await createActionToken(user._id, "verify_email", 24);
    const link = `${getEnv().APP_URL}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your WiselyFin Plus email",
      html: `<p>Hello ${escapeHtml(user.name)},</p><p>Please confirm your email by opening this link:</p><p><a href="${link}">Verify my email</a></p><p>This link works for 24 hours.</p>`,
    });
    res.json({ ok: true, message: "If email sending is available, a new link is on its way." });
  })
);

// The answer is always the same, so nobody can use this route to find out who has an account.
accountRouter.post(
  "/forgot-password",
  rateLimit("forgot", 5, 3600),
  asyncHandler(async (req, res) => {
    const body = forgotPasswordSchema.parse(req.body);
    await connectDb();
    const user = await User.findOne({ email: body.email });
    if (user) {
      const token = await createActionToken(user._id, "reset_password", 1);
      const link = `${getEnv().APP_URL}/reset-password?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: "Reset your WiselyFin Plus password",
        html: `<p>Hello ${escapeHtml(user.name)},</p><p>To choose a new password, open this link:</p><p><a href="${link}">Reset my password</a></p><p>This link works for 1 hour. If you did not ask for this, you can ignore this email.</p>`,
      });
    }
    res.json({
      ok: true,
      message: "If an account exists for this email, a reset link has been sent.",
    });
  })
);

accountRouter.post(
  "/reset-password",
  rateLimit("reset", 10, 3600),
  asyncHandler(async (req, res) => {
    const body = resetPasswordSchema.parse(req.body);
    await connectDb();
    const userId = await consumeActionToken(body.token, "reset_password");
    if (!userId) {
      throw new AppError(400, "BAD_TOKEN", "This link is not valid or has expired.");
    }
    await User.updateOne(
      { _id: userId },
      { passwordHash: await hashPassword(body.password), failedLogins: 0, lockedUntil: null }
    );
    // Log the user out of every device after a password change.
    await RefreshToken.updateMany({ userId }, { revoked: true });
    res.json({ ok: true, message: "Your password has been changed. Please log in." });
  })
);