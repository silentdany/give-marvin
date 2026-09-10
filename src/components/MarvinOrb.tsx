"use client";

import { cn } from "@/lib/utils";

/**
 * The logo. One orb, split down the middle: the left half is an ordinary bot
 * (calm white oval eye), the right half is Marvin (drooping green triangle
 * under a brow slit). Almost no difference. That is the joke.
 *
 * It rotates slowly and, as it comes back round, morphs the whole face into
 * Marvin — then back. CSS keyframes only: no library, no Lottie, no runtime.
 * The frozen split version lives in `@/lib/marvin/orb-svg` and is what the
 * favicon and the OG card use, since neither of those can animate.
 */

export type OrbVariant =
  | "spin" /* the normal state: rotating, morphing, tired */
  | "reverse" /* he reposted. it turns the wrong way. */
  | "whole" /* he accepted. no split left. */
  | "cracked" /* he said no. the crack is the exhibit. */
  | "still"; /* he liked it. nothing moves any more. */

const SHELL = "#f0f0ed";
const RING = "rgb(40 40 38 / 0.10)";
const EYE_CALM = "#ffffff";
const EYE_MARVIN = "var(--color-phosphor, #2fd39b)";
const BROW = "#2c2c2a";

function CalmEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={14.5}
      ry={25}
      fill={EYE_CALM}
      stroke={BROW}
      strokeOpacity={0.5}
      strokeWidth={4.5}
    />
  );
}

/** Brow slit plus the triangle hanging off it. The outer corner sits lower. */
function MarvinEye({ cx, cy, flip }: { cx: number; cy: number; flip?: boolean }) {
  const dir = flip ? -1 : 1;
  const x1 = cx - dir * 22;
  const y1 = cy - 8.5;
  const x2 = cx + dir * 22;
  const y2 = cy + 8.5;
  return (
    <g>
      <path d={`M ${x1} ${y1} L ${x2} ${y2} L ${cx + dir * 2.5} ${cy + 36} Z`} fill={EYE_MARVIN} />
      <path
        d={`M ${x1} ${y1} L ${x2} ${y2}`}
        stroke={BROW}
        strokeWidth={6.2}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

export function MarvinOrb({
  size = 96,
  variant = "spin",
  className,
  title = "Give Marvin",
}: {
  size?: number;
  variant?: OrbVariant;
  className?: string;
  title?: string;
}) {
  const animated = variant === "spin" || variant === "reverse";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("orb", className)}
      data-variant={variant}
    >
      <title>{title}</title>

      <circle cx={100} cy={100} r={94} fill={SHELL} stroke={RING} strokeWidth={2.4} />

      {variant === "cracked" ? (
        <>
          <path
            d="M 100 6 L 92 58 L 108 96 L 88 138 L 100 194"
            stroke={BROW}
            strokeWidth={3}
            strokeOpacity={0.55}
            fill="none"
            strokeLinejoin="round"
          />
          <MarvinEye cx={65} cy={104} flip />
          <MarvinEye cx={135} cy={104} />
        </>
      ) : variant === "whole" ? (
        <>
          <MarvinEye cx={65} cy={100} flip />
          <MarvinEye cx={135} cy={100} />
        </>
      ) : (
        <g className={animated ? "orb-face" : undefined}>
          {/* Left half: an ordinary bot. Fades out when the whole face goes Marvin. */}
          <g className={animated ? "orb-calm" : undefined}>
            <CalmEye cx={65} cy={105.5} />
          </g>
          {/* Right half: Marvin, always. The split is the whole gag. */}
          <MarvinEye cx={135} cy={100} />
          {/* The left eye going Marvin too: the morph, and the way back. */}
          <g className={animated ? "orb-full" : "orb-hidden"}>
            <MarvinEye cx={65} cy={100} flip />
          </g>
        </g>
      )}
    </svg>
  );
}

export default MarvinOrb;
