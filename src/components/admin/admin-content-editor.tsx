"use client";

import { useEffect, useState } from "react";

type ContentEditorProps = {
  title: string;
  description: string;
  contentKey: string;
};

export function AdminJsonContentEditor({
  title,
  description,
  contentKey,
}: ContentEditorProps) {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await fetch(`/api/admin/content/${contentKey}`);
      const payload = (await response.json()) as { value: unknown };
      setValue(JSON.stringify(payload.value, null, 2));
    })();
  }, [contentKey]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const parsed = JSON.parse(value) as unknown;
      const response = await fetch(`/api/admin/content/${contentKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: parsed }),
      });

      setMessage(response.ok ? "Saved successfully." : "Failed to save.");
    } catch {
      setMessage("Invalid JSON. Please fix formatting before saving.");
    }

    setSaving(false);
  };

  return (
    <section className="space-y-4 border border-charcoal/10 bg-white p-5">
      <div>
        <h3 className="font-serif text-xl text-maroon">{title}</h3>
        <p className="mt-1 text-sm text-warm-gray">{description}</p>
      </div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={16}
        className="w-full border border-charcoal/15 px-3 py-2.5 font-mono text-xs"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="border border-maroon bg-maroon px-4 py-2 text-xs tracking-[0.14em] text-ivory uppercase disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {message ? <p className="text-sm text-maroon">{message}</p> : null}
      </div>
    </section>
  );
}

export function AdminHomepageEditor() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Homepage</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Edit homepage sections, hero slides, banners, and section order.
        </p>
      </div>

      <AdminJsonContentEditor
        title="Announcement Bar"
        description="Enable/disable and edit the top announcement text."
        contentKey="announcement_bar"
      />
      <AdminJsonContentEditor
        title="Homepage Section Order"
        description="Reorder sections and toggle visibility with enabled + sortOrder fields."
        contentKey="homepage_sections"
      />
      <AdminJsonContentEditor
        title="Hero Slides"
        description="Edit hero images, headings, CTAs, and visibility."
        contentKey="hero_slides"
      />
      <AdminJsonContentEditor
        title="Collection Banners"
        description="See Our Collection cards — images, titles, and links."
        contentKey="collection_banners"
      />
      <AdminJsonContentEditor
        title="Shop by Category"
        description="Category cards shown on the homepage."
        contentKey="collections"
      />
      <AdminJsonContentEditor
        title="Best Sellers Config"
        description='Optional: { "productSlugs": ["slug-1", "slug-2"] } to hand-pick bestsellers.'
        contentKey="bestsellers_config"
      />
      <AdminJsonContentEditor
        title="How We Work"
        description="Steps shown on the homepage."
        contentKey="how_we_work"
      />
      <AdminJsonContentEditor
        title="Testimonials"
        description="Voices of Womania section."
        contentKey="testimonials"
      />
      <AdminJsonContentEditor
        title="Owner WhatsApp template"
        description='Order alert to boutique owner. Placeholders: {{orderNumber}}, {{customerName}}, {{customerPhone}}, {{items}}, {{total}}, etc.'
        contentKey="whatsapp_template"
      />
      <AdminJsonContentEditor
        title="Customer WhatsApp template"
        description='Order confirmation sent to the customer phone at checkout. Same placeholders as owner template.'
        contentKey="customer_whatsapp_template"
      />
    </div>
  );
}

export function AdminContentPagesEditor() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Website Content</h2>
        <p className="mt-2 text-sm text-warm-gray">
          Edit About Us, contact details, policies, FAQ, and social links.
        </p>
      </div>

      <AdminJsonContentEditor
        title="About Us"
        contentKey="about_us"
        description="Brand story and philosophy content."
      />
      <AdminJsonContentEditor
        title="Voices Gallery (About Us)"
        contentKey="voices_gallery"
        description="Photo gallery on About Us: clients, pageant, interns, studio. Each item needs id, image, alt, category (client|pageant|intern|studio), optional caption."
      />
      <AdminJsonContentEditor
        title="Contact Us"
        contentKey="contact_us"
        description="Contact page hero and reach options."
      />
      <AdminJsonContentEditor
        title="Store Contact"
        contentKey="store_contact"
        description="Footer and global contact details."
      />
      <AdminJsonContentEditor
        title="Policies"
        contentKey="policies"
        description="Shipping, returns, privacy, terms, FAQ, size guide, care."
      />
      <AdminJsonContentEditor
        title="Social Media"
        contentKey="social"
        description="WhatsApp, phone, email, address, hours, and social URLs."
      />
      <AdminJsonContentEditor
        title="Shipping & Payment"
        contentKey="shipping_payment"
        description="Shipping charges, COD, free shipping threshold, minimum order."
      />
    </div>
  );
}
