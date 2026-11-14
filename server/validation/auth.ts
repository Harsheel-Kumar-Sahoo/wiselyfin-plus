import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(254);

const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64, "Password must be at most 64 characters.")
  .regex(/[A-Za-z]/, "Password must contain a letter.")
  .regex(/[0-9]/, "Password must contain a number.");

const name = z
  .string()
  .trim()
  .min(1, "Please enter your name.")
  .max(60)
  .regex(/^[^<>]*$/, "Name cannot contain the characters < or >.");

export const signupSchema = z.object({
  name,
  email,
  password,
  language: z.enum(["en", "hi", "ta", "te", "bn"]).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(200),
  password,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10).max(200),
});