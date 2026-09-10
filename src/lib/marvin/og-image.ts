import { writeFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { ogJoke } from "./copy";
import type { TweetStats } from "./types";

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

function splitOrbSvg(): string {
  return `
  <g transform="translate(64,56)">
    <circle cx="70" cy="70" r="70" fill="#f3f3f1" stroke="#d2d2ce" stroke-width="2"/>
    <clipPath id="ogLeft"><rect x="0" y="0" width="70" height="140"/></clipPath>
    <clipPath id="ogRight"><rect x="70" y="0" width="70" height="140"/></clipPath>
    <g clip-path="url(#ogLeft)">
      <ellipse cx="48" cy="68" rx="14" ry="8" fill="#ffffff" stroke="#2c2c2a" stroke-width="4"/>
      <ellipse cx="92" cy="68" rx="14" ry="8" fill="#ffffff" stroke="#2c2c2a" stroke-width="4"/>
    </g>
    <g clip-path="url(#ogRight)">
      <polygon points="38,60 58,60 48,84" fill="#c23b3b"/>
      <polygon points="82,64 102,64 92,90" fill="#c23b3b"/>
    </g>
    <line x1="70" y1="2" x2="70" y2="138" stroke="#d2d2ce" stroke-width="2"/>
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
  <text x="1080" y="118" text-anchor="end" font-family="Nunito" font-weight="800" font-size="22" letter-spacing="6" fill="#8a8a86">DAY</text>
  <text x="1080" y="210" text-anchor="end" font-family="Nunito" font-weight="800" font-size="92" fill="#2c2c2a">${xml(n)}</text>
  <text x="80" y="360" font-family="Nunito" font-weight="800" font-size="36" fill="#2c2c2a">${xml(line)}</text>
  <text x="80" y="420" font-family="Nunito" font-weight="400" font-size="26" fill="#8a8a86">asking @elonmusk for Marvin's voice</text>
  <text x="80" y="560" font-family="Nunito" font-weight="400" font-size="20" fill="#b3b3ae">${xml(bar)}</text>
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
