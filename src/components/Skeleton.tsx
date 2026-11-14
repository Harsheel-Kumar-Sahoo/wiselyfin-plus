import type { HTMLAttributes } from "react";
import { cx } from "./cx";

// A grey placeholder shape shown while real content is loading.
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cx("animate-pulse rounded-control bg-soft", className)} {...rest} />;
}