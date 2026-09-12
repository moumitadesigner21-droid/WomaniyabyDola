import { revalidatePath } from "next/cache";

export function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/about-us");
  revalidatePath("/contact-us");
  revalidatePath("/category/[category]", "page");
  revalidatePath("/category/[category]/[subcategory]", "page");
  revalidatePath("/products/[slug]", "page");
}
