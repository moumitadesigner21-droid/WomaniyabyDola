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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WomaniaLogo } from "@/components/womania-logo";
import { useCart } from "@/lib/cart";
import { useCustomer } from "@/lib/customer";

import type { NavLinkItem } from "@/lib/site-chrome";

function isLinkActive(link: NavLinkItem, pathname: string): boolean {
  if (link.href === "/") return pathname === "/";
  if (link.href.startsWith("http") || link.href.startsWith("#")) return false;
  const [path] = link.href.split(/[?#]/);
  if (pathname === path || pathname.startsWith(`${path}/`)) return true;
  return link.children?.some((child) => isLinkActive(child, pathname)) ?? false;
}

function IconBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-forest px-1 text-[9px] font-bold text-ivory">
      {count}
    </span>
  );
}

interface HeaderClientProps {
  links: NavLinkItem[];
  logoUrl: string;
}

function HeaderInner({ links, logoUrl }: HeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const { itemCount: cartCount } = useCart();
  const { wishlist, customer } = useCustomer();
  const wishlistCount = wishlist.length;
  const accountHref = customer ? "/account" : "/account/login";
  const accountLabel = customer ? `Account (${customer.name.split(" ")[0]})` : "Sign in";

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Read the initial position via the listener path rather than a
    // synchronous setState in the effect body.
    window.dispatchEvent(new Event("scroll"));
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (link: NavLinkItem) => isLinkActive(link, pathname);

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
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 items-center justify-center text-charcoal/75 transition-colors hover:text-maroon sm:flex"
            >
              <Heart className="h-[19px] w-[19px]" strokeWidth={1.6} />
              {wishlistCount > 0 ? <IconBadge count={wishlistCount} /> : null}
            </Link>
          </div>

          {/* Center logo */}
          <div className="flex justify-center">
            <WomaniaLogo src={logoUrl} />
          </div>

          {/* Right utilities */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <Link
              href={accountHref}
              aria-label={accountLabel}
              title={accountLabel}
              className={`hidden h-10 w-10 items-center justify-center transition-colors hover:text-maroon sm:flex ${
                customer ? "text-forest" : "text-charcoal/75"
              }`}
            >
              <User className="h-[19px] w-[19px]" strokeWidth={1.6} />
            </Link>
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
            {links.map((link) => {
              const active = isActive(link);
              return (
                <li key={link.label} className="group/item relative">
                  <Link
                    href={link.href}
                    className={`group relative block px-3 py-3.5 text-[11px] font-medium tracking-[0.14em] uppercase transition-colors xl:px-3.5 xl:text-[12px] ${
                      active
                        ? "text-forest"
                        : "text-charcoal/80 hover:text-maroon"
                    }`}
                  >
                    {link.label}
                    {link.children?.length ? (
                      <span aria-hidden className="ml-1 text-[9px]">▾</span>
                    ) : null}
                    <span
                      className={`absolute bottom-2 left-3 right-3 h-px origin-center transition-transform duration-300 xl:left-3.5 xl:right-3.5 ${
                        active
                          ? "scale-x-100 bg-forest"
                          : "scale-x-0 bg-maroon group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                  {link.children?.length ? (
                    <ul className="invisible absolute left-0 top-full z-40 min-w-[200px] border border-charcoal/10 bg-ivory py-2 opacity-0 shadow-lg transition-opacity group-hover/item:visible group-hover/item:opacity-100 focus-within:visible focus-within:opacity-100">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={`block px-4 py-2 text-[11px] tracking-[0.12em] uppercase transition-colors hover:bg-maroon/5 hover:text-maroon ${
                              isActive(child) ? "text-forest" : "text-charcoal/80"
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
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
              <WomaniaLogo src={logoUrl} />
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
              {links.map((link) => {
                const active = isActive(link);
                return (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-md px-3 py-3.5 text-sm font-medium tracking-wide transition-colors ${
                        active
                          ? "bg-forest/8 text-forest"
                          : "text-charcoal hover:bg-maroon/5 hover:text-maroon"
                      }`}
                    >
                      {link.label}
                    </Link>
                    {link.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block rounded-md py-2.5 pl-8 pr-3 text-sm tracking-wide transition-colors ${
                          isActive(child)
                            ? "text-forest"
                            : "text-charcoal/75 hover:text-maroon"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </nav>

            <div className="grid grid-cols-3 gap-2 border-t border-charcoal/8 px-5 py-4">
              <Link
                href="/account/wishlist"
                onClick={() => setMobileOpen(false)}
                className="relative flex flex-col items-center gap-1 py-2 text-charcoal/80"
              >
                <span className="relative">
                  <Heart className="h-5 w-5" strokeWidth={1.75} />
                  {wishlistCount > 0 ? <IconBadge count={wishlistCount} /> : null}
                </span>
                <span className="text-[10px] tracking-wider uppercase">Wishlist</span>
              </Link>
              <Link
                href={accountHref}
                onClick={() => setMobileOpen(false)}
                className={`flex flex-col items-center gap-1 py-2 ${customer ? "text-forest" : "text-charcoal/80"}`}
              >
                <User className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[10px] tracking-wider uppercase">
                  {customer ? "Account" : "Sign in"}
                </span>
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="relative flex flex-col items-center gap-1 py-2 text-charcoal/80"
              >
                <span className="relative">
                  <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
                  {cartCount > 0 ? <IconBadge count={cartCount} /> : null}
                </span>
                <span className="text-[10px] tracking-wider uppercase">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function HeaderClient(props: HeaderClientProps) {
  return <HeaderInner {...props} />;
}
