"use client";

import { useEffect, useState } from "react";
import { BlobEditor } from "@/components/admin/editors/blob-editor";
import { Repeater, newId, withoutId } from "@/components/admin/editors/repeater";
import { useContent } from "@/components/admin/editors/use-content";
import {
  NumberField,
  SelectField,
  Tabs,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/form/fields";
import { ImageField } from "@/components/admin/form/image-field";
import { LinkField } from "@/components/admin/form/link-field";
import { SortableItem, SortableList } from "@/components/admin/form/sortable";
import { CATEGORY_SLUGS, categories } from "@/lib/categories";
import { CONTENT_DEFAULTS } from "@/lib/cms/content-defaults";
import {
  announcementBarSchema,
  bestsellersConfigSchema,
  collectionBannersSchema,
  heroSlidesSchema,
  homepageSectionsSchema,
  howWeWorkSchema,
  mergeHomepageSections,
  shopCollectionsSchema,
  testimonialsSchema,
} from "@/lib/cms/content-schemas";
import type { CmsProduct } from "@/lib/cms/types";

const FRAMING_OPTIONS = [
  { value: "center center", label: "Centre" },
  { value: "center top", label: "Top" },
  { value: "center 20%", label: "Slightly above centre" },
  { value: "center bottom", label: "Bottom" },
];

function AnnouncementEditor() {
  const editor = useContent("announcement_bar", announcementBarSchema, CONTENT_DEFAULTS.announcement_bar);
  return (
    <BlobEditor title="Announcement bar" description="The thin strip above the header on every page." editor={editor}>
      <Toggle label="Show announcement bar" checked={editor.value.enabled} onChange={(enabled) => editor.update({ ...editor.value, enabled })} />
      <TextField label="Text" value={editor.value.text} maxLength={200} showCounter onChange={(text) => editor.update({ ...editor.value, text })} error={editor.errors.text} />
    </BlobEditor>
  );
}

function SectionsEditor() {
  const editor = useContent("homepage_sections", homepageSectionsSchema, CONTENT_DEFAULTS.homepage_sections);
  const sections = mergeHomepageSections(editor.value);

  const setSections = (next: typeof sections) =>
    editor.update(next.map((section, index) => ({ ...section, sortOrder: index })));

  return (
    <BlobEditor title="Section order" description="Drag to reorder; switch sections on or off." editor={editor}>
      <SortableList items={sections} getId={(s) => s.id} onReorder={setSections}>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <SortableItem key={section.id} id={section.id} className="flex items-center gap-3 border border-charcoal/10 bg-ivory/40 px-3 py-2">
              {(handle) => (
                <>
                  {handle}
                  <span className="w-6 text-xs text-warm-gray">{index + 1}</span>
                  <input
                    value={section.label}
                    onChange={(event) => setSections(sections.map((s, i) => (i === index ? { ...s, label: event.target.value } : s)))}
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-charcoal outline-none"
                  />
                  <span className="text-[10px] tracking-[0.12em] text-warm-gray uppercase">{section.type}</span>
                  <Toggle label="" checked={section.enabled} onChange={(enabled) => setSections(sections.map((s, i) => (i === index ? { ...s, enabled } : s)))} />
                </>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
    </BlobEditor>
  );
}

function HeroEditor() {
  const editor = useContent("hero_slides", heroSlidesSchema, CONTENT_DEFAULTS.hero_slides);
  const slides = editor.value.map((slide, index) => ({ ...slide, _id: `${slide.desktopImage}-${index}` }));

  return (
    <BlobEditor title="Hero slides" description="Full-width slideshow at the top of the homepage." editor={editor}>
      <Repeater
        items={slides}
        getId={(slide) => slide._id}
        onChange={(next) => editor.update(next.map((slide, index) => ({ ...withoutId(slide), order: index + 1 })))}
        create={() => ({
          _id: newId("slide"),
          desktopImage: "",
          mobileImage: "",
          imagePosition: "center center",
          thumbnailPosition: "",
          meta: "",
          stat: "",
          eyebrow: "",
          title: "New slide",
          description: "",
          primaryButtonText: "Shop Now",
          primaryButtonUrl: "/shop",
          secondaryButtonText: "",
          secondaryButtonUrl: "",
          active: true,
          order: slides.length + 1,
        })}
        addLabel="Add slide"
        max={10}
        summary={(slide) => `${slide.active ? "" : "(hidden) "}${slide.title || "Untitled slide"}`}
      >
        {(slide, update, index) => (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <ImageField label="Desktop image" aspect="aspect-[16/9]" value={slide.desktopImage} required error={editor.errors[`${index}.desktopImage`]} onChange={(desktopImage) => update({ desktopImage, mobileImage: slide.mobileImage || desktopImage })} />
              <ImageField label="Mobile image" aspect="aspect-[3/4]" hint="Optional — falls back to the desktop image." value={slide.mobileImage} onChange={(mobileImage) => update({ mobileImage })} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="Eyebrow" hint="Small text above the headline." value={slide.eyebrow} onChange={(eyebrow) => update({ eyebrow })} />
              <TextField label="Headline" required value={slide.title} error={editor.errors[`${index}.title`]} onChange={(title) => update({ title })} />
              <SelectField label="Image framing" value={slide.imagePosition || "center center"} options={FRAMING_OPTIONS} onChange={(imagePosition) => update({ imagePosition })} />
            </div>
            <TextArea label="Description" rows={2} value={slide.description} onChange={(description) => update({ description })} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Tag line (top-left)" placeholder="Wrap Skirts & Everyday Ethnic" value={slide.meta} onChange={(meta) => update({ meta })} />
              <TextField label="Tag line (bottom)" placeholder="Handcrafted in Jalpaiguri" value={slide.stat} onChange={(stat) => update({ stat })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Primary button text" value={slide.primaryButtonText} onChange={(primaryButtonText) => update({ primaryButtonText })} />
              <LinkField label="Primary button link" value={slide.primaryButtonUrl} onChange={(primaryButtonUrl) => update({ primaryButtonUrl })} />
              <TextField label="Secondary button text" value={slide.secondaryButtonText} onChange={(secondaryButtonText) => update({ secondaryButtonText })} />
              <LinkField label="Secondary button link" value={slide.secondaryButtonUrl} onChange={(secondaryButtonUrl) => update({ secondaryButtonUrl })} />
            </div>
            <Toggle label="Show this slide" checked={slide.active} onChange={(active) => update({ active })} />
          </>
        )}
      </Repeater>
    </BlobEditor>
  );
}

function BannersEditor() {
  const editor = useContent("collection_banners", collectionBannersSchema, CONTENT_DEFAULTS.collection_banners);
  const items = editor.value.map((banner, index) => ({ ...banner, _id: `${banner.href}-${index}` }));

  return (
    <BlobEditor title="“See Our Collection” banners" description="Large image cards linking to a collection." editor={editor}>
      <Repeater
        items={items}
        getId={(b) => b._id}
        onChange={(next) => editor.update(next.map(withoutId))}
        create={() => ({ _id: newId("banner"), title: "New collection", subtitle: "", image: "", href: "/shop", imagePosition: "center center" })}
        addLabel="Add banner"
        max={12}
        summary={(b) => b.title}
      >
        {(banner, update, index) => (
          <div className="grid gap-4 md:grid-cols-[auto_1fr]">
            <ImageField label="Image" aspect="aspect-[4/5]" value={banner.image} required error={editor.errors[`${index}.image`]} onChange={(image) => update({ image })} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" required value={banner.title} onChange={(title) => update({ title })} />
              <TextField label="Subtitle" value={banner.subtitle} onChange={(subtitle) => update({ subtitle })} />
              <LinkField label="Link" required value={banner.href} onChange={(href) => update({ href })} />
              <SelectField label="Image framing" value={banner.imagePosition || "center center"} options={FRAMING_OPTIONS} onChange={(imagePosition) => update({ imagePosition })} />
            </div>
          </div>
        )}
      </Repeater>
    </BlobEditor>
  );
}

function CategoriesEditor() {
  const editor = useContent("collections", shopCollectionsSchema, CONTENT_DEFAULTS.collections);
  const items = editor.value.map((item, index) => ({ ...item, _id: `${item.categoryKey}-${index}` }));
  const categoryOptions = [
    ...CATEGORY_SLUGS.map((slug) => ({ value: slug, label: categories.find((c) => c.slug === slug)?.name ?? slug })),
    { value: "all", label: "All products" },
  ];

  return (
    <BlobEditor title="“Shop by Category” cards" description="Category cards on the homepage and the shop page. The product count is filled in automatically." editor={editor}>
      <Repeater
        items={items}
        getId={(c) => c._id}
        onChange={(next) => editor.update(next.map(withoutId))}
        create={() => ({ _id: newId("cat"), title: "Category", subtitle: "", image: "", href: "/shop", categoryKey: "all", imagePosition: "center center", portrait: false })}
        addLabel="Add category card"
        max={20}
        summary={(c) => c.title}
      >
        {(item, update, index) => (
          <div className="grid gap-4 md:grid-cols-[auto_1fr]">
            <ImageField label="Image" value={item.image} required error={editor.errors[`${index}.image`]} onChange={(image) => update({ image })} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" required value={item.title} onChange={(title) => update({ title })} />
              <TextField label="Subtitle" value={item.subtitle} onChange={(subtitle) => update({ subtitle })} />
              <SelectField label="Counts products from" value={String(item.categoryKey)} options={categoryOptions} onChange={(categoryKey) => update({ categoryKey, href: categoryKey === "all" ? "/shop" : `/category/${categoryKey}` })} />
              <LinkField label="Link" required value={item.href} onChange={(href) => update({ href })} />
              <SelectField label="Image framing" value={item.imagePosition || "center center"} options={FRAMING_OPTIONS} onChange={(imagePosition) => update({ imagePosition })} />
              <div className="flex items-end pb-1"><Toggle label="Portrait image" checked={item.portrait ?? false} onChange={(portrait) => update({ portrait })} /></div>
            </div>
          </div>
        )}
      </Repeater>
    </BlobEditor>
  );
}

function BestsellersEditor() {
  const editor = useContent("bestsellers_config", bestsellersConfigSchema, CONTENT_DEFAULTS.bestsellers_config);
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/admin/products");
      const payload = (await response.json()) as { products: CmsProduct[] };
      if (!cancelled) setProducts(payload.products);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chosen = editor.value.productSlugs;
  const toggle = (slug: string) =>
    editor.update({
      productSlugs: chosen.includes(slug) ? chosen.filter((s) => s !== slug) : [...chosen, slug],
    });
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 40);

  return (
    <BlobEditor title="Best sellers" description="Hand-pick the products in the Best Sellers rail. Leave empty to show products marked BESTSELLER automatically." editor={editor}>
      {chosen.length ? (
        <SortableList items={chosen} getId={(s) => s} onReorder={(productSlugs) => editor.update({ productSlugs })}>
          <div className="flex flex-wrap gap-2">
            {chosen.map((slug) => (
              <SortableItem key={slug} id={slug} className="flex items-center gap-1 border border-forest/30 bg-forest/5 pr-2 text-xs">
                {(handle) => (
                  <>
                    {handle}
                    <span>{bySlug.get(slug)?.name ?? slug}</span>
                    <button type="button" onClick={() => toggle(slug)} className="ml-1 text-maroon">×</button>
                  </>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
      ) : (
        <p className="text-sm text-warm-gray">Automatic (BESTSELLER badge).</p>
      )}
      <TextField label="Find a product" placeholder="Type to search…" value={query} onChange={setQuery} />
      <div className="grid max-h-64 gap-1 overflow-y-auto border border-charcoal/10 bg-ivory/40 p-2 sm:grid-cols-2">
        {filtered.map((product) => (
          <label key={product.id} className="flex items-center gap-2 px-2 py-1 text-sm">
            <input type="checkbox" checked={chosen.includes(product.slug)} onChange={() => toggle(product.slug)} />
            <span className="truncate">{product.name}</span>
          </label>
        ))}
      </div>
    </BlobEditor>
  );
}

function HowWeWorkEditor() {
  const editor = useContent("how_we_work", howWeWorkSchema, CONTENT_DEFAULTS.how_we_work);
  const items = editor.value.map((step, index) => ({ ...step, _id: `${step.step}-${index}` }));
  return (
    <BlobEditor title="How we work" description="Three or four short steps." editor={editor}>
      <Repeater
        items={items}
        getId={(s) => s._id}
        onChange={(next) => editor.update(next.map((step, index) => ({ ...withoutId(step), step: String(index + 1).padStart(2, "0") })))}
        create={() => ({ _id: newId("step"), step: String(items.length + 1).padStart(2, "0"), title: "New step", description: "", href: "/shop" })}
        addLabel="Add step"
        max={8}
        summary={(s) => `${s.step} · ${s.title}`}
      >
        {(step, update) => (
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Title" required value={step.title} onChange={(title) => update({ title })} />
            <LinkField label="Link" value={step.href} onChange={(href) => update({ href })} />
            <TextArea label="Description" className="md:col-span-2" rows={2} value={step.description} onChange={(description) => update({ description })} />
          </div>
        )}
      </Repeater>
    </BlobEditor>
  );
}

function TestimonialsEditor() {
  const editor = useContent("testimonials", testimonialsSchema, CONTENT_DEFAULTS.testimonials);
  const items = editor.value.map((t, index) => ({ ...t, _id: `${t.name}-${index}` }));
  return (
    <BlobEditor title="Testimonials" description="Customer quotes in the Voices of Womania section." editor={editor}>
      <Repeater
        items={items}
        getId={(t) => t._id}
        onChange={(next) => editor.update(next.map(withoutId))}
        create={() => ({ _id: newId("quote"), quote: "", name: "Customer", city: "", rating: 5 })}
        addLabel="Add testimonial"
        max={20}
        summary={(t) => `${t.name}${t.city ? `, ${t.city}` : ""}`}
      >
        {(t, update) => (
          <div className="grid gap-4 md:grid-cols-3">
            <TextArea label="Quote" className="md:col-span-3" rows={3} value={t.quote} onChange={(quote) => update({ quote })} />
            <TextField label="Name" required value={t.name} onChange={(name) => update({ name })} />
            <TextField label="City" value={t.city} onChange={(city) => update({ city })} />
            <NumberField label="Rating (1–5)" min={1} max={5} value={t.rating} onChange={(rating) => update({ rating: Math.min(5, Math.max(1, rating ?? 5)) })} />
          </div>
        )}
      </Repeater>
    </BlobEditor>
  );
}

const TABS = [
  { id: "layout", label: "Layout" },
  { id: "hero", label: "Hero" },
  { id: "banners", label: "Banners" },
  { id: "categories", label: "Categories" },
  { id: "bestsellers", label: "Best sellers" },
  { id: "how", label: "How we work" },
  { id: "testimonials", label: "Testimonials" },
] as const;

export function AdminHomepageEditor() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("layout");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Homepage</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Everything on the front page. Each panel saves on its own.
        </p>
      </div>
      <Tabs tabs={[...TABS]} active={tab} onChange={setTab} />
      {tab === "layout" ? (
        <div className="space-y-6">
          <AnnouncementEditor />
          <SectionsEditor />
        </div>
      ) : null}
      {tab === "hero" ? <HeroEditor /> : null}
      {tab === "banners" ? <BannersEditor /> : null}
      {tab === "categories" ? <CategoriesEditor /> : null}
      {tab === "bestsellers" ? <BestsellersEditor /> : null}
      {tab === "how" ? <HowWeWorkEditor /> : null}
      {tab === "testimonials" ? <TestimonialsEditor /> : null}
    </div>
  );
}

