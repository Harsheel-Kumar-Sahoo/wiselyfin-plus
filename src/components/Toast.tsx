import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { create } from "zustand";
import { cx } from "./cx";

type Tone = "success" | "error" | "info";
type ToastItem = { id: number; tone: Tone; message: string };

type ToastState = {
  items: ToastItem[];
  show: (message: string, tone?: Tone) => void;
  dismiss: (id: number) => void;
};

let nextId = 1;

// Call useToast.getState().show("text") from anywhere in the app.
export const useToast = create<ToastState>((set, get) => ({
  items: [],
  show: (message, tone = "info") => {
    const id = nextId++;
    set({ items: [...get().items.slice(-2), { id, tone, message }] });
    setTimeout(() => get().dismiss(id), 4000);
  },
  dismiss: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
}));

const icons = { success: CheckCircle2, error: AlertCircle, info: Info } as const;
const colors: Record<Tone, string> = {
  success: "text-success",
  error: "text-error",
  info: "text-accent",
};

// Put this once near the top of the app. It draws the messages.
export function ToastViewport() {
  const { t } = useTranslation();
  const items = useToast((s) => s.items);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {items.map((item) => {
        const Icon = icons[item.tone];
        return (
          <div
            key={item.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card"
          >
            <Icon size={20} strokeWidth={1.75} className={cx("shrink-0", colors[item.tone])} aria-hidden="true" />
            <p className="flex-1 text-sm text-ink">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label={t("common.close")}
              className="rounded-control p-1 text-muted hover:bg-soft hover:text-ink"
            >
              <X size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}