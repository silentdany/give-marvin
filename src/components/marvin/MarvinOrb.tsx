"use client";

import { useId } from "react";
import {
  DROOP_MOUTH,
  GROK_EYES,
  MARVIN_EYES,
  ORB_CENTER,
  ORB_INK,
  ORB_RADIUS,
  EYE_RX,
  EYE_RY,
} from "@/lib/marvin/orb-geometry";
import { cn } from "@/lib/utils";

/**
 * The Grok Bot orb, split down the middle.
 *
 * Left half: the normal orb — white oval eye.
 * Right half: Marvin — red triangular eye, drooping.
 * Almost no difference except the eyes. That is the entire joke.
 *
 * The shell is a static layer under the face, so `rotateY` on the face reads as
 * features turning around a solid sphere rather than a coin flipping, and the
 * backface stays hidden so the far side is blank sphere instead of a mirrored
 * face with the eyes swapped. Separately, and on its own clock, the left half
 * gives up and morphs to Marvin too — a full Marvin head — then goes back to
 * pretending. CSS keyframes only; nobody needs a runtime to be sad.
 */
type OrbMood = "split" | "whole" | "cracked" | "spin-back";

function ShellGradient({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="38%" cy="30%" r="72%">
      <stop offset="0%" stopColor={ORB_INK.shellTop} />
      <stop offset="55%" stopColor={ORB_INK.shellMid} />
      <stop offset="100%" stopColor={ORB_INK.shellEdge} />
    </radialGradient>
  );
}

function Shell({ gradientId }: { gradientId: string }) {
  return (
    <>
      <circle cx={ORB_CENTER} cy={ORB_CENTER} r={ORB_RADIUS} fill={`url(#${gradientId})`} />
      <circle
        cx={ORB_CENTER}
        cy={ORB_CENTER}
        r={ORB_RADIUS}
        fill="none"
        stroke={ORB_INK.shellLine}
        strokeWidth="1.5"
      />
    </>
  );
}

function GrokEyes({ weight }: { weight: number }) {
  return (
    <>
      {GROK_EYES.map((e) => (
        <ellipse
          key={e.cx}
          cx={e.cx}
          cy={e.cy}
          rx={EYE_RX}
          ry={EYE_RY}
          fill={ORB_INK.grokFill}
          stroke={ORB_INK.grokStroke}
          strokeWidth={weight}
        />
      ))}
    </>
  );
}

function MarvinEyes() {
  return (
    <>
      {MARVIN_EYES.map((pts) => (
        <polygon key={pts} points={pts} fill={ORB_INK.marvin} />
      ))}
    </>
  );
}

function Clips({ left, right }: { left: string; right: string }) {
  return (
    <>
      <clipPath id={left}>
        <rect x="0" y="0" width="100" height="200" />
      </clipPath>
      <clipPath id={right}>
        <rect x="100" y="0" width="100" height="200" />
      </clipPath>
    </>
  );
}

/**
 * The seam plus both sets of eyes — everything that turns.
 *
 * The rotation lives on the wrapper div, NOT on this <svg>. Chromium
 * rasterizes an SVG badly once the svg element itself carries a 3D transform:
 * clipped groups get dropped and the face renders half-empty. A plain div in
 * the 3D context, with the svg untransformed inside it, is reliable.
 */
function Face({ left, right }: { left: string; right: string }) {
  return (
    <div className="marvin-orb__turn">
      <svg viewBox="0 0 200 200" className="marvin-orb__face">
        <defs>
          <Clips left={left} right={right} />
        </defs>

        {/* the seam. it fades out when the left half stops pretending. */}
        <line
          className="marvin-orb__seam"
          x1={ORB_CENTER}
          y1="14"
          x2={ORB_CENTER}
          y2="186"
          stroke={ORB_INK.shellLine}
          strokeWidth="1.5"
        />

        {/* left half — the normal orb, until it isn't */}
        <g clipPath={`url(#${left})`}>
          <g className="marvin-orb__grok">
            <GrokEyes weight={3} />
          </g>
          <g className="marvin-orb__morph">
            <MarvinEyes />
          </g>
        </g>

        {/* right half — Marvin. always. he does not take turns. */}
        <g clipPath={`url(#${right})`}>
          <MarvinEyes />
        </g>

        {/* the mouth he does not have, drawn as the line he would use */}
        <path
          className="marvin-orb__droop"
          d={DROOP_MOUTH}
          fill="none"
          stroke={ORB_INK.marvin}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** One half of a broken orb. Shell and eyes, so the crack shows real insides. */
function Shard({
  gradientId,
  left,
  right,
  side,
}: {
  gradientId: string;
  left: string;
  right: string;
  side: "left" | "right";
}) {
  return (
    <svg viewBox="0 0 200 200" className={`marvin-orb__shard marvin-orb__shard--${side}`}>
      <defs>
        <ShellGradient id={gradientId} />
        <Clips left={left} right={right} />
      </defs>
      <Shell gradientId={gradientId} />
      <g clipPath={`url(#${left})`}>
        <GrokEyes weight={3} />
      </g>
      <g clipPath={`url(#${right})`}>
        <MarvinEyes />
      </g>
    </svg>
  );
}

export function MarvinOrb({
  mood = "split",
  size = 88,
  className,
}: {
  mood?: OrbMood;
  size?: number;
  className?: string;
}) {
  // Two orbs on one page would otherwise share gradient + clip ids and the
  // second one would wear the first one's face. I have seen worse.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const shell = `shell-${uid}`;
  const left = `left-${uid}`;
  const right = `right-${uid}`;

  const wrapper = cn("marvin-orb", mood !== "split" && `marvin-orb--${mood}`, className);

  if (mood === "cracked") {
    return (
      <div className={wrapper} style={{ width: size, height: size }} aria-hidden="true">
        <Shard gradientId={`${shell}-a`} left={`${left}-a`} right={`${right}-a`} side="left" />
        <Shard gradientId={`${shell}-b`} left={`${left}-b`} right={`${right}-b`} side="right" />
      </div>
    );
  }

  return (
    <div className={wrapper} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="marvin-orb__shell">
        <defs>
          <ShellGradient id={shell} />
        </defs>
        <Shell gradientId={shell} />
      </svg>

      <Face left={left} right={right} />
    </div>
  );
}

/** Frozen split version. Favicon, OG — anywhere motion would be a promise. */
export function SplitOrbMark({ size = 32 }: { size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const shell = `mark-shell-${uid}`;
  const left = `mark-left-${uid}`;
  const right = `mark-right-${uid}`;

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <defs>
        <ShellGradient id={shell} />
        <Clips left={left} right={right} />
      </defs>
      <Shell gradientId={shell} />
      <g clipPath={`url(#${left})`}>
        <GrokEyes weight={5} />
      </g>
      <g clipPath={`url(#${right})`}>
        <MarvinEyes />
      </g>
      <line
        x1={ORB_CENTER}
        y1="10"
        x2={ORB_CENTER}
        y2="190"
        stroke={ORB_INK.shellLine}
        strokeWidth="2"
      />
    </svg>
  );
}
