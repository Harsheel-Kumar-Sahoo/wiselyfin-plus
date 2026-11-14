import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cx } from "./cx";

export type SelectOption = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, options, error, className, id, ...rest },
  ref
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-message`;

  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        className={cx(
          "min-h-11 w-full rounded-control border bg-surface px-3 text-ink",
          error ? "border-error" : "border-line",
          className
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={messageId} className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
});