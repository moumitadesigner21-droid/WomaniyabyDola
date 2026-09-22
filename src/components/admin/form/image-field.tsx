"use client";

import { useRef, useState } from "react";
import { Field, inputClass } from "@/components/admin/form/fields";
import { MediaLibraryModal } from "@/components/admin/form/media-library";
import { uploadImage } from "@/components/admin/form/upload";

/**
 * Single image: preview + upload to R2 + pick from library + remove.
 * The raw URL stays editable under "Advanced" for legacy remote images.
 */
export function ImageField({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  aspect = "aspect-[3/4]",
  className,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  aspect?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setLocalError("");
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
    <Field label={label} hint={hint} error={error || localError} className={className}>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void handleFile(event.dataTransfer.files?.[0]);
          }}
          className={`relative w-28 shrink-0 overflow-hidden border border-dashed border-charcoal/25 bg-ivory ${aspect}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary URLs
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-[10px] text-warm-gray">
              Tap to add
            </span>
          )}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] text-maroon">
              Uploading…
            </span>
          ) : null}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="min-h-11 border border-maroon px-3 text-[11px] tracking-[0.12em] text-maroon uppercase hover:bg-maroon hover:text-ivory"
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="min-h-11 border border-charcoal/20 px-3 text-[11px] tracking-[0.12em] text-charcoal uppercase hover:border-maroon/40"
            >
              Library
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="min-h-11 px-2 text-[11px] tracking-[0.12em] text-warm-gray uppercase hover:text-maroon"
              >
                Remove
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowUrl((open) => !open)}
              className="ml-auto text-[11px] text-warm-gray underline-offset-2 hover:underline"
            >
              {showUrl ? "Hide URL" : "Advanced"}
            </button>
          </div>
          {showUrl ? (
            <input
              type="text"
              value={value}
              required={required}
              placeholder="/uploads/cms/… or https://…"
              onChange={(event) => onChange(event.target.value)}
              className={`${inputClass} font-mono text-xs`}
            />
          ) : value ? (
            <p className="truncate font-mono text-[11px] text-warm-gray" title={value}>
              {value}
            </p>
          ) : null}
          {required && !value ? (
            <p className="text-[11px] text-maroon">Required.</p>
          ) : null}
        </div>
      </div>
    </Field>

    {/* Outside the field label, and not display:none, so iOS opens the picker once. */}
    <input
      ref={fileInput}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic,image/heif"
      className="sr-only"
      tabIndex={-1}
      onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        void handleFile(file);
      }}
    />

    <MediaLibraryModal
      open={libraryOpen}
      onClose={() => setLibraryOpen(false)}
      onSelect={(urls) => urls[0] && onChange(urls[0])}
    />
    </>
  );
}
