import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PaymentReturnContent } from "@/components/payment-return-content";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const metadata = { title: "Payment status", robots: { index: false } };

export default function PaymentReturnPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-ivory"><PaymentReturnContent /></main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
