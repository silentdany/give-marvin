import { writeFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { ogJoke } from "./copy.ts";
import {
  EYE_RX,
  EYE_RY,
  GROK_EYES,
  MARVIN_EYES,
  ORB_CENTER,
  ORB_INK,
  ORB_RADIUS,
} from "./orb-geometry.ts";
import type { TweetStats } from "./types.ts";

type OgInput = {
  day: number;
  dayZero: boolean;
  fontBold: ArrayBuffer;
  fontRegular: ArrayBuffer;
  stats?: TweetStats;
  joke?: string;
};

function xml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return ["&", "amp;"].join("");
    if (ch === "<") return ["&", "lt;"].join("");
    if (ch === ">") return ["&", "gt;"].join("");
    if (ch === '"') return ["&", "quot;"].join("");
    return ["&", "#39;"].join("");
  });
}

/**
 * The frozen split mark, drawn from the same numbers as the component — Satori
 * and resvg cannot animate, and neither can a tweet, so the card gets the
 * static split. That was the joke anyway.
 */
function splitOrbSvg(): string {
  const grok = GROK_EYES.map(
    (e) =>
      `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${EYE_RX}" ry="${EYE_RY}" fill="${ORB_INK.grokFill}" stroke="${ORB_INK.grokStroke}" stroke-width="5"/>`,
  ).join("");
  const marvin = MARVIN_EYES.map(
    (points) => `<polygon points="${points}" fill="${ORB_INK.marvin}"/>`,
  ).join("");

  return `
  <g transform="translate(74,58) scale(0.74)">
    <clipPath id="ogLeft"><rect x="0" y="0" width="${ORB_CENTER}" height="200"/></clipPath>
    <clipPath id="ogRight"><rect x="${ORB_CENTER}" y="0" width="${ORB_CENTER}" height="200"/></clipPath>
    <circle cx="${ORB_CENTER}" cy="${ORB_CENTER}" r="${ORB_RADIUS}" fill="${ORB_INK.shellMid}" stroke="${ORB_INK.shellLine}" stroke-width="2"/>
    <g clip-path="url(#ogLeft)">${grok}</g>
    <g clip-path="url(#ogRight)">${marvin}</g>
    <line x1="${ORB_CENTER}" y1="10" x2="${ORB_CENTER}" y2="190" stroke="${ORB_INK.shellLine}" stroke-width="2"/>
  </g>`;
}

function renderOgSvg({ day, stats, joke }: OgInput): string {
  const n = String(Math.max(0, day));
  const line = joke || ogJoke(day);
  const s = stats ?? { views: 0, likes: 0, reposts: 0, replies: 0 };
  const bar = `${fmt(s.views)} views  ·  ${fmt(s.likes)} likes  ·  ${fmt(s.reposts)} reposts  ·  ${fmt(s.replies)} comments`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  ${splitOrbSvg()}
  <text x="1120" y="122" text-anchor="end" font-family="Nunito" font-weight="800" font-size="22" letter-spacing="7" fill="#b9b9b4">DAY</text>
  <text x="1120" y="214" text-anchor="end" font-family="Nunito" font-weight="800" font-size="96" fill="#1f1f1e">${xml(n)}</text>
  <text x="80" y="362" font-family="Nunito" font-weight="800" font-size="38" fill="#1f1f1e">${xml(line)}</text>
  <text x="80" y="422" font-family="Nunito" font-weight="400" font-size="26" fill="#8b8b87">asking @elonmusk for Marvin&#39;s voice</text>
  <text x="80" y="556" font-family="Nunito" font-weight="400" font-size="20" fill="#b9b9b4">${xml(bar)}</text>
</svg>`;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export async function renderOgPng(input: OgInput) {
  const boldPath = "/tmp/nunito-800.ttf";
  const regularPath = "/tmp/nunito-400.ttf";
  await Promise.all([
    writeFile(boldPath, Buffer.from(input.fontBold)),
    writeFile(regularPath, Buffer.from(input.fontRegular)),
  ]);

  const svg = renderOgSvg(input);
  return new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontFiles: [boldPath, regularPath],
      defaultFontFamily: "Nunito",
      loadSystemFonts: false,
    },
  })
    .render()
    .asPng();
}
