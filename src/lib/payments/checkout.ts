"use client";

let loading: Promise<void> | undefined;
export async function openCardCheckout(paymentSessionId: string, mode: "sandbox" | "production") {
  if (!window.Cashfree) {
    loading ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      const timeout = setTimeout(() => { script.remove(); loading = undefined; reject(new Error("Checkout took too long to load. Please retry.")); }, 15_000);
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => { clearTimeout(timeout); resolve(); };
      script.onerror = () => { clearTimeout(timeout); script.remove(); loading = undefined; reject(new Error("Unable to load secure checkout.")); };
      document.head.appendChild(script);
    });
    await loading;
  }
  if (!window.Cashfree) throw new Error("Secure checkout is unavailable.");
  await window.Cashfree({ mode }).checkout({ paymentSessionId });
}
