"use client";

import { useEffect, useRef, useState } from "react";
import { Field, inputClass } from "@/components/admin/form/fields";
import { MediaLibraryModal } from "@/components/admin/form/media-library";
import { SortableItem, SortableList } from "@/components/admin/form/sortable";
import { uploadImage } from "@/components/admin/form/upload";

export interface GalleryImage {
  url: string;
  altText: string;
}

/** Multi-image field: upload many, pick from library, drag to reorder, alt text per image. */
export function GalleryField({
  label,
  value,
  onChange,
  hint,
  defaultAlt = "",
}: {
  label: string;
  value: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  hint?: string;
  defaultAlt?: string;
}) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  // Updated as each photo lands, so a later file is added onto the latest list
  // even when the parent has not re-rendered yet.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const commit = (next: GalleryImage[]) => {
    valueRef.current = next;
    onChange(next);
  };

  const append = (urls: string[]) => {
    const current = valueRef.current;
    const existing = new Set(current.map((image) => image.url));
    const additions = urls
      .filter((url) => url && !existing.has(url))
      .map((url) => ({ url, altText: defaultAlt }));
    if (!additions.length) return;
    commit([...current, ...additions]);
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setError("");
    setBusy(files.length);
    const failures: string[] = [];
    let added = 0;
    for (const file of files) {
      try {
        const { url } = await uploadImage(file);
        append([url]);
        added += 1;
      } catch (err) {
        failures.push(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setBusy((count) => count - 1);
      }
    }
    if (failures.length && added > 0) {
      setError(
        `${added} photo${added === 1 ? "" : "s"} added. ${failures.length} failed — ${failures[0]}`,
      );
    } else if (failures.length) {
      setError(failures[0]);
    }
  };

  const update = (index: number, patch: Partial<GalleryImage>) =>
    commit(valueRef.current.map((image, i) => (i === index ? { ...image, ...patch } : image)));

  const remove = (index: number) => commit(valueRef.current.filter((_, i) => i !== index));

  return (
    <>
    <Field label={label} hint={hint} error={error}>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFiles(Array.from(event.dataTransfer.files));
        }}
        className="space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="min-h-11 border border-maroon px-3 text-[11px] tracking-[0.12em] text-maroon uppercase hover:bg-maroon hover:text-ivory"
          >
            Upload images
          </button>
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="min-h-11 border border-charcoal/20 px-3 text-[11px] tracking-[0.12em] text-charcoal uppercase hover:border-maroon/40"
          >
            Add from library
          </button>
          {busy > 0 ? <span className="text-xs text-forest">Uploading {busy}…</span> : null}
          <span className="text-[11px] text-warm-gray sm:ml-auto">
            Use the handle to reorder. The first photo is shown first.
          </span>
        </div>

        <SortableList items={value} getId={(image) => image.url} onReorder={onChange} grid>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {value.map((image, index) => (
              <SortableItem key={image.url} id={image.url} className="border border-charcoal/10 bg-white">
                {(handle) => (
                  <>
                    <div className="relative aspect-[3/4] overflow-hidden bg-ivory">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                      <img src={image.url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute top-1 left-1 bg-white/90">{handle}</div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-1 right-1 min-h-10 bg-white/90 px-2 text-[10px] tracking-[0.12em] text-maroon uppercase"
                      >
                        Remove
                      </button>
                      <span className="absolute bottom-1 left-1 bg-charcoal/70 px-1.5 py-0.5 text-[10px] text-ivory">
                        {index + 1}
                      </span>
                    </div>
                    <input
                      value={image.altText}
                      placeholder="Alt text (describe the photo)"
                      onChange={(event) => update(index, { altText: event.target.value })}
                      className={`${inputClass} border-0 border-t border-charcoal/10 text-xs`}
                    />
                  </>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>

        {value.length === 0 ? (
          <p className="border border-dashed border-charcoal/25 bg-ivory/60 px-4 py-6 text-center text-sm text-warm-gray">
            No gallery images yet. Tap Upload images to add photos.
          </p>
        ) : null}
      </div>
    </Field>

    {/* Outside the field label, and not display:none, so iOS opens the picker once. */}
    <input
      ref={fileInput}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic,image/heif"
      multiple
      className="sr-only"
      tabIndex={-1}
      onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        void handleFiles(files);
      }}
    />

    <MediaLibraryModal
      open={libraryOpen}
      multiple
      onClose={() => setLibraryOpen(false)}
      onSelect={append}
    />
    </>
  );
}
