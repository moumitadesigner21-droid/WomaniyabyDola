"use client";

import { useEffect, useState } from "react";
import { Field, inputClass } from "@/components/admin/form/fields";

interface LinkOption {
  group: "Pages" | "Categories" | "Products";
  label: string;
  href: string;
}

let cache: LinkOption[] | null = null;
let inflight: Promise<LinkOption[]> | null = null;

async function loadLinks(): Promise<LinkOption[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetch("/api/admin/links")
      .then((response) => response.json() as Promise<{ links: LinkOption[] }>)
      .then((payload) => {
        cache = payload.links;
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * URL input with a dropdown of internal destinations (pages, categories,
 * products). External URLs and anchors can still be typed.
 */
export function LinkField({
  label,
  value,
  onChange,
  hint,
  error,
  className,
  required,
}: {
  label: string;
  value: string;
  onChange: (href: string) => void;
  hint?: string;
  error?: string;
  className?: string;
  required?: boolean;
}) {
  const [links, setLinks] = useState<LinkOption[]>(cache ?? []);

  useEffect(() => {
    let cancelled = false;
    void loadLinks().then((loaded) => {
      if (!cancelled) setLinks(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = ["Pages", "Categories", "Products"] as const;
  const known = links.some((link) => link.href === value);

  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <div className="flex gap-2">
        <select
          value={known ? value : "__custom__"}
          onChange={(event) => {
            if (event.target.value !== "__custom__") onChange(event.target.value);
          }}
          className={`${inputClass} max-w-[45%]`}
        >
          <option value="__custom__">Custom URL…</option>
          {groups.map((group) => (
            <optgroup key={group} label={group}>
              {links
                .filter((link) => link.group === group)
                .map((link) => (
                  <option key={link.href} value={link.href}>
                    {link.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <input
          type="text"
          value={value}
          required={required}
          placeholder="/shop or https://…"
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} font-mono text-xs`}
        />
      </div>
    </Field>
  );
}
