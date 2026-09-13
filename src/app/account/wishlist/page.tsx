import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";
import { AccountShell } from "@/components/account/account-shell";
import { WishlistGrid } from "@/components/account/wishlist-grid";
import { getCurrentCustomer } from "@/lib/customers/session";

export const metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const customer = await getCurrentCustomer();

  const content = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-gold uppercase">
            {customer ? "My account" : "Saved on this device"}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-maroon sm:text-4xl">Wishlist</h1>
        </div>
        {!customer ? (
          <Link href="/account/login?next=%2Faccount%2Fwishlist" className="text-[10px] tracking-[0.18em] text-maroon uppercase hover:text-maroon-dark">
            Sign in to sync →
          </Link>
        ) : null}
      </div>
      <WishlistGrid />
    </div>
  );

  return (
    <AccountShell>
      {customer ? (
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-16 lg:px-8">
          <AccountNav />
          <div className="min-w-0">{content}</div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">{content}</div>
      )}
    </AccountShell>
  );
}
