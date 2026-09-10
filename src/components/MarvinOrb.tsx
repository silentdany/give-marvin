"use client";

import { EYE_L_PATH, EYE_R_PATH, ORB_BEVEL, ORB_INK, SLIT_PATH } from "@/lib/marvin/orb-svg";
import { cn } from "@/lib/utils";

/**
 * The logo.
 *
 * One matte sphere with a thin slit carved across it and two mint triangles
 * hanging off that slit — the left one large, the right one small and squeezed
 * by the curve of the ball. It turns slowly; as the face comes back round the
 * triangles retract into the bare slit (an ordinary bot, before it knows) and
 * then hang open again. CSS keyframes only: no library, no Lottie, no runtime.
 *
 * If `public/marvin-orb.webp` exists, that file is used instead and this
 * drawing never renders — see `__ORB_ASSET__` in `vite.config.ts`. The frozen
 * geometry for the favicon and the OG card lives in `@/lib/marvin/orb-svg`.
 */

export type OrbVariant =
  | "spin" /* the normal state: turning, morphing, tired */
  | "reverse" /* he reposted. it turns the wrong way. */
  | "whole" /* he accepted. nothing moves, the face is complete. */
  | "cracked" /* he said no. the crack is the exhibit. */
  | "still"; /* he liked it. nothing moves any more. */

let seq = 0;

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

  // Your own render, if you dropped one in. Nothing below it runs.
  if (__ORB_ASSET__) {
    return (
      <img
        src={__ORB_ASSET__}
        alt={title}
        width={size}
        height={size}
        className={cn("orb orb-asset block", className)}
        data-variant={variant}
        style={{ width: size, height: size }}
      />
    );
  }

  const uid = `orb${(seq = (seq + 1) % 1000)}`;

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
      <defs>
        <radialGradient id={`${uid}-shell`} cx="34%" cy="28%" r="82%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="52%" stopColor="#f1f1ee" />
          <stop offset="100%" stopColor="#d8d8d2" />
        </radialGradient>
        <linearGradient id={`${uid}-eye`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-phosphor, #2fd39b)" />
          <stop offset="100%" stopColor="#22c38d" />
        </linearGradient>
      </defs>

      <circle cx={100} cy={100} r={88} fill={`url(#${uid}-shell)`} />

      {variant === "cracked" ? (
        <path
          d="M 100 13 L 91 62 L 109 98 L 87 142 L 100 187"
          stroke={ORB_INK}
          strokeWidth={3}
          strokeOpacity={0.5}
          fill="none"
          strokeLinejoin="round"
        />
      ) : null}

      <g className={animated ? "orb-face" : undefined}>
        {/* the two cuts, and the light coming through them */}
        <g className={animated ? "orb-lid orb-lid-l" : undefined}>
          <path
            d={EYE_L_PATH}
            fill="none"
            stroke={ORB_BEVEL}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <path d={EYE_L_PATH} fill={`url(#${uid}-eye)`} />
        </g>
        <g className={animated ? "orb-lid orb-lid-r" : undefined}>
          <path
            d={EYE_R_PATH}
            fill="none"
            stroke={ORB_BEVEL}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <path d={EYE_R_PATH} fill={`url(#${uid}-eye)`} />
        </g>
        {/* the slit itself, always. it is the only thing he keeps. */}
        <path d={SLIT_PATH} stroke={ORB_INK} strokeWidth={4.2} strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

export default MarvinOrb;
