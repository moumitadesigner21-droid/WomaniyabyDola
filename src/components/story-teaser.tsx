"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AboutUsContent } from "@/lib/cms/content-schemas";
import { images } from "@/lib/images";

const ease = [0.22, 1, 0.36, 1] as const;

/** Founder / brand story teaser pulled from the About Us content. */
export function StoryTeaser({
  content,
  image = images.founder,
}: {
  content: AboutUsContent;
  image?: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const { story, welcome } = content;
  const paragraph = story.paragraphs[0] ?? welcome.intro;

  return (
    <section id="story" className="relative overflow-hidden bg-ivory py-16 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(232,212,139,0.16) 0%, transparent 42%), radial-gradient(circle at 10% 90%, rgba(107,30,46,0.05) 0%, transparent 40%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute inset-0 translate-x-4 translate-y-4 border-2 border-gold/50"
            style={{ borderRadius: "6rem 1.5rem 1.5rem 1.5rem" }}
          />
          <div
            className="relative aspect-[4/5] overflow-hidden bg-charcoal/5 shadow-[0_32px_64px_-24px_rgba(107,30,46,0.25)]"
            style={{ borderRadius: "6rem 1.5rem 1.5rem 1.5rem" }}
          >
            <Image
              src={image}
              alt={story.founderName ? `${story.founderName}, founder of Womania by Dola` : "Womania by Dola founder"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 40vw"
            />
          </div>
          {story.founderName ? (
            <div className="absolute -bottom-5 right-2 border border-gold/40 bg-ivory px-4 py-2.5 shadow-[0_12px_32px_-12px_rgba(107,30,46,0.35)] lg:right-6">
              <span className="block text-[10px] tracking-[0.2em] text-gold uppercase">Founder</span>
              <span className="block font-serif text-base text-charcoal">{story.founderName}</span>
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          <p className="text-[10px] tracking-[0.28em] text-gold uppercase">Our Story</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-maroon sm:text-4xl lg:text-5xl">
            {story.title || welcome.title}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-charcoal/80">{paragraph}</p>
          {story.quote ? (
            <blockquote className="mt-8 border-l-2 border-gold pl-5 font-serif text-xl italic leading-relaxed text-charcoal sm:text-2xl">
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          ) : null}
          <Link
            href="/about-us"
            className="mt-8 inline-flex items-center gap-2 border border-maroon bg-maroon px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition-colors hover:bg-maroon-dark"
          >
            Read our story
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
