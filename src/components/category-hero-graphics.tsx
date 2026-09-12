import type { CategorySlug } from "@/lib/categories";

const graphicShellClass =
  "pointer-events-none absolute inset-y-0 left-0 w-[min(72%,22rem)] animate-saree-sway sm:w-[min(68%,26rem)] lg:w-[min(58%,32rem)]";

function GraphicFrame({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden className={graphicShellClass}>
      <svg
        viewBox="0 0 420 720"
        preserveAspectRatio="xMinYMid slice"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>
    </div>
  );
}

export function SareeHeroGraphic() {
  return (
    <GraphicFrame>
      <defs>
        <linearGradient id="saree-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#faf7f2" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#e8d48b" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#faf7f2" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="saree-fold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#faf7f2" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#faf7f2" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path
        d="M-20 0 C120 40, 180 120, 150 220 S80 380, 120 520 S220 640, 280 720 L-30 720 Z"
        fill="url(#saree-sheen)"
      />
      <path
        d="M0 80 C90 110, 130 200, 110 310 S60 470, 95 620 S150 700, 210 720 L0 720 Z"
        fill="url(#saree-fold)"
        opacity="0.85"
      />
      <path
        d="M35 0 C70 90, 55 180, 85 270 S110 400, 75 510 S40 630, 95 720"
        stroke="#faf7f2"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M75 0 C105 100, 90 210, 120 300 S145 430, 110 540 S80 660, 140 720"
        stroke="#faf7f2"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
      <path
        d="M115 20 C140 120, 125 230, 155 320 S175 450, 145 560 S115 670, 175 720"
        stroke="#e8d48b"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
      <path
        d="M145 0 C185 80, 170 170, 200 260 S225 390, 190 500 S165 610, 220 720"
        stroke="#e8d48b"
        strokeOpacity="0.28"
        strokeWidth="2.5"
      />
    </GraphicFrame>
  );
}

export function GamchaHeroGraphic() {
  return (
    <GraphicFrame>
      <rect x="20" y="60" width="90" height="90" fill="#faf7f2" fillOpacity="0.08" />
      <rect x="120" y="60" width="90" height="90" fill="#e8d48b" fillOpacity="0.12" />
      <rect x="220" y="60" width="90" height="90" fill="#faf7f2" fillOpacity="0.06" />
      <rect x="70" y="160" width="90" height="90" fill="#e8d48b" fillOpacity="0.1" />
      <rect x="170" y="160" width="90" height="90" fill="#faf7f2" fillOpacity="0.08" />
      <rect x="30" y="260" width="90" height="90" fill="#faf7f2" fillOpacity="0.07" />
      <rect x="130" y="260" width="90" height="90" fill="#e8d48b" fillOpacity="0.14" />
      <rect x="230" y="260" width="90" height="90" fill="#faf7f2" fillOpacity="0.05" />
      <path
        d="M15 380 C80 410, 140 470, 120 560 S70 650, 110 720"
        stroke="#faf7f2"
        strokeOpacity="0.16"
        strokeWidth="2"
      />
      <path
        d="M55 400 C120 430, 180 500, 160 590 S110 680, 150 720"
        stroke="#e8d48b"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      <path
        d="M0 120 H300 M0 210 H300 M0 300 H300"
        stroke="#faf7f2"
        strokeOpacity="0.06"
      />
      <path
        d="M20 60 V350 M110 60 V350 M200 60 V350 M290 60 V350"
        stroke="#faf7f2"
        strokeOpacity="0.06"
      />
    </GraphicFrame>
  );
}

export function OutfitsHeroGraphic() {
  return (
    <GraphicFrame>
      <path
        d="M150 80 C120 120, 95 180, 100 260 S115 420, 95 560 S80 660, 120 720 L220 720 C250 660, 235 560, 255 420 S240 180, 210 80 Z"
        fill="#faf7f2"
        fillOpacity="0.08"
      />
      <path
        d="M150 80 L185 140 L235 120 L210 80 Z"
        fill="#e8d48b"
        fillOpacity="0.14"
      />
      <path
        d="M130 200 H240 M125 290 H245 M120 380 H250 M115 470 H255"
        stroke="#faf7f2"
        strokeOpacity="0.12"
      />
      <path
        d="M95 260 C70 300, 60 360, 75 420 S110 520, 90 620"
        stroke="#e8d48b"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M275 260 C300 300, 310 360, 295 420 S260 520, 280 620"
        stroke="#e8d48b"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <circle cx="185" cy="155" r="28" stroke="#faf7f2" strokeOpacity="0.15" />
    </GraphicFrame>
  );
}

export function SkirtsHeroGraphic() {
  return (
    <GraphicFrame>
      <path
        d="M180 90 C120 180, 80 320, 90 480 S130 640, 170 720 L250 720 C290 640, 330 480, 320 320 S280 180, 220 90 Z"
        fill="#faf7f2"
        fillOpacity="0.09"
      />
      <path
        d="M180 90 C150 200, 130 340, 140 500 S165 640, 190 720"
        stroke="#e8d48b"
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      <path
        d="M220 90 C250 200, 270 340, 260 500 S235 640, 210 720"
        stroke="#faf7f2"
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />
      <ellipse
        cx="200"
        cy="500"
        rx="120"
        ry="28"
        stroke="#faf7f2"
        strokeOpacity="0.1"
      />
      <path
        d="M70 360 C120 390, 170 410, 230 400 S310 360, 360 330"
        stroke="#e8d48b"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
    </GraphicFrame>
  );
}

export function ShrugHeroGraphic() {
  return (
    <GraphicFrame>
      <path
        d="M120 180 C90 220, 70 300, 75 400 S85 560, 70 650 L95 650 C110 560, 105 420, 115 320 S135 230, 160 190 Z"
        fill="#faf7f2"
        fillOpacity="0.08"
      />
      <path
        d="M300 180 C330 220, 350 300, 345 400 S335 560, 350 650 L325 650 C310 560, 315 420, 305 320 S285 230, 260 190 Z"
        fill="#faf7f2"
        fillOpacity="0.08"
      />
      <path
        d="M160 190 C200 170, 240 165, 280 170 C300 175, 315 185, 320 200 C300 210, 260 215, 220 215 C180 215, 150 205, 140 195 Z"
        fill="#e8d48b"
        fillOpacity="0.14"
      />
      <path
        d="M145 250 C180 270, 220 280, 260 275 C285 270, 305 255, 310 240"
        stroke="#faf7f2"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
      <path
        d="M150 340 C190 360, 230 368, 270 360"
        stroke="#e8d48b"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <path
        d="M155 430 C195 450, 235 458, 275 450"
        stroke="#faf7f2"
        strokeOpacity="0.12"
        strokeWidth="1.5"
      />
    </GraphicFrame>
  );
}

export function JamdaniHeroGraphic() {
  return (
    <GraphicFrame>
      <circle cx="90" cy="120" r="18" fill="#e8d48b" fillOpacity="0.16" />
      <circle cx="170" cy="90" r="14" fill="#faf7f2" fillOpacity="0.1" />
      <circle cx="250" cy="130" r="20" fill="#e8d48b" fillOpacity="0.12" />
      <circle cx="120" cy="220" r="16" fill="#faf7f2" fillOpacity="0.08" />
      <circle cx="210" cy="210" r="22" fill="#e8d48b" fillOpacity="0.14" />
      <circle cx="80" cy="320" r="15" fill="#faf7f2" fillOpacity="0.09" />
      <circle cx="160" cy="300" r="18" fill="#e8d48b" fillOpacity="0.11" />
      <circle cx="240" cy="330" r="17" fill="#faf7f2" fillOpacity="0.08" />
      <circle cx="130" cy="420" r="20" fill="#e8d48b" fillOpacity="0.13" />
      <circle cx="220" cy="440" r="16" fill="#faf7f2" fillOpacity="0.1" />
      <path
        d="M40 520 C100 500, 160 540, 220 520 S300 480, 340 510"
        stroke="#e8d48b"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M30 600 C90 580, 150 620, 210 600 S290 560, 330 590"
        stroke="#faf7f2"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
      <path
        d="M50 180 L50 680 M130 150 L130 680 M210 170 L210 680 M290 200 L290 680"
        stroke="#faf7f2"
        strokeOpacity="0.05"
      />
    </GraphicFrame>
  );
}

export function MekhlaChadorHeroGraphic() {
  return (
    <GraphicFrame>
      <path
        d="M70 80 L110 80 C125 200, 120 380, 105 560 S90 660, 85 720 L55 720 C60 640, 75 460, 70 280 S65 160, 70 80 Z"
        fill="#faf7f2"
        fillOpacity="0.1"
      />
      <path
        d="M200 100 L250 100 C270 240, 265 420, 245 580 S225 660, 220 720 L185 720 C190 640, 210 460, 205 280 S195 160, 200 100 Z"
        fill="#e8d48b"
        fillOpacity="0.12"
      />
      <path
        d="M85 140 C95 280, 90 440, 80 600"
        stroke="#e8d48b"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <path
        d="M215 160 C225 300, 220 460, 210 620"
        stroke="#faf7f2"
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />
      <path
        d="M110 80 C140 120, 160 180, 155 250"
        stroke="#faf7f2"
        strokeOpacity="0.14"
        strokeWidth="2"
      />
      <path
        d="M250 100 C280 140, 300 200, 295 270"
        stroke="#e8d48b"
        strokeOpacity="0.18"
        strokeWidth="2"
      />
    </GraphicFrame>
  );
}

export function DupattasHeroGraphic() {
  return (
    <GraphicFrame>
      <path
        d="M130 40 C150 180, 145 360, 155 520 S165 640, 175 720 L205 720 C215 640, 225 520, 215 360 S205 180, 185 40 Z"
        fill="#faf7f2"
        fillOpacity="0.1"
      />
      <path
        d="M145 40 C165 180, 160 360, 170 520 S180 640, 190 720"
        stroke="#e8d48b"
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      <path
        d="M165 40 C185 180, 180 360, 190 520 S200 640, 210 720"
        stroke="#faf7f2"
        strokeOpacity="0.12"
        strokeWidth="1.5"
      />
      <path
        d="M125 120 C200 140, 240 200, 230 280 S180 360, 120 400"
        stroke="#e8d48b"
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />
      <path
        d="M120 500 C190 520, 235 580, 225 660"
        stroke="#faf7f2"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
      <path
        d="M170 700 L175 720 M185 700 L190 720 M200 700 L205 720"
        stroke="#e8d48b"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
    </GraphicFrame>
  );
}

export function CottonStolesHeroGraphic() {
  return (
    <GraphicFrame>
      <rect
        x="40"
        y="280"
        width="280"
        height="90"
        rx="4"
        fill="#faf7f2"
        fillOpacity="0.09"
      />
      <path
        d="M40 300 H320 M40 330 H320 M40 360 H320"
        stroke="#faf7f2"
        strokeOpacity="0.12"
      />
      <path
        d="M40 280 C80 260, 120 255, 160 260 S240 270, 320 280"
        stroke="#e8d48b"
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      <path
        d="M40 370 C80 390, 120 395, 160 390 S240 380, 320 370"
        stroke="#e8d48b"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M55 370 V410 M75 370 V415 M95 370 V410 M115 370 V415 M135 370 V410"
        stroke="#faf7f2"
        strokeOpacity="0.18"
        strokeWidth="1.5"
      />
      <path
        d="M55 280 V240 M75 280 V235 M95 280 V240 M115 280 V235 M135 280 V240"
        stroke="#faf7f2"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
      <path
        d="M60 500 C120 480, 180 490, 240 500 S300 520, 330 510"
        stroke="#e8d48b"
        strokeOpacity="0.15"
        strokeWidth="2"
      />
    </GraphicFrame>
  );
}

export function ShopHeroGraphic() {
  return (
    <GraphicFrame>
      <path
        d="M60 200 C120 160, 200 150, 280 170 S340 220, 300 280 S220 320, 160 300 S80 260, 60 200 Z"
        fill="#faf7f2"
        fillOpacity="0.08"
      />
      <path
        d="M80 360 C140 320, 220 310, 290 330 S350 380, 310 440 S230 480, 170 460 S90 420, 80 360 Z"
        fill="#e8d48b"
        fillOpacity="0.1"
      />
      <path
        d="M100 520 C160 480, 240 470, 300 490 S340 530, 300 580 S220 620, 160 600 S100 560, 100 520 Z"
        fill="#faf7f2"
        fillOpacity="0.07"
      />
      <path
        d="M120 200 C180 240, 220 300, 210 380 S170 460, 130 540"
        stroke="#e8d48b"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M260 200 C200 240, 160 300, 170 380 S210 460, 250 540"
        stroke="#faf7f2"
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />
    </GraphicFrame>
  );
}

export type CategoryHeroGraphicKey = CategorySlug | "shop";

export function CategoryHeroGraphic({
  category,
}: {
  category: CategoryHeroGraphicKey;
}) {
  switch (category) {
    case "sarees":
      return <SareeHeroGraphic />;
    case "gamcha":
      return <GamchaHeroGraphic />;
    case "outfits":
      return <OutfitsHeroGraphic />;
    case "skirts-wrappers":
      return <SkirtsHeroGraphic />;
    case "shrug":
      return <ShrugHeroGraphic />;
    case "jamdani":
      return <JamdaniHeroGraphic />;
    case "mekhla-chador":
      return <MekhlaChadorHeroGraphic />;
    case "dupattas":
      return <DupattasHeroGraphic />;
    case "cotton-stoles":
      return <CottonStolesHeroGraphic />;
    case "shop":
      return <ShopHeroGraphic />;
    default:
      return null;
  }
}
