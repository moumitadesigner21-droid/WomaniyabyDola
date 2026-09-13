import { redirect } from "next/navigation";
import { AccountShell } from "@/components/account/account-shell";
import { LoginForm } from "@/components/account/auth-forms";
import { getCurrentCustomer } from "@/lib/customers/session";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage() {
  if (await getCurrentCustomer()) redirect("/account");
  return (
    <AccountShell>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <LoginForm />
      </div>
    </AccountShell>
  );
}
