"use client";

import { useEffect, useState } from "react";
import { BlobEditor } from "@/components/admin/editors/blob-editor";
import { useContent } from "@/components/admin/editors/use-content";
import {
  ListField,
  SaveBar,
  Section,
  SelectField,
  Tabs,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/form/fields";
import { ImageField } from "@/components/admin/form/image-field";
import { SeoPreview } from "@/components/admin/form/seo-preview";
import { CONTENT_DEFAULTS } from "@/lib/cms/content-defaults";
import { SEO_PAGE_KEYS, seoSchema, type PageSeo } from "@/lib/cms/content-schemas";
import type { CmsCategory } from "@/lib/cms/types";

const PAGE_LABELS: Record<(typeof SEO_PAGE_KEYS)[number], { label: string; path: string; fallbackTitle: string }> = {
  home: { label: "Home", path: "/", fallbackTitle: "" },
  shop: { label: "Shop", path: "/shop", fallbackTitle: "Shop" },
  about: { label: "About Us", path: "/about-us", fallbackTitle: "About Us" },
  contact: { label: "Contact Us", path: "/contact-us", fallbackTitle: "Contact Us" },
  policies: { label: "Policies", path: "/policies", fallbackTitle: "Store Policies" },
};

function SiteDefaultsEditor({ editor }: { editor: ReturnType<typeof useSeoContent> }) {
  const v = editor.value;
  return (
    <BlobEditor title="Site defaults" description="Used everywhere unless a page overrides it." editor={editor}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Site name" required value={v.siteTitle} error={editor.errors.siteTitle} onChange={(siteTitle) => editor.update({ ...v, siteTitle })} />
        <TextField label="Title template" hint="%s is replaced by the page title." value={v.titleTemplate} onChange={(titleTemplate) => editor.update({ ...v, titleTemplate })} />
        <TextField label="Homepage title" maxLength={70} showCounter value={v.homepageTitle} onChange={(homepageTitle) => editor.update({ ...v, homepageTitle })} />
        <TextField label="Twitter / X handle" placeholder="@womaniabydola" value={v.twitterHandle} onChange={(twitterHandle) => editor.update({ ...v, twitterHandle })} />
        <TextArea label="Default description" className="md:col-span-2" rows={3} maxLength={200} showCounter value={v.homepageDescription} onChange={(homepageDescription) => editor.update({ ...v, homepageDescription })} />
        <ListField label="Default keywords" className="md:col-span-2" hint="Comma separated. Added to every page." value={v.keywords} onChange={(keywords) => editor.update({ ...v, keywords })} />
        <ImageField label="Default share image (Open Graph)" aspect="aspect-[1200/630]" hint="1200×630 works best for WhatsApp/Facebook previews." value={v.ogImage} onChange={(ogImage) => editor.update({ ...v, ogImage })} />
        <TextField label="Google site verification" hint="The content value from Search Console's HTML tag method." value={v.googleSiteVerification} onChange={(googleSiteVerification) => editor.update({ ...v, googleSiteVerification })} />
      </div>
      <SeoPreview title={v.homepageTitle} description={v.homepageDescription} path="/" siteName={v.siteTitle} />
    </BlobEditor>
  );
}

function PagesEditor({ editor }: { editor: ReturnType<typeof useSeoContent> }) {
  const [page, setPage] = useState<(typeof SEO_PAGE_KEYS)[number]>("shop");
  const v = editor.value;
  const current: PageSeo = v.pages[page];
  const meta = PAGE_LABELS[page];
  const set = (patch: Partial<PageSeo>) =>
    editor.update({ ...v, pages: { ...v.pages, [page]: { ...current, ...patch } } });

  return (
    <BlobEditor title="Pages" description="Override the title, description and share image per page." editor={editor}>
      <Tabs tabs={SEO_PAGE_KEYS.map((key) => ({ id: key, label: PAGE_LABELS[key].label }))} active={page} onChange={setPage} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <TextField label="Title" maxLength={70} showCounter placeholder={meta.fallbackTitle || v.homepageTitle} value={current.title} onChange={(title) => set({ title })} />
          <TextArea label="Description" rows={3} maxLength={200} showCounter placeholder={v.homepageDescription} value={current.description} onChange={(description) => set({ description })} />
          <ListField label="Keywords" value={current.keywords} onChange={(keywords) => set({ keywords })} />
          <ImageField label="Share image" aspect="aspect-[1200/630]" value={current.ogImage} onChange={(ogImage) => set({ ogImage })} />
          <Toggle label="Hide from search engines (noindex)" checked={current.noindex} onChange={(noindex) => set({ noindex })} />
        </div>
        <SeoPreview
          title={current.title || meta.fallbackTitle || v.homepageTitle}
          description={current.description || v.homepageDescription}
          path={meta.path}
          siteName={v.siteTitle}
        />
      </div>
    </BlobEditor>
  );
}

function OrganizationEditor({ editor }: { editor: ReturnType<typeof useSeoContent> }) {
  const v = editor.value;
  const org = v.organization;
  const set = (patch: Partial<typeof org>) => editor.update({ ...v, organization: { ...org, ...patch } });
  return (
    <BlobEditor title="Business details (structured data)" description="Feeds Google's knowledge panel and rich results. Contact details fall back to Content → Contact details." editor={editor}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Business name" value={org.name} onChange={(name) => set({ name })} />
        <TextField label="Legal name" value={org.legalName} onChange={(legalName) => set({ legalName })} />
        <TextField label="Phone (with +91)" value={org.phone} onChange={(phone) => set({ phone })} />
        <TextField label="Email" type="email" value={org.email} onChange={(email) => set({ email })} />
        <TextField label="Street address" className="md:col-span-2" value={org.streetAddress} onChange={(streetAddress) => set({ streetAddress })} />
        <TextField label="City" value={org.locality} onChange={(locality) => set({ locality })} />
        <TextField label="State" value={org.region} onChange={(region) => set({ region })} />
        <TextField label="PIN code" value={org.postalCode} onChange={(postalCode) => set({ postalCode })} />
        <TextField label="Country code" value={org.country} onChange={(country) => set({ country })} />
        <ImageField label="Logo for search results" aspect="aspect-square" hint="Square, at least 112×112." value={org.logo} onChange={(logo) => set({ logo })} />
        <ListField label="Other profile URLs" hint="Instagram/Facebook/YouTube from Contact details are added automatically." value={org.sameAs} onChange={(sameAs) => set({ sameAs })} />
      </div>
    </BlobEditor>
  );
}

function CategoriesSeoEditor() {
  const [items, setItems] = useState<CmsCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/admin/categories");
      const payload = (await response.json()) as { categories: CmsCategory[] };
      if (!cancelled) {
        setItems(payload.categories);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = (slug: string, changes: Partial<CmsCategory>) => {
    setItems((current) => current.map((c) => (c.slug === slug ? { ...c, ...changes } : c)));
    setDirty((current) => new Set(current).add(slug));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    let failed = "";
    for (const slug of dirty) {
      const category = items.find((c) => c.slug === slug);
      if (!category) continue;
      const response = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: category.name,
          description: category.description,
          image: category.image,
          heroImage: category.heroImage,
          heroImagePosition: category.heroImagePosition,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          enabled: category.enabled,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        failed = `${category.name}: ${payload.error ?? "failed"}`;
        break;
      }
    }
    setIsError(Boolean(failed));
    setMessage(failed || "Categories saved.");
    if (!failed) setDirty(new Set());
    setSaving(false);
  };

  return (
    <Section title="Categories" description="Name, intro text, banner photo and search settings for each category page.">
      {!loaded ? (
        <p className="text-sm text-warm-gray">Loading…</p>
      ) : (
        <div className="space-y-3">
          {items.map((category) => (
            <details key={category.slug} className="border border-charcoal/10 bg-ivory/40">
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="font-medium text-charcoal">{category.name}</span>
                <span className="font-mono text-[11px] text-warm-gray">/category/{category.slug}</span>
              </summary>
              <div className="grid gap-4 border-t border-charcoal/10 bg-white p-4 md:grid-cols-2">
                <div className="space-y-4">
                  <TextField label="Display name" value={category.name} onChange={(name) => patch(category.slug, { name })} />
                  <TextArea label="Intro text (shown on the page)" rows={2} value={category.description ?? ""} onChange={(description) => patch(category.slug, { description })} />
                  <TextField label="Search title" maxLength={70} showCounter placeholder={category.name} value={category.seoTitle ?? ""} onChange={(seoTitle) => patch(category.slug, { seoTitle })} />
                  <TextArea label="Search description" rows={3} maxLength={200} showCounter placeholder={category.description ?? ""} value={category.seoDescription ?? ""} onChange={(seoDescription) => patch(category.slug, { seoDescription })} />
                  <ImageField label="Share image" aspect="aspect-[1200/630]" value={category.image ?? ""} onChange={(image) => patch(category.slug, { image })} />
                  <ImageField
                    label="Page banner photo (optional)"
                    aspect="aspect-[16/7]"
                    hint="Replaces the illustrated banner on this category's page. Leave empty for the illustration."
                    value={category.heroImage ?? ""}
                    onChange={(heroImage) => patch(category.slug, { heroImage: heroImage || null })}
                  />
                  {category.heroImage ? (
                    <SelectField
                      label="Banner framing"
                      value={category.heroImagePosition || "center center"}
                      options={[
                        { value: "center center", label: "Centre" },
                        { value: "center top", label: "Top" },
                        { value: "center 25%", label: "Upper third" },
                        { value: "center bottom", label: "Bottom" },
                      ]}
                      onChange={(heroImagePosition) => patch(category.slug, { heroImagePosition })}
                    />
                  ) : null}
                  <Toggle label="Category page enabled" checked={category.enabled} onChange={(enabled) => patch(category.slug, { enabled })} />
                </div>
                <SeoPreview
                  title={category.seoTitle || category.name}
                  description={category.seoDescription || category.description || ""}
                  path={`/category/${category.slug}`}
                />
              </div>
            </details>
          ))}
        </div>
      )}
      <SaveBar saving={saving} message={message} isError={isError} onSave={() => void save()} label={`Save categories${dirty.size ? ` (${dirty.size})` : ""}`} />
    </Section>
  );
}

function useSeoContent() {
  return useContent("seo", seoSchema, CONTENT_DEFAULTS.seo);
}

const TABS = [
  { id: "site", label: "Site defaults" },
  { id: "pages", label: "Pages" },
  { id: "categories", label: "Categories" },
  { id: "business", label: "Business details" },
] as const;

export function AdminSeoEditor() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("site");
  const editor = useSeoContent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Search & Sharing (SEO)</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Titles, descriptions, keywords and share images. Product search settings live on each product;
          the sitemap and structured data update automatically.
        </p>
      </div>
      <Tabs tabs={[...TABS]} active={tab} onChange={setTab} />
      {tab === "site" ? <SiteDefaultsEditor editor={editor} /> : null}
      {tab === "pages" ? <PagesEditor editor={editor} /> : null}
      {tab === "categories" ? <CategoriesSeoEditor /> : null}
      {tab === "business" ? <OrganizationEditor editor={editor} /> : null}
    </div>
  );
}
