import Image from "next/image";
import Link from "next/link";
import {
  WOMANIA_LOGO_CLASS,
  WOMANIA_LOGO_HEIGHT,
  WOMANIA_LOGO_WIDTH,
} from "@/components/womania-logo";
import {
  getAppearance,
  getFooterNav,
  getPolicyLinks,
  getSocial,
  normalizeWhatsAppNumber,
} from "@/lib/site-chrome";

const defaultQuickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
];

export async function Footer() {
  const [social, appearance, footerNav, supportLinks] = await Promise.all([
    getSocial(),
    getAppearance(),
    getFooterNav(),
    getPolicyLinks(),
  ]);
  const quickLinks = footerNav.length ? footerNav : defaultQuickLinks;
  const whatsapp = normalizeWhatsAppNumber(social.whatsappNumber);
  const socialLinks = [
    { label: "Instagram", href: social.instagramUrl },
    { label: "Facebook", href: social.facebookUrl },
    { label: "YouTube", href: social.youtubeUrl },
    ...social.otherLinks.map((link) => ({ label: link.label, href: link.url })),
  ].filter((link) => link.href && link.label);

  return (
    <footer id="contact" className="bg-charcoal text-ivory/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          <div>
            <Link href="/" className="inline-block mb-3">
              <Image
                src={appearance.logoUrl}
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
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-ivory text-sm tracking-widest uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              {social.phone ? (
                <li>
                  <a
                    href={`tel:${social.phone.replace(/\s/g, "")}`}
                    className="hover:text-gold transition-colors"
                  >
                    {social.phone}
                  </a>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              ) : null}
              {social.email ? (
                <li>
                  <a
                    href={`mailto:${social.email}`}
                    className="hover:text-gold transition-colors"
                  >
                    {social.email}
                  </a>
                </li>
              ) : null}
              {social.address ? (
                <li className="text-ivory/60 leading-relaxed">{social.address}</li>
              ) : null}
              {social.businessHours ? (
                <li className="text-ivory/60 leading-relaxed">
                  {social.businessHours}
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-ivory/40">
          <p>© {new Date().getFullYear()} Womania by Dola. All rights reserved.</p>
          <p>Handcrafted in Jalpaiguri</p>
        </div>
      </div>
    </footer>
  );
}
