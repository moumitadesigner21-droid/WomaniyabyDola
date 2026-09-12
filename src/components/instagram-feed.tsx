import Image from "next/image";
import Link from "next/link";
import { instagramPosts } from "@/lib/data";

export function InstagramFeed() {
  return (
    <section id="instagram" className="py-16 lg:py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 lg:mb-14">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
            Community
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-maroon mb-4">
            #WomaniaQueens
          </h2>
          <p className="text-warm-gray max-w-md mx-auto">
            Timeless styles, modern spirit. See how our queens drape their
            heritage.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {instagramPosts.map((src, i) => (
            <Link
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden"
            >
              <Image
                src={src}
                alt={`Womania Queen ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 16vw"
              />
              <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/30 transition-colors flex items-center justify-center">
                <span className="text-ivory text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-maroon text-maroon text-sm tracking-widest uppercase hover:bg-maroon hover:text-ivory transition-colors"
          >
            Follow @womaniabydola
          </Link>
        </div>
      </div>
    </section>
  );
}
