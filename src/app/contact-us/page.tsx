import { AnnouncementBar } from "@/components/announcement-bar";
import { ContactUs } from "@/components/contact-us";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { TrustStrip } from "@/components/trust-strip";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const metadata = {
  title: "Contact Us | Womania by Dola",
  description:
    "Reach Womania by Dola for orders, returns, sizing help, and FAQs. WhatsApp, phone, and email support from Jalpaiguri.",
};

export default function ContactUsPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <ContactUs />
        <TrustStrip />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
