"use client";

import { useState, type ReactNode } from "react";

export const inputClass =
  "w-full border border-charcoal/15 bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition-colors focus:border-maroon disabled:bg-ivory/60";

export function Section({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="border border-charcoal/10 bg-white p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-maroon">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-warm-gray">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
  counter,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  counter?: { value: number; max: number };
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-xs tracking-[0.14em] text-charcoal uppercase">
          {label}
        </span>
        {counter ? (
          <span
            className={`text-[11px] ${
              counter.value > counter.max ? "text-maroon" : "text-warm-gray"
            }`}
          >
            {counter.value}/{counter.max}
          </span>
        ) : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-maroon">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-warm-gray">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  required,
  type = "text",
  className,
  maxLength,
  showCounter,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "url" | "email" | "tel";
  className?: string;
  maxLength?: number;
  showCounter?: boolean;
}) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      className={className}
      counter={showCounter && maxLength ? { value: value.length, max: maxLength } : undefined}
    >
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  error,
  rows = 4,
  placeholder,
  className,
  maxLength,
  showCounter,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  rows?: number;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showCounter?: boolean;
}) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      className={className}
      counter={showCounter && maxLength ? { value: value.length, max: maxLength } : undefined}
    >
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} resize-y`}
      />
    </Field>
  );
}

/**
 * Draft text for array-backed fields: local state while typing, parent updated
 * on commit (blur/Enter), re-synced when the parent value changes externally.
 */
function useDraftList(
  value: string[],
  onChange: (value: string[]) => void,
  join: string,
  split: (text: string) => string[],
) {
  const joined = value.join(join);
  const [draft, setDraft] = useState(joined);
  const [lastSynced, setLastSynced] = useState(joined);

  if (joined !== lastSynced) {
    setLastSynced(joined);
    setDraft(joined);
  }

  const commit = () => {
    const next = split(draft);
    setDraft(next.join(join));
    if (next.join("\u0000") !== value.join("\u0000")) onChange(next);
  };

  return { draft, setDraft, commit };
}

/** Multi-paragraph text: blank lines separate paragraphs. */
export function ParagraphsField({
  label,
  value,
  onChange,
  hint,
  rows = 6,
  className,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  rows?: number;
  className?: string;
}) {
  const { draft, setDraft, commit } = useDraftList(value, onChange, "\n\n", (text) =>
    text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean),
  );
  return (
    <Field label={label} hint={hint ?? "Leave a blank line between paragraphs."} className={className}>
      <textarea
        value={draft}
        rows={rows}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        className={`${inputClass} resize-y`}
      />
    </Field>
  );
}

/** One item per line. */
export function LinesField({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  placeholder,
  className,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  const { draft, setDraft, commit } = useDraftList(value, onChange, "\n", (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );
  return (
    <Field label={label} hint={hint ?? "One per line."} className={className}>
      <textarea
        value={draft}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        className={`${inputClass} resize-y`}
      />
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  hint,
  error,
  min,
  max,
  step,
  className,
  allowEmpty,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  hint?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  allowEmpty?: boolean;
}) {
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            onChange(allowEmpty ? null : 0);
            return;
          }
          const parsed = Number(raw);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
        className={inputClass}
      />
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
  className?: string;
}) {
  // Keep a stored value that isn't one of the presets instead of silently
  // snapping to the first option.
  const allOptions = options.some((option) => option.value === value)
    ? options
    : [{ value, label: value ? `Custom (${value})` : "—" }, ...options];

  return (
    <Field label={label} hint={hint} className={className}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={inputClass}
      >
        {allOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-charcoal">
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            onChange(!checked);
          }
        }}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-forest" : "bg-charcoal/20"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      <span>
        <span className="block font-medium">{label}</span>
        {hint ? <span className="block text-xs text-warm-gray">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Comma-separated list input that returns a trimmed string array. */
export function ListField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  className,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  placeholder?: string;
  className?: string;
}) {
  const { draft, setDraft, commit } = useDraftList(value, onChange, ", ", (text) => [
    ...new Set(
      text
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ]);
  return (
    <Field label={label} hint={hint ?? "Separate with commas."} className={className}>
      <input
        type="text"
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        className={inputClass}
      />
    </Field>
  );
}

export function SaveBar({
  saving,
  message,
  isError,
  onSave,
  label = "Save Changes",
  secondary,
}: {
  saving: boolean;
  message: string;
  isError?: boolean;
  onSave: () => void;
  label?: string;
  secondary?: ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-charcoal/10 bg-ivory/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="border border-maroon bg-maroon px-5 py-2.5 text-xs tracking-[0.14em] text-ivory uppercase transition-colors hover:bg-maroon-dark disabled:opacity-60"
      >
        {saving ? "Saving..." : label}
      </button>
      {secondary}
      {message ? (
        <p className={`text-sm ${isError ? "text-maroon" : "text-forest"}`}>{message}</p>
      ) : null}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-charcoal/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`-mb-px border-b-2 px-4 py-2.5 text-xs tracking-[0.14em] uppercase transition-colors ${
            active === tab.id
              ? "border-maroon text-maroon"
              : "border-transparent text-warm-gray hover:text-charcoal"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
