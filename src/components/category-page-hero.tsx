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
}

export function CategoryPageHero({
  category,
  eyebrow,
  title,
  description,
}: CategoryPageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-maroon py-16 text-ivory lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 32px), repeating-linear-gradient(0deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 32px)",
        }}
      />

      <CategoryHeroGraphic category={category} />

      <div className="relative z-10 mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:justify-end lg:px-8">
        <div className="max-w-xl text-center lg:mr-[4%] lg:text-left xl:mr-[8%]">
          <p className="mb-4 text-xs tracking-[0.35em] text-gold-light uppercase">
            {eyebrow}
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ivory/85 sm:text-lg">
            {description}
          </p>
          <div className="mx-auto mt-10 h-px w-16 bg-gold lg:mx-0" />
        </div>
      </div>
    </section>
  );
}

export type { CategorySlug };
