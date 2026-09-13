"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Thin progress bar at the top of the viewport while a client-side navigation
 * is in flight. Starts on internal link clicks, finishes when the URL changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setActive(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Route changed → navigation finished. Done during render (adjust-state-on-
  // prop-change pattern) rather than in an effect.
  const routeKey = `${pathname}?${search.toString()}`;
  const [lastRoute, setLastRoute] = useState(routeKey);
  if (routeKey !== lastRoute) {
    setLastRoute(routeKey);
    setActive(false);
  }

  useEffect(() => {
    if (!active) return;
    // Safety valve: never leave the bar stuck (e.g. navigation cancelled).
    const timer = window.setTimeout(() => setActive(false), 8000);
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className={`h-full bg-gold ${active ? "animate-nav-progress" : "w-0"}`} />
    </div>
  );
}
