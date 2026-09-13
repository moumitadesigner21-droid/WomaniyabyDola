import { AnnouncementBar } from "@/components/announcement-bar";
import { ContactUs } from "@/components/contact-us";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TrustStrip } from "@/components/trust-strip";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { JsonLd } from "@/components/json-ld";
import { contactUsSchema } from "@/lib/cms/content-schemas";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { getContactUsContent } from "@/lib/storefront";

export function generateMetadata() {
  return buildPageMetadata("contact", {
    title: "Contact Us",
    description:
      "Reach Womania by Dola for orders, returns, sizing help, and FAQs. WhatsApp, phone, and email support from Jalpaiguri.",
    path: "/contact-us",
  });
}

export default async function ContactUsPage() {
  const raw = await getContactUsContent();
  const parsed = contactUsSchema.safeParse(raw);
  const content = parsed.success ? parsed.data : undefined;

  const faqJsonLd = content?.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: [faq.intro, ...faq.answer, ...faq.steps, ...faq.list].filter(Boolean).join(" "),
          },
        })),
      }
    : null;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact Us", path: "/contact-us" }]),
          ...(faqJsonLd ? [faqJsonLd] : []),
        ]}
      />
      <AnnouncementBar />
      <Header />
      <main>
        <ContactUs content={content} />
        <TrustStrip />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
