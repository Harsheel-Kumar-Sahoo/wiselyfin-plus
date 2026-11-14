import type { HTMLAttributes } from "react";
import { cx } from "./cx";

type Props = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({ padded = true, className, children, ...rest }: Props) {
  return (
    <div
      className={cx(
        "rounded-card border border-line bg-surface shadow-card",
        padded && "p-4 sm:p-6",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}