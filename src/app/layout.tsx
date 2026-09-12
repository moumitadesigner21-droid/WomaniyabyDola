import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { HashScroll } from "@/components/hash-scroll";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Womania by Dola | Heritage Modern Ethnic Wear",
  description:
    "Gamcha sarees, dresses, jackets & ethnic wear by Dola — handcrafted in Jalpaiguri with Assam tradition and modern style.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <CartProvider>
          <HashScroll />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
