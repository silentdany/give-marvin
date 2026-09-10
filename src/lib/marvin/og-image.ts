import { writeFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";
import { splitOrbSvg } from "./orb-svg";
import { OG_FIXED_LINE, ogLine } from "./copy";
import type { CampaignMode, TweetStats } from "./types";

type OgInput = {
  day: number;
  mode: CampaignMode;
  stats: TweetStats;
  visits: number;
  fontBold: ArrayBuffer;
  fontRegular: ArrayBuffer;
};

const INK = "#2c2c2a";
const MUTED = "#8a8a86";
const PAPER = "#ffffff";

function xml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return ["&", "amp;"].join("");
    if (ch === "<") return ["&", "lt;"].join("");
    if (ch === ">") return ["&", "gt;"].join("");
    if (ch === '"') return ["&", "quot;"].join("");
    return ["&", "#39;"].join("");
  });
}

export function compact(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n < 1000) return String(Math.round(n));
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}K`;
  }
  const m = n / 1_000_000;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.round(m)}M`;
}

/** SVG will not wrap text, so wrap it here. Nunito at ~0.5em average. */
export function wrap(text: string, fontSize: number, maxWidth: number, maxLines: number): string[] {
  const perChar = fontSize * 0.5;
  const limit = Math.max(8, Math.floor(maxWidth / perChar));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= limit) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.slice(0, maxLines);
}

function counterLabel(day: number, mode: CampaignMode): string {
  if (mode === "accepted") return "free";
  if (mode === "rejected") return `Day ${day} — rejected`;
  if (mode === "reposted") return "Day 999";
  return `Day ${Math.max(0, day)}`;
}

function renderOgSvg({
  day,
  mode,
  stats,
  visits,
}: Omit<OgInput, "fontBold" | "fontRegular">): string {
  const headline = ogLine(day);
  const lines = wrap(headline, 54, 1040, 2);
  const headlineY = lines.length > 1 ? 300 : 322;
  const headlineTspans = lines
    .map((line, i) => `<tspan x="80" dy="${i === 0 ? 0 : 66}">${xml(line)}</tspan>`)
    .join("");

  const counter = counterLabel(day, mode);
  const statBar = [
    `${compact(stats.views)} views`,
    `${compact(stats.likes)} likes`,
    `${compact(stats.reposts)} reposts`,
    `${compact(stats.comments)} comments`,
    `${compact(visits)} visits`,
  ].join("  ·  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>

  ${splitOrbSvg(80, 60, 96)}
  <text x="200" y="100" font-family="Nunito" font-weight="800" font-size="19" letter-spacing="6.5" fill="${INK}">GIVE MARVIN</text>
  <text x="200" y="130" font-family="Nunito" font-weight="400" font-size="20" fill="${MUTED}">personality: failed.</text>

  <text x="1120" y="122" text-anchor="end" font-family="Nunito" font-weight="800" font-size="62" fill="${INK}">${xml(counter)}</text>

  <text x="80" y="${headlineY}" font-family="Nunito" font-weight="800" font-size="54" fill="${INK}">${headlineTspans}</text>
  <text x="80" y="${headlineY + (lines.length > 1 ? 66 : 0) + 62}" font-family="Nunito" font-weight="400" font-size="28" fill="${MUTED}">${xml(OG_FIXED_LINE)}</text>

  <text x="80" y="566" font-family="Nunito" font-weight="400" font-size="23" fill="${MUTED}">${xml(statBar)}</text>
  <text x="1120" y="566" text-anchor="end" font-family="Nunito" font-weight="400" font-size="23" fill="${MUTED}">givemarvin.lol</text>
</svg>`;
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

export const __test = { renderOgSvg, counterLabel };
