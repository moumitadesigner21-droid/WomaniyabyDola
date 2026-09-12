"use client";

export function AdminLogoutButton() {
  return (
    <button
      type="button"
      className="text-warm-gray hover:text-maroon"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Logout
    </button>
  );
}
