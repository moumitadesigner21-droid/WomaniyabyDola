import Link from "next/link";
import { ArrowUpRight, Package, ShieldCheck, Truck } from "lucide-react";
import { howWeWorkSteps as defaultSteps } from "@/lib/data";

const icons = [Package, ShieldCheck, Truck];

export function HowWeWork({
  steps = defaultSteps,
}: {
  steps?: readonly { step: string; title: string; description: string; href: string }[];
}) {
  return (
    <section className="border-y border-charcoal/8 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center lg:mb-16">
          <p className="mb-3 text-xs tracking-[0.3em] text-gold uppercase">
            How We Work
          </p>
          <h2 className="font-serif text-3xl text-maroon sm:text-4xl">
            Elegance at your doorstep
          </h2>
          <p className="mt-4 text-base leading-relaxed text-warm-gray">
            Discover how Womania brings elegance to your doorstep with a seamless
            shopping experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
          {steps.map((step, index) => {
            const Icon = icons[index] ?? Package;

            return (
              <article
                key={step.step}
                className="group border border-charcoal/8 bg-ivory/50 p-6 transition-colors hover:border-maroon/20 hover:bg-ivory lg:p-8"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-serif text-3xl text-maroon/20">
                    {step.step}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-maroon/15 bg-white text-maroon transition-colors group-hover:border-maroon group-hover:bg-maroon group-hover:text-ivory">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="font-serif text-xl text-charcoal">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-warm-gray">
                  {step.description}
                </p>
                <Link
                  href={step.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] text-maroon uppercase transition-colors hover:text-gold"
                >
                  Read more
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
