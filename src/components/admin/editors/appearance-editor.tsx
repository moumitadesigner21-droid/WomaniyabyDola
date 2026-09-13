"use client";

import { BlobEditor } from "@/components/admin/editors/blob-editor";
import { useContent } from "@/components/admin/editors/use-content";
import { Field, TextField, inputClass } from "@/components/admin/form/fields";
import { ImageField } from "@/components/admin/form/image-field";
import { CONTENT_DEFAULTS } from "@/lib/cms/content-defaults";
import { appearanceSchema } from "@/lib/cms/content-schemas";

function ColorField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  error?: string;
}) {
  return (
    <Field label={label} error={error}>
      <div className="flex gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-10 w-12 cursor-pointer border border-charcoal/15 bg-white p-0.5"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} font-mono uppercase`}
          placeholder="#6B1E2E"
        />
      </div>
    </Field>
  );
}

export function AdminAppearanceEditor() {
  const editor = useContent("appearance", appearanceSchema, CONTENT_DEFAULTS.appearance);
  const v = editor.value;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Appearance</h2>
        <p className="mt-2 text-sm text-warm-gray">Logo, favicon and brand colours.</p>
      </div>
      <BlobEditor title="Brand" editor={editor}>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageField
            label="Logo"
            aspect="aspect-[224/90]"
            hint="Transparent PNG works best. Shown in the header and footer."
            value={v.logoUrl}
            required
            error={editor.errors.logoUrl}
            onChange={(logoUrl) => editor.update({ ...v, logoUrl })}
          />
          <ImageField
            label="Favicon"
            aspect="aspect-square"
            hint="Square image, at least 64×64."
            value={v.faviconUrl}
            onChange={(faviconUrl) => editor.update({ ...v, faviconUrl })}
          />
          <ColorField label="Primary colour (maroon)" value={v.primaryColor} error={editor.errors.primaryColor} onChange={(primaryColor) => editor.update({ ...v, primaryColor })} />
          <ColorField label="Accent colour (gold)" value={v.accentColor} error={editor.errors.accentColor} onChange={(accentColor) => editor.update({ ...v, accentColor })} />
          <TextField label="Heading font" hint="Informational for now — fonts are set in code." value={v.fontHeading} onChange={(fontHeading) => editor.update({ ...v, fontHeading })} />
          <TextField label="Body font" value={v.fontBody} onChange={(fontBody) => editor.update({ ...v, fontBody })} />
        </div>
        <div className="flex items-center gap-4 border border-charcoal/10 bg-ivory/60 p-4">
          <span className="text-xs tracking-[0.14em] text-warm-gray uppercase">Preview</span>
          <span className="px-4 py-2 text-xs tracking-[0.16em] text-ivory uppercase" style={{ backgroundColor: v.primaryColor }}>
            Shop Now
          </span>
          <span className="px-2 py-1 text-[9px] tracking-[0.15em] text-charcoal uppercase" style={{ backgroundColor: v.accentColor }}>
            Bestseller
          </span>
        </div>
      </BlobEditor>
    </div>
  );
}
