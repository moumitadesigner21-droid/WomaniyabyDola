import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/appearance", label: "Appearance" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ active }: { active?: string }) {
  return (
    <header className="border-b border-charcoal/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-gold uppercase">
              Womania CMS
            </p>
            <Link href="/admin" className="font-serif text-2xl text-maroon">
              Admin Panel
            </Link>
          </div>
          <AdminLogoutButton />
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 text-xs tracking-[0.12em] uppercase">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full border px-3 py-1.5 transition-colors ${
                active === link.href
                  ? "border-maroon bg-maroon text-ivory"
                  : "border-charcoal/15 bg-white text-charcoal hover:border-maroon/40 hover:text-maroon"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
