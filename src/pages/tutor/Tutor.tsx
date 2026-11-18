import { useMutation } from "@tanstack/react-query";
import { Bot, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { cx } from "../../components/cx";
import { EmptyState } from "../../components/EmptyState";
import { ApiError, api } from "../../lib/api";

type Message = { role: "user" | "assistant"; text: string; kind?: "error" };

type AskResponse = {
  ok: true;
  status: "answer" | "failed" | "not_configured" | "secret_warning";
  answer?: string;
};

const SUGGESTIONS = ["sip", "upi", "emergency", "credit"];

export function Tutor() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const ask = useMutation({
    mutationFn: (v: { question: string; history: Array<{ role: string; text: string }> }) =>
      api<AskResponse>(`/api/tutor/ask?lang=${lang}`, { method: "POST", body: v }),
    onSuccess: (data) => {
      if (data.status === "answer" && data.answer) {
        setMessages((m) => [...m, { role: "assistant", text: data.answer ?? "" }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: t(`tutor.status.${data.status}`), kind: "error" }]);
      }
    },
    onError: (err) => {
      const limited = err instanceof ApiError && err.status === 429;
      setMessages((m) => [
        ...m,
        { role: "assistant", text: limited ? t("tutor.limit") : t("tutor.status.failed"), kind: "error" },
      ]);
    },
  });

  function send(question: string) {
    const q = question.trim();
    if (!q || ask.isPending) return;
    // Only real answers are sent back as context, never error notices.
    const history = messages
      .filter((m) => m.kind !== "error")
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { role: "user", text: q }]);
    setText("");
    ask.mutate({ question: q, history });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(text);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("tutor.title")}</h1>
        <p className="text-muted">{t("tutor.subtitle")}</p>
      </div>

      <div role="note" className="rounded-control bg-accent-soft px-3 py-2 text-sm text-accent">
        {t("tutor.privacy")}
      </div>

      <Card className="space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <EmptyState icon={Bot} title={t("tutor.emptyTitle")} description={t("tutor.emptyBody")} />
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="secondary" className="h-auto whitespace-normal py-2 text-left" onClick={() => send(t(`tutor.suggestions.${s}`))}>
                  {t(`tutor.suggestions.${s}`)}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cx(
                    "max-w-[85%] space-y-1 rounded-card px-4 py-3 text-sm",
                    m.role === "user"
                      ? "bg-accent text-on-accent"
                      : m.kind === "error"
                        ? "bg-error-soft text-error"
                        : "bg-soft text-ink"
                  )}
                >
                  <p className="text-xs opacity-75">{m.role === "user" ? t("tutor.you") : t("tutor.tutor")}</p>
                  {/* Rendered as plain text, never as HTML. */}
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {ask.isPending ? <p className="text-sm text-muted">{t("tutor.thinking")}</p> : null}
            <div ref={endRef} />
          </div>
        )}
      </Card>

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="tutor-q" className="sr-only">
            {t("tutor.placeholder")}
          </label>
          <textarea
            id="tutor-q"
            rows={2}
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(text);
              }
            }}
            placeholder={t("tutor.placeholder")}
            className="w-full rounded-control border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted"
          />
        </div>
        <Button type="submit" loading={ask.isPending} aria-label={t("tutor.send")}>
          <Send size={18} strokeWidth={1.75} aria-hidden="true" />
          {t("tutor.send")}
        </Button>
      </form>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">{t("tutor.disclaimer")}</p>
        {messages.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            {t("tutor.clear")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}