"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ListField,
  NumberField,
  SaveBar,
  Section,
  SelectField,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/form/fields";
import { GalleryField } from "@/components/admin/form/gallery-field";
import { ImageField } from "@/components/admin/form/image-field";
import { SeoPreview } from "@/components/admin/form/seo-preview";
import { VariantsField } from "@/components/admin/form/variants-field";
import { CATEGORY_SLUGS, categories } from "@/lib/categories";
import type { CmsProduct, CmsProductInput } from "@/lib/cms/types";

const emptyProduct: CmsProductInput = {
  slug: "",
  name: "",
  description: "",
  categorySlug: "sarees",
  subcategorySlug: null,
  price: 0,
  salePrice: null,
  sku: "",
  stockQuantity: 10,
  inStock: true,
  enabled: true,
  featured: false,
  isNew: false,
  isBestseller: false,
  onSale: false,
  badgeText: "",
  fabric: "",
  color: "",
  careInstructions: "",
  dimensions: "",
  customSizeNote: "",
  image: "",
  hoverImage: "",
  imagePosition: "center center",
  portrait: false,
  cardBackground: "",
  highlights: [],
  tags: [],
  sizes: [],
  colors: [],
  seoTitle: "",
  seoDescription: "",
  videoUrl: "",
  palluImage: "",
  sortOrder: 0,
  images: [],
  options: [],
  variants: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<CmsProductInput>(emptyProduct);
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;

    void (async () => {
      const response = await fetch(`/api/admin/products/${productId}`);
      if (!response.ok) return;
      const { product } = (await response.json()) as { product: CmsProduct };
      if (cancelled) return;

      setForm({
        ...product,
        images: product.images.map((image) => ({
          url: image.url,
          altText: image.altText,
          sortOrder: image.sortOrder,
          imageType: image.imageType,
        })),
        options: product.options,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          optionValues: variant.optionValues,
          sku: variant.sku,
          price: variant.price,
          salePrice: variant.salePrice,
          stockQuantity: variant.stockQuantity,
          inStock: variant.inStock,
          image: variant.image,
          sortOrder: variant.sortOrder,
        })),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const patch = (changes: Partial<CmsProductInput>) =>
    setForm((current) => ({ ...current, ...changes }));

  const subcategoryOptions = useMemo(() => {
    const category = categories.find((c) => c.slug === form.categorySlug);
    return [
      { value: "", label: "— none —" },
      ...(category?.subcategories.map((sub) => ({ value: sub.slug, label: sub.name })) ?? []),
    ];
  }, [form.categorySlug]);

  const hasVariantRows = (form.variants ?? []).length > 0;
  const optionNames = (form.options ?? []).map((option) => option.name.trim().toLowerCase());
  /** True when an option already covers this attribute, making the single-value field redundant. */
  const coveredByOption = (...names: string[]) =>
    hasVariantRows && names.some((name) => optionNames.includes(name));
  const managedNote = (label: string) => (
    <p className="self-end pb-3 text-sm text-warm-gray">
      {label} is chosen per variant — edit it under <span className="font-medium text-charcoal">Variants</span>.
    </p>
  );

  const gallery = (form.images ?? [])
    .filter((image) => image.imageType === "gallery")
    .map((image) => ({ url: image.url, altText: image.altText ?? "" }));

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setFieldErrors({});

    const hasVariants = (form.options ?? []).some((o) => o.name.trim() && o.values.length) && (form.variants ?? []).length > 0;
    // Keep the legacy `sizes` list in sync with a "Size" option so older
    // storefront code and filters keep working.
    const sizeOption = (form.options ?? []).find((o) => o.name.trim().toLowerCase() === "size");
    const payload: CmsProductInput = {
      ...form,
      sizes: hasVariants ? (sizeOption?.values ?? []) : form.sizes,
      colors: hasVariants
        ? ((form.options ?? []).find((o) => /colou?r/i.test(o.name))?.values ?? form.colors)
        : form.colors,
      images: gallery.map((image, index) => ({
        url: image.url,
        altText: image.altText || form.name,
        sortOrder: index + 1,
        imageType: "gallery" as const,
      })),
    };

    const response = await fetch(
      productId ? `/api/admin/products/${productId}` : "/api/admin/products",
      {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (response.ok) {
      const data = (await response.json()) as { product: CmsProduct };
      setIsError(false);
      setMessage("Product saved.");
      if (!productId) router.push(`/admin/products/${data.product.id}`);
    } else {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        issues?: { path: string; message: string }[];
      };
      setIsError(true);
      setMessage(data.error ?? "Failed to save product.");
      setFieldErrors(
        Object.fromEntries((data.issues ?? []).map((issue) => [issue.path, issue.message])),
      );
    }

    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-maroon">
          {productId ? "Edit Product" : "Add Product"}
        </h2>
        <p className="mt-2 text-sm text-warm-gray">
          Details, pricing, stock, photos and search settings for this product.
        </p>
      </div>

      <Section title="Basics">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Name"
            value={form.name}
            required
            error={fieldErrors.name}
            onChange={(name) =>
              patch({ name, ...(slugTouched ? {} : { slug: slugify(name) }) })
            }
          />
          <TextField
            label="URL slug"
            value={form.slug}
            required
            error={fieldErrors.slug}
            hint={`Address: /products/${form.slug || "…"}`}
            onChange={(slug) => {
              setSlugTouched(true);
              patch({ slug: slugify(slug) });
            }}
          />
          <SelectField
            label="Category"
            value={form.categorySlug}
            options={CATEGORY_SLUGS.map((slug) => ({
              value: slug,
              label: categories.find((c) => c.slug === slug)?.name ?? slug,
            }))}
            onChange={(categorySlug) => patch({ categorySlug, subcategorySlug: null })}
          />
          <SelectField
            label="Subcategory"
            value={form.subcategorySlug ?? ""}
            options={subcategoryOptions}
            onChange={(sub) => patch({ subcategorySlug: sub || null })}
          />
          <TextArea
            label="Description"
            className="md:col-span-2"
            rows={5}
            value={form.description ?? ""}
            onChange={(description) => patch({ description })}
          />
        </div>
      </Section>

      <Section title="Pricing & Stock">
        <div className="grid gap-4 md:grid-cols-3">
          <NumberField
            label="Price (₹)"
            value={form.price}
            min={0}
            hint={hasVariantRows ? "Default for variants with no price of their own." : undefined}
            error={fieldErrors.price}
            onChange={(price) => patch({ price: price ?? 0 })}
          />
          <NumberField
            label="Sale price (₹)"
            value={form.salePrice ?? null}
            min={0}
            allowEmpty
            hint={hasVariantRows ? "Default for variants that don't set their own sale price." : "Leave empty for no sale."}
            error={fieldErrors.salePrice}
            onChange={(salePrice) => patch({ salePrice, onSale: salePrice != null })}
          />
          <TextField label="SKU" value={form.sku ?? ""} onChange={(sku) => patch({ sku })} />
          {hasVariantRows ? (
            <p className="self-center text-sm text-warm-gray md:col-span-1">
              Stock is tracked per variant below.
            </p>
          ) : (
            <NumberField
              label="Stock quantity"
              value={form.stockQuantity ?? 0}
              min={0}
              hint="Orders reduce this automatically. Set high if you don't track stock."
              onChange={(stockQuantity) => patch({ stockQuantity: stockQuantity ?? 0 })}
            />
          )}
          <div className="flex flex-col justify-center gap-3 md:col-span-2">
            {!hasVariantRows ? (
              <Toggle
                label="In stock"
                checked={form.inStock ?? true}
                onChange={(inStock) => patch({ inStock })}
                hint="Turn off to show Sold Out without changing the quantity."
              />
            ) : null}
            <Toggle
              label="Visible on the storefront"
              checked={form.enabled ?? true}
              onChange={(enabled) => patch({ enabled })}
            />
          </div>
        </div>
      </Section>

      <Section title="Photos" description="Upload from your phone or computer, or reuse anything in the media library.">
        <div className="grid gap-6 md:grid-cols-3">
          <ImageField
            label="Main photo"
            value={form.image}
            required
            error={fieldErrors.image}
            onChange={(image) => patch({ image })}
          />
          <ImageField
            label="Hover photo"
            hint="Shown when the cursor is over the card."
            value={form.hoverImage ?? ""}
            onChange={(hoverImage) => patch({ hoverImage })}
          />
          <ImageField
            label="Pallu / drape photo"
            value={form.palluImage ?? ""}
            onChange={(palluImage) => patch({ palluImage })}
          />
        </div>
        <GalleryField
          label="Gallery"
          defaultAlt={form.name}
          value={gallery}
          onChange={(images) =>
            patch({
              images: images.map((image, index) => ({
                url: image.url,
                altText: image.altText,
                sortOrder: index + 1,
                imageType: "gallery" as const,
              })),
            })
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            label="Video URL"
            type="url"
            value={form.videoUrl ?? ""}
            onChange={(videoUrl) => patch({ videoUrl })}
          />
          <SelectField
            label="Photo framing"
            value={form.imagePosition ?? "center center"}
            options={[
              { value: "center center", label: "Centre" },
              { value: "center top", label: "Top" },
              { value: "center 20%", label: "Slightly above centre" },
              { value: "center bottom", label: "Bottom" },
            ]}
            onChange={(imagePosition) => patch({ imagePosition })}
          />
          <div className="flex items-end pb-1">
            <Toggle
              label="Tall portrait card"
              hint="Use for full-length shots."
              checked={form.portrait ?? false}
              onChange={(portrait) => patch({ portrait })}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Variants"
        description="Sizes, colours and other options customers choose from. Each combination has its own stock, and can override the price or photo."
      >
        <VariantsField
          options={form.options ?? []}
          variants={form.variants ?? []}
          basePrice={form.price}
          onChange={({ options, variants }) => patch({ options, variants })}
        />
      </Section>

      <Section title="Details">
        <div className="grid gap-4 md:grid-cols-2">
          {coveredByOption("fabric") ? (
            managedNote("Fabric")
          ) : (
            <TextField label="Fabric" value={form.fabric ?? ""} onChange={(fabric) => patch({ fabric })} />
          )}
          {coveredByOption("colour", "color") ? (
            managedNote("Colour")
          ) : (
            <TextField label="Colour" value={form.color ?? ""} onChange={(color) => patch({ color })} />
          )}
          <TextField
            label="Dimensions"
            placeholder="e.g. Length 2.5 m · Breadth 38 in"
            value={form.dimensions ?? ""}
            onChange={(dimensions) => patch({ dimensions })}
          />
          {hasVariantRows ? null : (
            <ListField
              label="Sizes (simple)"
              placeholder="S, M, L, Free Size"
              hint="Quick size list without per-size stock. Use Variants above for stock per size/colour."
              value={form.sizes ?? []}
              onChange={(sizes) => patch({ sizes })}
            />
          )}
          <TextField
            label="Custom size note"
            placeholder="Custom sizing available on WhatsApp"
            value={form.customSizeNote ?? ""}
            onChange={(customSizeNote) => patch({ customSizeNote })}
          />
          <ListField label="Tags" value={form.tags ?? []} onChange={(tags) => patch({ tags })} />
          <ListField
            label="Highlights"
            className="md:col-span-2"
            hint="Short selling points, separated by commas."
            value={form.highlights ?? []}
            onChange={(highlights) => patch({ highlights })}
          />
          <TextArea
            label="Care instructions"
            className="md:col-span-2"
            rows={2}
            value={form.careInstructions ?? ""}
            onChange={(careInstructions) => patch({ careInstructions })}
          />
        </div>
      </Section>

      <Section title="Badges & Placement">
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle label="Featured on homepage" checked={form.featured ?? false} onChange={(featured) => patch({ featured })} />
          <Toggle label="NEW badge" checked={form.isNew ?? false} onChange={(isNew) => patch({ isNew })} />
          <Toggle label="BESTSELLER badge" checked={form.isBestseller ?? false} onChange={(isBestseller) => patch({ isBestseller })} />
          <TextField
            label="Custom badge text"
            value={form.badgeText ?? ""}
            onChange={(badgeText) => patch({ badgeText })}
          />
          <NumberField
            label="Sort order"
            hint="Lower numbers appear first."
            value={form.sortOrder ?? 0}
            onChange={(sortOrder) => patch({ sortOrder: sortOrder ?? 0 })}
          />
          <TextField
            label="Card background colour"
            placeholder="#faf7f2"
            value={form.cardBackground ?? ""}
            onChange={(cardBackground) => patch({ cardBackground })}
          />
        </div>
      </Section>

      <Section title="Search engines" description="How this product appears on Google and when shared on WhatsApp.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <TextField
              label="Search title"
              value={form.seoTitle ?? ""}
              maxLength={60}
              showCounter
              placeholder={form.name}
              onChange={(seoTitle) => patch({ seoTitle })}
            />
            <TextArea
              label="Search description"
              value={form.seoDescription ?? ""}
              maxLength={160}
              showCounter
              rows={3}
              placeholder={form.description?.slice(0, 160)}
              onChange={(seoDescription) => patch({ seoDescription })}
            />
          </div>
          <SeoPreview
            title={form.seoTitle || form.name || "Product name"}
            description={form.seoDescription || form.description || ""}
            path={`/products/${form.slug || "product"}`}
          />
        </div>
      </Section>

      <SaveBar
        saving={saving}
        message={message}
        isError={isError}
        onSave={() => void handleSave()}
        label={productId ? "Save Product" : "Create Product"}
        secondary={
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="border border-charcoal/15 bg-white px-5 py-2.5 text-xs tracking-[0.14em] text-charcoal uppercase"
          >
            Back to products
          </button>
        }
      />
    </div>
  );
}
