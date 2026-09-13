import Image from "next/image";
import type { CategorySlug } from "@/lib/categories";
import {
  CategoryHeroGraphic,
  type CategoryHeroGraphicKey,
} from "@/components/category-hero-graphics";

interface CategoryPageHeroProps {
  category: CategoryHeroGraphicKey;
  eyebrow: string;
  title: string;
  description: string;
  /** Optional photo background; when empty the illustrated default is used. */
  image?: string | null;
  imagePosition?: string | null;
}

export function CategoryPageHero({
  category,
  eyebrow,
  title,
  description,
  image,
  imagePosition,
}: CategoryPageHeroProps) {
  const hasPhoto = Boolean(image);

  return (
    <section className="relative overflow-hidden bg-maroon py-16 text-ivory lg:py-24">
      {hasPhoto ? (
        <>
          <Image
            src={image!}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: imagePosition || "center center" }}
          />
          {/* Legibility: deep maroon from the text side, soft vignette elsewhere */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-maroon-dark/85 via-maroon-dark/55 to-maroon-dark/25 lg:bg-gradient-to-l lg:from-maroon-dark/90 lg:via-maroon-dark/60 lg:to-maroon-dark/15"
          />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 32px), repeating-linear-gradient(0deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 32px)",
            }}
          />
          <CategoryHeroGraphic category={category} />
        </>
      )}

      <div className="relative z-10 mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:justify-end lg:px-8">
        <div className="max-w-xl text-center lg:mr-[4%] lg:text-left xl:mr-[8%]">
          <p className="mb-4 text-xs tracking-[0.35em] text-gold-light uppercase">
            {eyebrow}
          </p>
          <h1 className={`font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl ${hasPhoto ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]" : ""}`}>
            {title}
          </h1>
          <p className={`mt-6 text-base leading-relaxed text-ivory/90 sm:text-lg ${hasPhoto ? "drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]" : ""}`}>
            {description}
          </p>
          <div className="mx-auto mt-10 h-px w-16 bg-gold lg:mx-0" />
        </div>
      </div>
    </section>
  );
}

export type { CategorySlug };
