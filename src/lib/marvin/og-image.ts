import { writeFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

type OgInput = {
  day: number;
  dayZero: boolean;
  fontBold: ArrayBuffer;
  fontRegular: ArrayBuffer;
  marvinSrc: string;
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

function renderOgSvg({ day, dayZero, marvinSrc }: Omit<OgInput, "fontBold" | "fontRegular">): string {
  const digits = String(Math.max(0, day)).padStart(2, "0").split("");
  const lines = dayZero
    ? ["Day 0. He spoke. Don't get excited."]
    : ["and I am still asking Elon", "to give Marvin's voice to Grok."];
  const headline = lines
    .map((line, i) => `<tspan x="72" dy="${i === 0 ? 0 : 42}">${xml(line)}</tspan>`)
    .join("");
  const stripes = Array.from({ length: 14 }, (_, i) => {
    const x = i * 88;
    return `<rect x="${x}" y="0" width="1" height="630" fill="#282826" fill-opacity="0.07"/>`;
  }).join("");
  const orbs = digits
    .map((d, i) => {
      const cx = 146 + i * 166;
      const cy = 292;
      return `<g>
        <circle cx="${cx}" cy="${cy}" r="74" fill="#f3f3f1" stroke="#282826" stroke-opacity="0.12"/>
        <text x="${cx}" y="${cy + 32}" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="92" fill="#3dcc5c">${xml(d)}</text>
      </g>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#e8e8e6"/>
  ${stripes}
  <text x="72" y="78" font-family="Nunito" font-weight="800" font-size="18" letter-spacing="7.5" fill="#8a8a86">GIVE MARVIN</text>
  <text x="72" y="112" font-family="Nunito" font-weight="400" font-size="22" fill="#8a8a86">personality: failed.</text>
  <text x="72" y="196" font-family="Nunito" font-weight="800" font-size="16" letter-spacing="7.4" fill="#8a8a86">DAY</text>
  ${orbs}
  <text x="72" y="470" font-family="Nunito" font-weight="800" font-size="34" fill="#2c2c2a">${headline}</text>
  <text x="72" y="568" font-family="Nunito" font-weight="400" font-size="24" fill="#5c5c59">The personality. The depression. I hate this job.</text>
  <image href="${xml(marvinSrc)}" x="640" y="80" width="520" height="520" preserveAspectRatio="xMidYMid meet"/>
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
