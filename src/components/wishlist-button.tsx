"use client";

import { Heart } from "lucide-react";
import { useCustomer } from "@/lib/customer";

/** Heart toggle used on product cards and the product page. */
export function WishlistButton({
  productId,
  className = "",
  size = "sm",
  label,
}: {
  productId: string;
  className?: string;
  size?: "sm" | "md";
  label?: boolean;
}) {
  const { isWishlisted, toggleWishlist } = useCustomer();
  const active = isWishlisted(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleWishlist(productId);
      }}
      className={className}
    >
      <Heart
        className={`${size === "sm" ? "h-4 w-4" : "h-5 w-5"} transition-colors ${
          active ? "fill-maroon text-maroon" : ""
        }`}
      />
      {label ? <span>{active ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
