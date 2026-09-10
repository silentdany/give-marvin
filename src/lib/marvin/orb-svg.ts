/**
 * The logo, as a string of SVG.
 *
 * One matte sphere. One thin slit carved across it, rising to the right.
 * Two mint triangles hanging off that slit — the left one large, the right
 * one small and squeezed by the curve of the ball. No cartoon eyes, no
 * outlines: the light comes through the cuts, that is all.
 *
 * resvg (the OG card) and the favicon have no DOM and cannot animate, so they
 * take this frozen version. `MarvinOrb.tsx` mirrors the same numbers in JSX
 * and animates them. Change one, change the other.
 */

export const ORB_INK = "#2a2a28";
export const ORB_MINT = "#2fd39b";
export const ORB_MINT_DEEP = "#22c38d";
export const ORB_BEVEL = "#ffffff";

/* The face, in a 200×200 box with the sphere centred at (100,100), r = 88.
   The slit is one straight line; both triangles hang from points on it. */
export const SLIT_A = { x: 36, y: 112 };
export const SLIT_B = { x: 176, y: 76 };
export const EYE_L = { a: { x: 46, y: 109.4 }, b: { x: 104, y: 94.5 }, apex: { x: 86, y: 137 } };
export const EYE_R = { a: { x: 140, y: 85.3 }, b: { x: 170, y: 77.6 }, apex: { x: 160, y: 105 } };

type Eye = typeof EYE_L;

const tri = (e: Eye) => `M ${e.a.x} ${e.a.y} L ${e.b.x} ${e.b.y} L ${e.apex.x} ${e.apex.y} Z`;

export const EYE_L_PATH = tri(EYE_L);
export const EYE_R_PATH = tri(EYE_R);
export const SLIT_PATH = `M ${SLIT_A.x} ${SLIT_A.y} L ${SLIT_B.x} ${SLIT_B.y}`;

/**
 * `uid` keeps the gradient ids unique when several orbs share a document.
 * `eyes: false` draws the bare slit — the ordinary bot, before it knows.
 */
export function orbSvg(
  x: number,
  y: number,
  size: number,
  { uid = "orb", eyes = true }: { uid?: string; eyes?: boolean } = {},
): string {
  const k = size / 200;
  const cuts = eyes
    ? `
  <path d="${EYE_L_PATH}" fill="none" stroke="${ORB_BEVEL}" stroke-width="6" stroke-linejoin="round"/>
  <path d="${EYE_R_PATH}" fill="none" stroke="${ORB_BEVEL}" stroke-width="5" stroke-linejoin="round"/>
  <path d="${EYE_L_PATH}" fill="url(#${uid}-eye)"/>
  <path d="${EYE_R_PATH}" fill="url(#${uid}-eye)"/>`
    : "";

  return `<g transform="translate(${x} ${y}) scale(${k})">
  <defs>
    <radialGradient id="${uid}-shell" cx="34%" cy="28%" r="82%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="52%" stop-color="#f1f1ee"/>
      <stop offset="100%" stop-color="#d8d8d2"/>
    </radialGradient>
    <linearGradient id="${uid}-eye" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ORB_MINT}"/>
      <stop offset="100%" stop-color="${ORB_MINT_DEEP}"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="88" fill="url(#${uid}-shell)"/>${cuts}
  <path d="${SLIT_PATH}" stroke="${ORB_INK}" stroke-width="4.2" stroke-linecap="round" fill="none"/>
</g>`;
}

/** The frozen orb the favicon and the OG card share. */
export const splitOrbSvg = (x: number, y: number, size: number, uid?: string) =>
  orbSvg(x, y, size, { uid });

export const marvinOrbSvg = splitOrbSvg;
