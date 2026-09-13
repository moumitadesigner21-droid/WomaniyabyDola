"use client";

import { useState } from "react";
import { BlobEditor } from "@/components/admin/editors/blob-editor";
import { Repeater, newId, withoutId } from "@/components/admin/editors/repeater";
import { useContent } from "@/components/admin/editors/use-content";
import {
  LinesField,
  NumberField,
  ParagraphsField,
  SelectField,
  Tabs,
  TextArea,
  TextField,
  Toggle,
} from "@/components/admin/form/fields";
import { ImageField } from "@/components/admin/form/image-field";
import { CONTENT_DEFAULTS } from "@/lib/cms/content-defaults";
import {
  VOICE_CATEGORIES,
  aboutUsSchema,
  contactUsSchema,
  policiesSchema,
  shippingPaymentSchema,
  shopPageSchema,
  socialSchema,
  voicesGallerySchema,
  whatsappTemplateSchema,
} from "@/lib/cms/content-schemas";

const FRAMING = [
  { value: "center center", label: "Centre" },
  { value: "center top", label: "Top" },
  { value: "center 25%", label: "Upper third" },
  { value: "center bottom", label: "Bottom" },
];

function ShopPageEditor() {
  const editor = useContent("shop_page", shopPageSchema, CONTENT_DEFAULTS.shop_page);
  const v = editor.value;
  return (
    <BlobEditor
      title="Shop page banner"
      description="The banner at the top of /shop. Add a photo to replace the illustrated background; leave it empty to keep the illustration."
      editor={editor}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Eyebrow" value={v.eyebrow} onChange={(eyebrow) => editor.update({ ...v, eyebrow })} />
        <TextField label="Title" required value={v.title} error={editor.errors.title} onChange={(title) => editor.update({ ...v, title })} />
        <TextArea label="Description" className="md:col-span-2" rows={2} value={v.description} onChange={(description) => editor.update({ ...v, description })} />
        <ImageField
          label="Banner photo (optional)"
          aspect="aspect-[16/7]"
          hint="Wide landscape photos work best (at least 1600px). Text sits on the right on desktop."
          value={v.heroImage}
          onChange={(heroImage) => editor.update({ ...v, heroImage })}
        />
        <SelectField label="Photo framing" value={v.heroImagePosition || "center center"} options={FRAMING} onChange={(heroImagePosition) => editor.update({ ...v, heroImagePosition })} />
      </div>
    </BlobEditor>
  );
}

function AboutEditor() {
  const editor = useContent("about_us", aboutUsSchema, CONTENT_DEFAULTS.about_us);
  const v = editor.value;
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) =>
    editor.update({ ...v, [key]: value });

  return (
    <BlobEditor title="About Us page" editor={editor}>
      <h4 className="text-xs tracking-[0.2em] text-warm-gray uppercase">Welcome</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Eyebrow" value={v.welcome.eyebrow} onChange={(eyebrow) => set("welcome", { ...v.welcome, eyebrow })} />
        <TextField label="Title" required value={v.welcome.title} onChange={(title) => set("welcome", { ...v.welcome, title })} />
        <TextArea label="Intro" className="md:col-span-2" rows={3} value={v.welcome.intro} onChange={(intro) => set("welcome", { ...v.welcome, intro })} />
      </div>

      <h4 className="pt-4 text-xs tracking-[0.2em] text-warm-gray uppercase">Our story</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Section title" value={v.story.title} onChange={(title) => set("story", { ...v.story, title })} />
        <TextField label="Founder name" value={v.story.founderName} onChange={(founderName) => set("story", { ...v.story, founderName })} />
        <ParagraphsField label="Story paragraphs" className="md:col-span-2" value={v.story.paragraphs} onChange={(paragraphs) => set("story", { ...v.story, paragraphs })} />
        <TextArea label="Founder bio" rows={3} value={v.story.founderBio} onChange={(founderBio) => set("story", { ...v.story, founderBio })} />
        <TextArea label="Pull quote" rows={3} value={v.story.quote} onChange={(quote) => set("story", { ...v.story, quote })} />
      </div>

      <h4 className="pt-4 text-xs tracking-[0.2em] text-warm-gray uppercase">Philosophy & fabrics</h4>
      <TextField label="Section title" value={v.philosophy.title} onChange={(title) => set("philosophy", { ...v.philosophy, title })} />
      <ParagraphsField label="Paragraphs" value={v.philosophy.paragraphs} onChange={(paragraphs) => set("philosophy", { ...v.philosophy, paragraphs })} />
      <Repeater
        items={v.philosophy.fabrics.map((f, i) => ({ ...f, _id: `${f.name}-${i}` }))}
        getId={(f) => f._id}
        onChange={(next) => set("philosophy", { ...v.philosophy, fabrics: next.map(withoutId) })}
        create={() => ({ _id: newId("fabric"), name: "Fabric", note: "" })}
        addLabel="Add fabric"
        max={12}
        summary={(f) => f.name}
      >
        {(f, update) => (
          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <TextField label="Fabric" value={f.name} onChange={(name) => update({ name })} />
            <TextField label="Note" value={f.note} onChange={(note) => update({ note })} />
          </div>
        )}
      </Repeater>

      <h4 className="pt-4 text-xs tracking-[0.2em] text-warm-gray uppercase">Highlights</h4>
      <Repeater
        items={v.highlights.map((h, i) => ({ ...h, _id: `${h.title}-${i}` }))}
        getId={(h) => h._id}
        onChange={(next) => set("highlights", next.map(withoutId))}
        create={() => ({ _id: newId("hl"), title: "Highlight", description: "" })}
        addLabel="Add highlight"
        max={8}
        summary={(h) => h.title}
      >
        {(h, update) => (
          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <TextField label="Title" value={h.title} onChange={(title) => update({ title })} />
            <TextField label="Description" value={h.description} onChange={(description) => update({ description })} />
          </div>
        )}
      </Repeater>

      <h4 className="pt-4 text-xs tracking-[0.2em] text-warm-gray uppercase">Our promise</h4>
      <TextField label="Section title" value={v.promise.title} onChange={(title) => set("promise", { ...v.promise, title })} />
      <ParagraphsField label="Paragraphs" value={v.promise.paragraphs} onChange={(paragraphs) => set("promise", { ...v.promise, paragraphs })} />
    </BlobEditor>
  );
}

function VoicesEditor() {
  const editor = useContent("voices_gallery", voicesGallerySchema, CONTENT_DEFAULTS.voices_gallery);
  const v = editor.value;
  const labels: Record<(typeof VOICE_CATEGORIES)[number], string> = {
    client: "Client",
    pageant: "Pageant",
    intern: "Intern",
    studio: "Studio",
  };
  return (
    <BlobEditor title="Voices gallery (About Us)" description="Photo wall with category filters." editor={editor}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Eyebrow" value={v.eyebrow} onChange={(eyebrow) => editor.update({ ...v, eyebrow })} />
        <TextField label="Title" value={v.title} onChange={(title) => editor.update({ ...v, title })} />
        <TextArea label="Intro" className="md:col-span-2" rows={2} value={v.intro} onChange={(intro) => editor.update({ ...v, intro })} />
      </div>
      <Repeater<(typeof v.items)[number]>
        items={v.items}
        getId={(item) => item.id}
        onChange={(items) => editor.update({ ...v, items })}
        create={() => ({ id: newId("voice"), image: "", alt: "", category: "client" as const, caption: "" })}
        addLabel="Add photo"
        max={60}
        summary={(item) => `${labels[item.category]} · ${item.caption || item.alt || "photo"}`}
      >
        {(item, update) => (
          <div className="grid gap-4 md:grid-cols-[auto_1fr]">
            <ImageField label="Photo" value={item.image} required onChange={(image) => update({ image })} />
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Category" value={item.category} options={VOICE_CATEGORIES.map((c) => ({ value: c, label: labels[c] }))} onChange={(category) => update({ category })} />
              <TextField label="Caption" value={item.caption} onChange={(caption) => update({ caption })} />
              <TextField label="Alt text" className="md:col-span-2" hint="Describe the photo for screen readers and search engines." value={item.alt} onChange={(alt) => update({ alt })} />
            </div>
          </div>
        )}
      </Repeater>
    </BlobEditor>
  );
}

function ContactEditor() {
  const editor = useContent("contact_us", contactUsSchema, CONTENT_DEFAULTS.contact_us);
  const v = editor.value;
  return (
    <BlobEditor title="Contact Us page" editor={editor}>
      <h4 className="text-xs tracking-[0.2em] text-warm-gray uppercase">Header</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Eyebrow" value={v.hero.eyebrow} onChange={(eyebrow) => editor.update({ ...v, hero: { ...v.hero, eyebrow } })} />
        <TextField label="Title" required value={v.hero.title} onChange={(title) => editor.update({ ...v, hero: { ...v.hero, title } })} />
        <TextArea label="Intro" className="md:col-span-2" rows={2} value={v.hero.intro} onChange={(intro) => editor.update({ ...v, hero: { ...v.hero, intro } })} />
      </div>

      <h4 className="pt-4 text-xs tracking-[0.2em] text-warm-gray uppercase">Ways to reach us</h4>
      <Repeater
        items={v.reach.map((r, i) => ({ ...r, _id: `${r.label}-${i}` }))}
        getId={(r) => r._id}
        onChange={(next) => editor.update({ ...v, reach: next.map(withoutId) })}
        create={() => ({ _id: newId("reach"), label: "WhatsApp", value: "", href: "", note: "" })}
        addLabel="Add contact method"
        max={8}
        summary={(r) => `${r.label}: ${r.value}`}
      >
        {(r, update) => (
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Type" hint="Controls the icon." value={r.label} options={["WhatsApp", "Phone", "Email", "Studio"].map((l) => ({ value: l, label: l }))} onChange={(label) => update({ label })} />
            <TextField label="Shown text" value={r.value} onChange={(value) => update({ value })} />
            <TextField label="Link" placeholder="https://wa.me/… / tel:… / mailto:…" value={r.href} onChange={(href) => update({ href })} />
            <TextField label="Note" value={r.note} onChange={(note) => update({ note })} />
          </div>
        )}
      </Repeater>

      <h4 className="pt-4 text-xs tracking-[0.2em] text-warm-gray uppercase">FAQ</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="FAQ eyebrow" value={v.faqEyebrow} onChange={(faqEyebrow) => editor.update({ ...v, faqEyebrow })} />
        <TextField label="FAQ title" value={v.faqTitle} onChange={(faqTitle) => editor.update({ ...v, faqTitle })} />
      </div>
      <Repeater
        items={v.faqs}
        getId={(faq) => faq.id}
        onChange={(faqs) => editor.update({ ...v, faqs })}
        create={() => ({ id: newId("faq"), question: "New question", answer: [], intro: "", steps: [], list: [] })}
        addLabel="Add question"
        max={20}
        summary={(faq) => faq.question}
      >
        {(faq, update) => (
          <>
            <TextField label="Question" required value={faq.question} onChange={(question) => update({ question })} />
            <ParagraphsField label="Answer" rows={4} value={faq.answer} onChange={(answer) => update({ answer })} />
            <details className="text-sm">
              <summary className="cursor-pointer text-xs tracking-[0.12em] text-warm-gray uppercase">Steps & bullet list (optional)</summary>
              <div className="mt-3 space-y-4">
                <TextField label="Lead-in before steps" value={faq.intro} onChange={(intro) => update({ intro })} />
                <LinesField label="Numbered steps" rows={4} value={faq.steps} onChange={(steps) => update({ steps })} />
                <LinesField label="Bullet points" rows={3} value={faq.list} onChange={(list) => update({ list })} />
              </div>
            </details>
          </>
        )}
      </Repeater>

      <h4 className="pt-4 text-xs tracking-[0.2em] text-warm-gray uppercase">Enquiry form</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Form eyebrow" value={v.formEyebrow} onChange={(formEyebrow) => editor.update({ ...v, formEyebrow })} />
        <TextField label="Form title" value={v.formTitle} onChange={(formTitle) => editor.update({ ...v, formTitle })} />
        <TextArea label="Form note" className="md:col-span-2" rows={2} value={v.formNote} onChange={(formNote) => editor.update({ ...v, formNote })} />
      </div>
    </BlobEditor>
  );
}

function PoliciesEditor() {
  const editor = useContent("policies", policiesSchema, CONTENT_DEFAULTS.policies);
  const v = editor.value;
  const fields = [
    ["shipping", "Shipping policy"],
    ["returns", "Refund & returns"],
    ["sizeGuide", "Size guide"],
    ["care", "Care instructions"],
    ["privacy", "Privacy policy"],
    ["terms", "Terms & conditions"],
  ] as const;
  return (
    <BlobEditor title="Store policies" description="Shown at /policies and linked from the footer. Leave a section blank to hide it." editor={editor}>
      {fields.map(([key, label]) => (
        <TextArea key={key} label={label} rows={4} hint="Blank line = new paragraph." value={v[key]} onChange={(text) => editor.update({ ...v, [key]: text })} />
      ))}
      <h4 className="pt-4 text-xs tracking-[0.2em] text-warm-gray uppercase">Policy FAQ</h4>
      <Repeater
        items={v.faq.map((f, i) => ({ ...f, _id: `${i}-${f.question.slice(0, 12)}` }))}
        getId={(f) => f._id}
        onChange={(next) => editor.update({ ...v, faq: next.map(withoutId) })}
        create={() => ({ _id: newId("pfaq"), question: "New question", answer: "" })}
        addLabel="Add question"
        max={30}
        summary={(f) => f.question}
      >
        {(f, update) => (
          <>
            <TextField label="Question" value={f.question} onChange={(question) => update({ question })} />
            <TextArea label="Answer" rows={3} value={f.answer} onChange={(answer) => update({ answer })} />
          </>
        )}
      </Repeater>
    </BlobEditor>
  );
}

function SocialEditor() {
  const editor = useContent("social", socialSchema, CONTENT_DEFAULTS.social);
  const v = editor.value;
  return (
    <BlobEditor title="Contact details & social links" description="Used in the footer, the WhatsApp button and structured data." editor={editor}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="WhatsApp number" hint="Digits only, with country code (91…)." value={v.whatsappNumber} onChange={(whatsappNumber) => editor.update({ ...v, whatsappNumber: whatsappNumber.replace(/\D/g, "") })} />
        <TextField label="Phone (as displayed)" value={v.phone} onChange={(phone) => editor.update({ ...v, phone })} />
        <TextField label="Email" type="email" value={v.email} onChange={(email) => editor.update({ ...v, email })} />
        <TextField label="Business hours" value={v.businessHours} onChange={(businessHours) => editor.update({ ...v, businessHours })} />
        <TextArea label="Address" className="md:col-span-2" rows={2} value={v.address} onChange={(address) => editor.update({ ...v, address })} />
        <TextField label="Instagram URL" type="url" value={v.instagramUrl} onChange={(instagramUrl) => editor.update({ ...v, instagramUrl })} />
        <TextField label="Facebook URL" type="url" value={v.facebookUrl} onChange={(facebookUrl) => editor.update({ ...v, facebookUrl })} />
        <TextField label="YouTube URL" type="url" value={v.youtubeUrl} onChange={(youtubeUrl) => editor.update({ ...v, youtubeUrl })} />
      </div>
      <Repeater
        items={v.otherLinks.map((l, i) => ({ ...l, _id: `${l.url}-${i}` }))}
        getId={(l) => l._id}
        onChange={(next) => editor.update({ ...v, otherLinks: next.map(withoutId) })}
        create={() => ({ _id: newId("link"), label: "Link", url: "https://" })}
        addLabel="Add another link"
        max={8}
        summary={(l) => l.label}
      >
        {(l, update) => (
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Label" value={l.label} onChange={(label) => update({ label })} />
            <TextField label="URL" type="url" value={l.url} onChange={(url) => update({ url })} />
          </div>
        )}
      </Repeater>
    </BlobEditor>
  );
}

function ShippingEditor() {
  const editor = useContent("shipping_payment", shippingPaymentSchema, CONTENT_DEFAULTS.shipping_payment);
  const v = editor.value;
  return (
    <BlobEditor title="Shipping & payment rules" description="Applied to every order at checkout." editor={editor}>
      <div className="grid gap-4 md:grid-cols-3">
        <NumberField label="Flat shipping (₹)" min={0} value={v.flatShippingRate} onChange={(n) => editor.update({ ...v, flatShippingRate: n ?? 0 })} />
        <NumberField label="Free shipping above (₹)" min={0} allowEmpty hint="Empty = never free." value={v.freeShippingThreshold} onChange={(freeShippingThreshold) => editor.update({ ...v, freeShippingThreshold })} />
        <NumberField label="Minimum order (₹)" min={0} value={v.minOrderValue} onChange={(n) => editor.update({ ...v, minOrderValue: n ?? 0 })} />
        <TextField label="Delivery zones" className="md:col-span-3" value={v.deliveryZones} onChange={(deliveryZones) => editor.update({ ...v, deliveryZones })} />
      </div>
      <Toggle label="Accept orders (cash on delivery)" hint="Turn off to pause checkout temporarily." checked={v.codEnabled} onChange={(codEnabled) => editor.update({ ...v, codEnabled })} />
    </BlobEditor>
  );
}

const PLACEHOLDERS = ["orderNumber", "customerName", "customerPhone", "customerEmail", "customerAddress", "items", "subtotal", "shipping", "discount", "couponCode", "total", "paymentStatus"];

function TemplateEditor({ contentKey, title, description }: { contentKey: "whatsapp_template" | "customer_whatsapp_template"; title: string; description: string }) {
  const editor = useContent(contentKey, whatsappTemplateSchema, CONTENT_DEFAULTS[contentKey]);
  const [ref, setRef] = useState<HTMLTextAreaElement | null>(null);

  const insert = (token: string) => {
    const text = editor.value.template;
    const start = ref?.selectionStart ?? text.length;
    const end = ref?.selectionEnd ?? text.length;
    const next = `${text.slice(0, start)}{{${token}}}${text.slice(end)}`;
    editor.update({ template: next });
  };

  return (
    <BlobEditor title={title} description={description} editor={editor}>
      <div className="flex flex-wrap gap-1.5">
        {PLACEHOLDERS.map((token) => (
          <button key={token} type="button" onClick={() => insert(token)} className="border border-charcoal/15 bg-ivory px-2 py-1 font-mono text-[11px] text-charcoal hover:border-maroon/40 hover:text-maroon">
            {`{{${token}}}`}
          </button>
        ))}
      </div>
      <textarea
        ref={setRef}
        value={editor.value.template}
        rows={14}
        onChange={(event) => editor.update({ template: event.target.value })}
        className="w-full border border-charcoal/15 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed text-charcoal outline-none focus:border-maroon"
      />
    </BlobEditor>
  );
}

const TABS = [
  { id: "shop", label: "Shop page" },
  { id: "about", label: "About Us" },
  { id: "voices", label: "Voices gallery" },
  { id: "contact", label: "Contact page" },
  { id: "policies", label: "Policies" },
  { id: "social", label: "Contact details" },
  { id: "shipping", label: "Shipping & payment" },
  { id: "templates", label: "WhatsApp messages" },
] as const;

export function AdminContentPagesEditor() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("about");
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl text-maroon">Website Content</h2>
        <p className="mt-2 text-sm text-warm-gray">Page copy, policies, contact details and order messages.</p>
      </div>
      <Tabs tabs={[...TABS]} active={tab} onChange={setTab} />
      {tab === "shop" ? <ShopPageEditor /> : null}
      {tab === "about" ? <AboutEditor /> : null}
      {tab === "voices" ? <VoicesEditor /> : null}
      {tab === "contact" ? <ContactEditor /> : null}
      {tab === "policies" ? <PoliciesEditor /> : null}
      {tab === "social" ? <SocialEditor /> : null}
      {tab === "shipping" ? <ShippingEditor /> : null}
      {tab === "templates" ? (
        <div className="space-y-6">
          <TemplateEditor contentKey="whatsapp_template" title="Message to the boutique (new order)" description="Sent to the owner WhatsApp number when an order is placed." />
          <TemplateEditor contentKey="customer_whatsapp_template" title="Message to the customer (order confirmation)" description="Sent to the customer's phone at checkout." />
        </div>
      ) : null}
    </div>
  );
}
