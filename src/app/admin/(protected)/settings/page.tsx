import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import { AdminSettingsPanel } from "@/components/admin/admin-settings";

export const metadata = {
  title: "Settings | Womania Admin",
};

export default function AdminSettingsPage() {
  return (
    <><AdminSettingsPanel />
        <AdminPasswordForm /></>
  );
}
