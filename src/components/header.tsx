"use client";

import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { WomaniaLogo } from "@/components/womania-logo";
import { useCart } from "@/lib/cart";

type NavLink = {
  label: string;
  href: string;
  match?: (pathname: string, search: string, hash: string) => boolean;
};

const navLinks: NavLink[] = [
  {
    label: "Home",
    href: "/",
    match: (pathname, search, hash) =>
      pathname === "/" && !hash && !search.includes("category"),
  },
  {
    label: "Shop",
    href: "/shop",
    match: (pathname, search) =>
      pathname === "/shop" && !search.includes("category"),
  },
  {
    label: "Gamcha",
    href: "/category/gamcha",
    match: (pathname, _, hash) =>
      pathname.startsWith("/category/gamcha") ||
      (pathname === "/" && hash === "#gamcha"),
  },
  {
    label: "Outfits",
    href: "/category/outfits",
    match: (pathname) => pathname.startsWith("/category/outfits"),
  },
  {
    label: "Saree",
    href: "/category/sarees",
    match: (pathname) => pathname.startsWith("/category/sarees"),
  },
  {
    label: "Skirts & Wrappers",
    href: "/category/skirts-wrappers",
    match: (pathname, _, hash) =>
      pathname.startsWith("/category/skirts-wrappers") ||
      (pathname === "/" && hash === "#skirts"),
  },
  {
    label: "Shrug",
    href: "/category/shrug",
    match: (pathname, _, hash) =>
      pathname.startsWith("/category/shrug") ||
      (pathname === "/" && hash === "#shrug"),
  },
  {
    label: "Jamdani",
    href: "/category/jamdani",
    match: (pathname) => pathname.startsWith("/category/jamdani"),
  },
  {
    label: "Dupattas",
    href: "/category/dupattas",
    match: (pathname) => pathname.startsWith("/category/dupattas"),
  },
  {
    label: "Cotton Stoles",
    href: "/category/cotton-stoles",
    match: (pathname) => pathname.startsWith("/category/cotton-stoles"),
  },
  {
    label: "About Us",
    href: "/about-us",
    match: (pathname, _, hash) =>
      pathname === "/about-us" ||
      (pathname === "/" && (hash === "#about" || hash === "#story")),
  },
  {
    label: "Contact Us",
    href: "/contact-us",
    match: (pathname) => pathname === "/contact-us",
  },
];

function IconBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-forest px-1 text-[9px] font-bold text-ivory">
      {count}
    </span>
  );
}

function HeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hash, setHash] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const { itemCount: cartCount } = useCart();
  const wishlistCount = 0;

  useEffect(() => {
    setHash(window.location.hash);
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (link: NavLink) =>
    link.match?.(pathname, search, hash) ?? pathname === link.href;

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/shop?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery("");
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-ivory transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_24px_-4px_rgba(44,44,44,0.08)]" : ""
      }`}
    >
      {/* Top tier */}
      <div className="border-b border-charcoal/8">
        <div className="mx-auto grid h-[4.25rem] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-[5.25rem] lg:px-10">
          {/* Left utilities */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center text-charcoal/75 transition-colors hover:text-maroon"
            >
              <Search className="h-[19px] w-[19px]" strokeWidth={1.6} />
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 items-center justify-center text-charcoal/75 transition-colors hover:text-maroon sm:flex"
            >
              <Heart className="h-[19px] w-[19px]" strokeWidth={1.6} />
              <IconBadge count={wishlistCount} />
            </button>
          </div>

          {/* Center logo */}
          <div className="flex justify-center">
            <WomaniaLogo />
          </div>

          {/* Right utilities */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center text-charcoal/75 transition-colors hover:text-maroon sm:flex"
            >
              <User className="h-[19px] w-[19px]" strokeWidth={1.6} />
            </button>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center text-charcoal/75 transition-colors hover:text-maroon"
            >
              <ShoppingCart className="h-[19px] w-[19px]" strokeWidth={1.6} />
              {cartCount > 0 ? <IconBadge count={cartCount} /> : null}
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-maroon lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div
        className={`overflow-hidden border-b border-charcoal/8 bg-white transition-all duration-300 ${
          searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <form
          onSubmit={handleSearch}
          className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10"
        >
          <Search className="h-4 w-4 shrink-0 text-warm-gray" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gamcha, sarees, dresses..."
            className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-warm-gray/70 focus:outline-none"
          />
          <button
            type="submit"
            className="text-[10px] font-semibold tracking-[0.18em] text-maroon uppercase transition-colors hover:text-maroon-dark"
          >
            Search
          </button>
        </form>
      </div>

      {/* Bottom tier — desktop nav */}
      <nav
        className="hidden border-b border-charcoal/8 lg:block"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <ul className="flex items-center justify-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`group relative block px-3 py-3.5 text-[11px] font-medium tracking-[0.14em] uppercase transition-colors xl:px-3.5 xl:text-[12px] ${
                      active
                        ? "text-forest"
                        : "text-charcoal/80 hover:text-maroon"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-2 left-3 right-3 h-px origin-center transition-transform duration-300 xl:left-3.5 xl:right-3.5 ${
                        active
                          ? "scale-x-100 bg-forest"
                          : "scale-x-0 bg-maroon group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-charcoal/35 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-ivory shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal/8 px-5 py-4">
              <WomaniaLogo />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center text-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="border-b border-charcoal/8 px-5 py-4">
              <div className="flex items-center gap-2 border border-charcoal/12 px-3 py-2.5">
                <Search className="h-4 w-4 text-warm-gray" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </form>

            <nav
              className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link) => {
                const active = isActive(link);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-3.5 text-sm font-medium tracking-wide transition-colors ${
                      active
                        ? "bg-forest/8 text-forest"
                        : "text-charcoal hover:bg-maroon/5 hover:text-maroon"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="grid grid-cols-3 gap-2 border-t border-charcoal/8 px-5 py-4">
              <button
                type="button"
                aria-label="Wishlist"
                className="relative flex flex-col items-center gap-1 py-2 text-charcoal/80"
              >
                <Heart className="h-5 w-5" strokeWidth={1.75} />
                <IconBadge count={wishlistCount} />
                <span className="text-[10px] tracking-wider uppercase">
                  Wishlist
                </span>
              </button>
              <button
                type="button"
                aria-label="Account"
                className="flex flex-col items-center gap-1 py-2 text-charcoal/80"
              >
                <User className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[10px] tracking-wider uppercase">
                  Account
                </span>
              </button>
              <button
                type="button"
                aria-label="Cart"
                className="relative flex flex-col items-center gap-1 py-2 text-charcoal/80"
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
                <IconBadge count={cartCount} />
                <span className="text-[10px] tracking-wider uppercase">Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 h-[4.25rem] border-b border-charcoal/8 bg-ivory lg:h-[9.5rem]" />}>
      <HeaderInner />
    </Suspense>
  );
}
