import { getEnv } from "../config/env.js";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type EmailInput = { to: string; subject: string; html: string };

// Returns true if the email was handed to the email service, false if not.
// A failed email never breaks signup or login.
export async function sendEmail(input: EmailInput): Promise<boolean> {
  const env = getEnv();
  if (!env.EMAIL_API_KEY || !env.EMAIL_FROM) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.EMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}