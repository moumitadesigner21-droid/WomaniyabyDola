import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { buildPageMetadata } from "@/lib/seo";
import { getPolicies } from "@/lib/storefront";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("policies", {
    title: "Store Policies",
    description:
      "Shipping, returns, size guide, care instructions, privacy and terms for Womania by Dola.",
    path: "/policies",
  });
}

interface Policies {
  shipping?: string;
  returns?: string;
  privacy?: string;
  terms?: string;
  faq?: { question: string; answer: string }[];
  sizeGuide?: string;
  care?: string;
}

const SECTIONS: { key: keyof Policies; title: string }[] = [
  { key: "shipping", title: "Shipping Policy" },
  { key: "returns", title: "Refund & Returns" },
  { key: "sizeGuide", title: "Size Guide" },
  { key: "care", title: "Care Instructions" },
  { key: "privacy", title: "Privacy Policy" },
  { key: "terms", title: "Terms & Conditions" },
];

export default async function PoliciesPage() {
  const policies = ((await getPolicies()) ?? {}) as Policies;
  const faq = Array.isArray(policies.faq) ? policies.faq : [];

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-ivory">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.2em] text-warm-gray uppercase">
            Womania by Dola
          </p>
          <h1 className="mt-2 font-serif text-3xl text-maroon sm:text-4xl">
            Store Policies
          </h1>

          <div className="mt-10 space-y-10">
            {SECTIONS.map(({ key, title }) => {
              const body = policies[key];
              if (typeof body !== "string" || !body.trim()) return null;
              return (
                <section key={key} id={key} className="scroll-mt-40">
                  <h2 className="font-serif text-2xl text-maroon">{title}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-charcoal">
                    {body.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              );
            })}

            {faq.length ? (
              <section id="faq" className="scroll-mt-40">
                <h2 className="font-serif text-2xl text-maroon">FAQ</h2>
                <dl className="mt-3 space-y-5">
                  {faq.map((item, index) => (
                    <div key={index}>
                      <dt className="text-sm font-semibold text-charcoal">
                        {item.question}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-charcoal/80">
                        {item.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
