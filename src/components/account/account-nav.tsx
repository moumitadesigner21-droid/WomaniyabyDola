"use client";

import { Heart, LogOut, MapPin, Package, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCustomer } from "@/lib/customer";

const links = [
  { href: "/account", label: "Overview", icon: UserRound, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useCustomer();

  return (
    <aside className="lg:sticky lg:top-40">
      {customer ? (
        <div className="mb-6 border-b border-charcoal/10 pb-6">
          <p className="text-[10px] tracking-[0.2em] text-gold uppercase">Signed in as</p>
          <p className="mt-1 font-serif text-xl text-charcoal">{customer.name}</p>
          <p className="text-sm text-warm-gray">{customer.email}</p>
        </div>
      ) : null}
      <nav className="-mx-2 flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col" aria-label="Account">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-3 px-3 py-2.5 text-xs tracking-[0.14em] uppercase transition-colors ${
                active ? "bg-maroon text-ivory" : "text-charcoal hover:bg-maroon/5 hover:text-maroon"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/");
            router.refresh();
          }}
          className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-xs tracking-[0.14em] text-warm-gray uppercase transition-colors hover:text-maroon"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.6} />
          Sign out
        </button>
      </nav>
    </aside>
  );
}
