"use client";

import {
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type RadioItem<T extends string> = { value: T; label: string };

/**
 * A radio group with the keyboard behavior people expect: one tab stop, arrow keys move and select,
 * Home and End jump. Each control in this panel is built on it, so they all behave the same.
 */
export function RadioGroup<T extends string>({
  label,
  value,
  items,
  onChange,
  className = "",
  style,
  itemClassName = "",
  renderItem,
  children,
}: {
  label: string;
  value: T;
  items: RadioItem<T>[];
  onChange: (value: T) => void;
  className?: string;
  style?: CSSProperties;
  itemClassName?: string | ((checked: boolean) => string);
  renderItem: (
    item: RadioItem<T>,
    checked: boolean,
    index: number,
  ) => ReactNode;
  /** Extra layers behind the items, such as a sliding highlight. */
  children?: ReactNode;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );

  const move = (to: number) => {
    const next = (to + items.length) % items.length;
    onChange(items[next].value);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(current + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(current - 1);
        break;
      case "Home":
        e.preventDefault();
        move(0);
        break;
      case "End":
        e.preventDefault();
        move(items.length - 1);
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={className}
      style={style}
      onKeyDown={onKeyDown}
    >
      {children}
      {items.map((item, i) => {
        // Nothing is checked when the value matches no item (a mix); the first item keeps the tab stop.
        const checked = item.value === value;
        const cls =
          typeof itemClassName === "function"
            ? itemClassName(checked)
            : itemClassName;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={item.label}
            tabIndex={i === current ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={`focus-visible:ring-ring/50 outline-none focus-visible:ring-3 ${cls}`}
          >
            {renderItem(item, checked, i)}
          </button>
        );
      })}
    </div>
  );
}
