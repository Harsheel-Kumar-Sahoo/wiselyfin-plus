import { GEMINI_MODEL, SYSTEM_PROMPT } from "../config/ai.js";
import type { Lang } from "../utils/localize.js";

export type ChatMessage = { role: "user" | "assistant"; text: string };

const LANGUAGE_NAMES: Record<Lang, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
};

export type AiResult = { ok: true; text: string } | { ok: false; reason: "not_configured" | "failed" };

async function askGemini(messages: ChatMessage[], lang: Lang): Promise<AiResult> {
  const key = process.env.AI_API_KEY;
  if (!key) return { ok: false, reason: "not_configured" };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `${SYSTEM_PROMPT}\nAlways answer in ${LANGUAGE_NAMES[lang]}.` }],
          },
          contents: messages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          })),
          generationConfig: { maxOutputTokens: 600, temperature: 0.4 },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );
    if (!res.ok) return { ok: false, reason: "failed" };
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    if (!text) return { ok: false, reason: "failed" };
    return { ok: true, text };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

// The provider switch. To use another AI later, add a function above and a line here.
// This never throws: any problem becomes a friendly "failed" result.
export async function askTutor(messages: ChatMessage[], lang: Lang): Promise<AiResult> {
  const provider = process.env.AI_PROVIDER ?? "gemini";
  switch (provider) {
    case "gemini":
      return askGemini(messages, lang);
    default:
      return { ok: false, reason: "not_configured" };
  }
}