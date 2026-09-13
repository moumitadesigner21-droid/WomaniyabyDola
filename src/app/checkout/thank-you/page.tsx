import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThankYouContent } from "@/components/thank-you-content";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const metadata = { title: "Thank you for your order", robots: { index: false } };

export default function ThankYouPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-ivory">
        <ThankYouContent />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
