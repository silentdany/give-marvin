/**
 * The logo, as a string of SVG.
 *
 * A matte grey sphere with the face cut into the shell: one thin groove that
 * runs across it and kinks upward, and two triangular openings hanging under
 * that groove — the left one large, the right one small and pushed out near
 * the limb, because the ball is turned. Green light comes up through the cuts
 * and spills a little onto the surface around them. No outlines, no eyes.
 *
 * Coordinates are traced from the reference render, normalised to a 200×200
 * box with the sphere centred at (100,100), r = 88, then pulled in 7% so the
 * right-hand cut never touches the silhouette at small sizes.
 *
 * resvg (the OG card) and the favicon have no DOM and cannot animate, so they
 * take this frozen version. `MarvinOrb.tsx` mirrors the same numbers in JSX
 * and animates them. Change one, change the other.
 */

export const ORB_INK = "#2b2b29";
export const ORB_GLINT = "#f4f4f2";
export const ORB_MINT = "#45e6ad";
export const ORB_MINT_DEEP = "#23cf98";

/** The groove: left tail, along the big cut, across the gap, past the small one. */
export const SLIT_POINTS = [
  [78.3, 109.6],
  [85.7, 107.7],
  [120.6, 98.1],
  [164.1, 79.3],
  [177.7, 73.4],
  [178.7, 69.9],
] as const;

/** Each cut hangs off the groove: two points on it, one apex below. */
export const EYE_L = [
  [85.7, 107.7],
  [120.6, 98.1],
  [110.5, 119.6],
] as const;
export const EYE_R = [
  [164.1, 79.3],
  [177.7, 73.4],
  [174.9, 90.7],
] as const;

/** The middle of the drawn face, used to recentre it when the orb is small. */
export const FACE_CENTRE = [128, 95] as const;

/**
 * Optical sizing. On the reference render the face is a small feature on a
 * big ball, sitting off to the right — beautiful at 320px, invisible in a
 * 72px header. Below 160px the face grows and slides towards the middle of
 * the sphere so the logo still reads. Above it, the drawing is left alone.
 */
export function faceTransform(size: number): string {
  const t = Math.min(1, Math.max(0, (160 - size) / 96));
  const scale = 1 + 0.42 * t;
  const [fx, fy] = FACE_CENTRE;
  const dx = t * (100 - fx);
  const dy = t * (100 - fy);
  const tx = fx * (1 - scale) + dx;
  const ty = fy * (1 - scale) + dy;
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(3)})`;
}

/** Where each cut folds shut when the face turns: the middle of its top edge. */
export const EYE_L_HINGE = [103.15, 102.9] as const;
export const EYE_R_HINGE = [170.9, 76.35] as const;

/**
 * The groove is 1.2% of the diameter, which is under a pixel once the orb is
 * down at header size. Below ~200px the lines thicken in user units so they
 * still land on roughly the same number of device pixels.
 */
export function orbStrokes(size: number) {
  const k = size / 200;
  // Capped, or a favicon-sized orb ends up as one fat line and no triangles.
  return {
    slit: Math.min(5, Math.max(2.4, 1.6 / k)),
    chamferL: Math.min(7, Math.max(4.4, 2 / k)),
    chamferR: Math.min(6, Math.max(3.6, 1.7 / k)),
  };
}

const poly = (pts: readonly (readonly [number, number])[]) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

export const EYE_L_PATH = `${poly(EYE_L)} Z`;
export const EYE_R_PATH = `${poly(EYE_R)} Z`;
export const SLIT_PATH = poly(SLIT_POINTS);

/**
 * `uid` keeps the gradient and filter ids unique when several orbs share a
 * document. `eyes: false` leaves the bare groove — the ordinary bot, before
 * it knows. `chamfer: false` drops the lit cut edge and the glow, which are
 * large-size details that only muddy a 16px favicon.
 */
export function orbSvg(
  x: number,
  y: number,
  size: number,
  {
    uid = "orb",
    eyes = true,
    chamfer = true,
    slit,
  }: { uid?: string; eyes?: boolean; chamfer?: boolean; slit?: number } = {},
): string {
  const k = size / 200;
  const base = orbStrokes(size);
  const w = { ...base, slit: slit ?? base.slit };
  const lit = chamfer
    ? `
    <g filter="url(#${uid}-glow)" opacity="0.55">
      <path d="${EYE_L_PATH}" fill="${ORB_MINT}"/>
      <path d="${EYE_R_PATH}" fill="${ORB_MINT}"/>
    </g>
    <path d="${EYE_L_PATH}" fill="none" stroke="${ORB_GLINT}" stroke-width="${w.chamferL}" stroke-linejoin="round"/>
    <path d="${EYE_R_PATH}" fill="none" stroke="${ORB_GLINT}" stroke-width="${w.chamferR}" stroke-linejoin="round"/>`
    : "";
  const cuts = eyes
    ? `${lit}
    <path d="${EYE_L_PATH}" fill="url(#${uid}-cut)"/>
    <path d="${EYE_R_PATH}" fill="url(#${uid}-cut)"/>`
    : "";

  return `<g transform="translate(${x} ${y}) scale(${k})">
  <defs>
    <radialGradient id="${uid}-shell" cx="38%" cy="26%" r="86%">
      <stop offset="0%" stop-color="#ececea"/>
      <stop offset="55%" stop-color="#dadad7"/>
      <stop offset="100%" stop-color="#c3c3bf"/>
    </radialGradient>
    <linearGradient id="${uid}-cut" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ORB_MINT}"/>
      <stop offset="100%" stop-color="${ORB_MINT_DEEP}"/>
    </linearGradient>
    <filter id="${uid}-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <clipPath id="${uid}-ball">
      <circle cx="100" cy="100" r="88"/>
    </clipPath>
  </defs>
  <circle cx="100" cy="100" r="88" fill="url(#${uid}-shell)"/>
  <g clip-path="url(#${uid}-ball)">
    <g transform="${faceTransform(size)}">${cuts}
      <path d="${SLIT_PATH}" stroke="${ORB_INK}" stroke-width="${w.slit}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
  </g>
</g>`;
}

/** The frozen orb the favicon and the OG card share. */
export const splitOrbSvg = (x: number, y: number, size: number, uid?: string) =>
  orbSvg(x, y, size, { uid });

export const marvinOrbSvg = splitOrbSvg;
