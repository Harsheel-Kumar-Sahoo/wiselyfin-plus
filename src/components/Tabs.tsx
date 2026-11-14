import { useRef, type KeyboardEvent } from "react";
import { cx } from "./cx";

export type TabItem = { id: string; label: string };

type Props = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string; // read aloud by screen readers
};

export function Tabs({ items, value, onChange, label }: Props) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else return;
    e.preventDefault();
    const item = items[next];
    if (item) {
      onChange(item.id);
      refs.current[next]?.focus();
    }
  }

  return (
    <div role="tablist" aria-label={label} className="flex gap-1 border-b border-line">
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              "-mb-px min-h-11 border-b-2 px-4 text-sm font-medium transition-colors",
              selected ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}