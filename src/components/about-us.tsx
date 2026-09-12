import {
  Heart,
  Leaf,
  Palette,
  Ruler,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { aboutUsContent } from "@/lib/data";
import { images } from "@/lib/images";
import type { VoicesSectionContent } from "@/lib/voices";
import { VoicesOfWomania } from "@/components/voices-of-womania";

const highlightIcons = [Sparkles, Palette, Leaf, Ruler, Users];

type AboutUsContent = typeof aboutUsContent;

export function AboutUs({
  showHero = true,
  content = aboutUsContent,
  voices = null,
}: {
  showHero?: boolean;
  content?: AboutUsContent;
  voices?: VoicesSectionContent | null;
}) {
  const { welcome, story, philosophy, highlights, promise } = content;

  return (
    <div id="about">
      {!showHero && (
        <section className="border-b border-charcoal/8 bg-ivory pt-16 pb-8 lg:pt-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
              {welcome.eyebrow}
            </p>
            <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
              {welcome.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-warm-gray">
              {welcome.intro}
            </p>
          </div>
        </section>
      )}

      {showHero && (
        <section className="relative overflow-hidden bg-maroon py-20 text-ivory lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 32px), repeating-linear-gradient(0deg, #faf7f2 0, #faf7f2 1px, transparent 1px, transparent 32px)",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-4 text-xs tracking-[0.35em] text-gold-light uppercase">
              {welcome.eyebrow}
            </p>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {welcome.title}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ivory/85 sm:text-lg">
              {welcome.intro}
            </p>
            <div className="mx-auto mt-10 h-px w-16 bg-gold" />
          </div>
        </section>
      )}

      {/* Founder & story */}
      <section id="story" className="bg-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-charcoal/8 bg-white shadow-[0_24px_48px_-20px_rgba(107,30,46,0.28)]">
                <Image
                  src={images.founder}
                  alt="Dola Guha Neogi Roy at the Womania by Dola design studio"
                  fill
                  className="object-contain object-center p-1"
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  priority={showHero}
                />
              </div>
              <div className="absolute -bottom-4 -right-4 hidden h-24 w-24 border border-gold/40 bg-gold/10 lg:block" />
              <div className="absolute -top-4 -left-4 hidden h-16 w-16 border border-maroon/20 lg:block" />
            </div>

            <div className="lg:pl-4">
              <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
                Our Story
              </p>
              <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
                {story.title}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-charcoal/80">
                {story.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-charcoal/8 bg-white p-6 shadow-sm lg:p-8">
                <p className="text-[10px] tracking-[0.25em] text-gold uppercase">
                  The Woman Behind Womania
                </p>
                <p className="mt-2 font-serif text-xl text-maroon">
                  {story.founderName}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-warm-gray">
                  {story.founderBio}
                </p>
                <blockquote className="mt-6 border-l-2 border-gold pl-4">
                  <p className="font-serif text-lg italic text-maroon">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-y border-charcoal/8 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
            <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
              What We Believe
            </p>
            <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
              {philosophy.title}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-warm-gray">
              {philosophy.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {philosophy.fabrics.map((fabric, index) => (
              <div
                key={fabric.name}
                className="group relative overflow-hidden rounded-2xl border border-charcoal/8 bg-ivory p-6 text-center transition-colors hover:border-maroon/20 lg:p-8"
              >
                <span className="font-serif text-5xl text-maroon/10">
                  0{index + 1}
                </span>
                <h3 className="mt-2 font-serif text-2xl text-maroon">
                  {fabric.name}
                </h3>
                <p className="mt-2 text-sm text-warm-gray">{fabric.note}</p>
                <div className="mx-auto mt-4 h-0.5 w-8 origin-center scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-ivory py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-xl lg:mb-16">
            <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
              Why Womania
            </p>
            <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
              What Makes Womania Special
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = highlightIcons[index] ?? Heart;
              const isWide = index === highlights.length - 1;

              return (
                <article
                  key={item.title}
                  className={`group rounded-2xl border border-charcoal/8 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-maroon/15 hover:shadow-[0_20px_48px_-20px_rgba(107,30,46,0.18)] lg:p-8 ${
                    isWide ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-maroon/15 bg-maroon/5 text-maroon transition-colors group-hover:bg-maroon group-hover:text-ivory">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl text-charcoal">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-warm-gray">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {voices && voices.items.length > 0 ? (
        <VoicesOfWomania content={voices} />
      ) : null}

      {/* Promise */}
      <section className="relative overflow-hidden bg-charcoal py-16 text-ivory lg:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-maroon/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Heart className="mx-auto h-8 w-8 text-gold" strokeWidth={1.5} />
          <h2 className="mt-6 font-serif text-3xl sm:text-4xl">
            {promise.title}
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ivory/80">
            {promise.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/category/gamcha"
              className="inline-flex min-h-[48px] items-center justify-center bg-gold px-8 py-3 text-[11px] font-semibold tracking-[0.18em] text-charcoal uppercase transition-colors hover:bg-gold-light"
            >
              Explore Gamcha
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-[48px] items-center justify-center border border-ivory/25 px-8 py-3 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:border-gold hover:text-gold"
            >
              Shop the Collection
            </Link>
            {voices && voices.items.length > 0 ? (
              <Link
                href="#voices"
                className="inline-flex min-h-[48px] items-center justify-center border border-ivory/25 px-8 py-3 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:border-gold hover:text-gold"
              >
                See Voices
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
