import Image from "next/image";
import Link from "next/link";
import {
  WOMANIA_LOGO_CLASS,
  WOMANIA_LOGO_HEIGHT,
  WOMANIA_LOGO_PATH,
  WOMANIA_LOGO_WIDTH,
} from "@/components/womania-logo";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
  { label: "Order Tracking", href: "#" },
];

const supportLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Refund & Returns", href: "#" },
  { label: "Shipping Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-charcoal text-ivory/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          <div>
            <Link href="/" className="inline-block mb-3">
              <Image
                src={WOMANIA_LOGO_PATH}
                alt="Womania — Where tradition meets modernity"
                width={WOMANIA_LOGO_WIDTH}
                height={WOMANIA_LOGO_HEIGHT}
                className={WOMANIA_LOGO_CLASS}
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ivory/60">
              Timeless traditions, modern styles. Crafted with love from
              Jalpaiguri.
            </p>
          </div>

          <div>
            <h3 className="text-ivory text-sm tracking-widest uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-ivory text-sm tracking-widest uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-ivory text-sm tracking-widest uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="tel:9775301488"
                  className="hover:text-gold transition-colors"
                >
                  9775301488
                </a>
              </li>
              <li>
                <a
                  href="mailto:womaniadesignstudio@gmail.com"
                  className="hover:text-gold transition-colors"
                >
                  womaniadesignstudio@gmail.com
                </a>
              </li>
              <li className="text-ivory/60 leading-relaxed">
                Newtown para, PO &amp; District: Jalpaiguri
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ivory/40">
          <p>© 2026 Womania by Dola. All rights reserved.</p>
          <p>Heritage Modern — Homepage Mockup</p>
        </div>
      </div>
    </footer>
  );
}
