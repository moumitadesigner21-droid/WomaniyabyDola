import { BadgeCheck, CreditCard, MessageCircle, RotateCcw, Truck } from "lucide-react";

/**
 * Slim benefits strip under the hero. Text comes from the store's shipping and
 * contact settings so it stays truthful when the owner changes them.
 */
export function TrustBenefits({
  freeShippingThreshold,
  paymentsEnabled,
  deliveryZones,
  returnsDays = 7,
}: {
  freeShippingThreshold: number | null;
  paymentsEnabled: boolean;
  deliveryZones?: string;
  returnsDays?: number;
}) {
  const items = [
    {
      icon: BadgeCheck,
      title: "Handcrafted in Jalpaiguri",
      note: "Handloom & heritage weaves, made in small batches",
    },
    {
      icon: Truck,
      title: freeShippingThreshold
        ? `Free shipping above ₹${freeShippingThreshold.toLocaleString("en-IN")}`
        : `${deliveryZones || "Pan-India"} delivery`,
      note: freeShippingThreshold ? `${deliveryZones || "Pan-India"} delivery` : "Carefully packed & tracked",
    },
    ...(paymentsEnabled
      ? [{ icon: CreditCard, title: "Secure card payments", note: "Pay safely through Cashfree" }]
      : []),
    {
      icon: RotateCcw,
      title: `${returnsDays}-day easy returns`,
      note: "On unused items in original condition",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp support",
      note: "Sizing help, custom fits & order updates",
    },
  ];

  return (
    <section aria-label="Why shop with us" className="border-b border-charcoal/8 bg-white">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 divide-charcoal/8 px-4 sm:px-6 md:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:px-8">
        {items.map(({ icon: Icon, title, note }) => (
          <li key={title} className="flex items-start gap-3 px-2 py-5 lg:justify-center lg:px-6 lg:py-6">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon/[0.06] text-maroon">
              <Icon className="h-4 w-4" strokeWidth={1.6} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium leading-snug text-charcoal">{title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-warm-gray">{note}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
