/** Renders one or more schema.org objects as a JSON-LD script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to embed; "<" is escaped to avoid </script> injection.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
