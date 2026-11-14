import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cx } from "./cx";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className, id, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cx(
          "min-h-11 w-full rounded-control border bg-surface px-3 text-ink placeholder:text-muted",
          error ? "border-error" : "border-line",
          className
        )}
        {...rest}
      />
      {message ? (
        <p id={messageId} className={cx("text-sm", error ? "text-error" : "text-muted")}>
          {message}
        </p>
      ) : null}
    </div>
  );
});