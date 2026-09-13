import Link from "next/link";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="bg-ivory">
        <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">404</p>
          <h1 className="mt-4 font-serif text-3xl text-maroon sm:text-4xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-warm-gray">
            The product or page you&apos;re looking for may have moved or sold
            out. Browse the collection or reach us on WhatsApp.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-[44px] items-center justify-center bg-maroon px-8 py-3 text-xs font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
            >
              Shop Collection
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center border border-charcoal/15 px-8 py-3 text-xs font-semibold tracking-[0.18em] text-charcoal uppercase transition-colors hover:border-maroon/40 hover:text-maroon"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
