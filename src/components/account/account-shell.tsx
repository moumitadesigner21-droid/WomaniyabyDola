import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { ReactNode } from "react";

/** Storefront chrome around any account page. */
export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-ivory">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
