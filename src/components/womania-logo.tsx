import Image from "next/image";
import Link from "next/link";

/** Official Womania logo — use this asset only; do not replace with redrawn SVG or altered artwork. */
export const WOMANIA_LOGO_PATH = "/womania-logo.png";
export const WOMANIA_LOGO_WIDTH = 224;
export const WOMANIA_LOGO_HEIGHT = 90;

/** Default display height classes for header / footer */
export const WOMANIA_LOGO_CLASS =
  "h-14 w-auto transition-opacity duration-300 group-hover:opacity-90 sm:h-16 lg:h-[4.75rem]";

export function WomaniaLogo({
  className = "",
  src = WOMANIA_LOGO_PATH,
}: {
  className?: string;
  src?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Womania — Home"
      className={`group inline-block ${className}`}
    >
      <Image
        src={src}
        alt="Womania — Where tradition meets modernity"
        width={WOMANIA_LOGO_WIDTH}
        height={WOMANIA_LOGO_HEIGHT}
        className={WOMANIA_LOGO_CLASS}
        priority
      />
    </Link>
  );
}
