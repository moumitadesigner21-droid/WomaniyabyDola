"use client";

import {
  BadgePercent,
  Globe,
  Home,
  Images,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  Package,
  Palette,
  PanelsTopLeft,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: "newOrders";
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: "newOrders" },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/offers", label: "Coupons & offers", icon: BadgePercent },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/media", label: "Media library", icon: Images },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/content", label: "Pages & content", icon: PanelsTopLeft },
      { href: "/admin/navigation", label: "Menus", icon: ListTree },
      { href: "/admin/appearance", label: "Appearance", icon: Palette },
      { href: "/admin/seo", label: "Search & sharing", icon: Globe },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const ALL_ITEMS = GROUPS.flatMap((group) => group.items);

function isActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function currentTitle(pathname: string) {
  if (pathname.startsWith("/admin/products/new")) return "New product";
  if (/^\/admin\/products\/[^/]+$/.test(pathname)) return "Edit product";
  return ALL_ITEMS.find((item) => isActive(item, pathname))?.label ?? "Admin";
}

function SidebarContent({
  pathname,
  newOrders,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  newOrders: number;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ivory/10 px-5 py-5">
        <p className="text-[10px] tracking-[0.25em] text-gold uppercase">Womania</p>
        <Link href="/admin" onClick={onNavigate} className="font-serif text-2xl text-ivory">
          Admin
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="px-3 pb-1.5 text-[10px] tracking-[0.2em] text-ivory/40 uppercase">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item, pathname);
                const Icon = item.icon;
                const badge = item.badge === "newOrders" && newOrders > 0 ? newOrders : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-ivory text-maroon"
                          : "text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.7} />
                      <span className="flex-1">{item.label}</span>
                      {badge ? (
                        <span className={`min-w-[1.4rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold ${active ? "bg-maroon text-ivory" : "bg-gold text-charcoal"}`}>
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ivory/10 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ivory/80 transition-colors hover:bg-ivory/10 hover:text-ivory"
        >
          <Store className="h-4 w-4" strokeWidth={1.7} />
          View store
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-ivory/80 transition-colors hover:bg-ivory/10 hover:text-ivory"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.7} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newOrders, setNewOrders] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        const payload = (await response.json()) as { stats?: { newOrders?: number } };
        if (!cancelled) setNewOrders(payload.stats?.newOrders ?? 0);
      } catch {
        // badge is a nicety; ignore failures
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const title = currentTitle(pathname);

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[248px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden bg-charcoal lg:sticky lg:top-0 lg:block lg:h-screen">
        <SidebarContent pathname={pathname} newOrders={newOrders} onLogout={() => void logout()} />
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-charcoal/50" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-charcoal shadow-2xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-3 text-ivory/70 hover:text-ivory"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent pathname={pathname} newOrders={newOrders} onNavigate={() => setOpen(false)} onLogout={() => void logout()} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-charcoal/10 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center text-charcoal lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate font-serif text-lg text-maroon">{title}</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="hidden items-center gap-2 border border-charcoal/15 px-3 py-1.5 text-[11px] tracking-[0.12em] text-charcoal uppercase transition-colors hover:border-maroon/40 hover:text-maroon sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
              Find product
            </Link>
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 bg-maroon px-3 py-1.5 text-[11px] tracking-[0.12em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
            >
              + New product
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
