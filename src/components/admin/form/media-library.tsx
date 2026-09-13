"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadImage } from "@/components/admin/form/upload";

export interface MediaItem {
  key: string;
  url: string;
  size: number;
  uploaded: string;
  contentType: string | null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Grid of everything in the R2 bucket with upload + delete. Used standalone at
 * /admin/media and as a picker inside ImageField/GalleryField.
 */
export function MediaLibrary({
  onSelect,
  selectLabel = "Use image",
  multiple = false,
}: {
  onSelect?: (urls: string[]) => void;
  selectLabel?: string;
  multiple?: boolean;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async (next?: string | null) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/media${next ? `?cursor=${encodeURIComponent(next)}` : ""}`,
      );
      const payload = (await response.json()) as {
        items: MediaItem[];
        cursor: string | null;
      };
      setItems((current) => (next ? [...current, ...payload.items] : payload.items));
      setCursor(payload.cursor);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!cancelled) await load(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setMessage("");
    setUploading(files.length);
    const uploaded: MediaItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const { url } = await uploadImage(file);
        uploaded.push({
          key: url.split("/").pop() ?? url,
          url,
          size: file.size,
          uploaded: new Date().toISOString(),
          contentType: file.type,
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setUploading((count) => count - 1);
      }
    }
    setItems((current) => [...uploaded, ...current]);
    if (onSelect && uploaded.length) {
      onSelect(uploaded.map((item) => item.url));
    }
  };

  const remove = async (item: MediaItem) => {
    if (!confirm("Delete this image from storage? This cannot be undone.")) return;
    const response = await fetch(
      `/api/admin/media?url=${encodeURIComponent(item.url)}`,
      { method: "DELETE" },
    );
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Could not delete image.");
      return;
    }
    setItems((current) => current.filter((entry) => entry.key !== item.key));
  };

  const toggle = (url: string) => {
    if (!onSelect) return;
    if (!multiple) {
      onSelect([url]);
      return;
    }
    setSelected((current) =>
      current.includes(url) ? current.filter((u) => u !== url) : [...current, url],
    );
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFiles(event.dataTransfer.files);
        }}
        className="flex flex-wrap items-center justify-between gap-3 border border-dashed border-charcoal/25 bg-ivory/60 px-4 py-3"
      >
        <p className="text-sm text-warm-gray">
          Drag photos here or{" "}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="font-medium text-maroon underline-offset-2 hover:underline"
          >
            choose files
          </button>
          . Large photos are resized to 1600px WebP automatically.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        {uploading > 0 ? (
          <span className="text-xs text-forest">Uploading {uploading}…</span>
        ) : null}
      </div>

      {message ? <p className="text-sm text-maroon">{message}</p> : null}

      {multiple && onSelect && selected.length ? (
        <button
          type="button"
          onClick={() => {
            onSelect(selected);
            setSelected([]);
          }}
          className="border border-maroon bg-maroon px-4 py-2 text-xs tracking-[0.14em] text-ivory uppercase"
        >
          {selectLabel} ({selected.length})
        </button>
      ) : null}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => {
          const isSelected = selected.includes(item.url);
          return (
            <figure
              key={item.key}
              className={`group relative border bg-white ${
                isSelected ? "border-forest ring-2 ring-forest/30" : "border-charcoal/10"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(item.url)}
                className="block aspect-square w-full overflow-hidden bg-ivory"
                title={onSelect ? selectLabel : item.key}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary R2 URLs */}
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
              <figcaption className="flex items-center justify-between gap-2 px-2 py-1.5 text-[10px] text-warm-gray">
                <span>{formatBytes(item.size)}</span>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  className="text-maroon opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  Delete
                </button>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-warm-gray">Loading…</p>
      ) : cursor ? (
        <button
          type="button"
          onClick={() => void load(cursor)}
          className="border border-charcoal/15 bg-white px-4 py-2 text-xs tracking-[0.14em] uppercase"
        >
          Load more
        </button>
      ) : items.length === 0 ? (
        <p className="text-sm text-warm-gray">No uploads yet.</p>
      ) : null}
    </div>
  );
}

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  multiple,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/40"
      />
      <div className="relative max-h-[85vh] w-full max-w-4xl overflow-y-auto border border-charcoal/10 bg-ivory p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl text-maroon">Media Library</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs tracking-[0.14em] text-warm-gray uppercase hover:text-maroon"
          >
            Close
          </button>
        </div>
        <MediaLibrary
          multiple={multiple}
          onSelect={(urls) => {
            onSelect(urls);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
