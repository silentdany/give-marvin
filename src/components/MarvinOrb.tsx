"use client";

import { useId } from "react";
import {
  EYE_L_HINGE,
  EYE_L_PATH,
  EYE_R_HINGE,
  EYE_R_PATH,
  ORB_GLINT,
  ORB_INK,
  ORB_MINT,
  ORB_MINT_DEEP,
  SLIT_PATH,
  faceTransform,
  orbStrokes,
} from "@/lib/marvin/orb-svg";
import { cn } from "@/lib/utils";

/**
 * The logo.
 *
 * A matte grey sphere with the face cut into the shell: one thin groove that
 * runs across it and kinks upward, and two triangular openings hanging under
 * it — the left one large, the right one small and pushed out near the limb,
 * because the ball is turned. Green light comes up through the cuts.
 *
 * It turns slowly, and as the face comes back round the cuts fold shut into
 * the bare groove — an ordinary bot, before it knows — then open again. CSS
 * keyframes only: no library, no Lottie, no runtime.
 *
 * If `public/marvin-orb.webp` exists, that file is used instead and none of
 * this renders — see `__ORB_ASSET__` in `vite.config.ts`.
 */

export type OrbVariant =
  | "spin" /* the normal state: turning, folding, tired */
  | "reverse" /* he reposted. it turns the wrong way. */
  | "whole" /* he accepted. nothing moves, the face is complete. */
  | "cracked" /* he said no. the crack is the exhibit. */
  | "still"; /* he liked it. nothing moves any more. */

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
  // useId, not a counter: the server and the client must agree on these.
  const uid = useId().replace(/:/g, "");
  const animated = variant === "spin" || variant === "reverse";
  const w = orbStrokes(size);

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

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("orb", className)}
      data-variant={variant}
      style={
        {
          "--orb-hinge-l": `${EYE_L_HINGE[0]}px ${EYE_L_HINGE[1]}px`,
          "--orb-hinge-r": `${EYE_R_HINGE[0]}px ${EYE_R_HINGE[1]}px`,
        } as React.CSSProperties
      }
    >
      <title>{title}</title>
      <defs>
        <radialGradient id={`${uid}-shell`} cx="38%" cy="26%" r="86%">
          <stop offset="0%" stopColor="#ececea" />
          <stop offset="55%" stopColor="#dadad7" />
          <stop offset="100%" stopColor="#c3c3bf" />
        </radialGradient>
        <linearGradient id={`${uid}-cut`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ORB_MINT} />
          <stop offset="100%" stopColor={ORB_MINT_DEEP} />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <clipPath id={`${uid}-ball`}>
          <circle cx={100} cy={100} r={88} />
        </clipPath>
      </defs>

      <circle cx={100} cy={100} r={88} fill={`url(#${uid}-shell)`} />

      {variant === "cracked" ? (
        <path
          d="M 100 13 L 91 62 L 109 98 L 87 142 L 100 187"
          stroke={ORB_INK}
          strokeWidth={Math.max(2.6, 1.8 / (size / 200))}
          strokeOpacity={0.45}
          fill="none"
          strokeLinejoin="round"
        />
      ) : null}

      {/* the face lives on the surface of the ball, and never leaves it */}
      <g clipPath={`url(#${uid}-ball)`}>
        <g className={animated ? "orb-face" : undefined}>
          <g transform={faceTransform(size)}>
            {/* the light spilling out of the cuts, onto the shell */}
            <g filter={`url(#${uid}-glow)`} opacity={0.55}>
              <path
                className={animated ? "orb-lid orb-lid-l" : undefined}
                d={EYE_L_PATH}
                fill={ORB_MINT}
              />
              <path
                className={animated ? "orb-lid orb-lid-r" : undefined}
                d={EYE_R_PATH}
                fill={ORB_MINT}
              />
            </g>

            {/* the chamfer, then the opening itself */}
            <g className={animated ? "orb-lid orb-lid-l" : undefined}>
              <path
                d={EYE_L_PATH}
                fill="none"
                stroke={ORB_GLINT}
                strokeWidth={w.chamferL}
                strokeLinejoin="round"
              />
              <path d={EYE_L_PATH} fill={`url(#${uid}-cut)`} />
            </g>
            <g className={animated ? "orb-lid orb-lid-r" : undefined}>
              <path
                d={EYE_R_PATH}
                fill="none"
                stroke={ORB_GLINT}
                strokeWidth={w.chamferR}
                strokeLinejoin="round"
              />
              <path d={EYE_R_PATH} fill={`url(#${uid}-cut)`} />
            </g>

            {/* the groove, always. it is the only thing he keeps. */}
            <path
              d={SLIT_PATH}
              stroke={ORB_INK}
              strokeWidth={w.slit}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

export default MarvinOrb;
