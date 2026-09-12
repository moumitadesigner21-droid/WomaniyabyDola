import Image from "next/image";
import Link from "next/link";
import { images } from "@/lib/images";

const heritagePieces = [
  {
    name: "Cotton Mekhla Chador in Green Base",
    price: "₹2,600",
    image: images.collections.mekhlaChadorGreen,
  },
  {
    name: "Mekhla Chador Silk Blend",
    price: "₹2,800",
    image: images.assamSpotlight[1],
  },
];

export function AssamSpotlight() {
  return (
    <section id="assam" className="border-y border-charcoal/8 bg-ivory/80 py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-[10px] tracking-[0.28em] text-warm-gray uppercase">
              Heritage Corner
            </p>
            <h2 className="font-serif text-2xl text-maroon sm:text-3xl">
              Mekhla Chador
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-warm-gray sm:text-base">
              A cherished Assam classic we still keep in the collection — now
              available in select pieces. Browse when you&apos;re looking for
              the traditional drape.
            </p>
            <Link
              href="/category/mekhla-chador"
              className="mt-5 inline-flex text-[11px] tracking-[0.18em] text-maroon uppercase transition-colors hover:text-gold"
            >
              View Mekhla Chador →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-md lg:max-w-lg">
            {heritagePieces.map((product) => (
              <Link
                key={product.name}
                href="/category/mekhla-chador"
                className="group overflow-hidden rounded-lg border border-charcoal/8 bg-white"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 40vw, 200px"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-xs leading-snug text-charcoal transition-colors group-hover:text-maroon sm:text-sm">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-maroon">
                    {product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
