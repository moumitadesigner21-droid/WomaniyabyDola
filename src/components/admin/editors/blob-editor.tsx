"use client";

import type { ReactNode } from "react";
import { Section } from "@/components/admin/form/fields";

/** Card wrapper with Save/Reset for a single site_content key. */
export function BlobEditor({
  title,
  description,
  editor,
  children,
}: {
  title: string;
  description?: string;
  editor: {
    save: () => Promise<boolean>;
    reset: () => void;
    saving: boolean;
    loaded: boolean;
    message: string;
    isError: boolean;
    dirty: boolean;
  };
  children: ReactNode;
}) {
  return (
    <Section
      title={title}
      description={description}
      actions={
        <div className="flex items-center gap-3">
          {editor.message ? (
            <span className={`text-xs ${editor.isError ? "text-maroon" : "text-forest"}`}>
              {editor.message}
            </span>
          ) : editor.dirty ? (
            <span className="text-xs text-warm-gray">Unsaved changes</span>
          ) : null}
          <button
            type="button"
            onClick={editor.reset}
            className="text-[11px] tracking-[0.12em] text-warm-gray uppercase hover:text-charcoal"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={editor.saving || !editor.loaded}
            onClick={() => void editor.save()}
            className="border border-maroon bg-maroon px-4 py-2 text-xs tracking-[0.14em] text-ivory uppercase disabled:opacity-60"
          >
            {editor.saving ? "Saving…" : "Save"}
          </button>
        </div>
      }
    >
      {editor.loaded ? children : <p className="text-sm text-warm-gray">Loading…</p>}
    </Section>
  );
}
