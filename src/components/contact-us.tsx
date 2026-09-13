"use client";

import {
  ArrowUpRight,
  ChevronDown,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { contactUsContent } from "@/lib/data";
import { getWhatsAppContactUrl } from "@/lib/format";
import { contactUsSchema, type ContactUsContent } from "@/lib/cms/content-schemas";

type FaqItem = ContactUsContent["faqs"][number];

const reachIcons = {
  WhatsApp: MessageCircle,
  Phone: Phone,
  Email: Mail,
  Studio: MapPin,
} as const;

function FaqAnswer({ faq }: { faq: FaqItem }) {
  if (faq.steps?.length) {
    return (
      <div className="space-y-4">
        {faq.intro ? (
          <p className="text-sm leading-relaxed text-charcoal/80">{faq.intro}</p>
        ) : null}
        <ol className="space-y-3">
          {faq.steps.map((step, index) => (
            <li key={step.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-charcoal/80">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-maroon/8 font-serif text-xs text-maroon">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faq.answer?.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-charcoal/80">
            {paragraph}
          </p>
        ))}
      {faq.list?.length ? (
        <ul className="space-y-2 border-l border-gold/40 pl-4">
          {faq.list.map((item) => (
            <li key={item.slice(0, 40)} className="text-sm leading-relaxed text-charcoal/80">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ContactUs({ content }: { content?: ContactUsContent }) {
  const { hero, reach, faqEyebrow, faqTitle, formEyebrow, formTitle, formNote, faqs } =
    content ?? contactUsSchema.parse(contactUsContent);

  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id ?? null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const url = getWhatsAppContactUrl(form);
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-maroon py-20 text-ivory lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 18px), repeating-linear-gradient(-45deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 18px)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="mb-4 text-xs tracking-[0.35em] text-gold-light uppercase">
                {hero.eyebrow}
              </p>
              <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-[3.25rem]">
                {hero.title}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg">
                {hero.intro}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {reach.map((channel) => {
                const Icon = reachIcons[channel.label as keyof typeof reachIcons];
                return (
                  <Link
                    key={channel.label}
                    href={channel.href}
                    target={channel.label === "Studio" ? "_blank" : undefined}
                    rel={channel.label === "Studio" ? "noopener noreferrer" : undefined}
                    className="group rounded-2xl border border-ivory/12 bg-ivory/5 p-4 backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-ivory/10 sm:p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold-light">
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-ivory/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-light" />
                    </div>
                    <p className="text-[10px] tracking-[0.22em] text-ivory/55 uppercase">
                      {channel.label}
                    </p>
                    <p className="mt-1 font-serif text-lg text-ivory">{channel.value}</p>
                    <p className="mt-2 text-xs leading-relaxed text-ivory/60">{channel.note}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + Form */}
      <section className="bg-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* FAQ thread */}
            <div>
              <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
                {faqEyebrow}
              </p>
              <h2 className="font-serif text-3xl text-maroon sm:text-4xl">{faqTitle}</h2>

              <div className="relative mt-10">
                <div
                  aria-hidden
                  className="absolute top-3 bottom-3 left-[1.125rem] hidden w-px bg-gradient-to-b from-gold via-maroon/20 to-gold/40 sm:block"
                />

                <div className="space-y-3">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaq === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`relative rounded-2xl border transition-all duration-300 ${
                          isOpen
                            ? "border-maroon/15 bg-white shadow-[0_20px_40px_-24px_rgba(107,30,46,0.35)]"
                            : "border-charcoal/8 bg-white/70 hover:border-charcoal/15"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                          aria-expanded={isOpen}
                          className="flex w-full items-start gap-4 px-4 py-5 text-left sm:px-5"
                        >
                          <span
                            className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm transition-colors ${
                              isOpen
                                ? "bg-maroon text-ivory"
                                : "bg-maroon/8 text-maroon"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 pt-1">
                            <span className="block font-serif text-lg text-maroon sm:text-xl">
                              {faq.question}
                            </span>
                          </span>
                          <ChevronDown
                            className={`mt-1 h-5 w-5 shrink-0 text-warm-gray transition-transform duration-300 ${
                              isOpen ? "rotate-180 text-maroon" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`grid transition-all duration-300 ${
                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="border-t border-charcoal/6 px-4 pb-5 sm:px-5 sm:pl-[4.75rem]">
                              <FaqAnswer faq={faq} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:pt-2">
              <div className="sticky top-28">
                <div className="hero-image-shell relative overflow-hidden border border-charcoal/8 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(44,44,44,0.18)] sm:p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.35]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(201,162,39,0.06) 0%, transparent 45%), linear-gradient(180deg, rgba(107,30,46,0.03) 0%, transparent 100%)",
                    }}
                  />

                  <div className="relative">
                    <p className="text-[10px] tracking-[0.25em] text-gold uppercase">
                      {formEyebrow}
                    </p>
                    <h2 className="mt-2 font-serif text-2xl text-maroon sm:text-3xl">
                      {formTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-warm-gray">{formNote}</p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] tracking-[0.14em] text-charcoal/70 uppercase">
                            Your Name
                          </span>
                          <input
                            required
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-charcoal/12 bg-ivory/50 px-3.5 py-3 text-sm text-charcoal placeholder:text-warm-gray/60 focus:border-maroon/30 focus:outline-none"
                            placeholder="Your full name"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] tracking-[0.14em] text-charcoal/70 uppercase">
                            Your Email
                          </span>
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-charcoal/12 bg-ivory/50 px-3.5 py-3 text-sm text-charcoal placeholder:text-warm-gray/60 focus:border-maroon/30 focus:outline-none"
                            placeholder="you@email.com"
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] tracking-[0.14em] text-charcoal/70 uppercase">
                            Phone Number
                          </span>
                          <input
                            required
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full border border-charcoal/12 bg-ivory/50 px-3.5 py-3 text-sm text-charcoal placeholder:text-warm-gray/60 focus:border-maroon/30 focus:outline-none"
                            placeholder="10-digit mobile"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-[11px] tracking-[0.14em] text-charcoal/70 uppercase">
                            Company
                          </span>
                          <input
                            type="text"
                            value={form.company}
                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                            className="w-full border border-charcoal/12 bg-ivory/50 px-3.5 py-3 text-sm text-charcoal placeholder:text-warm-gray/60 focus:border-maroon/30 focus:outline-none"
                            placeholder="Optional"
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className="mb-1.5 block text-[11px] tracking-[0.14em] text-charcoal/70 uppercase">
                          Your Message
                        </span>
                        <textarea
                          required
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full resize-none border border-charcoal/12 bg-ivory/50 px-3.5 py-3 text-sm text-charcoal placeholder:text-warm-gray/60 focus:border-maroon/30 focus:outline-none"
                          placeholder="Tell us about your order, sizing, or question..."
                        />
                      </label>

                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 bg-maroon px-6 py-3.5 text-sm font-medium tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
                      >
                        Send via WhatsApp
                        <Send className="h-4 w-4" />
                      </button>

                      {submitted ? (
                        <p className="text-center text-xs text-forest">
                          WhatsApp opened — send the message to reach our studio.
                        </p>
                      ) : (
                        <p className="text-center text-xs text-warm-gray">
                          Prefer email?{" "}
                          <a
                            href="mailto:womaniadesignstudio@gmail.com"
                            className="text-maroon underline-offset-2 hover:underline"
                          >
                            womaniadesignstudio@gmail.com
                          </a>
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
