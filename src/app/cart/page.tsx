import { AnnouncementBar } from "@/components/announcement-bar";
import { CartContent } from "@/components/cart-content";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const metadata = {
  title: "Cart | Womania by Dola",
  description: "Review your Womania cart before checkout.",
};

export default function CartPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-ivory">
        <CartContent />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
