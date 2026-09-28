import { cn } from "@/lib/utils";
import type { GarmentKind } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Colour helpers                                                      */
/* ------------------------------------------------------------------ */

function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function shade(hex?: string | null, amount = 0) {
  const safeHex = hex && typeof hex === "string" && hex.trim().length > 0 ? hex.trim() : "#627264";
  const m = safeHex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const f = (v: number) => clamp255(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount));
  return `#${[f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/* ------------------------------------------------------------------ */
/* Silhouettes — flat, modern, brand-consistent                        */
/* ------------------------------------------------------------------ */

function Body({ kind, fill, dark, light }: { kind: GarmentKind; fill: string; dark: string; light: string }) {
  const stroke = dark;
  const common = { fill, stroke, strokeWidth: 2.5, strokeLinejoin: "round" as const };

  switch (kind) {
    case "tshirt":
    case "top":
    case "shirt":
    case "hoodie":
    case "jacket": {
      const crop = kind === "top";
      const bodyBottom = crop ? 250 : 340;
      return (
        <g>
          {/* sleeves */}
          <path d="M96 118 L58 170 L88 194 L112 152 Z" {...common} />
          <path d="M204 118 L242 170 L212 194 L188 152 Z" {...common} />
          {/* body */}
          <path
            d={`M112 110 Q150 128 188 110 L212 122 L212 ${bodyBottom} Q150 ${bodyBottom + 12} 88 ${bodyBottom} L88 122 Z`}
            {...common}
          />
          {/* neckline */}
          <path d="M120 110 Q150 142 180 110" fill="none" stroke={dark} strokeWidth="3" />
          {kind === "shirt" && (
            <>
              <path d="M150 124 L150 336" stroke={light} strokeWidth="2" opacity="0.7" />
              <g fill={light} opacity="0.75">
                {[150, 186, 222, 258, 294].map((y) => (
                  <circle key={y} cx="150" cy={y} r="3" />
                ))}
              </g>
              <path d="M120 110 L150 142 L136 108 Z" fill={light} opacity="0.55" />
              <path d="M180 110 L150 142 L164 108 Z" fill={light} opacity="0.55" />
            </>
          )}
          {kind === "hoodie" && (
            <>
              <path d="M118 112 Q150 66 182 112 Q150 132 118 112 Z" {...common} />
              <path d="M142 150 L142 250 L158 250 L158 150 Z" fill={light} opacity="0.5" />
              <path d="M116 250 L184 250 L184 296 L116 296 Z" fill={light} opacity="0.3" />
            </>
          )}
          {kind === "jacket" && (
            <>
              <path d="M150 128 L150 338" stroke={light} strokeWidth="3" />
              <path d="M120 110 L150 130 L136 106 Z" fill={light} opacity="0.5" />
              <path d="M180 110 L150 130 L164 106 Z" fill={light} opacity="0.5" />
              <rect x="90" y="240" width="26" height="40" rx="8" fill={light} opacity="0.35" />
              <rect x="184" y="240" width="26" height="40" rx="8" fill={light} opacity="0.35" />
            </>
          )}
        </g>
      );
    }
    case "dress":
      return (
        <g>
          <path d="M104 118 L64 168 L92 192 L118 150 Z" {...common} />
          <path d="M196 118 L236 168 L208 192 L182 150 Z" {...common} />
          <path
            d="M118 112 Q150 132 182 112 L196 124 L206 210 L246 340 Q150 366 54 340 L94 210 L104 124 Z"
            {...common}
          />
          <path d="M124 112 Q150 146 176 112" fill="none" stroke={dark} strokeWidth="3" />
          <path d="M96 214 L204 214 L246 340 Q150 366 54 340 Z" fill={light} opacity="0.28" />
        </g>
      );
    case "jeans":
    case "trousers":
    case "shorts": {
      const bottom = kind === "shorts" ? 250 : 342;
      return (
        <g>
          <path
            d={`M100 108 L200 108 L206 ${bottom} L158 ${bottom} L150 190 L142 ${bottom} L94 ${bottom} Z`}
            {...common}
          />
          <rect x="100" y="100" width="100" height="22" rx="6" {...common} />
          {kind === "jeans" && (
            <>
              <path d="M150 122 L150 190" stroke={light} strokeWidth="2.5" />
              <circle cx="128" cy="140" r="6" fill={light} opacity="0.6" />
              <path d="M104 176 L146 176" stroke={light} strokeWidth="2" opacity="0.5" />
            </>
          )}
          {kind === "trousers" && <path d="M150 122 L150 342" stroke={light} strokeWidth="2.5" opacity="0.8" />}
        </g>
      );
    }
    case "skirt":
      return (
        <g>
          <path d="M100 118 L200 118 L246 322 Q150 352 54 322 Z" {...common} />
          <rect x="100" y="110" width="100" height="20" rx="6" {...common} />
          <path d="M126 130 L110 320 M150 130 L150 336 M174 130 L190 320" stroke={light} strokeWidth="2" opacity="0.5" fill="none" />
        </g>
      );
    case "sneaker":
      return (
        <g>
          <path
            d="M44 300 L44 250 Q44 232 66 232 L108 232 Q132 232 150 250 L214 268 Q252 278 252 300 Z"
            {...common}
          />
          <path d="M40 300 L256 300 Q260 320 240 322 L56 322 Q36 320 40 300 Z" fill={dark} />
          <path d="M100 240 Q120 262 150 258 M112 240 Q132 258 158 254" stroke={light} strokeWidth="3" fill="none" opacity="0.75" />
          <path d="M150 250 L214 268" stroke={light} strokeWidth="2.5" fill="none" opacity="0.6" />
        </g>
      );
    case "heel":
      return (
        <g>
          <path d="M78 226 Q150 210 214 250 Q246 268 240 300 L150 300 Q92 296 78 268 Z" {...common} />
          <path d="M228 296 L236 336 L222 336 L216 296 Z" fill={dark} />
          <path d="M80 246 Q126 232 168 240" stroke={light} strokeWidth="3" fill="none" opacity="0.7" />
          <path d="M78 226 Q64 250 84 274" stroke={dark} strokeWidth="3" fill="none" />
        </g>
      );
    case "bag":
      return (
        <g>
          <path d="M110 200 Q150 130 190 200" fill="none" stroke={dark} strokeWidth="6" />
          <rect x="76" y="196" width="148" height="118" rx="16" {...common} />
          <rect x="76" y="196" width="148" height="34" rx="14" fill={light} opacity="0.35" />
          <rect x="132" y="238" width="36" height="26" rx="6" fill={light} opacity="0.8" />
        </g>
      );
    case "watch":
      return (
        <g>
          <rect x="126" y="86" width="48" height="80" rx="14" {...common} />
          <rect x="126" y="238" width="48" height="80" rx="14" {...common} />
          <circle cx="150" cy="202" r="58" {...common} />
          <circle cx="150" cy="202" r="44" fill={light} opacity="0.4" />
          <path d="M150 202 L150 174 M150 202 L172 214" stroke={dark} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "sunglasses":
      return (
        <g>
          <path d="M58 186 Q92 166 130 186 Q130 226 90 230 Q58 226 58 186 Z" {...common} />
          <path d="M242 186 Q208 166 170 186 Q170 226 210 230 Q242 226 242 186 Z" {...common} />
          <path d="M130 190 Q150 178 170 190" stroke={dark} strokeWidth="8" fill="none" />
          <path d="M58 186 L28 176 M242 186 L272 176" stroke={dark} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M70 190 Q92 178 118 192" stroke={light} strokeWidth="4" fill="none" opacity="0.6" />
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M74 224 Q74 138 150 138 Q226 138 226 224 Z" {...common} />
          <path d="M226 224 Q282 224 282 250 Q282 262 250 258 L226 244 Z" {...common} />
          <path d="M150 138 L150 224" stroke={light} strokeWidth="3" opacity="0.6" />
          <circle cx="150" cy="140" r="9" fill={light} />
        </g>
      );
    case "necklace":
      return (
        <g>
          <path d="M92 120 Q150 268 208 120" fill="none" stroke={dark} strokeWidth="6" strokeLinecap="round" />
          <path d="M108 128 Q150 240 192 128" fill="none" stroke={dark} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M150 244 L166 274 L150 304 L134 274 Z" {...common} />
          <circle cx="150" cy="244" r="8" fill={light} />
        </g>
      );
    case "belt":
      return (
        <g>
          <rect x="34" y="180" width="232" height="46" rx="10" {...common} />
          <rect x="30" y="168" width="58" height="70" rx="12" {...common} />
          <rect x="42" y="184" width="34" height="38" rx="6" fill={light} opacity="0.7" />
          <g fill={light} opacity="0.55">
            {[140, 168, 196, 224].map((x) => (
              <circle key={x} cx={x} cy="203" r="4" />
            ))}
          </g>
        </g>
      );
    default:
      return (
        <g>
          <rect x="84" y="120" width="132" height="180" rx="24" {...common} />
          <circle cx="150" cy="210" r="40" fill={light} opacity="0.4" />
        </g>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Public component                                                     */
/* ------------------------------------------------------------------ */

export function GarmentArt({
  kind,
  color = "#627264",
  seed = 1,
  className,
  label,
}: {
  kind: GarmentKind;
  color?: string | null;
  seed?: number;
  className?: string;
  label?: string;
}) {
  const safeColor = color && typeof color === "string" && color.trim().length > 0 ? color.trim() : "#627264";
  const dark = shade(safeColor, -0.4);
  const light = shade(safeColor, 0.35);
  const cleanHex = safeColor.replace("#", "");
  const uid = `${kind}-${cleanHex}-${seed}`;
  const tilt = (seed % 7) - 3;

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      aria-label={label ?? `${kind} illustration`}
      role="img"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 20% 0%, ${shade(safeColor, 0.86)}, ${shade(safeColor, 0.94)} 55%, var(--surface-muted))`,
        }}
      />
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: safeColor }}
      />
      <div
        className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full opacity-25 blur-2xl"
        style={{ background: shade(safeColor, 0.5) }}
      />
      <svg
        viewBox="0 0 300 400"
        className="relative h-[86%] w-[86%] drop-shadow-[0_18px_25px_rgba(0,0,0,0.18)] transition-transform duration-500 ease-out group-hover:scale-[1.04] group-hover:-rotate-1"
        style={{ transform: `rotate(${tilt * 0.4}deg)` }}
        data-uid={uid}
      >
        <defs>
          <linearGradient id={`g-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={light} stopOpacity="0.55" />
            <stop offset="45%" stopColor={safeColor} stopOpacity="0" />
            <stop offset="100%" stopColor={dark} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <Body kind={kind} fill={safeColor} dark={dark} light={light} />
        <rect x="0" y="0" width="300" height="400" fill={`url(#g-${uid})`} />
      </svg>
    </div>
  );
}
