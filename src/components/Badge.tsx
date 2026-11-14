import type { HTMLAttributes } from "react";
import { cx } from "./cx";

type Tone = "neutral" | "accent" | "coin" | "success" | "error";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  neutral: "bg-soft text-muted",
  accent: "bg-accent-soft text-accent",
  coin: "bg-coin-soft text-coin",
  success: "bg-success-soft text-success",
  error: "bg-error-soft text-error",
};

export function Badge({ tone = "neutral", className, children, ...rest }: Props) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}