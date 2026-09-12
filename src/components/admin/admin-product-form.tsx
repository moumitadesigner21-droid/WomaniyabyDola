"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORY_SLUGS } from "@/lib/categories";
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
};

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<CmsProductInput>(emptyProduct);
  const [galleryUrls, setGalleryUrls] = useState("");
  const [sizesText, setSizesText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!productId) return;

    void (async () => {
      const response = await fetch(`/api/admin/products/${productId}`);
      const payload = (await response.json()) as { product: CmsProduct };
      const product = payload.product;

      setForm({
        slug: product.slug,
        name: product.name,
        description: product.description,
        categorySlug: product.categorySlug,
        subcategorySlug: product.subcategorySlug,
        price: product.price,
        salePrice: product.salePrice,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        inStock: product.inStock,
        enabled: product.enabled,
        featured: product.featured,
        isNew: product.isNew,
        isBestseller: product.isBestseller,
        onSale: product.onSale,
        badgeText: product.badgeText,
        fabric: product.fabric,
        color: product.color,
        careInstructions: product.careInstructions,
        dimensions: product.dimensions,
        customSizeNote: product.customSizeNote,
        image: product.image,
        hoverImage: product.hoverImage,
        imagePosition: product.imagePosition,
        portrait: product.portrait,
        cardBackground: product.cardBackground,
        highlights: product.highlights,
        tags: product.tags,
        sizes: product.sizes,
        colors: product.colors,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        videoUrl: product.videoUrl,
        palluImage: product.palluImage,
        sortOrder: product.sortOrder,
        images: product.images.map((image) => ({
          url: image.url,
          altText: image.altText,
          sortOrder: image.sortOrder,
          imageType: image.imageType,
        })),
      });
      setGalleryUrls(
        product.images.map((image) => image.url).join("\n"),
      );
      setSizesText(product.sizes.join(", "));
      setTagsText(product.tags.join(", "));
    })();
  }, [productId]);

  const uploadImage = async (file: File, field: "image" | "hoverImage" | "palluImage") => {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const payload = (await response.json()) as { url: string };
    setForm((current) => ({ ...current, [field]: payload.url }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload: CmsProductInput = {
      ...form,
      sizes: splitList(sizesText),
      tags: splitList(tagsText),
      images: galleryUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url, index) => ({
          url,
          altText: form.name,
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
      setMessage("Product saved successfully.");
      router.push(`/admin/products/${data.product.id}`);
    } else {
      setMessage("Failed to save product.");
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-maroon">
          {productId ? "Edit Product" : "Add Product"}
        </h2>
        <p className="mt-2 text-sm text-warm-gray">
          Manage product details, images, stock, badges, and SEO.
        </p>
      </div>

      {message ? <p className="text-sm text-maroon">{message}</p> : null}

      <section className="grid gap-4 border border-charcoal/10 bg-white p-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Name</span>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Slug</span>
          <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Description</span>
          <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Category</span>
          <select value={form.categorySlug} onChange={(e) => setForm({ ...form, categorySlug: e.target.value as CmsProductInput["categorySlug"] })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm">
            {CATEGORY_SLUGS.map((slug) => (
              <option key={slug} value={slug}>{slug}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Subcategory</span>
          <input value={form.subcategorySlug ?? ""} onChange={(e) => setForm({ ...form, subcategorySlug: e.target.value || null })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Price (₹)</span>
          <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Sale Price (₹)</span>
          <input type="number" value={form.salePrice ?? ""} onChange={(e) => setForm({ ...form, salePrice: e.target.value ? Number(e.target.value) : null, onSale: Boolean(e.target.value) })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">SKU</span>
          <input value={form.sku ?? ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Stock Quantity</span>
          <input type="number" value={form.stockQuantity ?? 0} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Sizes (comma separated)</span>
          <input value={sizesText} onChange={(e) => setSizesText(e.target.value)} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Tags (comma separated)</span>
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Fabric</span>
          <input value={form.fabric ?? ""} onChange={(e) => setForm({ ...form, fabric: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Colour</span>
          <input value={form.color ?? ""} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Care Instructions</span>
          <textarea value={form.careInstructions ?? ""} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} rows={2} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
      </section>

      <section className="grid gap-4 border border-charcoal/10 bg-white p-5 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          Enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
          In Stock
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured on Homepage
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
          NEW Badge
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isBestseller} onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })} />
          BESTSELLER Badge
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Custom Badge Text</span>
          <input value={form.badgeText ?? ""} onChange={(e) => setForm({ ...form, badgeText: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
      </section>

      <section className="space-y-4 border border-charcoal/10 bg-white p-5">
        <h3 className="font-serif text-xl text-maroon">Images</h3>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Main Image URL</span>
          <input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
          <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "image")} />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Hover Image URL</span>
          <input value={form.hoverImage ?? ""} onChange={(e) => setForm({ ...form, hoverImage: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Pallu / Drape Image URL</span>
          <input value={form.palluImage ?? ""} onChange={(e) => setForm({ ...form, palluImage: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Gallery Image URLs (one per line, drag order top to bottom)</span>
          <textarea value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} rows={5} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">Product Video URL</span>
          <input value={form.videoUrl ?? ""} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
      </section>

      <section className="grid gap-4 border border-charcoal/10 bg-white p-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">SEO Title</span>
          <input value={form.seoTitle ?? ""} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em]">SEO Description</span>
          <textarea value={form.seoDescription ?? ""} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} rows={3} className="w-full border border-charcoal/15 px-3 py-2.5 text-sm" />
        </label>
      </section>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="border border-maroon bg-maroon px-5 py-2.5 text-xs tracking-[0.14em] text-ivory uppercase disabled:opacity-60">
          {saving ? "Saving..." : "Save Product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="border border-charcoal/15 bg-white px-5 py-2.5 text-xs tracking-[0.14em] text-charcoal uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}
