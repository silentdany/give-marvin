"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The Guide's computer — the one that prints 42 at the end of the book.
 * It is the background; the counter is the content. There is exactly one
 * counter on this site and it lives inside this screen.
 */

const CASE = "#faf6ec";
const CASE_EDGE = "#e4ded0";
const CASE_SHADE = "#f2ecdd";
const CASE_DEEP = "#eae3d2";

export type ScreenTone = "normal" | "green" | "red" | "off";

/**
 * Where the screen sits inside the picture. The drawn case and a supplied
 * render do not frame it identically, so the counter is placed per source.
 */
/**
 * Measured off the supplied render rather than guessed. The file is
 * 1680×1184 with wide transparent margins: the computer itself only occupies
 * x 396–1307, y 75–1096, and the white screen sits at x 487–1217, y 175–648.
 * The margins are cropped away, so the picture fills its box instead of
 * floating in the middle of it.
 */
const ASSET_CROP = {
  /** width / height of the computer once the transparent margin is gone */
  ratio: 911 / 1021,
  imageWidth: "184.41%",
  imageLeft: "-43.47%",
  imageTop: "-7.35%",
};

const SCREEN = __COMPUTER_ASSET__
  ? { left: "9.99%", right: "9.88%", top: "9.79%", height: "46.33%" }
  : { left: "26%", right: "26%", top: "11.5%", height: "38%" };

const BAR: Record<ScreenTone, string> = {
  normal: "var(--color-phosphor, #2fd39b)",
  green: "var(--color-phosphor, #2fd39b)",
  red: "var(--color-danger, #c0504a)",
  off: "#d9d3c4",
};

export function GuideComputer({
  children,
  tone = "normal",
  className,
}: {
  children: ReactNode;
  tone?: ScreenTone;
  className?: string;
}) {
  const bar = BAR[tone];

  return (
    <div className={cn("relative w-full select-none", className)} data-tone={tone}>
      {/* Your own render, if you dropped one in. See `__COMPUTER_ASSET__`. */}
      {__COMPUTER_ASSET__ ? (
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: String(ASSET_CROP.ratio) }}
        >
          <img
            src={__COMPUTER_ASSET__}
            alt=""
            className="absolute"
            style={{
              width: ASSET_CROP.imageWidth,
              maxWidth: "none",
              left: ASSET_CROP.imageLeft,
              top: ASSET_CROP.imageTop,
            }}
          />
        </div>
      ) : (
        <svg viewBox="0 0 600 520" className="block w-full" aria-hidden="true">
          {/* the slab it stands on, receding towards you */}
          <path d="M 252 396 L 348 396 L 396 464 L 204 464 Z" fill={CASE_DEEP} />
          <path d="M 252 396 L 348 396 L 352 406 L 248 406 Z" fill={CASE_SHADE} />

          {/* two legs, splayed like an easel that gave up */}
          <path
            d="M 206 316 L 232 316 L 196 470 L 170 470 Z"
            fill={CASE}
            stroke={CASE_EDGE}
            strokeWidth={2}
          />
          <path
            d="M 368 316 L 394 316 L 430 470 L 404 470 Z"
            fill={CASE}
            stroke={CASE_EDGE}
            strokeWidth={2}
          />

          {/* braces */}
          <path
            d="M 216 356 L 262 402 L 250 412 L 206 368 Z"
            fill={CASE_SHADE}
            stroke={CASE_EDGE}
            strokeWidth={2}
          />
          <path
            d="M 384 356 L 338 402 L 350 412 L 394 368 Z"
            fill={CASE_SHADE}
            stroke={CASE_EDGE}
            strokeWidth={2}
          />

          {/* the case */}
          <rect
            x={112}
            y={22}
            width={376}
            height={300}
            rx={38}
            fill={CASE}
            stroke={CASE_EDGE}
            strokeWidth={2.5}
          />

          {/* the screen — white, empty, waiting for a number it will not like */}
          <rect
            x={148}
            y={54}
            width={304}
            height={208}
            rx={22}
            fill="#ffffff"
            stroke={CASE_EDGE}
            strokeWidth={4}
          />

          {/* the chin: one green line and a power dot */}
          <rect x={154} y={288} width={232} height={9} rx={4.5} fill={bar} />
          <circle cx={418} cy={292} r={14} fill="none" stroke={bar} strokeWidth={2.6} />
          <path d="M 418 284 L 418 293" stroke={bar} strokeWidth={2.6} strokeLinecap="round" />
        </svg>
      )}

      {/* the screen is the background. this is the content. */}
      <div
        className="absolute flex flex-col items-center justify-center px-3 text-center"
        style={SCREEN}
      >
        {children}
      </div>
    </div>
  );
}

export default GuideComputer;
