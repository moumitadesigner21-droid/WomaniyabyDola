import { AdminLoginForm } from "@/components/admin/admin-login";

export const metadata = {
  title: "Admin Login | Womania",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 py-16">
      <AdminLoginForm />
    </div>
  );
}
