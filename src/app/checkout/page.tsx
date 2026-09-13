import { AnnouncementBar } from "@/components/announcement-bar";
import { CheckoutContent } from "@/components/checkout-content";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const metadata = {
  title: "Checkout",
  description: "Complete your Womania order securely on our website.",
};

export default function CheckoutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-ivory">
        <CheckoutContent />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
