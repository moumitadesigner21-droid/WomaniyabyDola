export function TrustStrip() {
  const items = [
    "Secure Checkout",
    "Easy Returns",
    "Pan-India Delivery",
    "WhatsApp Support",
  ];

  return (
    <section className="border-y border-maroon/10 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-center justify-center gap-2 text-sm text-charcoal"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
              <span className="tracking-wide">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
