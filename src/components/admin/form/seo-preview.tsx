"use client";

/** Approximates a Google result so editors can see truncation. */
export function SeoPreview({
  title,
  description,
  path,
  siteName = "Womania by Dola",
}: {
  title: string;
  description: string;
  path: string;
  siteName?: string;
}) {
  const shownTitle = title.length > 60 ? `${title.slice(0, 57)}…` : title;
  const shownDescription =
    description.length > 160 ? `${description.slice(0, 157)}…` : description;

  return (
    <div className="border border-charcoal/10 bg-ivory/60 p-4">
      <p className="mb-2 text-[10px] tracking-[0.14em] text-warm-gray uppercase">
        Google preview
      </p>
      <p className="text-xs text-charcoal/70">
        {siteName} › {path.replace(/^\//, "").replace(/\//g, " › ") || "home"}
      </p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{shownTitle || "Title"}</p>
      <p className="mt-1 text-sm leading-relaxed text-charcoal/80">
        {shownDescription || "Description will appear here."}
      </p>
    </div>
  );
}
