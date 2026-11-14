import { cx } from "./cx";

type Props = {
  value: number; // 0 to 100
  label: string; // read aloud by screen readers
  tone?: "accent" | "coin";
  className?: string;
};

export function ProgressBar({ value, label, tone = "accent", className }: Props) {
  const safe = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safe)}
      className={cx("h-2 w-full overflow-hidden rounded-full bg-soft", className)}
    >
      <div
        className={cx(
          "h-full rounded-full transition-all duration-300",
          tone === "coin" ? "bg-coin" : "bg-accent"
        )}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}