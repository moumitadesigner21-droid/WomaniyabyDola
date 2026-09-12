import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/session";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }

  return <div className="min-h-screen bg-ivory">{children}</div>;
}
