"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { CmsProduct } from "@/lib/cms/types";

export function AdminProductsPanel() {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/products?all=1");
    const payload = (await response.json()) as { products: CmsProduct[] };
    setProducts(payload.products);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setMessage("Product deleted.");
      await load();
    } else {
      setMessage("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-maroon">Products</h2>
          <p className="mt-2 text-sm text-warm-gray">
            Add, edit, enable, feature, and manage stock for all products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="border border-maroon bg-maroon px-4 py-2 text-xs tracking-[0.14em] text-ivory uppercase"
        >
          Add Product
        </Link>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products..."
        className="w-full max-w-md border border-charcoal/15 bg-white px-3 py-2.5 text-sm"
      />

      {message ? <p className="text-sm text-maroon">{message}</p> : null}

      <div className="overflow-x-auto border border-charcoal/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/10 bg-ivory/60 text-xs tracking-[0.12em] uppercase text-warm-gray">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-charcoal/8">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt=""
                      className="h-12 w-10 object-cover"
                    />
                    <div>
                      <p className="font-medium text-charcoal">{product.name}</p>
                      <p className="text-xs text-warm-gray">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-warm-gray">{product.categorySlug}</td>
                <td className="px-4 py-3">
                  {product.salePrice ? (
                    <span>
                      <span className="text-maroon">{formatPrice(product.salePrice)}</span>
                      <span className="ml-2 text-xs text-warm-gray line-through">
                        {formatPrice(product.price)}
                      </span>
                    </span>
                  ) : (
                    formatPrice(product.price)
                  )}
                </td>
                <td className="px-4 py-3">{product.stockQuantity}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {!product.enabled ? (
                      <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[10px] uppercase">
                        Disabled
                      </span>
                    ) : null}
                    {!product.inStock ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] uppercase text-red-700">
                        Out of stock
                      </span>
                    ) : null}
                    {product.featured ? (
                      <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] uppercase">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-xs tracking-[0.12em] text-maroon uppercase"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-xs tracking-[0.12em] text-red-700 uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
