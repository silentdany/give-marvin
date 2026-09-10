/**
 * The logo: one orb, split down the middle.
 * Left half is the ordinary bot — a calm white oval eye.
 * Right half is Marvin — a drooping green triangle under a brow slit.
 * Almost no difference. That is the joke.
 *
 * Pure string SVG so the OG renderer (resvg, no DOM) and the favicon can
 * share the exact same geometry as the animated React component.
 */

export const ORB_SHELL = "#f0f0ed";
export const ORB_RING = "rgb(40 40 38 / 0.10)";
export const ORB_EYE_CALM = "#ffffff";
export const ORB_EYE_MARVIN = "#2fd39b";
export const ORB_BROW = "#2c2c2a";

export type OrbHalf = "calm" | "marvin";

/** A calm bot eye: an upright rounded oval. Nothing behind it. */
function calmEye(cx: number, cy: number, r: number): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.145}" ry="${r * 0.25}"
    fill="${ORB_EYE_CALM}" stroke="${ORB_BROW}" stroke-opacity="0.5" stroke-width="${r * 0.045}"/>`;
}

/**
 * A Marvin eye: a brow slit, and a triangle hanging off it.
 * `droop` slides the outer corner down — that is the entire personality.
 */
function marvinEye(cx: number, cy: number, r: number, droop: number, flip: boolean): string {
  const dir = flip ? -1 : 1;
  const browX1 = cx - dir * r * 0.22;
  const browX2 = cx + dir * r * 0.22;
  const browY1 = cy - droop * r;
  const browY2 = cy + droop * r;
  const apexX = cx + dir * r * 0.025;
  const apexY = (browY1 + browY2) / 2 + r * 0.36;

  return `<g>
    <path d="M ${browX1} ${browY1} L ${browX2} ${browY2} L ${apexX} ${apexY} Z"
      fill="${ORB_EYE_MARVIN}"/>
    <path d="M ${browX1} ${browY1} L ${browX2} ${browY2}"
      stroke="${ORB_BROW}" stroke-width="${r * 0.062}" stroke-linecap="round" fill="none"/>
  </g>`;
}

/**
 * The frozen split orb. `x`,`y` is the top-left of a `size`×`size` box.
 * Satori and resvg cannot animate; this is the still both of them use.
 */
export function splitOrbSvg(x: number, y: number, size: number): string {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;
  const shell = r * 0.96;

  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${shell}" fill="${ORB_SHELL}"
      stroke="${ORB_RING}" stroke-width="${size * 0.012}"/>
    ${calmEye(cx - r * 0.35, cy + r * 0.055, r)}
    ${marvinEye(cx + r * 0.35, cy, r, 0.085, false)}
  </g>`;
}

/** Both eyes Marvin. Used when the joke stops being a joke. */
export function marvinOrbSvg(x: number, y: number, size: number): string {
  const r = size / 2;
  const cx = x + r;
  const cy = y + r;
  const shell = r * 0.96;

  return `<g>
    <circle cx="${cx}" cy="${cy}" r="${shell}" fill="${ORB_SHELL}"
      stroke="${ORB_RING}" stroke-width="${size * 0.012}"/>
    ${marvinEye(cx - r * 0.35, cy, r, 0.085, true)}
    ${marvinEye(cx + r * 0.35, cy, r, 0.085, false)}
  </g>`;
}
