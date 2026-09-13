"use client";

import { useCallback, useEffect, useState } from "react";
import type { z } from "zod";

interface Issue {
  path: string;
  message: string;
}

/**
 * Loads one `site_content` blob, validates it client-side with the same zod
 * schema the API uses, and exposes save/reset. `defaults` is used when the
 * key is missing or unparseable (and for "Reset to defaults").
 */
export function useContent<S extends z.ZodTypeAny>(
  key: string,
  schema: S,
  defaults: z.output<S>,
) {
  type Value = z.output<S>;
  const [value, setValue] = useState<Value>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/admin/content/${key}`);
        const payload = (await response.json()) as { value: unknown };
        const parsed = schema.safeParse(payload.value);
        if (!cancelled) setValue(parsed.success ? (parsed.data as Value) : defaults);
      } catch {
        if (!cancelled) setValue(defaults);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // defaults/schema are module constants
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback((next: Value | ((current: Value) => Value)) => {
    setValue((current) =>
      typeof next === "function" ? (next as (c: Value) => Value)(current) : next,
    );
    setDirty(true);
    setMessage("");
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setMessage("");
    setErrors({});

    const local = schema.safeParse(value);
    if (!local.success) {
      setIsError(true);
      setErrors(
        Object.fromEntries(local.error.issues.map((i) => [i.path.join("."), i.message])),
      );
      setMessage(`Please fix: ${local.error.issues[0]?.path.join(".") || key}`);
      setSaving(false);
      return false;
    }

    const response = await fetch(`/api/admin/content/${key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: local.data }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      issues?: Issue[];
    };

    if (!response.ok) {
      setIsError(true);
      setMessage(payload.error ?? "Failed to save.");
      setErrors(Object.fromEntries((payload.issues ?? []).map((i) => [i.path, i.message])));
      setSaving(false);
      return false;
    }

    setIsError(false);
    setMessage("Saved.");
    setDirty(false);
    setSaving(false);
    return true;
  }, [key, schema, value]);

  const reset = useCallback(() => {
    update(defaults);
    setMessage("Defaults restored — save to apply.");
    setIsError(false);
  }, [defaults, update]);

  return { value, update, save, reset, saving, loaded, message, isError, errors, dirty };
}
