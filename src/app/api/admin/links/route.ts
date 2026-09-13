import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/session";
import { withErrorHandling } from "@/lib/api/validation";
import { categories } from "@/lib/categories";
import { listAllProducts } from "@/lib/cms/products-repository";

export const runtime = "nodejs";

export interface LinkOption {
  group: "Pages" | "Categories" | "Products";
  label: string;
  href: string;
}

/** Internal destinations for the admin link picker. */
export const GET = withErrorHandling(async () => {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages: LinkOption[] = [
    { group: "Pages", label: "Home", href: "/" },
    { group: "Pages", label: "Shop", href: "/shop" },
    { group: "Pages", label: "About Us", href: "/about-us" },
    { group: "Pages", label: "Contact Us", href: "/contact-us" },
    { group: "Pages", label: "Store Policies", href: "/policies" },
    { group: "Pages", label: "Cart", href: "/cart" },
  ];

  const categoryLinks: LinkOption[] = categories.flatMap((category) => [
    { group: "Categories" as const, label: category.name, href: `/category/${category.slug}` },
    ...category.subcategories.map((sub) => ({
      group: "Categories" as const,
      label: `${category.name} › ${sub.name}`,
      href: `/category/${category.slug}/${sub.slug}`,
    })),
  ]);

  const products = await listAllProducts(false);
  const productLinks: LinkOption[] = products.map((product) => ({
    group: "Products",
    label: product.name,
    href: `/products/${product.slug}`,
  }));

  return NextResponse.json({ links: [...pages, ...categoryLinks, ...productLinks] });
});
