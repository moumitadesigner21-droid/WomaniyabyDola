import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { AccountShell } from "@/components/account/account-shell";
import { getCurrentCustomer } from "@/lib/customers/session";

export const metadata = { robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/login?next=%2Faccount");
  }

  return (
    <AccountShell>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-16 lg:px-8">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </AccountShell>
  );
}
