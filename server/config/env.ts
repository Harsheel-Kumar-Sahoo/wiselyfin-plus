import { z } from "zod";

const schema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CRON_SECRET: z.string().min(16),
  APP_URL: z.string().url().default("http://localhost:5173"),
  NODE_ENV: z.string().default("development"),
  EMAIL_PROVIDER: z.string().default("resend"),
  EMAIL_API_KEY: z.string().default(""),
  EMAIL_FROM: z.string().default(""),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

// Reads and checks all settings once. Only names are shown in errors, never values.
export function getEnv(): Env {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const names = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing or invalid environment settings: ${names}`);
  }
  cached = result.data;
  return cached;
}