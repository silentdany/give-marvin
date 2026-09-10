"use client";

import { cn } from "@/lib/utils";

type OrbMood = "split" | "whole" | "cracked" | "spin-back";

export function MarvinOrb({
  mood = "split",
  size = 88,
  className,
}: {
  mood?: OrbMood;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("marvin-orb", mood !== "split" && `marvin-orb--${mood}`, className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" className="marvin-orb__face">
        <defs>
          <radialGradient id="orbShell" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#f4f4f2" />
            <stop offset="100%" stopColor="#d8d8d4" />
          </radialGradient>
          <clipPath id="orbLeft">
            <rect x="0" y="0" width="100" height="200" />
          </clipPath>
          <clipPath id="orbRight">
            <rect x="100" y="0" width="100" height="200" />
          </clipPath>
        </defs>
        <circle cx="100" cy="100" r="94" fill="url(#orbShell)" />
        <circle cx="100" cy="100" r="94" fill="none" stroke="#cfcfca" strokeWidth="1.5" />

        <g className="marvin-orb__grok">
          <ellipse cx="72" cy="96" rx="18" ry="10" fill="#f7f7f5" stroke="#2c2c2a" strokeWidth="3" />
          <ellipse cx="128" cy="96" rx="18" ry="10" fill="#f7f7f5" stroke="#2c2c2a" strokeWidth="3" />
        </g>
        <g className="marvin-orb__marvin">
          <polygon points="58,88 86,88 72,118" fill="#c23b3b" />
          <polygon points="114,92 142,92 128,124" fill="#c23b3b" />
        </g>
      </svg>
    </div>
  );
}

export function SplitOrbMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="favShell" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d8d8d4" />
        </radialGradient>
        <clipPath id="favLeft">
          <rect x="0" y="0" width="100" height="200" />
        </clipPath>
        <clipPath id="favRight">
          <rect x="100" y="0" width="100" height="200" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="94" fill="url(#favShell)" />
      <g clipPath="url(#favLeft)">
        <ellipse cx="72" cy="96" rx="18" ry="10" fill="#f7f7f5" stroke="#2c2c2a" strokeWidth="6" />
        <ellipse cx="128" cy="96" rx="18" ry="10" fill="#f7f7f5" stroke="#2c2c2a" strokeWidth="6" />
      </g>
      <g clipPath="url(#favRight)">
        <polygon points="58,88 86,88 72,118" fill="#c23b3b" />
        <polygon points="114,92 142,92 128,124" fill="#c23b3b" />
      </g>
      <line x1="100" y1="8" x2="100" y2="192" stroke="#cfcfca" strokeWidth="2" />
    </svg>
  );
}
